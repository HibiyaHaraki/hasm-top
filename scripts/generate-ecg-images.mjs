// ###################################################
// File Name : generate-ecg-images.mjs
// Purpose : Generate the legacy Extended Commit Graph figures.
// Description : Renders public/images/ecg-layers.png (figure 01) and
//               public/images/ecg-branches.png (figure 02) from a declarative
//               isometric scene description. The renderer is a dependency-free
//               software rasteriser: primitives are drawn into a supersampled RGB
//               buffer, box-filtered down for anti-aliasing, then encoded as PNG
//               with node:zlib. Run with `npm run generate:ecg-images`.
// ###################################################

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import zlib from "node:zlib";
import { createLogger } from "../src/hasm_logger/src/react/logger.js";

const logger = createLogger("generate-ecg-images");

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const OUTPUT_DIR = path.join(REPO_ROOT, "public", "images");

const WIDTH = 1600;
const HEIGHT = 800;
// Every primitive is rasterised at this multiple and box-filtered down, which
// anti-aliases edges and lets overlapping opaque shapes compose without seams.
const SUPERSAMPLE = 4;

// Palette taken from the HASM cool/steel figure styling used on the Extended Commit Graph page.
const COLOR = {
  background: "#f0f9ff",
  grid: "#dae9f2",
  axis: "#78a0b6",
  label: "#082f49",
  causal: "#497d99",
  processBase: "#7fa6ba",
  processLight: "#eef7fd",
  processDark: "#10567a",
  processRim: "#0e5276",
  achievementTop: "#7fa6ba",
  achievementFront: "#0a4f73",
  achievementSide: "#497d99",
  emberDark: "#8a2d0a",
  emberLight: "#b4816f",
  mossDark: "#1e5b2b",
  mossLight: "#759d82",
};

// ---------------------------------------------------------------------------
// Isometric projection
// ---------------------------------------------------------------------------

// Screen anchor of the world origin, i.e. where the three axes meet.
const ORIGIN = [190, 651];
// One X / Z unit is 64px; one Y (depth) unit travels 39px along the 45 degree axis.
const UNIT_X = 64;
const UNIT_Z = 64;
const DEPTH_RISE = 39;
const UNIT_Y = DEPTH_RISE / Math.SQRT1_2;

const project = ([x, y, z]) => [
  ORIGIN[0] + x * UNIT_X + y * UNIT_Y * Math.SQRT1_2,
  ORIGIN[1] - y * UNIT_Y * Math.SQRT1_2 - z * UNIT_Z,
];

// ---------------------------------------------------------------------------
// Vector helpers
// ---------------------------------------------------------------------------

function parseColor(value) {
  return [
    Number.parseInt(value.slice(1, 3), 16),
    Number.parseInt(value.slice(3, 5), 16),
    Number.parseInt(value.slice(5, 7), 16),
  ];
}

const mixColor = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

function normalize(vector) {
  const length = Math.hypot(...vector) || 1;
  return vector.map((value) => value / length);
}

const distance = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

// Samples a quadratic Bezier whose control point is offset from the chord
// midpoint, so an edge can bow away from the straight connection.
function bowedCurve(from, to, bow, steps = 72) {
  const chord = distance(from, to);
  const [nx, ny] = normalize([-(to[1] - from[1]), to[0] - from[0]]);
  const control = [
    (from[0] + to[0]) / 2 + nx * bow * chord,
    (from[1] + to[1]) / 2 + ny * bow * chord,
  ];
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const inv = 1 - t;
    points.push([
      inv * inv * from[0] + 2 * inv * t * control[0] + t * t * to[0],
      inv * inv * from[1] + 2 * inv * t * control[1] + t * t * to[1],
    ]);
  }
  return points;
}

// Walks a polyline and returns the portion between two arc-length offsets, so
// edges can stop short of the node silhouettes they connect.
function trimPolyline(points, headTrim, tailTrim) {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + distance(points[i - 1], points[i]));
  }
  const total = lengths[lengths.length - 1];
  const start = Math.min(headTrim, total * 0.45);
  const end = Math.max(total - Math.min(tailTrim, total * 0.45), start + 1);

  const pointAt = (target) => {
    for (let i = 1; i < points.length; i++) {
      if (lengths[i] >= target) {
        const span = lengths[i] - lengths[i - 1] || 1;
        const t = (target - lengths[i - 1]) / span;
        return [
          points[i - 1][0] + (points[i][0] - points[i - 1][0]) * t,
          points[i - 1][1] + (points[i][1] - points[i - 1][1]) * t,
        ];
      }
    }
    return points[points.length - 1];
  };

  const trimmed = [pointAt(start)];
  for (let i = 0; i < points.length; i++) {
    if (lengths[i] > start && lengths[i] < end) trimmed.push(points[i]);
  }
  trimmed.push(pointAt(end));
  return trimmed;
}

