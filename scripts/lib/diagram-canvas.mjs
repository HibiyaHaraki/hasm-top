// ###################################################
// File Name : diagram-canvas.mjs
// Purpose : Dependency-free 2D raster canvas shared by the ECG diagram scripts.
// Description : Provides a supersampled software rasteriser (polygon fill,
//               round-joined polylines, dashes, circles, arrows and a built-in
//               single-stroke technical font) plus a minimal PNG encoder based on
//               node:zlib. No third-party rendering package is required, so the
//               diagrams can be regenerated from a clean checkout.
// ###################################################

import zlib from "node:zlib";

// ---------------------------------------------------------------------------
// Colour and vector helpers
// ---------------------------------------------------------------------------

export function parseColor(value) {
  return [
    Number.parseInt(value.slice(1, 3), 16),
    Number.parseInt(value.slice(3, 5), 16),
    Number.parseInt(value.slice(5, 7), 16),
  ];
}

export const mixColor = (a, b, t) => {
  const from = typeof a === "string" ? parseColor(a) : a;
  const to = typeof b === "string" ? parseColor(b) : b;
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ];
};

const normalize = (vector) => {
  const length = Math.hypot(vector[0], vector[1]) || 1;
  return [vector[0] / length, vector[1] / length];
};

const distance = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

// Non-zero winding cancels overlapping sub-paths that run in opposite
// directions, which would punch holes into translucent strokes. Normalising the
// orientation of every outline keeps the union filled.
function orientOutline(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  return area < 0 ? [...points].reverse() : points;
}

// Samples an ellipse as a closed polyline, used for round glyph parts.
const ellipsePath = (cx, cy, rx, ry, steps = 32) => {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    points.push([cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry]);
  }
  return points;
};

