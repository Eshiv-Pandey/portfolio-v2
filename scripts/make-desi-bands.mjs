/**
 * Rebuilds the tile band used by `DesiDivider pattern="tile"` and the footer
 * wordmark backdrop, from `design/references/ref2.png`.
 *
 * The important number here is the crop height. `DesiDivider` scales the whole
 * band down to its own height, so a strip containing N rows of motifs renders
 * each motif at `height / N` px. The first version of this asset was two rows
 * tall, which at a 26px divider put every motif at 13px — below the size where
 * the eye resolves a pattern, so the band read as coloured static. Cropping to
 * exactly one 120px tile row means one motif fills the band's full height.
 *
 * ref2 is a 10x6 grid of 120px tiles. Row 3 (y = 360) is the one row where all
 * ten tiles are whole and centred; the rows above and below cut the 2x2
 * medallions in half.
 *
 * The strip is then mirrored onto its own flip so `repeat-x` has no visible
 * seam — ref2's left and right edges don't meet.
 *
 *   node scripts/make-desi-bands.mjs
 */
import sharp from "sharp";

const SRC = "design/references/ref2.png";
const OUT = "public/images/desi-band-tile.webp";

const ROW_Y = 360;
const ROW_H = 120;
const ROW_W = 1200;

const row = await sharp(SRC)
  .extract({ left: 0, top: ROW_Y, width: ROW_W, height: ROW_H })
  .png()
  .toBuffer();

const flipped = await sharp(row).flop().png().toBuffer();

const info = await sharp({
  create: {
    width: ROW_W * 2,
    height: ROW_H,
    channels: 3,
    background: "#ffffff",
  },
})
  .composite([
    { input: row, left: 0, top: 0 },
    { input: flipped, left: ROW_W, top: 0 },
  ])
  .webp({ quality: 82, effort: 6 })
  .toFile(OUT);

console.log(
  `${OUT}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB  (aspect ${info.width / info.height}:1)`,
);
