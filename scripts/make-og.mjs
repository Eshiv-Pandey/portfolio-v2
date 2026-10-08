/**
 * Builds src/app/opengraph-image.jpg — the card people see when the site is
 * shared. Written as a script rather than an `opengraph-image.tsx` route so the
 * result is a static file with no ImageResponse/font runtime at build time.
 *
 * Run: node scripts/make-og.mjs
 */
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const W = 1200;
const H = 630;

const CREAM = "#F7F0E2";
const MARIGOLD = "#E9A208";
const INDIGO = "#243A8E";
const TEAL = "#0E7C7B";
const ROSE = "#C2185B";
const MAROON = "#B3202C";
const INK = "#171310";

/** The same cusped arch the profile photo sits in on the site (JaaliFrame),
 *  authored in 0–1 units and scaled here. */
const ARCH = [
  ["M", 0, 1],
  ["L", 0, 0.44],
  ["Q", 0, 0.3, 0.13, 0.3],
  ["Q", 0.14, 0.14, 0.3, 0.13],
  ["Q", 0.32, 0.02, 0.5, 0.02],
  ["Q", 0.68, 0.02, 0.7, 0.13],
  ["Q", 0.86, 0.14, 0.87, 0.3],
  ["Q", 1, 0.3, 1, 0.44],
  ["L", 1, 1],
  ["Z"],
];

const archPath = (w, h) =>
  ARCH.map(([cmd, ...pts]) => {
    const scaled = pts.map((v, i) => (i % 2 === 0 ? v * w : v * h).toFixed(2));
    return `${cmd} ${scaled.join(" ")}`;
  }).join(" ");

const PHOTO_W = 330;
const PHOTO_H = 424;
const PHOTO_X = 790;
const PHOTO_Y = 103;
const PLATE = 6; // marigold border thickness, the site's 3px scaled up

/** Photo, clipped to the arch, with a marigold plate showing through. */
async function buildPortrait() {
  const inner = await sharp(await readFile("public/images/Eshiv_Pandey.jpeg"))
    .resize(PHOTO_W - PLATE * 2, PHOTO_H - PLATE * 2, {
      fit: "cover",
      position: "center",
    })
    .composite([
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO_W - PLATE * 2}" height="${PHOTO_H - PLATE * 2}">
             <path d="${archPath(PHOTO_W - PLATE * 2, PHOTO_H - PLATE * 2)}" fill="#fff"/>
           </svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const plate = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO_W}" height="${PHOTO_H}">
       <path d="${archPath(PHOTO_W, PHOTO_H)}" fill="${MARIGOLD}"/>
     </svg>`
  );

  return sharp(plate, { density: 300 })
    .resize(PHOTO_W, PHOTO_H)
    .composite([{ input: inner, left: PLATE, top: PLATE }])
    .png()
    .toBuffer();
}

const chips = [
  { label: "Go", x: 70 },
  { label: "TypeScript", x: 146 },
  { label: "C++", x: 290 },
  { label: "Next.js", x: 370 },
  { label: "Kubernetes", x: 476 },
  { label: "PostgreSQL", x: 616 },
];

const background = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <pattern id="jaali" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M20 0 40 20 20 40 0 20Z" fill="none" stroke="${MARIGOLD}" stroke-width="1" opacity="0.3"/>
      <circle cx="20" cy="20" r="2.4" fill="${MARIGOLD}" opacity="0.22"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  <rect width="${W}" height="${H}" fill="url(#jaali)"/>

  <!-- A wash that keeps the pattern off the type -->
  <rect x="0" y="0" width="740" height="${H}" fill="${CREAM}" opacity="0.82"/>

  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="10" fill="none"
        stroke="${TEAL}" stroke-width="2" stroke-dasharray="2 9" stroke-linecap="round"/>

  <text x="70" y="118" font-family="ui-sans-serif, Segoe UI, system-ui, sans-serif"
        font-size="17" font-weight="700" letter-spacing="5.5" fill="${MAROON}">NEW DELHI · INDIA</text>

  <text x="66" y="246" font-family="ui-sans-serif, Segoe UI, system-ui, sans-serif"
        font-size="104" font-weight="800" letter-spacing="-3" fill="${INK}">ESHIV</text>
  <text x="66" y="346" font-family="ui-sans-serif, Segoe UI, system-ui, sans-serif"
        font-size="104" font-weight="800" letter-spacing="-3" fill="${INK}">PANDEY</text>

  <rect x="70" y="386" width="132" height="6" rx="3" fill="${MARIGOLD}"/>
  <rect x="212" y="386" width="46" height="6" rx="3" fill="${ROSE}"/>
  <rect x="268" y="386" width="22" height="6" rx="3" fill="${TEAL}"/>

  <text x="70" y="440" font-family="ui-sans-serif, Segoe UI, system-ui, sans-serif"
        font-size="27" font-weight="700" fill="${INDIGO}">Full Stack Developer · Open Source</text>
  <text x="70" y="478" font-family="ui-sans-serif, Segoe UI, system-ui, sans-serif"
        font-size="21" fill="#5b5347">CNCF HAMi member · B.Tech ECE, University of Delhi</text>

  <g>
    ${chips
      .map(
        (c) => `
      <rect x="${c.x}" y="520" width="${c.label.length * 11 + 26}" height="34" rx="17"
            fill="none" stroke="${INDIGO}" stroke-width="1.4" opacity="0.55"/>
      <text x="${c.x + 13}" y="543" font-family="ui-sans-serif, Segoe UI, system-ui, sans-serif"
            font-size="17" fill="${INDIGO}">${c.label}</text>`
      )
      .join("")}
  </g>
</svg>`;

const portrait = await buildPortrait();

await sharp(Buffer.from(background), { density: 300 })
  .resize(W, H)
  .composite([{ input: portrait, left: PHOTO_X, top: PHOTO_Y }])
  .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
  .toFile("src/app/opengraph-image.jpg");

console.log("wrote src/app/opengraph-image.jpg");
