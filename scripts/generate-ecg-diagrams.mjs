// ###################################################
// File Name : generate-ecg-diagrams.mjs
// Purpose : Generate the explanatory diagrams used by the Extended Commit Graph page.
// Description : Renders the coordinate model (3D / 2D), the four HASM entity
//               representations (FACT, EXPERIENCE, PERSON, LINK) and the two
//               differences from a Git commit graph into public/images. Drawing
//               is done with the dependency-free rasteriser in lib/diagram-canvas.mjs,
//               so the figures can be regenerated from a clean checkout with
//               `npm run generate:ecg-diagrams`.
// ###################################################

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createCanvas, bowedCurve } from "./lib/diagram-canvas.mjs";
import { createLogger } from "../src/hasm_logger/src/react/logger.js";

const logger = createLogger("generate-ecg-diagrams");

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const OUTPUT_DIR = path.join(REPO_ROOT, "public", "images");

const WIDTH = 1600;
const HEIGHT = 800;

// Palette shared with the existing ECG figures so the whole page reads as one set.
const C = {
  bg: "#f0f9ff",
  grid: "#dbe9f3",
  axis: "#78a0b6",
  label: "#082f49",
  muted: "#4b7490",
  steel: "#0a4f73",
  moss: "#1e5b2b",
  ember: "#8a2d0a",
  link: "#497d99",
  ghost: "#9dbccd",
};

const LINE_W = 7;
const FACT_R = 13;
const TITLE_CAP = 30;
const NOTE_CAP = 21;
const TAG_CAP = 22;

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Paints a background plate behind a label so it stays readable over geometry. */
function labelBox(cv, value, x, baseline, { size = TAG_CAP, color = C.label, align = "center", pad = 9 } = {}) {
  const width = cv.measure(value, size);
  const left = align === "center" ? x - width / 2 : align === "right" ? x - width : x;
  cv.fill([[
    [left - pad, baseline - size - pad * 0.75],
    [left + width + pad, baseline - size - pad * 0.75],
    [left + width + pad, baseline + pad * 0.85],
    [left - pad, baseline + pad * 0.85],
  ]], C.bg);
  cv.text(value, x, baseline, { size, color, align });
}

/** A vertical EXPERIENCE line: constant position, advancing only through time. */
function experienceLine(cv, x, timeStart, timeEnd, color, { cap = true, arrow = true } = {}) {
  cv.polyline([[x, timeStart], [x, timeEnd]], LINE_W, color);
  if (cap) cv.circle(x, timeStart, LINE_W * 0.95, color);
  if (arrow) cv.arrowHead([x, timeEnd], [0, -1], 20, 10, color);
}

/** A FACT: a filled point sitting on one EXPERIENCE line. */
function factDot(cv, x, y, color) {
  cv.circle(x, y, FACT_R + 5, C.bg);
  cv.circle(x, y, FACT_R, color);
  cv.circle(x, y, FACT_R * 0.4, C.bg);
}

/** A recursively echoed FACT, drawn hollow to show it is inherited, not recorded. */
function echoDot(cv, x, y, color) {
  cv.circle(x, y, FACT_R + 5, C.bg);
  cv.ring(x, y, FACT_R - 1, 3.4, color);
}

/** Branch or merge connector between two EXPERIENCE lines. */
function relation(cv, from, to, color, bow) {
  const curve = bowedCurve(from, to, bow, 72);
  cv.polyline(curve, 4.2, color, 0.9);
  const last = curve[curve.length - 1];
  const previous = curve[curve.length - 6];
  cv.arrowHead(last, [last[0] - previous[0], last[1] - previous[1]], 17, 8.5, color, 0.9);
}

function sceneHeader(cv, kicker, title) {
  cv.text(kicker, 76, 80, { size: 19, color: C.link, weight: 0.15 });
  cv.text(title, 76, 128, { size: TITLE_CAP, color: C.label, weight: 0.145 });
}

function footNote(cv, value, x = 76, baseline = HEIGHT - 44) {
  cv.text(value, x, baseline, { size: NOTE_CAP, color: C.muted });
}

