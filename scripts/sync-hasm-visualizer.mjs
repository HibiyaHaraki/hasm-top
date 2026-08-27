// ###################################################
// File Name : sync-hasm-visualizer.mjs
// Purpose : Sync 3D commit graph visualizer logic from submodules/hasm
//           and generate client-side layout calculation for landing page.
// Description : Reads the visualizer engine, layout filter, and design rules from
//               submodules/hasm, and outputs generated visualizer files into
//               src/generated/visualizer/.
// ###################################################

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createLogger } from "../src/hasm_logger/src/react/logger.js";

const logger = createLogger("sync-hasm-visualizer");

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");

const SOURCE_GRAPH = path.join(REPO_ROOT, "submodules", "hasm", "src", "features", "visualizer", "threeCommitGraph.js");
const SOURCE_FILTER = path.join(REPO_ROOT, "submodules", "hasm", "src", "features", "visualizer", "layoutFilter.js");
const SOURCE_CSS = path.join(REPO_ROOT, "submodules", "hasm", "src", "seq01.css");

const OUTPUT_DIR = path.join(REPO_ROOT, "src", "generated", "visualizer");

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function extractTopLevelBlocks(css) {
  const blocks = [];
  let depth = 0;
  let selectorStart = 0;
  let blockStart = 0;
  for (let index = 0; index < css.length; index += 1) {
    if (css[index] === "{") {
      if (depth === 0) blockStart = selectorStart;
      depth += 1;
    } else if (css[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        blocks.push(css.slice(blockStart, index + 1).trim());
        selectorStart = index + 1;
      }
    }
  }
  return blocks;
}

function extractVisualizerCss() {
  const visualizerSelectors = [
    ".visualizer-page",
    ".visualizer-toolbar",
    ".graph-stage",
    ".graph-canvas",
    ".graph-progress",
    ".graph-warning",
    ".graph-notice",
    ".graph-tooltip",
  ];
  return extractTopLevelBlocks(readFileSync(SOURCE_CSS, "utf8"))
    .filter((block) => visualizerSelectors.some((selector) => block.startsWith(selector)))
    .join("\n");
}

