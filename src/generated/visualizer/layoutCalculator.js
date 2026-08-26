// Generated 3D visualizer layout calculator matching HASM Rust backend (SEQ-03)
export function computeVisualizerLayoutJS(model, filter) {
  const timeScaleMode = filter?.timeScaleMode || "Linear";
  const zScaleFactor = Number(filter?.zScaleFactor || 1.0);

  const zStepValue = getZStep(timeScaleMode, zScaleFactor);
  const nodes = [];
  const lines = [];
  const branchPositions = new Map();
  const firstCommitZ = new Map();

  const experiences = model?.experiences || [];
  experiences.forEach((experience, index) => {
    const x = index * 6.0;
    const parentCount = Array.isArray(experience.parent_experience_ids)
      ? experience.parent_experience_ids.length
      : 0;
    const y = parentCount * 2.0;
    const id = String(experience.experience_id || experience.id);
    branchPositions.set(id, [x, y]);
    nodes.push({
      id,
      entityType: "EXPERIENCE",
      label: experience.experience_name || experience.name || "Experience",
      x,
      y,
      z: 0.0,
    });
  });

  const facts = [...(model?.facts || [])];
  facts.sort((left, right) => {
    const timeA = left.occurred_at || left.occurredAt || "";
    const timeB = right.occurred_at || right.occurredAt || "";
    if (timeA < timeB) return -1;
    if (timeA > timeB) return 1;
    const idA = String(left.fact_id || left.id || "");
    const idB = String(right.fact_id || right.id || "");
    return idA.localeCompare(idB);
  });

  const earliestTime = facts.length > 0 ? timeKey(facts[0].occurred_at || facts[0].occurredAt) : 0;
  let maximumZ = zStepValue;

  facts.forEach((fact, index) => {
    const tKey = timeKey(fact.occurred_at || fact.occurredAt);
    const z = factZ(timeScaleMode, index, tKey, earliestTime, zStepValue);
    maximumZ = Math.max(maximumZ, z);

    const expIds = fact.experience_ids || fact.experienceIds || [];
    const branchId = expIds.length > 0 ? String(expIds[0]) : null;
    const [x, y] = branchId && branchPositions.has(branchId) ? branchPositions.get(branchId) : [0.0, 0.0];

    if (branchId && !firstCommitZ.has(branchId)) {
      firstCommitZ.set(branchId, z);
    }

    nodes.push({
      id: String(fact.fact_id || fact.id),
      entityType: "FACT",
      label: fact.fact_name || fact.name || "Fact",
      x,
      y,
      z,
    });
  });

  experiences.forEach((experience) => {
    const expId = String(experience.experience_id || experience.id);
    const [x, y] = branchPositions.has(expId) ? branchPositions.get(expId) : [0.0, 0.0];
    lines.push({
      id: `branch-${expId}`,
      lineType: "BRANCH",
      from: [x, y, 0.0],
      to: [x, y, maximumZ + zStepValue],
    });

    const joinZ = firstCommitZ.has(expId) ? firstCommitZ.get(expId) : zStepValue;
    const parents = experience.parent_experience_ids || experience.parentExperienceIds || [];
    parents.forEach((parentIdRaw) => {
      const parentId = String(parentIdRaw);
      if (branchPositions.has(parentId)) {
        const [parentX, parentY] = branchPositions.get(parentId);
        lines.push({
          id: `join-${parentId}-${expId}`,
          lineType: "BRANCH_JOIN",
          from: [parentX, parentY, joinZ],
          to: [x, y, joinZ],
        });
      }
    });
  });

  const people = model?.people || [];
  people.forEach((person, index) => {
    nodes.push({
      id: String(person.person_id || person.id),
      entityType: "PERSON",
      label: person.person_name || person.name || "Person",
      x: -5.0,
      y: index * 2.0,
      z: 0.0,
    });
  });

  const links = model?.links || [];
  links.forEach((link, index) => {
    if (nodes.length === 0) return;
    const sourceNode = nodes[index % nodes.length];
    const targetNode = nodes[(index + 1) % nodes.length];
    lines.push({
      id: String(link.link_id || link.id),
      lineType: "LINK",
      from: [sourceNode.x, sourceNode.y, sourceNode.z],
      to: [targetNode.x, targetNode.y, targetNode.z],
    });
  });

  return { nodes3d: nodes, lines3d: lines, warnings: [] };
}

function timeKey(value) {
  if (!value) return 0;
  const parts = String(value).split(/[^0-9]+/).map(Number).filter((n) => !isNaN(n));
  if (parts.length < 3) return 0;
  const [year, month, day] = parts;
  return year * 372 + month * 31 + day;
}

function factZ(mode, index, time, earliestTime, zStepVal) {
  const delta = Math.max(0, time - earliestTime);
  switch (mode) {
    case "Logarithmic":
      return Math.max(1.0, Math.log10(delta + 1.0)) * zStepVal;
    case "SequentialIndex":
      return (index + 1.0) * zStepVal;
    default: // Linear
      return Math.max(1.0, delta / 30.0) * zStepVal;
  }
}

function getZStep(mode, scale) {
  const normalizedScale = Math.max(0.1, scale);
  switch (mode) {
    case "Logarithmic":
      return 2.0 * normalizedScale;
    case "SequentialIndex":
      return 3.0 * normalizedScale;
    default:
      return 4.0 * normalizedScale;
  }
}