/** Vertical "time advances upward" ruler used by the flat 2D style diagrams. */
function timeRuler(cv, x, bottom, top) {
  cv.arrow([x, bottom], [x, top], { lineWidth: 3, color: C.axis, head: 18, halfWidth: 8 });
  cv.text("TIME", x, top - 18, { size: TAG_CAP, color: C.muted, align: "center" });
}

function dashedRect(cv, left, top, right, bottom, color) {
  cv.dashed([[left, top], [right, top], [right, bottom], [left, bottom], [left, top]], 2.6, color, { dash: 13, gap: 10, alpha: 0.85 });
}

// ---------------------------------------------------------------------------
// 01 - The 3D coordinate model
// ---------------------------------------------------------------------------

const ISO = { ox: 430, oy: 668, ux: 84, dx: 60, dy: -34, uz: 56 };
const p3 = ([x, y, z]) => [ISO.ox + x * ISO.ux + y * ISO.dx, ISO.oy + y * ISO.dy - z * ISO.uz];

function drawAxes3d(cv) {
  const spanX = 7;
  const spanY = 4;

  // Ground plane: the XY plane that holds the EXPERIENCE distribution.
  cv.fill([[p3([0, 0, 0]), p3([spanX, 0, 0]), p3([spanX, spanY, 0]), p3([0, spanY, 0])]], "#e4f0f8");
  for (let x = 0; x <= spanX; x++) cv.polyline([p3([x, 0, 0]), p3([x, spanY, 0])], 1.6, C.grid);
  for (let y = 0; y <= spanY; y++) cv.polyline([p3([0, y, 0]), p3([spanX, y, 0])], 1.6, C.grid);

  cv.arrow(p3([0, 0, 0]), [p3([spanX, 0, 0])[0] + 70, ISO.oy], { lineWidth: 3, color: C.axis, head: 18, halfWidth: 8 });
  cv.arrow(p3([0, 0, 0]), p3([0, spanY + 0.7, 0]), { lineWidth: 3, color: C.axis, head: 18, halfWidth: 8 });
  cv.arrow(p3([0, 0, 0]), p3([0, 0, 5]), { lineWidth: 3.4, color: C.axis, head: 20, halfWidth: 9 });

  cv.text("X", p3([spanX, 0, 0])[0] + 92, ISO.oy + 10, { size: TAG_CAP, color: C.muted });
  labelBox(cv, "Y", p3([0, spanY + 0.7, 0])[0] - 28, p3([0, spanY + 0.7, 0])[1] - 8, { align: "right", color: C.muted });
  cv.text("Z : TIME", p3([0, 0, 5])[0] + 24, p3([0, 0, 5])[1] + 8, { size: TAG_CAP, color: C.label });

  const nodes = [
    { at: [1.9, 0.6], color: C.steel, tag: "E1", facts: [0.9, 2.2, 3.4] },
    { at: [4.0, 2.1], color: C.moss, tag: "E2", facts: [1.3, 2.8] },
    { at: [6.3, 3.5], color: C.ember, tag: "E3", facts: [0.7, 2.3, 3.7] },
  ];

  // The in-plane gap between two bases is the relationship between experiences.
  const a = p3([...nodes[0].at, 0]);
  const b = p3([...nodes[1].at, 0]);
  cv.dashed([a, b], 2.8, C.link, { dash: 12, gap: 9 });
  labelBox(cv, "RELATIONSHIP", (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 30, { size: 20, color: C.link });

  // Painter order: the deepest experience line is drawn first.
  for (const node of [...nodes].sort((p, q) => q.at[1] - p.at[1])) {
    const base = p3([...node.at, 0]);
    cv.fill([[
      [base[0] - 16, base[1]], [base[0], base[1] - 9], [base[0] + 16, base[1]], [base[0], base[1] + 9],
    ]], C.grid);
    const top = base[1] - 4.6 * ISO.uz;
    experienceLine(cv, base[0], base[1], top, node.color);
    for (const z of node.facts) factDot(cv, base[0], base[1] - z * ISO.uz, node.color);
    labelBox(cv, node.tag, base[0], top - 26, { color: node.color });
  }

  cv.text("XY PLANE", 1300, 612, { size: TAG_CAP, color: C.label });
  cv.text("EXPERIENCE", 1300, 648, { size: 19, color: C.muted });
  cv.text("DISTRIBUTION", 1300, 678, { size: 19, color: C.muted });

  sceneHeader(cv, "COORDINATE MODEL / 3D", "XY PLANE HOLDS EXPERIENCE, Z IS TIME");
  footNote(cv, "EACH EXPERIENCE KEEPS A FIXED X AND Y, SO A LINE ONLY TRAVELS ALONG TIME.");
}

// ---------------------------------------------------------------------------
// 02 - The flattened 2D coordinate model
// ---------------------------------------------------------------------------

function drawAxes2d(cv) {
  const left = 300;
  const bottom = 664;
  const right = 1460;

  for (let i = 1; i <= 5; i++) {
    const y = bottom - i * 76;
    cv.polyline([[left, y], [right - 40, y]], 1.6, C.grid);
    cv.text(`T${i}`, left - 26, y + 9, { size: 19, color: C.ghost, align: "right" });
  }

  cv.arrow([left, bottom], [right, bottom], { lineWidth: 3, color: C.axis, head: 18, halfWidth: 8 });
  cv.arrow([left, bottom], [left, 212], { lineWidth: 3, color: C.axis, head: 18, halfWidth: 8 });
  cv.text("TIME", left, 190, { size: TAG_CAP, color: C.label, align: "center" });
  cv.text("EXPERIENCE DISTRIBUTION", right, bottom + 46, { size: TAG_CAP, color: C.label, align: "right" });

  const lines = [
    { x: 470, color: C.steel, tag: "E1", start: bottom, facts: [600, 470, 350] },
    { x: 700, color: C.moss, tag: "E2", start: bottom - 76, facts: [500, 380] },
    { x: 1000, color: C.ember, tag: "E3", start: bottom, facts: [620, 436, 320] },
    { x: 1240, color: C.steel, tag: "E4", start: 436, facts: [340] },
  ];

  for (const line of lines) {
    experienceLine(cv, line.x, line.start, 250, line.color);
    for (const y of line.facts) factDot(cv, line.x, y, line.color);
    labelBox(cv, line.tag, line.x, 224, { color: line.color });
  }

  sceneHeader(cv, "COORDINATE MODEL / 2D", "HORIZONTAL IS DISTRIBUTION, VERTICAL IS TIME");
  footNote(cv, "THE XY PLANE IS FLATTENED ONTO ONE HORIZONTAL AXIS, TIME STAYS VERTICAL.");
}

// ---------------------------------------------------------------------------
// 03 - FACT
// ---------------------------------------------------------------------------

function drawEntityFact(cv) {
  const bottom = 668;
  const top = 236;
  timeRuler(cv, 150, bottom, top - 10);

  const lines = [
    { x: 420, color: C.steel, tag: "E1", facts: [600, 470, 330] },
    { x: 700, color: C.moss, tag: "E2", facts: [540, 380] },
    { x: 980, color: C.ember, tag: "E3", facts: [620, 460, 300] },
  ];
  for (const line of lines) {
    experienceLine(cv, line.x, bottom, top, line.color);
    for (const y of line.facts) factDot(cv, line.x, y, line.color);
    labelBox(cv, line.tag, line.x, top - 26, { color: line.color });
  }

  // Call out a single fact to show it is nothing more than a point on its line.
  const focus = [980, 460];
  cv.ring(focus[0], focus[1], 30, 2.6, C.ember, 0.85);
  cv.dashed([[focus[0] + 32, focus[1]], [1210, focus[1]]], 2.6, C.ember, { dash: 11, gap: 8 });
  cv.text("FACT = ONE COMMIT", 1230, focus[1] - 16, { size: 25, color: C.label });
  cv.text("A POINT ON ITS", 1230, focus[1] + 26, { size: 22, color: C.muted });
  cv.text("EXPERIENCE LINE", 1230, focus[1] + 62, { size: 22, color: C.muted });

  sceneHeader(cv, "ENTITY / FACT", "OBJECTIVE INFORMATION, STORED AS A POINT");
  footNote(cv, "A FACT NEVER MOVES: ITS EXPERIENCE AND ITS MOMENT IN TIME ARE FIXED.");
}

// ---------------------------------------------------------------------------
// 04 - EXPERIENCE
// ---------------------------------------------------------------------------

function drawEntityExperience(cv) {
  const bottom = 668;
  const top = 212;
  timeRuler(cv, 140, bottom, top - 10);

  const parentX = 400;
  const selfX = 800;
  const childX = 1200;

  experienceLine(cv, parentX, bottom, top, C.steel);
  labelBox(cv, "PARENT", parentX, 186, { color: C.steel });
  factDot(cv, parentX, 600, C.steel);

  experienceLine(cv, childX, bottom, top, C.ember);
  labelBox(cv, "CHILD", childX, 186, { color: C.ember });
  factDot(cv, childX, 620, C.ember);

  const start = 520;
  const end = 300;
  experienceLine(cv, selfX, start, end, C.moss, { arrow: false });
  factDot(cv, selfX, 460, C.moss);
  factDot(cv, selfX, 370, C.moss);
  labelBox(cv, "EXPERIENCE", selfX, 268, { color: C.moss });

  relation(cv, [parentX, 560], [selfX, start], C.moss, 0.14);
  relation(cv, [selfX, end], [childX, 258], C.moss, 0.14);
  labelBox(cv, "BRANCH OUT", (parentX + selfX) / 2, 586, { size: 20, color: C.moss });
  labelBox(cv, "MERGE INTO", (selfX + childX) / 2, 326, { size: 20, color: C.moss });

  sceneHeader(cv, "ENTITY / EXPERIENCE", "SUBJECTIVE CONTEXT, DRAWN AS A LINE");
  footNote(cv, "A LINE AT CONSTANT X AND Y: IT BRANCHES FROM PARENTS AND MERGES INTO CHILDREN.");
}

// ---------------------------------------------------------------------------
// 05 - PERSON
// ---------------------------------------------------------------------------

function drawEntityPerson(cv) {
  const bottom = 664;
  const top = 300;
  timeRuler(cv, 140, bottom, top - 10);

  const groups = [
    { tag: "PERSON P1", color: C.steel, lines: [380, 580] },
    { tag: "PERSON P2", color: C.moss, lines: [940, 1140] },
  ];

  for (const group of groups) {
    const left = group.lines[0] - 100;
    const right = group.lines[group.lines.length - 1] + 100;
    dashedRect(cv, left, top - 80, right, bottom + 46, C.ghost);
    labelBox(cv, group.tag, (left + right) / 2, top - 98, { size: 24, color: group.color });
    for (const x of group.lines) {
      experienceLine(cv, x, bottom, top, group.color);
      factDot(cv, x, bottom - 80, group.color);
      factDot(cv, x, bottom - 220, group.color);
    }
  }

  cv.text("NOT DRAWN", 1300, 420, { size: 25, color: C.label });
  cv.text("AS ITS OWN", 1300, 458, { size: 25, color: C.label });
  cv.text("NODE", 1300, 496, { size: 25, color: C.label });

  sceneHeader(cv, "ENTITY / PERSON", "VISIBLE ONLY AS THE OWNER OF EXPERIENCE");
  footNote(cv, "PERSON IS NOT PLOTTED DIRECTLY. IT APPEARS THROUGH THE EXPERIENCES THAT BELONG TO IT.");
}

// ---------------------------------------------------------------------------
// 06 - LINK
// ---------------------------------------------------------------------------

function drawEntityLink(cv) {
  const bottom = 660;
  const top = 230;
  timeRuler(cv, 140, bottom, top - 10);

  const leftX = 500;
  const rightX = 1020;

  // A LINK may also span a range of time, which reads as a surface between lines.
  const plane = [[leftX, 560], [rightX, 520], [rightX, 330], [leftX, 370]];
  cv.fill([plane], C.link, 0.14);
  cv.dashed([...plane, plane[0]], 2.4, C.link, { dash: 11, gap: 9, alpha: 0.75 });

  experienceLine(cv, leftX, bottom, top, C.steel);
  experienceLine(cv, rightX, bottom, top, C.moss);
  labelBox(cv, "E1", leftX, top - 26, { color: C.steel });
  labelBox(cv, "E2", rightX, top - 26, { color: C.moss });

  for (const y of [620, 560, 370]) factDot(cv, leftX, y, C.steel);
  for (const y of [520, 330, 280]) factDot(cv, rightX, y, C.moss);

  cv.dashed([[leftX, 620], [rightX, 520]], 3, C.link, { dash: 13, gap: 10 });
  cv.dashed([[leftX, 370], [rightX, 280]], 3, C.link, { dash: 13, gap: 10 });

  labelBox(cv, "LINK AS A LINE", (leftX + rightX) / 2, 608, { size: 20, color: C.link });
  cv.text("LINK AS A PLANE", (leftX + rightX) / 2, 452, { size: 20, color: C.link, align: "center" });

  cv.text("SHOWN AS A", 1200, 392, { size: 24, color: C.label });
  cv.text("DOTTED FORM", 1200, 428, { size: 24, color: C.label });
  cv.text("WHILE THE METHOD", 1200, 470, { size: 20, color: C.muted });
  cv.text("IS UNDER DEVELOPMENT", 1200, 502, { size: 20, color: C.muted });

  sceneHeader(cv, "ENTITY / LINK", "A CONNECTION BETWEEN LINKED ENTITIES");
  footNote(cv, "LINK IS STILL IN DESIGN: THE DOTTED LINE AND PLANE ARE PLACEHOLDERS, NOT A FINAL NOTATION.");
}

// ---------------------------------------------------------------------------
// 07 - Git branches vs. Extended Commit Graph branches
// ---------------------------------------------------------------------------

function drawGitMultiParent(cv) {
  cv.dashed([[800, 150], [800, 712]], 2.4, C.ghost, { dash: 12, gap: 10 });

  // Left: a Git branch always leaves one parent and merges back into one line.
  cv.text("GIT COMMIT GRAPH", 76, 128, { size: 26, color: C.label, weight: 0.145 });
  cv.text("BRANCHING", 76, 80, { size: 19, color: C.link, weight: 0.15 });

  const mainX = 280;
  const sideX = 580;
  experienceLine(cv, mainX, 690, 200, C.steel);
  labelBox(cv, "MAIN", mainX, 174, { size: 20, color: C.steel });
  for (const y of [640, 480, 300]) factDot(cv, mainX, y, C.steel);

  experienceLine(cv, sideX, 540, 340, C.moss, { arrow: false });
  factDot(cv, sideX, 440, C.moss);
  labelBox(cv, "BRANCH", sideX, 308, { size: 20, color: C.moss });
  relation(cv, [mainX, 580], [sideX, 540], C.moss, 0.1);
  relation(cv, [sideX, 340], [mainX, 300], C.moss, 0.1);
  footNote(cv, "ONE PARENT. ONE MERGE TARGET.", 76, 762);

  // Right: an experience can start from several parents and feed several children.
  cv.text("EXTENDED COMMIT GRAPH", 860, 128, { size: 26, color: C.label, weight: 0.145 });
  cv.text("BRANCHING", 860, 80, { size: 19, color: C.link, weight: 0.15 });

  const selfX = 1200;
  const parents = [{ x: 960, tag: "P1" }, { x: 1450, tag: "P2" }];
  const children = [{ x: 960, tag: "C1" }, { x: 1450, tag: "C2" }];

  for (const parent of parents) {
    experienceLine(cv, parent.x, 700, 568, C.steel, { arrow: false });
    factDot(cv, parent.x, 648, C.steel);
    labelBox(cv, parent.tag, parent.x, 734, { size: 20, color: C.steel });
    relation(cv, [parent.x, 568], [selfX, 512], C.moss, parent.x < selfX ? 0.14 : -0.14);
  }

  experienceLine(cv, selfX, 512, 300, C.moss, { arrow: false, cap: false });
  factDot(cv, selfX, 408, C.moss);
  labelBox(cv, "E", selfX - 50, 418, { size: 22, color: C.moss });

  for (const child of children) {
    experienceLine(cv, child.x, 244, 140, C.ember, { cap: false });
    factDot(cv, child.x, 212, C.ember);
    labelBox(cv, child.tag, child.x, 290, { size: 20, color: C.ember });
    relation(cv, [selfX, 300], [child.x, 252], C.moss, child.x < selfX ? 0.14 : -0.14);
  }

  footNote(cv, "MANY PARENTS. MANY CHILDREN.", 860, 762);
}

// ---------------------------------------------------------------------------
// 08 - A fact echoes back through every parent experience
// ---------------------------------------------------------------------------

function drawGitRecursive(cv) {
  const bottom = 700;
  const top = 250;
  timeRuler(cv, 140, bottom, top - 10);

  const e1 = 400;
  const e2 = 820;
  const e3 = 1240;
  const factY = 388;

  experienceLine(cv, e1, bottom, top, C.steel);
  labelBox(cv, "E1", e1, top - 26, { color: C.steel });
  experienceLine(cv, e2, 600, top, C.moss, { arrow: true, cap: false });
  labelBox(cv, "E2", e2, top - 26, { color: C.moss });
  experienceLine(cv, e3, 480, top, C.ember, { arrow: true, cap: false });
  labelBox(cv, "E3", e3, top - 26, { color: C.ember });

  relation(cv, [e1, 648], [e2, 600], C.moss, 0.1);
  relation(cv, [e2, 540], [e3, 480], C.ember, 0.1);

  cv.dashed([[e2, factY], [e3 - 20, factY]], 2.8, C.ember, { dash: 12, gap: 9 });
  cv.dashed([[e1, factY], [e2 - 20, factY]], 2.8, C.ember, { dash: 12, gap: 9 });

  factDot(cv, e3, factY, C.ember);
  cv.ring(e3, factY, 29, 2.6, C.ember, 0.85);
  echoDot(cv, e2, factY, C.ember);
  echoDot(cv, e1, factY, C.ember);

  labelBox(cv, "RECORDED ON E3", e3, factY + 62, { size: 20, color: C.ember });
  labelBox(cv, "ALSO SHOWN ON E2", e2, factY + 62, { size: 20, color: C.muted });
  labelBox(cv, "ALSO SHOWN ON E1", e1, factY + 62, { size: 20, color: C.muted });

  factDot(cv, e1, 560, C.steel);
  factDot(cv, e2, 330, C.moss);

  cv.text("FACT", 76, 80, { size: 19, color: C.link, weight: 0.15 });
  cv.text("RECURSIVE VISIBILITY", 76, 128, { size: TITLE_CAP, color: C.label, weight: 0.145 });
  footNote(cv, "A FACT AFFECTS MORE THAN ONE EXPERIENCE, SO IT STAYS VISIBLE ON EVERY PARENT LINE.");
}

// ---------------------------------------------------------------------------
// Scene table and output
// ---------------------------------------------------------------------------

const SCENES = [
  { file: "ecg-axes-3d.png", summary: "3D coordinate model", draw: drawAxes3d },
  { file: "ecg-axes-2d.png", summary: "2D coordinate model", draw: drawAxes2d },
  { file: "ecg-entity-fact.png", summary: "FACT entity", draw: drawEntityFact },
  { file: "ecg-entity-experience.png", summary: "EXPERIENCE entity", draw: drawEntityExperience },
  { file: "ecg-entity-person.png", summary: "PERSON entity", draw: drawEntityPerson },
  { file: "ecg-entity-link.png", summary: "LINK entity", draw: drawEntityLink },
  { file: "ecg-git-multiparent.png", summary: "Multiple parents and children", draw: drawGitMultiParent },
  { file: "ecg-git-recursive.png", summary: "Recursive fact visibility", draw: drawGitRecursive },
];

mkdirSync(OUTPUT_DIR, { recursive: true });
for (const scene of SCENES) {
  const started = Date.now();
  const canvas = createCanvas({ width: WIDTH, height: HEIGHT, background: C.bg });
  scene.draw(canvas);
  const png = canvas.toPng();
  writeFileSync(path.join(OUTPUT_DIR, scene.file), png);
  logger.debug("Rendered ECG diagram.", {
    file: scene.file,
    summary: scene.summary,
    bytes: png.length,
    durationMs: Date.now() - started,
  });
}

logger.info(`Generated ${SCENES.length} Extended Commit Graph diagrams in public/images.`);
