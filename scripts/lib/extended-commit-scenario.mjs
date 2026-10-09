// ###################################################
// File Name : extended-commit-scenario.mjs
// Purpose : Draw the complete Hibiya worked example and its focus variants.
// Description : Keeps one fixed 2D Extended Commit Graph geometry for the full
//               scenario and fades unrelated entities for each reader message.
// ###################################################

import { bowedCurve } from "./diagram-canvas.mjs";

export const SCENARIO_WIDTH = 2400;
export const SCENARIO_HEIGHT = 1500;

const C = {
  bg: "#f0f9ff",
  grid: "#dbe9f3",
  axis: "#78a0b6",
  label: "#082f49",
  muted: "#4b7490",
  ghost: "#9dbccd",
  e1: "#0a4f73",
  e2: "#1e5b2b",
  e3: "#8a2d0a",
  e4: "#6a3f8f",
  link1: "#b24718",
  link2: "#356f8d",
  link3: "#486b2c",
};

const EXPERIENCES = [
  {
    id: "EXPERIENCE 1",
    title: "UNIVERSITY ENTRANCE EXAM",
    summary: "TWO FAILURES LED TO A DIFFERENT UNIVERSITY.",
    x: 350,
    color: C.e1,
    start: 1130,
    end: 884,
  },
  {
    id: "EXPERIENCE 2",
    title: "INTERNATIONAL EXPERIENCE",
    summary: "STUDY ABROAD REVEALED COMPUTATIONAL ENGINEERING.",
    x: 900,
    color: C.e2,
    start: 802,
    end: 556,
  },
  {
    id: "EXPERIENCE 3",
    title: "RESEARCH",
    summary: "LAB WORK DEVELOPED RESEARCH AND PYTHON SKILLS.",
    x: 1450,
    color: C.e3,
    start: 474,
    end: 310,
  },
  {
    id: "EXPERIENCE 4",
    title: "PROGRAMMING",
    summary: "MATLAB AND PYTHON FORM A NEW LEARNING VIEW.",
    x: 2000,
    color: C.e4,
    start: 556,
    end: 392,
  },
];

const FACTS = [
  { id: "FACT 1-1", date: "MAR 2016", summary: "FAILED THE TOHOKU UNIVERSITY ENTRANCE EXAM.", experience: "EXPERIENCE 1", y: 1130 },
  { id: "FACT 1-2", date: "APR 2016", summary: "DECIDED TO TRY THE EXAM AGAIN NEXT YEAR.", experience: "EXPERIENCE 1", y: 1048 },
  { id: "FACT 1-3", date: "MAR 2017", summary: "FAILED THE TOHOKU UNIVERSITY EXAM AGAIN.", experience: "EXPERIENCE 1", y: 966 },
  { id: "FACT 1-4", date: "APR 2017", summary: "ENTERED THE UNIVERSITY OF ELECTRO-COMMUNICATIONS.", experience: "EXPERIENCE 1", y: 884 },
  { id: "FACT 2-1", date: "MAY 2017", summary: "HIS FATHER INSPIRED AN INTERNATIONAL CAREER.", experience: "EXPERIENCE 2", y: 802 },
  { id: "FACT 2-3", date: "AUG 2019", summary: "RECEIVED A CHANCE TO STUDY IN SWEDEN.", experience: "EXPERIENCE 2", y: 720 },
  { id: "FACT 2-4", date: "NOV 2019", summary: "DISCOVERED COMPUTATIONAL ENGINEERING.", experience: "EXPERIENCE 2", y: 638 },
  { id: "FACT 2-5", date: "JAN 2020", summary: "USED MATLAB FOR STRUCTURAL CALCULATIONS.", experience: "EXPERIENCE 2", y: 556 },
  { id: "FACT 3-1", date: "APR 2021", summary: "JOINED A COMPUTATIONAL ENGINEERING LAB.", experience: "EXPERIENCE 3", y: 474 },
  { id: "FACT 3-2", date: "JUN 2021", summary: "LEARNED PYTHON FOR COMPUTATIONAL ENGINEERING.", experience: "EXPERIENCE 3", y: 392 },
  { id: "FACT 3-3", date: "SEP 2021", summary: "WON AN AWARD FOR A RESEARCH PRESENTATION.", experience: "EXPERIENCE 3", y: 310 },
];

