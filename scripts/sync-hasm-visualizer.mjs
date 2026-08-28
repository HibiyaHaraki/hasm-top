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
  // One famous historical figure per region (Europe, United States, Japan, China);
  // each person's first EXPERIENCE encodes their life span (born - died) and each
  // model has 6 experiences and 20+ facts spanning their biography.
  const sampleModelsContent = `// Sample .hasm model datasets for live 3D visualization
export const SAMPLE_HASM_MODELS = [
  {
    fileName: "MarieCurieResearch.hasm",
    title: "Marie Curie Research Model (Europe)",
    model: {
      people: [
        { person_id: "mc1", person_name: "Marie Curie", birthday: "1867-11-07", deathday: "1934-07-04" }
      ],
      experiences: [
        { experience_id: "mce1", experience_name: "Life (1867-11-07 - 1934-07-04)", parent_experience_ids: [] },
        { experience_id: "mce2", experience_name: "Early Education in Warsaw & Paris", parent_experience_ids: ["mce1"] },
        { experience_id: "mce3", experience_name: "Discovery of Radioactivity & New Elements", parent_experience_ids: ["mce1", "mce2"] },
        { experience_id: "mce4", experience_name: "Nobel Prize Recognition", parent_experience_ids: ["mce1", "mce3"] },
        { experience_id: "mce5", experience_name: "World War I Mobile X-ray Units", parent_experience_ids: ["mce1"] },
        { experience_id: "mce6", experience_name: "Founding the Radium Institute", parent_experience_ids: ["mce1", "mce3"] }
      ],
      facts: [
        { fact_id: "mcf1", fact_name: "Born in Warsaw, Congress Poland", occurred_at: "1867-11-07", experience_ids: ["mce2"] },
        { fact_id: "mcf2", fact_name: "Graduated secondary school with a gold medal", occurred_at: "1883-06-12", experience_ids: ["mce2"] },
        { fact_id: "mcf3", fact_name: "Worked as a governess to fund her sister's studies", occurred_at: "1886-01-01", experience_ids: ["mce2"] },
        { fact_id: "mcf4", fact_name: "Moved to Paris and enrolled at the Sorbonne", occurred_at: "1891-11-03", experience_ids: ["mce2"] },
        { fact_id: "mcf5", fact_name: "Earned degree in physics", occurred_at: "1893-07-28", experience_ids: ["mce2"] },
        { fact_id: "mcf6", fact_name: "Earned degree in mathematics", occurred_at: "1894-07-28", experience_ids: ["mce2"] },
        { fact_id: "mcf7", fact_name: "Met Pierre Curie", occurred_at: "1894-04-01", experience_ids: ["mce2"] },
        { fact_id: "mcf8", fact_name: "Married Pierre Curie", occurred_at: "1895-07-26", experience_ids: ["mce2"] },
        { fact_id: "mcf9", fact_name: "Began research on uranium rays", occurred_at: "1897-01-01", experience_ids: ["mce3"] },
        { fact_id: "mcf10", fact_name: "Coined the term \\"radioactivity\\"", occurred_at: "1898-04-12", experience_ids: ["mce3"] },
        { fact_id: "mcf11", fact_name: "Discovered polonium", occurred_at: "1898-07-18", experience_ids: ["mce3"] },
        { fact_id: "mcf12", fact_name: "Discovered radium", occurred_at: "1898-12-26", experience_ids: ["mce3"] },
        { fact_id: "mcf13", fact_name: "Awarded her doctorate in physics", occurred_at: "1903-06-25", experience_ids: ["mce3"] },
        { fact_id: "mcf14", fact_name: "Awarded the Nobel Prize in Physics", occurred_at: "1903-12-10", experience_ids: ["mce4"] },
        { fact_id: "mcf15", fact_name: "Death of Pierre Curie in a street accident", occurred_at: "1906-04-19", experience_ids: ["mce1"] },
        { fact_id: "mcf16", fact_name: "Became the first female professor at the Sorbonne", occurred_at: "1906-05-13", experience_ids: ["mce3"] },
        { fact_id: "mcf17", fact_name: "Isolated pure metallic radium", occurred_at: "1910-01-01", experience_ids: ["mce3"] },
        { fact_id: "mcf18", fact_name: "Awarded the Nobel Prize in Chemistry", occurred_at: "1911-12-10", experience_ids: ["mce4"] },
        { fact_id: "mcf19", fact_name: "Founded the Radium Institute in Paris", occurred_at: "1914-07-01", experience_ids: ["mce6"] },
        { fact_id: "mcf20", fact_name: "Developed mobile X-ray units, the \\"Little Curies\\"", occurred_at: "1914-08-01", experience_ids: ["mce5"] },
        { fact_id: "mcf21", fact_name: "Directed the Red Cross Radiology Service", occurred_at: "1916-01-01", experience_ids: ["mce5"] },
        { fact_id: "mcf22", fact_name: "Died of aplastic anemia from radiation exposure", occurred_at: "1934-07-04", experience_ids: ["mce1"] }
      ],
      links: [
        { link_id: "mcl1", link_name: "Collaborated With Pierre Curie", link_type: "relationship" },
        { link_id: "mcl2", link_name: "Advanced Nuclear Physics", link_type: "breakthrough" },
        { link_id: "mcl3", link_name: "Founded Radium Institute", link_type: "achievement" }
      ]
    }
  },
  {
    fileName: "AbrahamLincolnLeadership.hasm",
    title: "Abraham Lincoln Leadership Model (United States)",
    model: {
      people: [
        { person_id: "al1", person_name: "Abraham Lincoln", birthday: "1809-02-12", deathday: "1865-04-15" }
      ],
      experiences: [
        { experience_id: "ale1", experience_name: "Life (1809-02-12 - 1865-04-15)", parent_experience_ids: [] },
        { experience_id: "ale2", experience_name: "Frontier Youth & Self-Education", parent_experience_ids: ["ale1"] },
        { experience_id: "ale3", experience_name: "Legal & Political Career in Illinois", parent_experience_ids: ["ale1", "ale2"] },
        { experience_id: "ale4", experience_name: "Presidency & Civil War Leadership", parent_experience_ids: ["ale1", "ale3"] },
        { experience_id: "ale5", experience_name: "Emancipation & Constitutional Reform", parent_experience_ids: ["ale1", "ale4"] },
        { experience_id: "ale6", experience_name: "Assassination & National Mourning", parent_experience_ids: ["ale1", "ale4"] }
      ],
      facts: [
        { fact_id: "alf1", fact_name: "Born in a log cabin, Hardin County, Kentucky", occurred_at: "1809-02-12", experience_ids: ["ale2"] },
        { fact_id: "alf2", fact_name: "Family relocated to Indiana", occurred_at: "1816-12-01", experience_ids: ["ale2"] },
        { fact_id: "alf3", fact_name: "Mother Nancy Hanks Lincoln died", occurred_at: "1818-10-05", experience_ids: ["ale2"] },
        { fact_id: "alf4", fact_name: "Family relocated to Illinois", occurred_at: "1830-03-01", experience_ids: ["ale2"] },
        { fact_id: "alf5", fact_name: "Served in the Illinois militia during the Black Hawk War", occurred_at: "1832-04-21", experience_ids: ["ale2"] },
        { fact_id: "alf6", fact_name: "Elected to the Illinois General Assembly", occurred_at: "1834-08-04", experience_ids: ["ale3"] },
        { fact_id: "alf7", fact_name: "Admitted to the Illinois bar", occurred_at: "1836-09-09", experience_ids: ["ale3"] },
        { fact_id: "alf8", fact_name: "Married Mary Todd", occurred_at: "1842-11-04", experience_ids: ["ale3"] },
        { fact_id: "alf9", fact_name: "Elected to the U.S. House of Representatives", occurred_at: "1846-08-03", experience_ids: ["ale3"] },
        { fact_id: "alf10", fact_name: "Delivered the \\"House Divided\\" speech", occurred_at: "1858-06-16", experience_ids: ["ale3"] },
        { fact_id: "alf11", fact_name: "Concluded the Lincoln-Douglas debates", occurred_at: "1858-10-15", experience_ids: ["ale3"] },
        { fact_id: "alf12", fact_name: "Elected 16th President of the United States", occurred_at: "1860-11-06", experience_ids: ["ale4"] },
        { fact_id: "alf13", fact_name: "Inaugurated as President", occurred_at: "1861-03-04", experience_ids: ["ale4"] },
        { fact_id: "alf14", fact_name: "Confederate forces attacked Fort Sumter", occurred_at: "1861-04-12", experience_ids: ["ale4"] },
        { fact_id: "alf15", fact_name: "Issued the preliminary Emancipation Proclamation", occurred_at: "1862-09-22", experience_ids: ["ale5"] },
        { fact_id: "alf16", fact_name: "Emancipation Proclamation took effect", occurred_at: "1863-01-01", experience_ids: ["ale5"] },
        { fact_id: "alf17", fact_name: "Delivered the Gettysburg Address", occurred_at: "1863-11-19", experience_ids: ["ale4"] },
        { fact_id: "alf18", fact_name: "Re-elected as President", occurred_at: "1864-11-08", experience_ids: ["ale4"] },
        { fact_id: "alf19", fact_name: "Advocated passage of the 13th Amendment", occurred_at: "1865-01-31", experience_ids: ["ale5"] },
        { fact_id: "alf20", fact_name: "Accepted Confederate surrender at Appomattox", occurred_at: "1865-04-09", experience_ids: ["ale4"] },
        { fact_id: "alf21", fact_name: "Shot at Ford's Theatre by John Wilkes Booth", occurred_at: "1865-04-14", experience_ids: ["ale6"] },
        { fact_id: "alf22", fact_name: "Died from his wounds", occurred_at: "1865-04-15", experience_ids: ["ale6"] }
      ],
      links: [
        { link_id: "all1", link_name: "Debated Stephen Douglas", link_type: "relationship" },
        { link_id: "all2", link_name: "Issued Emancipation Proclamation", link_type: "achievement" },
        { link_id: "all3", link_name: "Led the Union Through Civil War", link_type: "breakthrough" }
      ]
    }
  },
  {
    fileName: "TokugawaIeyasuUnification.hasm",
    title: "Tokugawa Ieyasu Unification Model (Japan)",
    model: {
      people: [
        { person_id: "ti1", person_name: "Tokugawa Ieyasu", birthday: "1543-01-31", deathday: "1616-06-01" }
      ],
      experiences: [
        { experience_id: "tie1", experience_name: "Life (1543-01-31 - 1616-06-01)", parent_experience_ids: [] },
        { experience_id: "tie2", experience_name: "Hostage Years & Early Alliances", parent_experience_ids: ["tie1"] },
        { experience_id: "tie3", experience_name: "Rise as Daimyo of Mikawa & Kanto", parent_experience_ids: ["tie1", "tie2"] },
        { experience_id: "tie4", experience_name: "Sekigahara Campaign & Unification", parent_experience_ids: ["tie1", "tie3"] },
        { experience_id: "tie5", experience_name: "Founding the Tokugawa Shogunate", parent_experience_ids: ["tie1", "tie4"] },
        { experience_id: "tie6", experience_name: "Retirement as Ogosho & Final Campaigns", parent_experience_ids: ["tie1", "tie5"] }
      ],
      facts: [
        { fact_id: "tif1", fact_name: "Born at Okazaki Castle, Mikawa Province", occurred_at: "1543-01-31", experience_ids: ["tie2"] },
        { fact_id: "tif2", fact_name: "Sent as a hostage to the Imagawa clan", occurred_at: "1549-01-01", experience_ids: ["tie2"] },
        { fact_id: "tif3", fact_name: "Formed an alliance with Oda Nobunaga", occurred_at: "1562-01-01", experience_ids: ["tie2"] },
        { fact_id: "tif4", fact_name: "Took control of Mikawa Province", occurred_at: "1566-01-01", experience_ids: ["tie3"] },
        { fact_id: "tif5", fact_name: "Fought at the Battle of Mikatagahara", occurred_at: "1573-01-25", experience_ids: ["tie3"] },
        { fact_id: "tif6", fact_name: "Allied forces defeated the Takeda clan at Nagashino", occurred_at: "1575-06-28", experience_ids: ["tie3"] },
        { fact_id: "tif7", fact_name: "Received the Kanto region from Toyotomi Hideyoshi", occurred_at: "1590-08-01", experience_ids: ["tie3"] },
        { fact_id: "tif8", fact_name: "Established his castle town at Edo", occurred_at: "1590-09-01", experience_ids: ["tie3"] },
        { fact_id: "tif9", fact_name: "Became guardian regent after Hideyoshi's death", occurred_at: "1598-09-18", experience_ids: ["tie3"] },
        { fact_id: "tif10", fact_name: "Won the decisive Battle of Sekigahara", occurred_at: "1600-10-21", experience_ids: ["tie4"] },
        { fact_id: "tif11", fact_name: "Appointed Shogun by the Emperor", occurred_at: "1603-03-24", experience_ids: ["tie5"] },
        { fact_id: "tif12", fact_name: "Established the Tokugawa shogunate government in Edo", occurred_at: "1603-04-01", experience_ids: ["tie5"] },
        { fact_id: "tif13", fact_name: "Retired the title of Shogun to his son Hidetada", occurred_at: "1605-05-01", experience_ids: ["tie6"] },
        { fact_id: "tif14", fact_name: "Took the title of Ogosho, the retired ruler", occurred_at: "1605-06-01", experience_ids: ["tie6"] },
        { fact_id: "tif15", fact_name: "Issued regulations governing daimyo households", occurred_at: "1611-01-01", experience_ids: ["tie5"] },
        { fact_id: "tif16", fact_name: "Began the Winter Siege of Osaka Castle", occurred_at: "1614-12-01", experience_ids: ["tie6"] },
        { fact_id: "tif17", fact_name: "Ended the Toyotomi clan in the Summer Siege of Osaka", occurred_at: "1615-06-04", experience_ids: ["tie6"] },
        { fact_id: "tif18", fact_name: "Issued the Buke Shohatto code for samurai households", occurred_at: "1615-07-07", experience_ids: ["tie5"] },
        { fact_id: "tif19", fact_name: "Fell ill following a hawking excursion", occurred_at: "1616-01-21", experience_ids: ["tie6"] },
        { fact_id: "tif20", fact_name: "Died at Sunpu Castle", occurred_at: "1616-06-01", experience_ids: ["tie1"] },
        { fact_id: "tif21", fact_name: "Deified posthumously as Tosho Daigongen", occurred_at: "1617-04-01", experience_ids: ["tie6"] },
        { fact_id: "tif22", fact_name: "Enshrined at Nikko Toshogu shrine", occurred_at: "1617-04-17", experience_ids: ["tie6"] }
      ],
      links: [
        { link_id: "til1", link_name: "Allied With Oda Nobunaga", link_type: "relationship" },
        { link_id: "til2", link_name: "Won the Battle of Sekigahara", link_type: "breakthrough" },
        { link_id: "til3", link_name: "Founded the Edo Shogunate", link_type: "achievement" }
      ]
    }
  },
  {
    fileName: "SunYatSenRevolution.hasm",
    title: "Sun Yat-sen Revolution Model (China)",
    model: {
      people: [
        { person_id: "sy1", person_name: "Sun Yat-sen", birthday: "1866-11-12", deathday: "1925-03-12" }
      ],
      experiences: [
        { experience_id: "sye1", experience_name: "Life (1866-11-12 - 1925-03-12)", parent_experience_ids: [] },
        { experience_id: "sye2", experience_name: "Medical Studies & Early Reform Ideas", parent_experience_ids: ["sye1"] },
        { experience_id: "sye3", experience_name: "Revolutionary Organizing in Exile", parent_experience_ids: ["sye1", "sye2"] },
        { experience_id: "sye4", experience_name: "Xinhai Revolution & Founding the Republic", parent_experience_ids: ["sye1", "sye3"] },
        { experience_id: "sye5", experience_name: "Three Principles of the People", parent_experience_ids: ["sye1", "sye3"] },
        { experience_id: "sye6", experience_name: "Reorganizing the Kuomintang", parent_experience_ids: ["sye1", "sye4"] }
      ],
      facts: [
        { fact_id: "syf1", fact_name: "Born in Cuiheng village, Guangdong", occurred_at: "1866-11-12", experience_ids: ["sye2"] },
        { fact_id: "syf2", fact_name: "Traveled to Honolulu to study", occurred_at: "1879-01-01", experience_ids: ["sye2"] },
        { fact_id: "syf3", fact_name: "Enrolled at the Hong Kong College of Medicine", occurred_at: "1887-01-01", experience_ids: ["sye2"] },
        { fact_id: "syf4", fact_name: "Graduated as a licensed physician", occurred_at: "1892-07-23", experience_ids: ["sye2"] },
        { fact_id: "syf5", fact_name: "Founded the Revive China Society", occurred_at: "1894-11-24", experience_ids: ["sye3"] },
        { fact_id: "syf6", fact_name: "First Guangzhou Uprising attempt failed", occurred_at: "1895-10-26", experience_ids: ["sye3"] },
        { fact_id: "syf7", fact_name: "Held at the Chinese legation in London", occurred_at: "1896-10-11", experience_ids: ["sye3"] },
        { fact_id: "syf8", fact_name: "Formed the Tongmenghui revolutionary alliance in Tokyo", occurred_at: "1905-08-20", experience_ids: ["sye3"] },
        { fact_id: "syf9", fact_name: "Published the Three Principles of the People doctrine", occurred_at: "1905-11-26", experience_ids: ["sye5"] },
        { fact_id: "syf10", fact_name: "Organized the Huanggang uprising in Guangdong", occurred_at: "1907-05-22", experience_ids: ["sye3"] },
        { fact_id: "syf11", fact_name: "Wuchang Uprising ignited the Xinhai Revolution", occurred_at: "1911-10-10", experience_ids: ["sye4"] },
        { fact_id: "syf12", fact_name: "Returned to China from an overseas fundraising tour", occurred_at: "1911-12-25", experience_ids: ["sye4"] },
        { fact_id: "syf13", fact_name: "Inaugurated as Provisional President of the Republic of China", occurred_at: "1912-01-01", experience_ids: ["sye4"] },
        { fact_id: "syf14", fact_name: "Resigned the presidency to Yuan Shikai for national unity", occurred_at: "1912-02-13", experience_ids: ["sye4"] },
        { fact_id: "syf15", fact_name: "Founded the Kuomintang political party", occurred_at: "1912-08-25", experience_ids: ["sye4"] },
        { fact_id: "syf16", fact_name: "Launched the Second Revolution against Yuan Shikai", occurred_at: "1913-07-12", experience_ids: ["sye4"] },
        { fact_id: "syf17", fact_name: "Established a military government in Guangzhou", occurred_at: "1917-09-01", experience_ids: ["sye6"] },
        { fact_id: "syf18", fact_name: "Reorganized the Kuomintang with Soviet assistance", occurred_at: "1924-01-20", experience_ids: ["sye6"] },
        { fact_id: "syf19", fact_name: "Delivered his lectures on the Three Principles of the People", occurred_at: "1924-01-27", experience_ids: ["sye5"] },
        { fact_id: "syf20", fact_name: "Founded the Whampoa Military Academy", occurred_at: "1924-06-16", experience_ids: ["sye6"] },
        { fact_id: "syf21", fact_name: "Traveled north to negotiate national unity", occurred_at: "1924-11-13", experience_ids: ["sye6"] },
        { fact_id: "syf22", fact_name: "Died of liver cancer in Beijing", occurred_at: "1925-03-12", experience_ids: ["sye1"] }
      ],
      links: [
        { link_id: "syl1", link_name: "Founded the Tongmenghui Alliance", link_type: "relationship" },
        { link_id: "syl2", link_name: "Led the Xinhai Revolution", link_type: "breakthrough" },
        { link_id: "syl3", link_name: "Authored the Three Principles", link_type: "achievement" }
      ]
    }
  }
];
`;
  writeFileSync(path.join(OUTPUT_DIR, "sampleModels.js"), sampleModelsContent, "utf8");

  logger.info("Successfully synced 3D visualizer from submodules/hasm into src/generated/visualizer.");
}

syncFiles();
