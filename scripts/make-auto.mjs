/**
 * Cuts the auto-rickshaw out of `design/references/auto.png`.
 *
 * The source is a product render of a paisley-painted auto on a flat lavender
 * backdrop that darkens toward the top, with a soft contact shadow and a little
 * lens-flare glow spilled onto the ground at the front wheel. None of that
 * survives being flown across the page, so it all comes off here.
 *
 * The backdrop is purple and so is a lot of the paintwork, so a plain colour
 * key would punch holes in the roof. Two things keep it out of the auto:
 *
 *   - the backdrop test keys on the *muted* purple of the ground — blue on top,
 *     then red, then green, with red and green close together (`r - g` small).
 *     The auto's violets and pinks are saturated: green sits far below red, so
 *     they fail the `r - g` window even where blue and red read as purple. Only
 *     the see-through windscreen glass shares the ground's flat tint.
 *   - the flood only travels inward from the border, so anything the auto
 *     encloses — the glass included — is unreachable and stays put.
 *
 * The cut edge is feathered by one pixel so the silhouette doesn't keep a
 * lavender halo over the page.
 *
 *   node scripts/make-auto.mjs
 */
import sharp from "sharp";

const SRC = "design/references/auto.png";
const OUT = "public/images/auto-art.webp";

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: W, height: H } = info;
const idx = (x, y) => (y * W + x) * 4;

/**
 * The lavender backdrop, its top-to-bottom gradient, the soft contact shadow
 * (a darker, still blue-led purple) and the pale flare on the ground. All read
 * as muted purple: blue on top, red above green, and — the clause that saves
 * the roof — red barely above green. The auto's violets and paisley pinks have
 * green far below red, so they fall outside the `r - g` window.
 */
const isBg = (i) => {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  return (
    b >= r - 4 &&
    r >= g - 4 &&
    r - g <= 32 &&
    b - g >= 18 &&
    b <= 205 &&
    g >= 45 &&
    r <= 185
  );
};

// Flood inward from every border pixel. Explicit stack, not recursion — a
// 1200x900 field would overrun a depth-first call stack.
const cleared = new Uint8Array(W * H);
const stack = [];
const push = (x, y) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const p = y * W + x;
  if (cleared[p]) return;
  if (!isBg(p * 4)) return;
  cleared[p] = 1;
  stack.push(x, y);
};

for (let x = 0; x < W; x++) {
  push(x, 0);
  push(x, H - 1);
}
for (let y = 0; y < H; y++) {
  push(0, y);
  push(W - 1, y);
}
while (stack.length) {
  const y = stack.pop();
  const x = stack.pop();
  push(x + 1, y);
  push(x - 1, y);
  push(x, y + 1);
  push(x, y - 1);
}

// Feather: a kept pixel touching cleared ground goes half-transparent, enough
// to kill the fringe without eating the outline.
const edge = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (cleared[p]) continue;
    if (
      (x > 0 && cleared[p - 1]) ||
      (x < W - 1 && cleared[p + 1]) ||
      (y > 0 && cleared[p - W]) ||
      (y < H - 1 && cleared[p + W])
    ) {
      edge[p] = 1;
    }
  }
}

let minX = W;
let minY = H;
let maxX = -1;
let maxY = -1;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (cleared[p]) {
      data[idx(x, y) + 3] = 0;
      continue;
    }
    if (edge[p]) data[idx(x, y) + 3] = 128;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
}

const width = maxX - minX + 1;
const height = maxY - minY + 1;

const out = await sharp(data, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: minX, top: minY, width, height })
  .webp({ quality: 92, alphaQuality: 100 })
  .toFile(OUT);

const clearedCount = cleared.reduce((n, v) => n + v, 0);
console.log(
  `${OUT}  ${out.width}x${out.height}  ${(out.size / 1024).toFixed(0)} KB  ` +
    `(cleared ${((clearedCount / (W * H)) * 100).toFixed(1)}% of source, ` +
    `bbox ${minX},${minY} → ${maxX},${maxY})`
);