// Splits a polyline into the "on" runs of a dash pattern.
function dashPolyline(points, dash, gap) {
  const runs = [];
  let current = [points[0]];
  let drawing = true;
  let remaining = dash;

  for (let i = 1; i < points.length; i++) {
    let from = points[i - 1];
    const to = points[i];
    let segment = distance(from, to);
    while (segment > remaining) {
      const t = remaining / segment;
      const cut = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
      if (drawing) {
        current.push(cut);
        runs.push(current);
        current = [];
      } else {
        current = [cut];
      }
      drawing = !drawing;
      from = cut;
      segment -= remaining;
      remaining = drawing ? dash : gap;
    }
    remaining -= segment;
    if (drawing) current.push(to);
  }
  if (drawing && current.length > 1) runs.push(current);
  return runs;
}

// Centripetal-style resampling used to smooth the hand-placed glyph skeletons.
function smoothPath(points, widths, steps = 8) {
  const outPoints = [];
  const outWidths = [];
  const last = points.length - 1;
  for (let i = 0; i < last; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(last, i + 2)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      outPoints.push([
        0.5 * (2 * p1[0] + (p2[0] - p0[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (p2[1] - p0[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
      outWidths.push(widths[i] + (widths[i + 1] - widths[i]) * t);
    }
  }
  outPoints.push(points[last]);
  outWidths.push(widths[last]);
  return { points: outPoints, widths: outWidths };
}

// Expands a centreline into a closed outline using a per-point width, which
// gives the modulated strokes a serif face needs.
function thickenPath(points, widths) {
  const left = [];
  const right = [];
  for (let i = 0; i < points.length; i++) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const [nx, ny] = normalize([-(next[1] - prev[1]), next[0] - prev[0]]);
    const half = widths[i] / 2;
    left.push([points[i][0] + nx * half, points[i][1] + ny * half]);
    right.push([points[i][0] - nx * half, points[i][1] - ny * half]);
  }
  return left.concat(right.reverse());
}

// ---------------------------------------------------------------------------
// Raster surface
// ---------------------------------------------------------------------------

function createSurface() {
  const width = WIDTH * SUPERSAMPLE;
  const height = HEIGHT * SUPERSAMPLE;
  const pixels = new Uint8Array(width * height * 3);
  const background = parseColor(COLOR.background);
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = background[0];
    pixels[i + 1] = background[1];
    pixels[i + 2] = background[2];
  }

  const blend = (x, y, rgb, alpha) => {
    const index = (y * width + x) * 3;
    if (alpha >= 1) {
      pixels[index] = rgb[0];
      pixels[index + 1] = rgb[1];
      pixels[index + 2] = rgb[2];
      return;
    }
    pixels[index] += (rgb[0] - pixels[index]) * alpha;
    pixels[index + 1] += (rgb[1] - pixels[index + 1]) * alpha;
    pixels[index + 2] += (rgb[2] - pixels[index + 2]) * alpha;
  };

  // Scanline fill with non-zero winding. Polygons are supplied in page
  // coordinates and scaled into the supersampled grid here.
  const fillPolygons = (polygons, color, alpha = 1) => {
    const rgb = typeof color === "string" ? parseColor(color) : color;
    const edges = [];
    let minY = Infinity;
    let maxY = -Infinity;
    for (const polygon of polygons) {
      const scaled = polygon.map(([x, y]) => [x * SUPERSAMPLE, y * SUPERSAMPLE]);
      for (let i = 0; i < scaled.length; i++) {
        const a = scaled[i];
        const b = scaled[(i + 1) % scaled.length];
        if (a[1] === b[1]) continue;
        edges.push([a[0], a[1], b[0], b[1]]);
        minY = Math.min(minY, a[1], b[1]);
        maxY = Math.max(maxY, a[1], b[1]);
      }
    }
    if (!edges.length) return;

    const first = Math.max(0, Math.floor(minY));
    const last = Math.min(height - 1, Math.ceil(maxY));
    const crossings = [];
    for (let y = first; y <= last; y++) {
      const scan = y + 0.5;
      crossings.length = 0;
      for (const [ax, ay, bx, by] of edges) {
        if ((scan >= ay && scan < by) || (scan >= by && scan < ay)) {
          const t = (scan - ay) / (by - ay);
          crossings.push([ax + (bx - ax) * t, by > ay ? 1 : -1]);
        }
      }
      if (crossings.length < 2) continue;
      crossings.sort((a, b) => a[0] - b[0]);
      let winding = 0;
      for (let i = 0; i < crossings.length - 1; i++) {
        winding += crossings[i][1];
        if (winding === 0) continue;
        const from = Math.max(0, Math.ceil(crossings[i][0] - 0.5));
        const to = Math.min(width - 1, Math.ceil(crossings[i + 1][0] - 0.5) - 1);
        for (let x = from; x <= to; x++) blend(x, y, rgb, alpha);
      }
    }
  };

  // Per-sample disc painter; `shade` may return null to leave a sample untouched.
  const shadeDisc = (cx, cy, radius, shade) => {
    const first = Math.max(0, Math.floor((cx - radius) * SUPERSAMPLE));
    const last = Math.min(width - 1, Math.ceil((cx + radius) * SUPERSAMPLE));
    const top = Math.max(0, Math.floor((cy - radius) * SUPERSAMPLE));
    const bottom = Math.min(height - 1, Math.ceil((cy + radius) * SUPERSAMPLE));
    for (let y = top; y <= bottom; y++) {
      for (let x = first; x <= last; x++) {
        const px = (x + 0.5) / SUPERSAMPLE - cx;
        const py = (y + 0.5) / SUPERSAMPLE - cy;
        const unit = (px * px + py * py) / (radius * radius);
        if (unit > 1) continue;
        const sample = shade(px / radius, py / radius, unit);
        if (sample) blend(x, y, sample[0], sample[1]);
      }
    }
  };

  const fillCircle = (cx, cy, radius, color, alpha = 1) => {
    const rgb = typeof color === "string" ? parseColor(color) : color;
    shadeDisc(cx, cy, radius, () => [rgb, alpha]);
  };

  const strokeCircle = (cx, cy, radius, lineWidth, color, alpha = 1) => {
    const rgb = typeof color === "string" ? parseColor(color) : color;
    const outer = radius + lineWidth / 2;
    const innerRatio = ((radius - lineWidth / 2) / outer) ** 2;
    shadeDisc(cx, cy, outer, (_nx, _ny, unit) => (unit < innerRatio ? null : [rgb, alpha]));
  };

  // Round-joined polyline. Opaque strokes compose seamlessly because every
  // supersample is binary; translucent strokes should use single segments.
  const strokePolyline = (points, lineWidth, color, alpha = 1) => {
    const half = lineWidth / 2;
    const quads = [];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      if (a[0] === b[0] && a[1] === b[1]) continue;
      const [nx, ny] = normalize([-(b[1] - a[1]), b[0] - a[0]]);
      quads.push([
        [a[0] + nx * half, a[1] + ny * half],
        [b[0] + nx * half, b[1] + ny * half],
        [b[0] - nx * half, b[1] - ny * half],
        [a[0] - nx * half, a[1] - ny * half],
      ]);
    }
    for (const quad of quads) fillPolygons([quad], color, alpha);
    if (lineWidth > 2.5) {
      for (let i = 1; i < points.length - 1; i++) {
        fillCircle(points[i][0], points[i][1], half, color, alpha);
      }
    }
  };

  const toImage = () => {
    const out = new Uint8Array(WIDTH * HEIGHT * 3);
    const samples = SUPERSAMPLE * SUPERSAMPLE;
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let sy = 0; sy < SUPERSAMPLE; sy++) {
          const row = (y * SUPERSAMPLE + sy) * width;
          for (let sx = 0; sx < SUPERSAMPLE; sx++) {
            const index = (row + x * SUPERSAMPLE + sx) * 3;
            r += pixels[index];
            g += pixels[index + 1];
            b += pixels[index + 2];
          }
        }
        const index = (y * WIDTH + x) * 3;
        out[index] = Math.round(r / samples);
        out[index + 1] = Math.round(g / samples);
        out[index + 2] = Math.round(b / samples);
      }
    }
    return out;
  };

  return { fillPolygons, fillCircle, strokeCircle, strokePolyline, shadeDisc, toImage };
}

