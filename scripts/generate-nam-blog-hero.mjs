import path from "node:path";
import sharp from "sharp";

const repoRoot = path.resolve(import.meta.dirname, "..");
const blogAssetsRoot = path.join(repoRoot, "public", "assets", "blogs");
const outputPath = path.join(blogAssetsRoot, "building-openstudio-nam-rack.webp");

const canvas = {
  height: 1764,
  width: 3360,
};

const screens = {
  amp: {
    path: path.join(blogAssetsRoot, "nam-rack-overview.webp"),
    height: 1080,
    left: 720,
    top: 180,
    width: 1920,
  },
  post: {
    path: path.join(blogAssetsRoot, "nam-rack-post-fx.webp"),
    height: 720,
    left: 2000,
    top: 800,
    width: 1280,
  },
  pre: {
    path: path.join(blogAssetsRoot, "nam-rack-pre-fx.webp"),
    height: 720,
    left: 80,
    top: 800,
    width: 1280,
  },
};

const backdrop = Buffer.from(`
  <svg width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#05070a"/>
        <stop offset="0.55" stop-color="#08080a"/>
        <stop offset="1" stop-color="#040305"/>
      </linearGradient>
      <radialGradient id="warm" cx="50%" cy="38%" r="60%">
        <stop offset="0" stop-color="#28150c" stop-opacity="0.28"/>
        <stop offset="0.55" stop-color="#150b08" stop-opacity="0.12"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="leftGlow" cx="0%" cy="42%" r="42%">
        <stop offset="0" stop-color="#183f2a" stop-opacity="0.16"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="rightGlow" cx="100%" cy="42%" r="42%">
        <stop offset="0" stop-color="#183f2a" stop-opacity="0.16"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-25%" y="-25%" width="150%" height="160%">
        <feGaussianBlur stdDeviation="42"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#base)"/>
    <rect width="100%" height="100%" fill="url(#warm)"/>
    <rect width="100%" height="100%" fill="url(#leftGlow)"/>
    <rect width="100%" height="100%" fill="url(#rightGlow)"/>
    <rect x="670" y="150" width="2020" height="1140" rx="28" fill="#000000" opacity="0.72" filter="url(#shadow)"/>
  </svg>
`);

const prepareSideScreen = async ({ height, path: sourcePath, width }) =>
  sharp(sourcePath, { limitInputPixels: false })
    .resize(width, height, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .modulate({
      brightness: 0.72,
      saturation: 0.84,
    })
    .ensureAlpha(0.88)
    .png()
    .toBuffer();

const prepareAmpScreen = async () =>
  sharp(screens.amp.path, { limitInputPixels: false })
    .resize(screens.amp.width, screens.amp.height, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

const [preScreen, postScreen, ampScreen] = await Promise.all([
  prepareSideScreen(screens.pre),
  prepareSideScreen(screens.post),
  prepareAmpScreen(),
]);

await sharp(backdrop, { limitInputPixels: false })
  .composite([
    {
      input: preScreen,
      left: screens.pre.left,
      top: screens.pre.top,
    },
    {
      input: postScreen,
      left: screens.post.left,
      top: screens.post.top,
    },
    {
      input: ampScreen,
      left: screens.amp.left,
      top: screens.amp.top,
    },
  ])
  .webp({
    effort: 6,
    nearLossless: true,
    quality: 92,
    smartSubsample: true,
  })
  .toFile(outputPath);

console.log(`[blogs] rebuilt ${path.relative(repoRoot, outputPath)} at ${canvas.width}x${canvas.height}.`);
