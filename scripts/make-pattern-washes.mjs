/**
 * Compresses the supplied reference art into the small webp washes the cards
 * actually use.
 *
 * The originals are 650KB–1.4MB PNGs. They're consumed as CSS `background-image`
 * (ProjectsGrid's hover wash, PosterCard's texture), which bypasses next/image
 * entirely — so whatever is in public/ is what every visitor downloads. At the
 * size these render (a ~270px card, at 10–20% opacity) a 640px webp is already
 * more detail than the wash can show.
 *
 * Run: node scripts/make-pattern-washes.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SOURCES = ["ref1", "ref2", "ref3", "ref5"];

await mkdir("public/patterns", { recursive: true });

for (const name of SOURCES) {
  const src = `design/references/${name}.png`;
  const out = `public/patterns/${name}.webp`;

  const info = await sharp(src)
    .resize(640, null, { withoutEnlargement: true })
    .webp({ quality: 66, effort: 6 })
    .toFile(out);

  console.log(`${out.padEnd(28)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
