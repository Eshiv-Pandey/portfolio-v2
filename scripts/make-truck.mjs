/**
 * Cuts the truck out of `public/images/truck.png`.
 *
 * The source is a flat-yellow product shot with a soft olive contact shadow
 * painted under the wheels. Neither survives being driven across a white page,
 * so both come off here rather than at runtime.
 *
 * A plain colour-key would punch holes in the truck — the artwork is packed
 * with creams, tans and marigolds that sit inside any tolerance wide enough to
 * span the ground. Two things keep it out of the paintwork:
 *
 *   - the ground test is a *shape* test, not a sampled key. The flat ground is
 *     bright, warm and blue-starved; so is the ~5px pale vignette at the frame
 *     edge. Cream paint on the truck is bright but neutral, so it fails the
 *     blue-deficit clause.
 *   - the flood only travels inward from the border, so anything enclosed by
 *     the truck's outline is unreachable no matter what colour it is.
 *
 * The contact shadow needs its own test, because it is painted on the ground
 * rather than connected to the frame edge by colour. That test is bounded to
 * the rows the shadow actually occupies — above them the truck is full of
 * browns that answer the same description.
 *
 * The cut edge is feathered by one pixel; without it the outline keeps a yellow
 * fringe that reads as a halo over white.
 *
 *   node scripts/make-truck.mjs
 */
import sharp from "sharp";

const SRC = "public/images/truck.png";
const OUT = "public/images/truck-art.webp";

/**
 * First row of the contact shadow. Measured, not guessed: a per-row census of
 * warm pixels left standing after the ground flood jumps from 4 at y=450 to
 * 139 at y=451, peaks at 567 around y=473 and is empty by y=480.
 */
const SHADOW_TOP = 450;

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: W, height: H } = info;
const idx = (x, y) => (y * W + x) * 4;

/** The flat ground yellow, and the paler vignette at the frame edge. */
const isGround = (i) => {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  return r >= 226 && g >= 190 && b <= 190 && r - b >= 60 && g - b >= 30;
};

/**
 * The olive contact shadow, plus the soft ramp where it fades back into the
 * ground — warm, red through to blue in order, with a real blue deficit. The
 * tyres it sits under are navy-black and fail the brightness floor.
 */
const isShadow = (y, i) => {
  if (y < SHADOW_TOP) return false;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  return r > 100 && r >= g && g >= b && r - b > 40;
};

// Flood from every border pixel. Explicit stack, not recursion — 626x626 would
// overrun the call stack depth-first.
const cleared = new Uint8Array(W * H);
const stack = [];
const push = (x, y) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const p = y * W + x;
  if (cleared[p]) return;
  const i = p * 4;
  if (!isGround(i) && !isShadow(y, i)) return;
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