function syncFiles() {
  ensureDir(OUTPUT_DIR);

  // 1. Sync threeCommitGraph.js with OrbitControls import fix and viewState preservation support
  let graphContent = readFileSync(SOURCE_GRAPH, "utf8");
  graphContent = graphContent.replace(
    'import { OrbitControls } from "three/addons/controls/OrbitControls.js";',
    'import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";'
  );

  // Support camera viewState parameter and getViewState() cleanup method
  graphContent = graphContent.replace(
    'export function createCommitGraph(container, payload, theme, onSelect, onHover, factDatesById) {',
    'export function createCommitGraph(container, payload, theme, onSelect, onHover, factDatesById, initialViewState) {'
  );
  graphContent = graphContent.replace(
    'camera.position.set(13, 11, 20);',
    'if (initialViewState?.position) { camera.position.copy(initialViewState.position); } else { camera.position.set(13, 11, 20); }'
  );
  graphContent = graphContent.replace(
    'camera.lookAt(0, 0, 5);',
    'if (initialViewState?.quaternion) { camera.quaternion.copy(initialViewState.quaternion); } else { camera.lookAt(0, 0, 5); }'
  );
  graphContent = graphContent.replace(
    'controls.target.set(0, 0, 5);',
    'if (initialViewState?.target) { controls.target.copy(initialViewState.target); } else { controls.target.set(0, 0, 5); }'
  );
  graphContent = graphContent.replace(
    'return () => {',
    'const disposeFn = () => {'
  );
  graphContent = graphContent.replace(
    /container\.removeChild\(renderer\.domElement\);\s*}\s*};\s*}/,
    `container.removeChild(renderer.domElement);
    }
  };
  disposeFn.getViewState = () => ({
    position: camera.position.clone(),
    quaternion: camera.quaternion.clone(),
    target: controls.target.clone(),
  });
  return disposeFn;
}`
  );
  writeFileSync(path.join(OUTPUT_DIR, "threeCommitGraph.js"), graphContent, "utf8");

  // 2. Sync layoutFilter.js
  const filterContent = readFileSync(SOURCE_FILTER, "utf8");
  writeFileSync(path.join(OUTPUT_DIR, "layoutFilter.js"), filterContent, "utf8");

  // 3. Sync the visualizer page design from the submodule.
  const visualizerCss = extractVisualizerCss();
  const adapterCss = `
.HasmVisualizer_Container > .HasmVisualizer_Legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 16px;
  border: 1px solid var(--theme-border);
  background: var(--theme-soft);
  font-size: 0.8rem;
  font-weight: 700;
}
.HasmVisualizer_Container .HasmVisualizer_LegendItem { display: flex; align-items: center; gap: 6px; }
.HasmVisualizer_Container .HasmVisualizer_LegendDot { width: 12px; height: 12px; border-radius: 2px; }
.HasmVisualizer_Container > .HasmVisualizer_Inspector {
  padding: 16px;
  border: 1px solid var(--theme-border);
  border-left: 4px solid var(--theme-primary);
  background: var(--theme-soft);
}
.HasmVisualizer_Container .HasmVisualizer_InspectorTitle { margin: 0 0 6px; font-family: Georgia, serif; font-size: 1.1rem; font-weight: 700; }
.HasmVisualizer_Container .HasmVisualizer_InspectorMeta { display: flex; flex-wrap: wrap; gap: 12px; color: var(--theme-muted); font-size: 0.8rem; }
`;
  writeFileSync(
    path.join(OUTPUT_DIR, "visualizer-design.css"),
    `/* AUTO-GENERATED from submodules/hasm/src/seq01.css. */\n${visualizerCss}\n${adapterCss}`,
    "utf8",
  );

  // 4. Generate layoutCalculator.js matching Rust calculate_layout logic in visualizer_commands.rs
  const calculatorContent = `// Generated 3D visualizer layout calculator matching HASM Rust backend (SEQ-03)
export function computeVisualizerLayoutJS(model, filter) {
  const timeScaleMode = filter?.timeScaleMode || "Linear";
  const zScaleFactor = Number(filter?.zScaleFactor || 1.0);

  const zStepValue = getZStep(timeScaleMode, zScaleFactor);
  const nodes = [];
  const lines = [];
  const experienceFactZs = new Map();

  const experiences = model?.experiences || [];
  const branchPositions = calculateBranchPositions(experiences);
  experiences.forEach((experience) => {
    const id = String(experience.experience_id || experience.id);
    const [x, y] = branchPositions.get(id) || [0.0, 0.0];
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

  facts.forEach((fact, index) => {
    const tKey = timeKey(fact.occurred_at || fact.occurredAt);
    const z = factZ(timeScaleMode, index, tKey, earliestTime, zStepValue);

    const expIds = fact.experience_ids || fact.experienceIds || [];
    const reflectedExperiences = new Set();
    expIds.forEach((experienceId) => collectExperienceAndAncestors(String(experienceId), experiences, reflectedExperiences));
    const visibleBranches = reflectedExperiences.size > 0 ? reflectedExperiences : new Set([null]);

    visibleBranches.forEach((branchId) => {
      const [x, y] = branchId && branchPositions.has(branchId) ? branchPositions.get(branchId) : [0.0, 0.0];
      if (branchId) {
        experienceFactZs.set(branchId, [...(experienceFactZs.get(branchId) || []), z]);
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
  });

  experiences.forEach((experience) => {
    const expId = String(experience.experience_id || experience.id);
    const [x, y] = branchPositions.has(expId) ? branchPositions.get(expId) : [0.0, 0.0];
    const factZs = experienceFactZs.get(expId) || [];
    if (factZs.length > 0) {
      const firstFactZ = Math.min(...factZs);
      const lastFactZ = Math.max(...factZs);
      lines.push({
        id: \`branch-\${expId}\`,
        lineType: "BRANCH",
        from: [x, y, firstFactZ],
        to: [x, y, lastFactZ],
      });

      const parents = experience.parent_experience_ids || experience.parentExperienceIds || [];
      parents.forEach((parentIdRaw) => {
        const parentId = String(parentIdRaw);
        if (!branchPositions.has(parentId)) return;
        const [parentX, parentY] = branchPositions.get(parentId);
        const branchControl = midpointControl([parentX, parentY, firstFactZ], [x, y, firstFactZ]);
        const mergeControl = midpointControl([x, y, lastFactZ], [parentX, parentY, lastFactZ]);
        lines.push({
          id: \`branch-\${parentId}-\${expId}\`,
          lineType: "BRANCH_OUT",
          from: [parentX, parentY, firstFactZ],
          to: [x, y, firstFactZ],
          controlPoints: [branchControl],
        });
        lines.push({
          id: \`merge-\${expId}-\${parentId}\`,
          lineType: "BRANCH_MERGE",
          from: [x, y, lastFactZ],
          to: [parentX, parentY, lastFactZ],
          controlPoints: [mergeControl],
        });
      });
    }
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

function midpointControl(from, to) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  return [
    (from[0] + to[0]) / 2.0 - dy * 0.18,
    (from[1] + to[1]) / 2.0 + dx * 0.18,
    from[2],
  ];
}

function timeKey(value) {
  if (!value) return 0;
  const parts = String(value).split(/[^0-9]+/).map(Number).filter((n) => !isNaN(n));
  if (parts.length < 3) return 0;
  const [year, month, day] = parts;
  return year * 372 + month * 31 + day;
}

function calculateBranchPositions(experiences) {
  const generationGap = 6.0;
  const siblingGap = 4.0;
  const depths = new Map();

  experiences.forEach((experience) => {
    experienceDepth(String(experience.experience_id || experience.id), experiences, depths, new Set());
  });

  const orderedExperiences = [...experiences].sort((left, right) => {
    const leftId = String(left.experience_id || left.id);
    const rightId = String(right.experience_id || right.id);
    return (depths.get(leftId) || 0) - (depths.get(rightId) || 0);
  });
  const positions = new Map();
  const lanesByDepth = new Map();

  orderedExperiences.forEach((experience) => {
    const id = String(experience.experience_id || experience.id);
    const depth = depths.get(id) || 0;
    const parents = experience.parent_experience_ids || experience.parentExperienceIds || [];
    const parentLanes = parents
      .map((parentId) => positions.get(String(parentId)))
      .filter(Boolean)
      .map((position) => position[1]);
    const parentCenter = parentLanes.length > 0
      ? parentLanes.reduce((total, lane) => total + lane, 0) / parentLanes.length
      : 0.0;
    const siblingExperiences = experiences.filter((candidate) => {
      const candidateParents = candidate.parent_experience_ids || candidate.parentExperienceIds || [];
      return candidateParents.some((parentId) => parents.map(String).includes(String(parentId)));
    });
    const siblingIndex = Math.max(0, siblingExperiences.findIndex((candidate) => String(candidate.experience_id || candidate.id) === id));
    const desiredY = parentCenter + (siblingIndex - (Math.max(0, siblingExperiences.length - 1) / 2.0)) * siblingGap;
    const occupiedLanes = lanesByDepth.get(depth) || [];
    const y = nearestAvailableLane(desiredY, occupiedLanes, siblingGap);
    lanesByDepth.set(depth, occupiedLanes);
    positions.set(id, [depth * generationGap, y]);
  });

  return positions;
}

function experienceDepth(experienceId, experiences, depths, visiting) {
  if (depths.has(experienceId)) return depths.get(experienceId);
  if (visiting.has(experienceId)) return 0;
  visiting.add(experienceId);
  const experience = experiences.find((candidate) => String(candidate.experience_id || candidate.id) === experienceId);
  const parents = experience?.parent_experience_ids || experience?.parentExperienceIds || [];
  const depth = experience
    ? parents.reduce((maximum, parentId) => Math.max(maximum, experienceDepth(String(parentId), experiences, depths, visiting) + 1), 0)
    : 0;
  visiting.delete(experienceId);
  depths.set(experienceId, depth);
  return depth;
}

function collectExperienceAndAncestors(experienceId, experiences, collected) {
  if (collected.has(experienceId)) return;
  collected.add(experienceId);
  const experience = experiences.find((candidate) => String(candidate.experience_id || candidate.id) === experienceId);
  const parents = experience?.parent_experience_ids || experience?.parentExperienceIds || [];
  parents.forEach((parentId) => collectExperienceAndAncestors(String(parentId), experiences, collected));
}

function nearestAvailableLane(desiredY, occupiedLanes, gap) {
  for (let step = 0; step <= occupiedLanes.length; step += 1) {
    const offset = step * gap;
    for (const candidate of [desiredY + offset, desiredY - offset]) {
      if (occupiedLanes.every((lane) => Math.abs(candidate - lane) >= gap)) {
        occupiedLanes.push(candidate);
        return candidate;
      }
    }
  }
  throw new Error("Unable to find an available EXPERIENCE lane");
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
`;
  writeFileSync(path.join(OUTPUT_DIR, "layoutCalculator.js"), calculatorContent, "utf8");

  // 5. Generate sampleModels.js representing .hasm packages
  const sampleModelsContent = `// Sample .hasm model datasets for live 3D visualization
export const SAMPLE_HASM_MODELS = [
  {
    fileName: "AdaLovelaceResearch.hasm",
    title: "Ada Lovelace Research Model",
    model: {
      people: [
        { person_id: "p1", person_name: "Ada Lovelace", birthday: "1815-12-10" }
      ],
      experiences: [
        { experience_id: "e1", experience_name: "Life Stream", parent_experience_ids: [] },
        { experience_id: "e2", experience_name: "Analytical Engine Research", parent_experience_ids: ["e1"] },
        { experience_id: "e3", experience_name: "Algorithm Writing & Publication", parent_experience_ids: ["e1", "e2"] }
      ],
      facts: [
        { fact_id: "f1", fact_name: "Meeting Charles Babbage", occurred_at: "1833-06-05", experience_ids: ["e1"] },
        { fact_id: "f2", fact_name: "Translating Menabrea Paper", occurred_at: "1842-10-01", experience_ids: ["e2"] },
        { fact_id: "f3", fact_name: "Note G: Bernoulli Numbers Algorithm", occurred_at: "1843-07-10", experience_ids: ["e3"] },
        { fact_id: "f4", fact_name: "First Computer Program Publication", occurred_at: "1843-09-01", experience_ids: ["e3"] }
      ],
      links: [
        { link_id: "l1", link_name: "Influenced By Babbage", link_type: "relationship" },
        { link_id: "l2", link_name: "Published Algorithm", link_type: "achievement" }
      ]
    }
  },
  {
    fileName: "AlanTuringEnigma.hasm",
    title: "Alan Turing Cryptanalysis Model",
    model: {
      people: [
        { person_id: "pt1", person_name: "Alan Turing", birthday: "1912-06-23" },
        { person_id: "pt2", person_name: "Joan Clarke", birthday: "1917-06-24" }
      ],
      experiences: [
        { experience_id: "et1", experience_name: "Bletchley Park Station X", parent_experience_ids: [] },
        { experience_id: "et2", experience_name: "Hut 8 Enigma Decryption", parent_experience_ids: ["et1"] },
        { experience_id: "et3", experience_name: "Bombe Electromechanical Machine", parent_experience_ids: ["et1", "et2"] },
        { experience_id: "et4", experience_name: "ACE Computer Design", parent_experience_ids: ["et1"] }
      ],
      facts: [
        { fact_id: "ft1", fact_name: "Joining Government Code School", occurred_at: "1939-09-04", experience_ids: ["et1"] },
        { fact_id: "ft2", fact_name: "Bombe Initial Blueprint", occurred_at: "1939-12-15", experience_ids: ["et3"] },
        { fact_id: "ft3", fact_name: "First Victory Machine Installed", occurred_at: "1940-03-18", experience_ids: ["et3"] },
        { fact_id: "ft4", fact_name: "Naval Enigma Banburismus Method", occurred_at: "1941-05-10", experience_ids: ["et2"] },
        { fact_id: "ft5", fact_name: "Automatic Computing Engine Proposal", occurred_at: "1945-02-19", experience_ids: ["et4"] }
      ],
      links: [
        { link_id: "lt1", link_name: "Led Hut 8 Team", link_type: "collaboration" },
        { link_id: "lt2", link_name: "Designed Bombe", link_type: "breakthrough" }
      ]
    }
  }
];
`;
  writeFileSync(path.join(OUTPUT_DIR, "sampleModels.js"), sampleModelsContent, "utf8");

  logger.info("Successfully synced 3D visualizer from submodules/hasm into src/generated/visualizer.");
}

syncFiles();
