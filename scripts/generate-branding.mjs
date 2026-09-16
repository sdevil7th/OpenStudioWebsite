/** Reproduce website icons from the approved 2160px PNG; never upscale a derivative. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const source = await readFile(path.join(root, "assets/branding/openstudio-logo-source.png"));
const output = path.join(root, "public/assets/openstudio/branding");
await mkdir(output, { recursive: true });
const metadata = await sharp(source).metadata();
if (metadata.width !== 2160 || metadata.height !== 2160) throw new Error("Expected the approved 2160 × 2160 master.");
const sizes = {
  "favicon-16x16.png": 16,
  "favicon-32x32.png": 32,
  "favicon-48x48.png": 48,
  "apple-touch-icon.png": 180,
  "android-chrome-192x192.png": 192,
  "android-chrome-512x512.png": 512,
  "icon.png": 512,
};
for (const [name, size] of Object.entries(sizes)) {
  await sharp(source).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(output, name));
}
for (const size of [78, 216, 512, 1024]) {
  await sharp(source)
    .resize(size, size)
    .webp(size === 78 ? { lossless: true } : { quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(path.join(output, `openstudio-mark-${size}.webp`));
}
// PNG-compressed ICO entries are supported by current Windows and browser icon readers.
const frames = await Promise.all([16, 32, 48, 256].map((size) => sharp(source).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + frames.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(frames.length, 4);
let offset = directory.length;
frames.forEach((frame, index) => {
  const size = [16, 32, 48, 256][index];
  const entry = 6 + index * 16;
  directory[entry] = directory[entry + 1] = size === 256 ? 0 : size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await writeFile(path.join(root, "public/favicon.ico"), Buffer.concat([directory, ...frames]));
console.log(`Branding generated from SHA-256 ${createHash("sha256").update(source).digest("hex")}`);
