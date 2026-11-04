/** Build the 1200×630 card used when eshiv.in is shared. */
import sharp from "sharp";
import path from "node:path";

const width = 1200;
const height = 630;
const fontfile = path.resolve("scripts/assets/PixelifySans.ttf");

const name = await sharp({
  text: {
    text: '<span foreground="#f5f3eb" weight="bold">Eshiv\nPandey</span>',
    font: "Pixelify Sans",
    fontfile,
    width: 640,
    height: 250,
    align: "left",
    rgba: true,
  },
}).png().toBuffer();

const portrait = await sharp("public/images/pic1.jpeg")
  .resize(272, 272, { fit: "cover", position: "attention" })
  .composite([{
    input: Buffer.from('<svg width="272" height="272"><rect width="272" height="272" rx="12" fill="white"/></svg>'),
    blend: "dest-in",
  }])
  .png().toBuffer();

const favicon = await sharp("public/images/favicon-red.png").resize(44, 44).png().toBuffer();

const board = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="1200" height="630" fill="#111310"/>
  <rect x="24" y="24" width="1152" height="582" rx="16" fill="none" stroke="#30362b"/>
  <text x="104" y="78" font-family="Segoe UI, sans-serif" font-size="22" fill="#c5f261">eshiv.in</text>
  <rect x="804" y="154" width="292" height="320" rx="16" fill="#1b1e18" stroke="#404735"/>
  <text x="950" y="460" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="16" fill="#b9c0ad">New Delhi, India</text>
  <text x="72" y="459" font-family="Segoe UI, sans-serif" font-size="27" fill="#c5f261">Engineer &amp; open-source contributor.</text>
  <text x="72" y="499" font-family="Segoe UI, sans-serif" font-size="22" fill="#b9c0ad">Backends, infrastructure, and databases.</text>
  <path d="M72 550H1128" stroke="#30362b"/>
  <text x="72" y="584" font-family="Segoe UI, sans-serif" font-size="16" fill="#b9c0ad">Selected work, open source, and ideas.</text>
</svg>`);

await sharp(board)
  .composite([
    { input: favicon, left: 54, top: 46 },
    { input: name, left: 68, top: 161 },
    { input: portrait, left: 814, top: 164 },
  ])
  .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
  .toFile("src/app/opengraph-image.jpg");

console.log("Generated the portfolio share card.");
