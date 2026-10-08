/**
 * Cuts `opening_window.png` into the two pieces <OpeningWindow> composites.
 *
 * The transition needs the artwork to fill any viewport, but the source is a
 * 1125² square with everything at a fixed size. Scaling it to cover would crop
 * the window; letterboxing it would show white margins. So the square is taken
 * apart into the two things that actually want different treatment:
 *
 *   window-valance.webp  the marigold band + black lace, tiled along the top
 *   window-motif.webp    the window itself, centred on the door seam
 *
 * Everything else in the source is one flat colour — a 164,791px sample of the
 * wall came back with *zero* deviation from #5a934e — so the wall is left to
 * CSS as a background colour and keyed out of both crops. That also means the
 * crops can be tight: no green padding is needed to hide a join, because there
 * is no join.
 *
 * All the constants below are measurements, not estimates. See the numbers
 * quoted against each one.
 */
import { statSync } from "node:fs";
import sharp from "sharp";

const SRC = "public/images/opening_window.png";
const OUT_VALANCE = "public/images/window-valance.webp";
const OUT_MOTIF = "public/images/window-motif.webp";

/** The flat wall. Sampled, and confirmed uniform across the whole wall area. */
const WALL = [90, 147, 78];

/**
 * How far a pixel may sit from the wall colour and still be erased. The wall is
 * bit-exact, so this only needs to absorb a stray LSB — keeping it tiny leaves
 * every anti-aliased edge pixel opaque, and since those edges get drawn back
 * over the same green in CSS, the result is pixel-identical to the source.
 */
const TOL = 6;

/**
 * The lace repeats every 105.173px. That came from a least-squares fit through
 * the ten gaps between motifs, which landed within 0.52px of every one of them.
 *
 * Six periods is 631.04px, so a 631px tile accumulates 0.04px of drift per
 * repeat — invisible at any zoom. (One period would drift 0.17px, three 0.48px.)
 */
const VALANCE = { left: 165, top: 30, width: 631, height: 161 };

/**
 * The window's bounding box is x 277..842, y 316..988. Padded 2px for the
 * anti-aliased rim, and kept symmetric about the motif's own centre (559.5) so
 * that centring the crop on the seam centres the window — its mullion lands
 * exactly on the split.
 */
const MOTIF = { left: 275, top: 314, width: 570, height: 677 };

/**
 * The art turned out not to be flat vector — the shutters, arch and sill all
 * carry gradients, so the two crops hold 20k and 44k distinct colours and
 * lossless WebP costs 292 KB between them. Too much for something that has to
 * be on screen in the first frame.
 *
 * q92 is 76 KB. Magnifying the finest detail in each crop 4x — the louvres and
 * the lace edges — at the size they actually render showed no ringing and no
 * difference from lossless: the downscale to display size averages the
 * artefacts away before anyone sees them. q85 (53 KB) also looked clean, but
 * q92 leaves headroom for high-DPI screens, which upscale rather than
 * downscale and so get none of that averaging for free.
 */
const ENCODE = { quality: 92, alphaQuality: 100, effort: 6 };

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W } = info;

/** Erase the wall, in place, over one crop rectangle. Returns the raw RGBA. */
function cut({ left, top, width, height }) {
  const out = Buffer.allocUnsafe(width * height * 4);
  let kept = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const s = ((top + y) * W + (left + x)) * 4;
      const d = (y * width + x) * 4;
      const r = data[s];
      const g = data[s + 1];
      const b = data[s + 2];
      const wall =
        Math.abs(r - WALL[0]) <= TOL && Math.abs(g - WALL[1]) <= TOL && Math.abs(b - WALL[2]) <= TOL;
      out[d] = r;
      out[d + 1] = g;
      out[d + 2] = b;
      out[d + 3] = wall ? 0 : 255;
      if (!wall) kept++;
    }
  }
  return { out, kept };
}

const kb = (p) => `${Math.round(statSync(p).size / 1024)} KB`;

for (const [name, box, path] of [
  ["valance", VALANCE, OUT_VALANCE],
  ["motif", MOTIF, OUT_MOTIF],
]) {
  const { out, kept } = cut(box);
  await sharp(out, { raw: { width: box.width, height: box.height, channels: 4 } })
    .webp(ENCODE)
    .toFile(path);
  const ink = ((kept / (box.width * box.height)) * 100).toFixed(1);
  console.log(
    `${path}  ${box.width}x${box.height}  ${kb(path)}  ${ink}% ink  aspect ${(box.width / box.height).toFixed(4)}`
  );
}

// ---------------------------------------------------------------------------
// Mocks of the closed state, so the composition can be checked before any CSS
// exists. These mirror <OpeningWindow> exactly, including the sizing formulas —
// keep them in step with the CSS, they are the only cheap way to see what a
// viewport looks like before the doors move.
// ---------------------------------------------------------------------------
const clamp = (lo, v, hi) => Math.min(hi, Math.max(lo, v));

async function preview(w, h, out) {
  // --ow-valance-h: clamp(56px, 8.5vw, 136px)
  const valanceH = Math.round(clamp(56, w * 0.085, 136));
  const valanceW = Math.round(VALANCE.width * (valanceH / VALANCE.height));
  // --ow-motif-w: min(72vw, 52vh, 620px) — width-led on phones, height-led on
  // desktops, so the window neither shrinks to a stamp on mobile nor collides
  // with the valance on a short laptop.
  const motifW = Math.round(Math.min(w * 0.72, h * 0.52, 620));
  const motifH = Math.round(motifW * (MOTIF.height / MOTIF.width));

  const valanceTile = await sharp(OUT_VALANCE).resize(valanceW, valanceH).toBuffer();
  const motifArt = await sharp(OUT_MOTIF).resize(motifW, motifH).toBuffer();

  const layers = [];
  // Left door tiles leftward from the seam, right door rightward, so a tile
  // boundary lands exactly on the split and the lace runs across it unbroken.
  for (let x = w / 2; x < w; x += valanceW) layers.push({ input: valanceTile, left: Math.round(x), top: 0 });
  for (let x = w / 2 - valanceW; x > -valanceW; x -= valanceW)
    layers.push({ input: valanceTile, left: Math.round(x), top: 0 });

  layers.push({
    input: motifArt,
    left: Math.round(w / 2 - motifW / 2),
    top: Math.round(h * 0.56 - motifH / 2),
  });
  layers.push({
    input: { create: { width: 2, height: h, channels: 4, background: { r: 233, g: 162, b: 8, alpha: 1 } } },
    left: Math.round(w / 2 - 1),
    top: 0,
  });

  await sharp({
    create: { width: w, height: h, channels: 4, background: { r: WALL[0], g: WALL[1], b: WALL[2], alpha: 1 } },
  })
    .composite(layers)
    .png()
    .toFile(out);
  console.log(`${out}  ${w}x${h}   valance ${valanceW}x${valanceH}   motif ${motifW}x${motifH}`);
}

console.log("");
await preview(1440, 900, "_window-preview.png");
await preview(390, 844, "_window-preview-mobile.png");
console.log(`wall #${WALL.map((v) => v.toString(16).padStart(2, "0")).join("")}`);
