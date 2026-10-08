/**
 * Rasterises the hand-drawn project covers to the PNGs the cards actually load.
 *
 * KeyV DB and tRAGtion have no UI to screenshot, so their covers are SVG
 * diagrams of what the projects are. `next/image` can serve SVG only with
 * `dangerouslyAllowSVG`, which isn't worth enabling for two files, so they ship
 * as PNGs and the SVGs stay as the editable source.
 *
 * 2x the 712x400 canvas. The width is deliberate — see the note at the top of
 * `keyv-db.svg` for the two container aspects this has to survive.
 *
 *   node scripts/make-project-covers.mjs
 */
import sharp from "sharp";

const COVERS = ["keyv-db", "tragtion"];

const SCALE = 2;
const WIDTH = 712 * SCALE;
const HEIGHT = 400 * SCALE;

for (const name of COVERS) {
  const src = `public/project-image/${name}.svg`;
  const out = `public/project-image/${name}.png`;

  // `density` is what actually drives librsvg's rasterisation; resizing after
  // the fact would just upscale a 712px bitmap and blur the 9px label text.
  const info = await sharp(src, { density: 72 * SCALE })
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(out);

  console.log(
    `${out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB  (aspect ${(info.width / info.height).toFixed(3)}:1)`,
  );
}