const FACT_COPIES = [
  { id: "FACT 4-1 = FACT 2-5", sourceId: "FACT 2-5", summary: "MATLAB BECOMES PART OF THE PROGRAMMING VIEW.", experience: "EXPERIENCE 4", y: 556 },
  { id: "FACT 4-2 = FACT 3-2", sourceId: "FACT 3-2", summary: "PYTHON BECOMES PART OF THE PROGRAMMING VIEW.", experience: "EXPERIENCE 4", y: 392 },
];

const LINKS = [
  {
    id: "LINK 1",
    from: "FACT 1-3",
    to: "FACT 3-3",
    summary: "PERSISTENCE FROM FAILURE SUPPORTS LATER SUCCESS.",
    color: C.link1,
    bow: -0.18,
  },
  {
    id: "LINK 2",
    from: "FACT 2-5",
    to: "FACT 3-2",
    summary: "MATLAB KNOWLEDGE SUPPORTS PYTHON LEARNING.",
    color: C.link2,
    bow: 0.28,
  },
  {
    id: "LINK 3",
    from: "FACT 2-4",
    to: "FACT 3-1",
    summary: "DISCOVERING THE FIELD EXPLAINS THE LAB CHOICE.",
    color: C.link3,
    bow: -0.28,
  },
];

const FOCUS = {
  all: {
    experiences: new Set(EXPERIENCES.map(({ id }) => id)),
    facts: new Set([...FACTS.map(({ id }) => id), ...FACT_COPIES.map(({ id }) => id)]),
    links: new Set(LINKS.map(({ id }) => id)),
    title: "HIBIYA'S LEARNING JOURNEY",
    kicker: "COMPLETE EXTENDED COMMIT GRAPH / 2016-2021",
  },
  revaluation: {
    experiences: new Set(["EXPERIENCE 1", "EXPERIENCE 3"]),
    facts: new Set(["FACT 1-1", "FACT 1-2", "FACT 1-3", "FACT 1-4", "FACT 3-3"]),
    links: new Set(["LINK 1"]),
    title: "NON-LINEAR REVALUATION",
    kicker: "FOCUS / PAST FAILURE AND FUTURE SUCCESS",
  },
  discontinuity: {
    experiences: new Set(["EXPERIENCE 2", "EXPERIENCE 3"]),
    facts: new Set(["FACT 2-4", "FACT 3-1"]),
    links: new Set(["LINK 3"]),
    title: "STRUCTURAL DISCONTINUITY",
    kicker: "FOCUS / A REASON THAT CROSSES EXPERIENCES",
  },
  restructuring: {
    experiences: new Set(["EXPERIENCE 2", "EXPERIENCE 3", "EXPERIENCE 4"]),
    facts: new Set(["FACT 2-5", "FACT 3-2", "FACT 4-1 = FACT 2-5", "FACT 4-2 = FACT 3-2"]),
    links: new Set(),
    title: "RESTRUCTURING THE SUBJECTIVE LAYER",
    kicker: "FOCUS / THE SAME FACTS, A NEW EXPERIENCE",
  },
};

const experienceById = new Map(EXPERIENCES.map((experience) => [experience.id, experience]));
const factById = new Map(FACTS.map((fact) => [fact.id, fact]));