// ---------------------------------------------------------------------------
// Minimal serif type for the node and axis labels
// ---------------------------------------------------------------------------

// Glyphs live in a box where y=0 is the baseline and y=1 the cap height.
// `rect` and `poly` describe straight shapes; `curve` is a modulated stroke.
const GLYPHS = {
  A: {
    advance: 0.76,
    shapes: [
      { poly: [[0.325, 1], [0.405, 1], [0.225, 0.075], [0.145, 0.075]] },
      { poly: [[0.345, 1], [0.44, 1], [0.655, 0.075], [0.5, 0.075]] },
      { rect: [0.205, 0.25, 0.6, 0.35] },
      { rect: [0.075, 0, 0.29, 0.075] },
      { rect: [0.44, 0, 0.715, 0.075] },
      { poly: [[0.3, 1], [0.405, 1], [0.405, 0.91]] },
    ],
  },
  E: {
    advance: 0.66,
    shapes: [
      { rect: [0.095, 0, 0.245, 1] },
      { rect: [0.045, 0.885, 0.6, 1] },
      { rect: [0.545, 0.8, 0.615, 1] },
      { rect: [0.095, 0.455, 0.47, 0.565] },
      { rect: [0.435, 0.4, 0.495, 0.62] },
      { rect: [0.035, 0, 0.635, 0.115] },
      { rect: [0.575, 0, 0.645, 0.22] },
    ],
  },
  R: {
    advance: 0.72,
    shapes: [
      { rect: [0.095, 0, 0.245, 1] },
      { rect: [0.04, 0.925, 0.3, 1] },
      { rect: [0.02, 0, 0.325, 0.075] },
      {
        curve: {
          points: [[0.245, 0.985], [0.4, 0.99], [0.52, 0.92], [0.545, 0.8], [0.52, 0.665], [0.4, 0.58], [0.245, 0.565]],
          widths: [0.075, 0.085, 0.1, 0.115, 0.105, 0.09, 0.075],
        },
      },
      { poly: [[0.355, 0.6], [0.49, 0.6], [0.7, 0.075], [0.555, 0.075]] },
      { rect: [0.525, 0, 0.775, 0.075] },
    ],
  },
  X: {
    // Traced from the reference artwork, so the outline is already italic and
    // already at its final width (see `literal`).
    literal: true,
    advance: 1.2,
    shapes: [
      { poly: [[0.3085, 1], [0.4835, 1], [0.8665, 0], [0.6915, 0]] },
      { poly: [[0.9945, 1], [1.0795, 1], [0.2555, 0], [0.1705, 0]] },
      { rect: [0.275, 0.9, 0.675, 1] },
      { rect: [0.825, 0.9, 1.175, 1] },
      { rect: [0.025, 0, 0.375, 0.1] },
      { rect: [0.525, 0, 0.975, 0.1] },
    ],
  },
  Y: {
    literal: true,
    advance: 1,
    shapes: [
      { poly: [[0.125, 1], [0.275, 1], [0.405, 0.5], [0.255, 0.5]] },
      { poly: [[0.77, 1], [0.87, 1], [0.42, 0.5], [0.32, 0.5]] },
      { poly: [[0.255, 0.52], [0.405, 0.52], [0.265, 0], [0.115, 0]] },
      { rect: [0.025, 0.9, 0.425, 1] },
      { rect: [0.625, 0.9, 0.975, 1] },
      { rect: [0.025, 0, 0.475, 0.1] },
    ],
  },
  Z: {
    advance: 0.68,
    shapes: [
      { rect: [0.075, 0.9, 0.625, 1] },
      { poly: [[0.455, 0.9], [0.625, 0.9], [0.225, 0.1], [0.055, 0.1]] },
      { rect: [0.05, 0, 0.65, 0.105] },
      { rect: [0.075, 0.78, 0.15, 1] },
      { rect: [0.55, 0, 0.625, 0.22] },
    ],
  },
  1: {
    advance: 0.48,
    shapes: [
      { rect: [0.185, 0, 0.33, 1] },
      { poly: [[0.185, 1], [0.185, 0.74], [0.05, 0.845], [0.05, 0.925]] },
      { rect: [0.055, 0, 0.455, 0.075] },
    ],
  },
  2: {
    advance: 0.56,
    shapes: [
      {
        curve: {
          points: [[0.075, 0.78], [0.115, 0.885], [0.215, 0.965], [0.335, 0.975], [0.445, 0.925], [0.485, 0.82], [0.455, 0.7], [0.355, 0.58], [0.205, 0.42], [0.115, 0.275], [0.09, 0.16]],
          widths: [0.06, 0.075, 0.095, 0.11, 0.115, 0.11, 0.105, 0.115, 0.125, 0.115, 0.1],
        },
      },
      { rect: [0.065, 0, 0.525, 0.09] },
    ],
  },
  3: {
    advance: 0.54,
    shapes: [
      {
        curve: {
          points: [[0.065, 0.875], [0.15, 0.955], [0.275, 0.98], [0.395, 0.935], [0.435, 0.845], [0.395, 0.745], [0.265, 0.69]],
          widths: [0.06, 0.08, 0.1, 0.1, 0.095, 0.085, 0.075],
        },
      },
      {
        curve: {
          points: [[0.225, 0.7], [0.375, 0.675], [0.49, 0.575], [0.515, 0.42], [0.46, 0.23], [0.32, 0.105], [0.165, 0.09], [0.055, 0.165]],
          widths: [0.075, 0.09, 0.11, 0.125, 0.125, 0.11, 0.09, 0.065],
        },
      },
    ],
  },
};