// Samples a quadratic Bezier whose control point is offset from the chord
// midpoint, so a connector can bow away from the straight line.
export function bowedCurve(from, to, bow, steps = 64) {
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

// Splits a polyline into the "on" runs of a dash pattern.
function dashRuns(points, dash, gap) {
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

// ---------------------------------------------------------------------------
// Single-stroke technical font
// ---------------------------------------------------------------------------
// Glyphs live in a box where x starts at 0, the cap height spans y 0 (top) to
// y 1 (baseline), and `w` is the advance width. Strokes are centrelines, so the
// apparent weight comes from the stroke width chosen at draw time.

const CAP = 0.62;
const GLYPHS = {
  A: { w: 0.74, s: [[[0, 1], [0.31, 0], [0.62, 1]], [[0.1, 0.68], [0.52, 0.68]]] },
  B: {
    w: 0.74,
    s: [
      [[0, 0], [0, 1]],
      [[0, 0], [0.4, 0], [0.55, 0.13], [0.55, 0.37], [0.4, 0.5], [0, 0.5]],
      [[0.4, 0.5], [0.58, 0.64], [0.58, 0.87], [0.42, 1], [0, 1]],
    ],
  },
  C: { w: 0.74, s: [[[0.58, 0.2], [0.44, 0.04], [0.24, 0.02], [0.08, 0.18], [0.03, 0.42], [0.03, 0.6], [0.08, 0.83], [0.24, 0.98], [0.44, 0.96], [0.58, 0.8]]] },
  D: { w: 0.76, s: [[[0, 0], [0, 1]], [[0, 0], [0.34, 0], [0.56, 0.2], [0.6, 0.5], [0.56, 0.8], [0.34, 1], [0, 1]]] },
  E: { w: 0.7, s: [[[0.56, 0], [0, 0], [0, 1], [0.56, 1]], [[0, 0.5], [0.44, 0.5]]] },
  F: { w: 0.68, s: [[[0.56, 0], [0, 0], [0, 1]], [[0, 0.5], [0.44, 0.5]]] },
  G: { w: 0.78, s: [[[0.58, 0.2], [0.44, 0.04], [0.24, 0.02], [0.08, 0.18], [0.03, 0.42], [0.03, 0.62], [0.1, 0.85], [0.28, 0.99], [0.48, 0.94], [0.6, 0.78], [0.6, 0.55]], [[0.36, 0.55], [0.6, 0.55]]] },
  H: { w: 0.78, s: [[[0, 0], [0, 1]], [[0.62, 0], [0.62, 1]], [[0, 0.5], [0.62, 0.5]]] },
  I: { w: 0.48, s: [[[0.2, 0], [0.2, 1]]] },
  J: { w: 0.62, s: [[[0.46, 0], [0.46, 0.78], [0.36, 0.96], [0.17, 1], [0.03, 0.86]]] },
  K: { w: 0.76, s: [[[0, 0], [0, 1]], [[0.58, 0], [0.04, 0.56]], [[0.21, 0.4], [0.6, 1]]] },
  L: { w: 0.66, s: [[[0, 0], [0, 1], [0.54, 1]]] },
  M: { w: 0.88, s: [[[0, 1], [0, 0], [0.36, 0.64], [0.72, 0], [0.72, 1]]] },
  N: { w: 0.8, s: [[[0, 1], [0, 0], [0.62, 1], [0.62, 0]]] },
  O: { w: 0.82, s: [ellipsePath(0.33, 0.5, 0.33, 0.5)] },
  P: { w: 0.72, s: [[[0, 1], [0, 0], [0.42, 0], [0.57, 0.14], [0.57, 0.38], [0.42, 0.52], [0, 0.52]]] },
  Q: { w: 0.84, s: [ellipsePath(0.33, 0.5, 0.33, 0.5), [[0.38, 0.72], [0.66, 1.06]]] },
  R: { w: 0.76, s: [[[0, 1], [0, 0], [0.42, 0], [0.57, 0.14], [0.57, 0.38], [0.42, 0.52], [0, 0.52]], [[0.3, 0.52], [0.6, 1]]] },
  S: { w: 0.72, s: [[[0.55, 0.14], [0.39, 0.01], [0.17, 0.03], [0.05, 0.17], [0.08, 0.36], [0.3, 0.46], [0.51, 0.56], [0.57, 0.76], [0.45, 0.96], [0.21, 0.99], [0.04, 0.85]]] },
  T: { w: 0.7, s: [[[0, 0], [0.62, 0]], [[0.31, 0], [0.31, 1]]] },
  U: { w: 0.78, s: [[[0, 0], [0, 0.72], [0.1, 0.93], [0.31, 1], [0.52, 0.93], [0.62, 0.72], [0.62, 0]]] },
  V: { w: 0.76, s: [[[0, 0], [0.31, 1], [0.62, 0]]] },
  W: { w: 1, s: [[[0, 0], [0.18, 1], [0.41, 0.32], [0.64, 1], [0.82, 0]]] },
  X: { w: 0.76, s: [[[0, 0], [0.62, 1]], [[0.62, 0], [0, 1]]] },
  Y: { w: 0.76, s: [[[0, 0], [0.31, 0.5], [0.62, 0]], [[0.31, 0.5], [0.31, 1]]] },
  Z: { w: 0.72, s: [[[0, 0], [0.6, 0], [0, 1], [0.6, 1]]] },
  0: { w: 0.74, s: [ellipsePath(0.29, 0.5, 0.29, 0.5)] },
  1: { w: 0.52, s: [[[0.03, 0.2], [0.26, 0], [0.26, 1]]] },
  2: { w: 0.7, s: [[[0.04, 0.2], [0.16, 0.03], [0.4, 0.01], [0.56, 0.16], [0.52, 0.4], [0.02, 1], [0.6, 1]]] },
  3: { w: 0.7, s: [[[0.04, 0.14], [0.2, 0], [0.44, 0.04], [0.54, 0.2], [0.4, 0.45], [0.22, 0.47]], [[0.4, 0.45], [0.57, 0.63], [0.53, 0.88], [0.31, 1], [0.06, 0.92]]] },
  4: { w: 0.74, s: [[[0.44, 1], [0.44, 0], [0.02, 0.72], [0.64, 0.72]]] },
  5: { w: 0.7, s: [[[0.55, 0], [0.12, 0], [0.06, 0.42], [0.2, 0.33], [0.42, 0.35], [0.57, 0.54], [0.53, 0.84], [0.29, 1], [0.05, 0.92]]] },
  6: { w: 0.72, s: [[[0.52, 0.05], [0.3, 0], [0.12, 0.18], [0.05, 0.54], [0.08, 0.84], [0.28, 1], [0.49, 0.94], [0.57, 0.74], [0.47, 0.53], [0.24, 0.49], [0.08, 0.62]]] },
  7: { w: 0.68, s: [[[0, 0], [0.6, 0], [0.24, 1]]] },
  8: { w: 0.74, s: [ellipsePath(0.3, 0.25, 0.25, 0.25), ellipsePath(0.3, 0.73, 0.29, 0.27)] },
  9: { w: 0.72, s: [[[0.08, 0.95], [0.3, 1], [0.48, 0.82], [0.55, 0.46], [0.52, 0.16], [0.32, 0], [0.11, 0.06], [0.03, 0.26], [0.13, 0.47], [0.36, 0.51], [0.52, 0.38]]] },
  " ": { w: 0.44, s: [] },
  ".": { w: 0.36, s: [[[0.14, 0.98], [0.18, 0.98]]] },
  ",": { w: 0.36, s: [[[0.2, 0.92], [0.12, 1.14]]] },
  ":": { w: 0.34, s: [[[0.14, 0.32], [0.18, 0.32]], [[0.14, 0.98], [0.18, 0.98]]] },
  "-": { w: 0.6, s: [[[0.06, 0.54], [0.5, 0.54]]] },
  "+": { w: 0.68, s: [[[0.06, 0.54], [0.56, 0.54]], [[0.31, 0.29], [0.31, 0.79]]] },
  "=": { w: 0.68, s: [[[0.06, 0.38], [0.56, 0.38]], [[0.06, 0.7], [0.56, 0.7]]] },
  "/": { w: 0.6, s: [[[0.02, 1.02], [0.5, -0.02]]] },
  "(": { w: 0.44, s: [[[0.36, -0.04], [0.14, 0.22], [0.14, 0.78], [0.36, 1.04]]] },
  ")": { w: 0.44, s: [[[0.08, -0.04], [0.3, 0.22], [0.3, 0.78], [0.08, 1.04]]] },
  "?": { w: 0.66, s: [[[0.06, 0.2], [0.18, 0.02], [0.42, 0.02], [0.55, 0.18], [0.5, 0.4], [0.3, 0.52], [0.3, 0.72]], [[0.3, 0.97], [0.3, 1]]] },
  "→": { w: 1.1, s: [[[0, 0.54], [0.94, 0.54]], [[0.64, 0.3], [0.96, 0.54], [0.64, 0.78]]] },
};

const TRACKING = 0.07;

const glyphFor = (character) => GLYPHS[character] ?? GLYPHS[character.toUpperCase()] ?? GLYPHS["?"];

export function measureText(text, capHeight, tracking = TRACKING) {
  let advance = 0;
  for (const character of text) advance += glyphFor(character).w + tracking;
  return (advance - tracking) * capHeight;
}

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------

export function createCanvas({ width, height, supersample = 4, background = "#ffffff" }) {
  const sampleWidth = width * supersample;
  const sampleHeight = height * supersample;
  const pixels = new Uint8Array(sampleWidth * sampleHeight * 3);
  const base = parseColor(background);
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = base[0];
    pixels[i + 1] = base[1];
    pixels[i + 2] = base[2];
  }

  const blend = (x, y, rgb, alpha) => {
    const index = (y * sampleWidth + x) * 3;
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

  // Scanline fill with the non-zero winding rule. Polygons arrive in page
  // coordinates and are scaled into the supersampled grid here.
  const fill = (polygons, color, alpha = 1) => {
    const rgb = typeof color === "string" ? parseColor(color) : color;
    const edges = [];
    let minY = Infinity;
    let maxY = -Infinity;
    for (const polygon of polygons) {
      if (polygon.length < 3) continue;
      for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i];
        const b = polygon[(i + 1) % polygon.length];
        const ay = a[1] * supersample;
        const by = b[1] * supersample;
        if (ay === by) continue;
        edges.push([a[0] * supersample, ay, b[0] * supersample, by]);
        minY = Math.min(minY, ay, by);
        maxY = Math.max(maxY, ay, by);
      }
    }
    if (!edges.length) return;

    const first = Math.max(0, Math.floor(minY));
    const last = Math.min(sampleHeight - 1, Math.ceil(maxY));
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
        const to = Math.min(sampleWidth - 1, Math.ceil(crossings[i + 1][0] - 0.5) - 1);
        for (let x = from; x <= to; x++) blend(x, y, rgb, alpha);
      }
    }
  };

  const shadeDisc = (cx, cy, radius, shade) => {
    const first = Math.max(0, Math.floor((cx - radius) * supersample));
    const last = Math.min(sampleWidth - 1, Math.ceil((cx + radius) * supersample));
    const top = Math.max(0, Math.floor((cy - radius) * supersample));
    const bottom = Math.min(sampleHeight - 1, Math.ceil((cy + radius) * supersample));
    for (let y = top; y <= bottom; y++) {
      for (let x = first; x <= last; x++) {
        const px = (x + 0.5) / supersample - cx;
        const py = (y + 0.5) / supersample - cy;
        const unit = (px * px + py * py) / (radius * radius);
        if (unit > 1) continue;
        const sample = shade(px / radius, py / radius, unit);
        if (sample) blend(x, y, sample[0], sample[1]);
      }
    }
  };

  const circle = (cx, cy, radius, color, alpha = 1) => {
    const rgb = typeof color === "string" ? parseColor(color) : color;
    shadeDisc(cx, cy, radius, () => [rgb, alpha]);
  };

  const ring = (cx, cy, radius, lineWidth, color, alpha = 1) => {
    const rgb = typeof color === "string" ? parseColor(color) : color;
    const outer = radius + lineWidth / 2;
    const innerRatio = ((radius - lineWidth / 2) / outer) ** 2;
    shadeDisc(cx, cy, outer, (_nx, _ny, unit) => (unit < innerRatio ? null : [rgb, alpha]));
  };

  // Round-joined, round-capped polyline. Opaque strokes compose seamlessly
  // because every supersample is binary; translucent strokes are drawn as a
  // single merged outline instead to avoid double blending at the joints.
  const polyline = (points, lineWidth, color, alpha = 1) => {
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
    if (!quads.length) return;
    if (alpha >= 1) {
      for (const quad of quads) fill([quad], color, alpha);
      if (lineWidth > 1.6) {
        for (const point of points) circle(point[0], point[1], half, color, alpha);
      }
    } else {
      // A single non-zero fill keeps overlapping joints from darkening, and the
      // shared orientation keeps them from cancelling each other out.
      const joints = points.map((point) => ellipsePath(point[0], point[1], half, half, 16));
      const outlines = lineWidth > 1.6 ? quads.concat(joints) : quads;
      fill(outlines.map(orientOutline), color, alpha);
    }
  };

  const dashed = (points, lineWidth, color, { dash = 14, gap = 10, alpha = 1 } = {}) => {
    for (const run of dashRuns(points, dash, gap)) polyline(run, lineWidth, color, alpha);
  };

  const arrowHead = (tip, direction, length, halfWidth, color, alpha = 1) => {
    const [dx, dy] = normalize(direction);
    const back = [tip[0] - dx * length, tip[1] - dy * length];
    fill([[tip, [back[0] - dy * halfWidth, back[1] + dx * halfWidth], [back[0] + dy * halfWidth, back[1] - dx * halfWidth]]], color, alpha);
  };

  const arrow = (from, to, { lineWidth = 3, color = "#000000", head = 16, halfWidth = 7, alpha = 1 } = {}) => {
    const direction = normalize([to[0] - from[0], to[1] - from[1]]);
    const shaftEnd = [to[0] - direction[0] * head * 0.8, to[1] - direction[1] * head * 0.8];
    polyline([from, shaftEnd], lineWidth, color, alpha);
    arrowHead(to, direction, head, halfWidth, color, alpha);
  };

  // Draws a label with the built-in stroke font. `y` is the baseline unless a
  // vertical alignment is requested; `size` is the cap height in pixels.
  const text = (value, x, y, { size = 20, color = "#000000", align = "left", vAlign = "baseline", weight = 0.13, tracking = TRACKING, alpha = 1 } = {}) => {
    const total = measureText(value, size, tracking);
    let cursor = x;
    if (align === "center") cursor -= total / 2;
    else if (align === "right") cursor -= total;

    let baseline = y;
    if (vAlign === "middle") baseline = y + size / 2;
    else if (vAlign === "top") baseline = y + size;

    const lineWidth = Math.max(1.4, size * weight);
    for (const character of value) {
      const glyph = glyphFor(character);
      for (const stroke of glyph.s) {
        if (stroke.length < 2) {
          continue;
        }
        polyline(
          stroke.map(([gx, gy]) => [cursor + gx * size, baseline - size + gy * size]),
          lineWidth,
          color,
          alpha,
        );
      }
      // Single-point marks such as the full stop are painted as round dots.
      for (const stroke of glyph.s) {
        if (stroke.length === 2 && distance(stroke[0], stroke[1]) * size < lineWidth) {
          circle(cursor + stroke[0][0] * size, baseline - size + stroke[0][1] * size, lineWidth * 0.55, color, alpha);
        }
      }
      cursor += (glyph.w + tracking) * size;
    }
    return total;
  };

  const toImage = () => {
    const out = new Uint8Array(width * height * 3);
    const samples = supersample * supersample;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let sy = 0; sy < supersample; sy++) {
          const row = (y * supersample + sy) * sampleWidth;
          for (let sx = 0; sx < supersample; sx++) {
            const index = (row + x * supersample + sx) * 3;
            r += pixels[index];
            g += pixels[index + 1];
            b += pixels[index + 2];
          }
        }
        const index = (y * width + x) * 3;
        out[index] = Math.round(r / samples);
        out[index + 1] = Math.round(g / samples);
        out[index + 2] = Math.round(b / samples);
      }
    }
    return out;
  };

  return {
    width,
    height,
    fill,
    circle,
    ring,
    polyline,
    dashed,
    arrow,
    arrowHead,
    text,
    measure: (value, size, tracking) => measureText(value, size, tracking),
    toPng: () => encodePng(toImage(), width, height),
  };
}

export const FONT_CAP_RATIO = CAP;

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
function filterScanlines(image, width, height) {
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  const candidate = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
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

export function encodePng(image, width, height) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // truecolour
  const data = Buffer.from(image.buffer, image.byteOffset, image.length);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", zlib.deflateSync(filterScanlines(data, width, height), { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}