function wrappedText(cv, value, x, y, maxWidth, options = {}) {
  const size = options.size ?? 18;
  const lineHeight = options.lineHeight ?? size * 1.35;
  const words = value.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && cv.measure(candidate, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  lines.forEach((text, index) => cv.text(text, x, y + index * lineHeight, { ...options, size }));
  return lines.length;
}

function scenarioFactDot(cv, x, y, color, alpha, reflected = false) {
  cv.circle(x, y, 15, C.bg, alpha);
  if (reflected) {
    cv.ring(x, y, 11, 3.2, color, alpha);
  } else {
    cv.circle(x, y, 11, color, alpha);
    cv.circle(x, y, 4, C.bg, alpha);
  }
}

function endpoint(factId) {
  const fact = factById.get(factId);
  const experience = experienceById.get(fact.experience);
  return [experience.x, fact.y];
}

function alphaFor(set, id, focus, active = 1, faded = 0.12) {
  return focus === "all" || set.has(id) ? active : faded;
}

export function drawScenarioGraph(cv, focusName = "all") {
  const focus = FOCUS[focusName] || FOCUS.all;

  cv.text(focus.kicker, 72, 66, { size: 19, color: C.muted, weight: 0.15 });
  cv.text(focus.title, 72, 116, { size: 31, color: C.label, weight: 0.145 });

  // Shared index-time rows mirror the visualizer's 2D layout while retaining real dates.
  cv.arrow([118, 1180], [118, 270], { lineWidth: 3, color: C.axis, head: 18, halfWidth: 8 });
  cv.text("TIME", 118, 246, { size: 20, color: C.muted, align: "center" });
  for (const fact of FACTS) {
    cv.polyline([[150, fact.y], [2310, fact.y]], 1.2, C.grid, 0.72);
    cv.text(fact.date, 160, fact.y + 6, { size: 15, color: C.ghost });
  }

  // LINK geometry is drawn first so branches, FACT dots, and labels remain readable above it.
  const linkLabelPoints = new Map();
  for (const link of LINKS) {
    const alpha = alphaFor(focus.links, link.id, focusName, 0.92, 0.08);
    const curve = bowedCurve(endpoint(link.from), endpoint(link.to), link.bow, 100);
    cv.dashed(curve, 4, link.color, { dash: 14, gap: 10, alpha });
    const midpoint = curve[Math.floor(curve.length / 2)];
    linkLabelPoints.set(link.id, midpoint);
  }

  for (const experience of EXPERIENCES) {
    const alpha = alphaFor(focus.experiences, experience.id, focusName, 1, 0.12);
    cv.polyline([[experience.x, experience.start], [experience.x, experience.end]], 7, experience.color, alpha);
    cv.circle(experience.x, experience.start, 7, experience.color, alpha);
    cv.arrowHead([experience.x, experience.end], [0, -1], 19, 9, experience.color, alpha);

    cv.text(experience.id, experience.x, 166, { size: 19, color: experience.color, align: "center", weight: 0.15, alpha });
    cv.text(experience.title, experience.x, 198, { size: 21, color: experience.color, align: "center", weight: 0.145, alpha });
    wrappedText(cv, experience.summary, experience.x, 226, 470, {
      size: 15,
      lineHeight: 20,
      color: C.muted,
      align: "center",
      alpha,
    });
  }

  for (const fact of FACTS) {
    const experience = experienceById.get(fact.experience);
    const alpha = alphaFor(focus.facts, fact.id, focusName, 1, 0.1);
    scenarioFactDot(cv, experience.x, fact.y, experience.color, alpha);
    cv.text(`${fact.id} / ${fact.date}`, experience.x + 25, fact.y - 7, {
      size: 16,
      color: experience.color,
      weight: 0.15,
      alpha,
    });
    wrappedText(cv, fact.summary, experience.x + 25, fact.y + 15, 430, {
      size: 14,
      lineHeight: 19,
      color: C.label,
      alpha,
    });
  }

  for (const copy of FACT_COPIES) {
    const experience = experienceById.get(copy.experience);
    const alpha = alphaFor(focus.facts, copy.id, focusName, 1, 0.1);
    scenarioFactDot(cv, experience.x, copy.y, experience.color, alpha, true);
    cv.text(copy.id, experience.x + 25, copy.y - 7, {
      size: 16,
      color: experience.color,
      weight: 0.15,
      alpha,
    });
    wrappedText(cv, copy.summary, experience.x + 25, copy.y + 15, 340, {
      size: 14,
      lineHeight: 19,
      color: C.label,
      alpha,
    });
  }

  for (const link of LINKS) {
    const alpha = alphaFor(focus.links, link.id, focusName, 1, 0.08);
    const [x, y] = linkLabelPoints.get(link.id);
    cv.fill([[[x - 68, y - 25], [x + 68, y - 25], [x + 68, y + 10], [x - 68, y + 10]]], C.bg, alpha);
    cv.text(link.id, x, y, { size: 18, color: link.color, align: "center", weight: 0.15, alpha });
  }

  cv.polyline([[72, 1255], [2328, 1255]], 1.5, C.grid);
  LINKS.forEach((link, index) => {
    const x = 120 + index * 760;
    const alpha = alphaFor(focus.links, link.id, focusName, 1, 0.1);
    cv.text(link.id, x, 1306, { size: 18, color: link.color, weight: 0.15, alpha });
    cv.text(`${link.from} + ${link.to}`, x, 1336, { size: 15, color: link.color, alpha });
    wrappedText(cv, link.summary, x, 1368, 650, {
      size: 16,
      lineHeight: 22,
      color: C.label,
      alpha,
    });
  });

  cv.text("FILLED DOT = RECORDED FACT", 72, 1460, { size: 15, color: C.muted });
  cv.text("HOLLOW DOT = THE SAME FACT IN A NEW SUBJECTIVE EXPERIENCE", 660, 1460, { size: 15, color: C.muted });
  cv.text("DASHED CURVE = LINK", 1810, 1460, { size: 15, color: C.muted });
}