const ITALIC_SLANT = 0.21;
const TRACKING = 0.03;
// The reference artwork sets its labels in a wide serif, so every glyph is
// stretched horizontally after the unit-box outlines are built.
const WIDTH_SCALE = 1.32;

function glyphOutlines(character, italic) {
  const glyph = GLYPHS[character];
  if (!glyph) throw new Error(`No glyph defined for "${character}".`);
  // Traced glyphs carry their slant and width in the outline already; the
  // constructed ones are drawn upright and sheared/stretched on the way out.
  const slant = glyph.literal
    ? ([x, y]) => [x, y]
    : ([x, y]) => [(x + (italic ? ITALIC_SLANT * y : 0)) * WIDTH_SCALE, y];
  const outlines = [];
  for (const shape of glyph.shapes) {
    if (shape.rect) {
      const [x0, y0, x1, y1] = shape.rect;
      outlines.push([[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(slant));
    } else if (shape.poly) {
      outlines.push(shape.poly.map(slant));
    } else {
      const { points, widths } = smoothPath(shape.curve.points, shape.curve.widths);
      outlines.push(thickenPath(points, widths).map(slant));
    }
  }
  // Stems, bowls and serifs overlap, and the scanline fill uses the non-zero
  // rule, so every outline has to wind the same way or the overlaps drop out.
  return outlines.map(orientOutline);
}

function orientOutline(points) {
  let twice = 0;
  for (let i = 0; i < points.length; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % points.length];
    twice += x0 * y1 - x1 * y0;
  }
  return twice < 0 ? [...points].reverse() : points;
}

const advanceOf = (character) => {
  const glyph = GLYPHS[character];
  return glyph.literal ? glyph.advance : (glyph.advance + TRACKING) * WIDTH_SCALE;
};

const measureText = (text, capHeight) =>
  [...text].reduce((total, character) => total + advanceOf(character) * capHeight, 0) - TRACKING * WIDTH_SCALE * capHeight;

function drawText(surface, text, anchorX, baseline, capHeight, color, { italic = false, align = "center" } = {}) {
  const width = measureText(text, capHeight);
  let cursor = align === "center" ? anchorX - width / 2 : anchorX;
  const polygons = [];
  for (const character of text) {
    for (const outline of glyphOutlines(character, italic)) {
      // Flip to page coordinates, where y grows downwards from the baseline.
      polygons.push(outline.map(([x, y]) => [cursor + x * capHeight, baseline - y * capHeight]));
    }
    cursor += advanceOf(character) * capHeight;
  }
  surface.fillPolygons(polygons, color);
}

// ---------------------------------------------------------------------------
// Figure primitives
// ---------------------------------------------------------------------------

const AXIS_LABEL_CAP = 20;
const NODE_LABEL_CAP = 21;

const NODE_STYLE = {
  process: { clearance: 22, labelDrop: 56 },
  achievement: { clearance: 27, labelDrop: 64 },
  experience: { clearance: 34, labelDrop: 71 },
};

const PROCESS_RADIUS = 18;
const EXPERIENCE_SPREAD = 0.45;
const EXPERIENCE_RISE = 0.52;
const HALO_RADIUS = 45;

const TONES = {
  ember: { dark: COLOR.emberDark, light: COLOR.emberLight },
  moss: { dark: COLOR.mossDark, light: COLOR.mossLight },
};

function drawArrowhead(surface, tip, direction, length, halfWidth, color) {
  const [dx, dy] = normalize(direction);
  const base = [tip[0] - dx * length, tip[1] - dy * length];
  surface.fillPolygons(
    [[tip, [base[0] - dy * halfWidth, base[1] + dx * halfWidth], [base[0] + dy * halfWidth, base[1] - dx * halfWidth]]],
    color
  );
}

// Objective process node: a lit sphere sitting on the causal plane.
function drawProcess(surface, center) {
  const light = normalize([-0.45, -0.58, 0.68]);
  const half = normalize([light[0], light[1], light[2] + 1]);
  const base = parseColor(COLOR.processBase);
  const dark = parseColor(COLOR.processDark);
  const highlight = parseColor(COLOR.processLight);
  const rim = parseColor(COLOR.processRim);

  surface.fillCircle(center[0], center[1], PROCESS_RADIUS + 1.1, COLOR.processRim);
  surface.shadeDisc(center[0], center[1], PROCESS_RADIUS, (nx, ny, unit) => {
    const nz = Math.sqrt(Math.max(0, 1 - unit));
    const diffuse = Math.max(0, nx * light[0] + ny * light[1] + nz * light[2]);
    const specular = Math.max(0, nx * half[0] + ny * half[1] + nz * half[2]) ** 26;
    let color = mixColor(dark, base, diffuse ** 0.75);
    color = mixColor(color, highlight, 0.85 * specular);
    return [mixColor(color, rim, 0.6 * unit ** 6), 1];
  });
}

// Objective achievement node: an isometric cube with three lit faces. The cube
// is drawn in screen space on true 30-degree edges rather than on the scene
// axes, which is what the reference artwork does.
function drawAchievement(surface, position) {
  const [cx, cy] = project(position);
  const halfWidth = 23;
  const rhombusHalf = 13.6;
  const bodyHeight = 25;
  const lift = 3.2;

  const near = [cx, cy + lift];
  const top = [cx, cy + lift - rhombusHalf * 2];
  const left = [cx - halfWidth, cy + lift - rhombusHalf];
  const right = [cx + halfWidth, cy + lift - rhombusHalf];
  const nearBase = [cx, cy + lift + bodyHeight];
  const leftBase = [cx - halfWidth, cy + lift - rhombusHalf + bodyHeight];
  const rightBase = [cx + halfWidth, cy + lift - rhombusHalf + bodyHeight];

  surface.fillPolygons([[top, right, near, left]], COLOR.achievementTop);
  surface.fillPolygons([[left, near, nearBase, leftBase]], COLOR.achievementFront);
  surface.fillPolygons([[near, right, rightBase, nearBase]], COLOR.achievementSide);

  // The three shared edges catch the light, so they read a shade brighter.
  for (const edge of [[left, near], [near, right], [near, nearBase]]) {
    surface.strokePolyline(edge, 1.2, COLOR.achievementTop, 0.55);
  }
}

// Subjective experience node: an octahedron lifted above the causal plane,
// wrapped in a soft halo that marks it as an interpretation rather than a fact.
function drawExperience(surface, position, tone) {
  const palette = TONES[tone];
  const center = project(position);
  const vertex = (dx, dy, dz) => project([position[0] + dx, position[1] + dy, position[2] + dz]);

  const top = vertex(0, 0, EXPERIENCE_RISE);
  const bottom = vertex(0, 0, -EXPERIENCE_RISE);
  const east = vertex(EXPERIENCE_SPREAD, 0, 0);
  const west = vertex(-EXPERIENCE_SPREAD, 0, 0);

  // The halo is an outline only: its interior stays the page colour so the
  // node still reads as a solid object floating inside an interpretive field.
  surface.strokeCircle(center[0], center[1], HALO_RADIUS, 1.6, palette.dark, 0.156);

  // Four quadrants split by the vertical seam and the horizontal equator.
  surface.fillPolygons([[top, west, center]], palette.dark);
  surface.fillPolygons([[top, center, east]], palette.light);
  surface.fillPolygons([[bottom, west, center]], palette.light);
  surface.fillPolygons([[bottom, center, east]], palette.dark);
  surface.strokePolyline([top, east, bottom, west, top], 1.2, palette.dark, 0.35);
}

// The ground plane: the objective causal layer the experience nodes rise from.
function drawGroundPlane(surface) {
  const depthSteps = 7;
  const planeWidth = 17;
  const columnStep = 170 / UNIT_X;

  for (let depth = 1; depth <= depthSteps; depth++) {
    surface.strokePolyline([project([0, depth, 0]), project([planeWidth, depth, 0])], 1.1, COLOR.grid, 0.75);
  }
  for (let column = columnStep; column <= planeWidth; column += columnStep) {
    surface.strokePolyline([project([column, 0, 0]), project([column, depthSteps, 0])], 1.1, COLOR.grid, 0.75);
  }
}

function drawAxes(surface) {
  // `label` is placed by its centre on x and its baseline on y, measured from
  // the arrow tip so the three captions sit the same way as in the reference.
  const axes = [
    { tip: [18.5, 0, 0], label: "X", offset: [26, 10.5] },
    { tip: [0, 8.8, 0], label: "Y", offset: [32, 1] },
    { tip: [0, 0, 8.05], label: "Z", offset: [-9.2, -18.3] },
  ];
  const origin = project([0, 0, 0]);
  for (const axis of axes) {
    const tip = project(axis.tip);
    const direction = [tip[0] - origin[0], tip[1] - origin[1]];
    const [dx, dy] = normalize(direction);
    surface.strokePolyline([origin, [tip[0] - dx * 13, tip[1] - dy * 13]], 1.9, COLOR.axis);
    drawArrowhead(surface, tip, direction, 16, 6, COLOR.axis);
    drawText(surface, axis.label, tip[0] + axis.offset[0], tip[1] + axis.offset[1], AXIS_LABEL_CAP, COLOR.label, {
      italic: true,
    });
  }
}

// ---------------------------------------------------------------------------
// Scene description
// ---------------------------------------------------------------------------

const SCENES = [
  {
    file: "ecg-layers.png",
    summary: "One history, multiple layers of meaning.",
    nodes: {
      R1: { kind: "process", at: [1.34, 0.8, 0] },
      R2: { kind: "process", at: [5.909, 2.45, 0] },
      A1: { kind: "achievement", at: [10.909, 2.45, 0] },
      A2: { kind: "achievement", at: [14.2, 5.75, 0] },
      E1: { kind: "experience", tone: "ember", at: [5.309, 2.45, 4.335] },
      E2: { kind: "experience", tone: "moss", at: [10.959, 5.75, 3.19] },
    },
    causal: [["R1", "R2"], ["R2", "A1"], ["A1", "A2"]],
    interpretive: [
      ["R1", "E1", -0.06],
      ["E1", "R2", 0.07],
      ["A1", "E2", 0.04],
      ["E2", "A2", -0.1],
    ],
    trajectory: [["E1", "E2", -0.217]],
  },
  {
    file: "ecg-branches.png",
    summary: "Branch the interpretation, not the facts.",
    nodes: {
      R1: { kind: "process", at: [1.34, 0.8, 0] },
      R2: { kind: "process", at: [5.909, 2.45, 0] },
      A1: { kind: "achievement", at: [10.909, 2.45, 0] },
      E1: { kind: "experience", tone: "ember", at: [1.929, 2.45, 3.69] },
      E2: { kind: "experience", tone: "moss", at: [6.789, 2.45, 5.11] },
      E3: { kind: "experience", tone: "ember", at: [13.259, 2.45, 5.705] },
    },
    causal: [["R1", "R2"], ["R2", "A1"]],
    interpretive: [
      ["R1", "E1", -0.07],
      ["R1", "E2", -0.1],
      ["E1", "E3", -0.1],
      ["E3", "A1", -0.06],
    ],
    trajectory: [["E2", "E3", 0.284]],
  },
];

function renderScene(scene) {
  const surface = createSurface();
  const anchor = (id) => project(scene.nodes[id].at);
  const clearance = (id) => NODE_STYLE[scene.nodes[id].kind].clearance;

  drawGroundPlane(surface);
  drawAxes(surface);

  // Causal edges: solid, directed, and drawn under the nodes they connect.
  for (const [from, to] of scene.causal) {
    const path = trimPolyline(bowedCurve(anchor(from), anchor(to), 0), clearance(from), clearance(to) + 16);
    surface.strokePolyline(path, 3.2, COLOR.causal);
    const tip = path[path.length - 1];
    const previous = path[path.length - 2];
    drawArrowhead(surface, [tip[0] + (tip[0] - previous[0]), tip[1] + (tip[1] - previous[1])], [tip[0] - previous[0], tip[1] - previous[1]], 18, 7.5, COLOR.causal);
  }

  // Interpretive edges: dashed curves that never claim causality.
  for (const [from, to, bow] of scene.interpretive) {
    const path = trimPolyline(bowedCurve(anchor(from), anchor(to), bow), clearance(from), clearance(to));
    for (const dash of dashPolyline(path, 12, 9)) {
      surface.strokePolyline(dash, 3, COLOR.emberDark);
    }
  }

  // Trajectories between experiences: smooth, continuous, non-causal momentum.
  for (const [from, to, bow] of scene.trajectory) {
    const path = trimPolyline(bowedCurve(anchor(from), anchor(to), bow), clearance(from), clearance(to));
    surface.strokePolyline(path, 3.2, COLOR.mossDark);
  }

  for (const [id, node] of Object.entries(scene.nodes)) {
    const center = project(node.at);
    if (node.kind === "process") drawProcess(surface, center);
    else if (node.kind === "achievement") drawAchievement(surface, node.at);
    else drawExperience(surface, node.at, node.tone);
    drawText(surface, id, center[0], center[1] + NODE_STYLE[node.kind].labelDrop, NODE_LABEL_CAP, COLOR.label);
  }

  return surface.toImage();
}

// ---------------------------------------------------------------------------
// PNG encoding
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

// Chooses the cheapest standard PNG filter per scanline before deflating.
function filterScanlines(image) {
  const stride = WIDTH * 3;
  const raw = Buffer.alloc((stride + 1) * HEIGHT);
  const candidate = Buffer.alloc(stride);
  for (let y = 0; y < HEIGHT; y++) {
    const row = image.subarray(y * stride, (y + 1) * stride);
    const previous = y > 0 ? image.subarray((y - 1) * stride, y * stride) : null;
    let bestType = 0;
    let bestScore = Infinity;
    let best = null;
    for (let type = 0; type <= 4; type++) {
      let score = 0;
      for (let i = 0; i < stride; i++) {
        const a = i >= 3 ? row[i - 3] : 0;
        const b = previous ? previous[i] : 0;
        const c = previous && i >= 3 ? previous[i - 3] : 0;
        let value;
        if (type === 0) value = row[i];
        else if (type === 1) value = row[i] - a;
        else if (type === 2) value = row[i] - b;
        else if (type === 3) value = row[i] - ((a + b) >> 1);
        else {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          value = row[i] - (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
        }
        candidate[i] = value & 0xff;
        score += Math.min(candidate[i], 256 - candidate[i]);
      }
      if (score < bestScore) {
        bestScore = score;
        bestType = type;
        best = Buffer.from(candidate);
      }
    }
    raw[y * (stride + 1)] = bestType;
    best.copy(raw, y * (stride + 1) + 1);
  }
  return raw;
}

function encodePng(image) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0);
  header.writeUInt32BE(HEIGHT, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", zlib.deflateSync(filterScanlines(Buffer.from(image.buffer, image.byteOffset, image.length)), { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------

mkdirSync(OUTPUT_DIR, { recursive: true });
for (const scene of SCENES) {
  const started = Date.now();
  const target = path.join(OUTPUT_DIR, scene.file);
  const png = encodePng(renderScene(scene));
  writeFileSync(target, png);
  logger.debug("Rendered Extended Commit Graph figure.", {
    file: scene.file,
    summary: scene.summary,
    bytes: png.length,
    durationMs: Date.now() - started,
  });
}

logger.info(`Generated ${SCENES.length} Extended Commit Graph figures in public/images.`);
