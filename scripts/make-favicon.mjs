import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourcePath = process.argv[2] ?? "scripts/assets/favicon-source.png";
const red = [239, 32, 32];
const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

// Find the white exterior without removing the enclosed white symbol.
const visited = new Uint8Array(width * height);
const queue = [];
function visit(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const pixel = y * width + x;
  if (visited[pixel]) return;
  visited[pixel] = 1;
  const offset = pixel * 4;
  const [r, g, b] = data.subarray(offset, offset + 3);
  if ((r + g + b) / 3 >= 128 || data[offset + 3] === 0) {
    queue.push(pixel);
  }
}
for (let x = 0; x < width; x++) { visit(x, 0); visit(x, height - 1); }
for (let y = 0; y < height; y++) { visit(0, y); visit(width - 1, y); }
for (let index = 0; index < queue.length; index++) {
  const pixel = queue[index];
  const x = pixel % width;
  const y = Math.floor(pixel / width);
  visit(x - 1, y); visit(x + 1, y); visit(x, y - 1); visit(x, y + 1);
}

// Turn black into red. Exterior edge pixels use transparency instead of a
// white matte, while the white symbol inside the circle stays opaque.
for (let pixel = 0; pixel < visited.length; pixel++) {
  const offset = pixel * 4;
  const white = (data[offset] + data[offset + 1] + data[offset + 2]) / (3 * 255);
  for (let channel = 0; channel < 3; channel++) {
    data[offset + channel] = visited[pixel]
      ? red[channel]
      : Math.round(red[channel] * (1 - white) + 255 * white);
  }
  if (visited[pixel]) data[offset + 3] = Math.round(data[offset + 3] * (1 - white));
}

let left = width, top = height, right = 0, bottom = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] > 20) {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
}
if (left > right || top > bottom) throw new Error("The source image has no visible artwork.");
const master = await sharp(data, { raw: { width, height, channels: 4 } })
  .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
  .resize(480, 480, { fit: "contain", background: "#00000000" })
  .extend({ top: 16, bottom: 16, left: 16, right: 16, background: "#00000000" })
  .png().toBuffer();
await fs.mkdir("public/images", { recursive: true });
await fs.writeFile("public/images/favicon-red.png", master);
await fs.writeFile("src/app/icon.png", master);
await sharp(master).resize(180, 180).png().toFile("src/app/apple-icon.png");

// A multi-resolution ICO containing PNG frames, supported by modern browsers.
const sizes = [16, 32, 48, 64, 128, 256];
const frames = await Promise.all(sizes.map((size) => sharp(master).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
frames.forEach((frame, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index] === 256 ? 0 : sizes[index];
  header[entry + 1] = header[entry];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(frame.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await fs.writeFile("src/app/favicon.ico", Buffer.concat([header, ...frames]));
console.log(`Generated favicon assets from ${path.basename(sourcePath)}.`);
