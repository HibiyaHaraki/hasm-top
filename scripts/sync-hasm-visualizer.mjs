// ###################################################
// File Name : sync-hasm-visualizer.mjs
// Purpose : Sync 3D commit graph visualizer logic from submodules/hasm
//           and generate client-side layout calculation for landing page.
// Description : Reads threeCommitGraph.js and layoutFilter.js from submodules/hasm,
//               and outputs generated visualizer files into src/generated/visualizer/.
// ###################################################

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createLogger } from "../src/hasm_logger/src/react/logger.js";

const logger = createLogger("sync-hasm-visualizer");

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");

const SOURCE_GRAPH = path.join(REPO_ROOT, "submodules", "hasm", "src", "features", "visualizer", "threeCommitGraph.js");
const SOURCE_FILTER = path.join(REPO_ROOT, "submodules", "hasm", "src", "features", "visualizer", "layoutFilter.js");

const OUTPUT_DIR = path.join(REPO_ROOT, "src", "generated", "visualizer");

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function syncFiles() {
  ensureDir(OUTPUT_DIR);

  // 1. Sync threeCommitGraph.js with OrbitControls import fix for standard Vite module resolution
  let graphContent = readFileSync(SOURCE_GRAPH, "utf8");
  graphContent = graphContent.replace(
    'import { OrbitControls } from "three/addons/controls/OrbitControls.js";',
    'import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";'
  );
  writeFileSync(path.join(OUTPUT_DIR, "threeCommitGraph.js"), graphContent, "utf8");

  // 2. Sync layoutFilter.js
  const filterContent = readFileSync(SOURCE_FILTER, "utf8");
  writeFileSync(path.join(OUTPUT_DIR, "layoutFilter.js"), filterContent, "utf8");

  // 3. Generate layoutCalculator.js matching Rust calculate_layout logic in visualizer_commands.rs
  const calculatorContent = `// Generated 3D visualizer layout calculator matching HASM Rust backend (SEQ-03)
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
      id: \`branch-\${expId}\`,
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
          id: \`join-\${parentId}-\${expId}\`,
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
`;
  writeFileSync(path.join(OUTPUT_DIR, "layoutCalculator.js"), calculatorContent, "utf8");

  // 4. Generate sampleModels.js representing .hasm packages
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
