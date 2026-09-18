// A small, deterministic light-curtain renderer. All painting happens at this
// fixed resolution: the artwork is intentionally soft, including on Retina/4K.
export const AURA_WIDTH = 480;
export const AURA_HEIGHT = 336;

const CURTAIN_COUNT = 350;
const HUES = [276, 167, 259, 169];

function random(seed: number) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const curtains = Array.from({ length: CURTAIN_COUNT }, (_, index) => {
  const next = random(index * 7919 + 41);
  const duration = 3.8 + next() * 1.8;
  return { duration, offset: next() * duration };
});

/** Paint any time directly; t=0 is also used to generate the static fallback. */
export function createAuraPainter(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { alpha: false });
  const light = document.createElement("canvas");
  light.width = AURA_WIDTH;
  light.height = AURA_HEIGHT;
  const lightContext = light.getContext("2d");
  if (!context || !lightContext || !("filter" in context)) return null;
  canvas.width = AURA_WIDTH;
  canvas.height = AURA_HEIGHT;

  // Cache the four light brushes once instead of allocating hundreds of
  // gradients on every frame. Their height is scaled for each curtain.
  const brushes: HTMLCanvasElement[] = [];
  for (const hue of HUES) {
    const brush = document.createElement("canvas");
    brush.width = 12;
    brush.height = 128;
    const brushContext = brush.getContext("2d");
    if (!brushContext) return null;
    const glow = brushContext.createLinearGradient(0, 0, 0, 128);
    glow.addColorStop(0, `hsla(${hue}, 100%, 65%, 0)`);
    glow.addColorStop(0.5, `hsla(${hue}, 100%, 65%, 1)`);
    glow.addColorStop(1, `hsla(${hue}, 100%, 65%, 0)`);
    brushContext.fillStyle = glow;
    brushContext.fillRect(0, 0, 12, 128);
    brushes.push(brush);
  }

  return (seconds: number) => {
    lightContext.clearRect(0, 0, AURA_WIDTH, AURA_HEIGHT);
    lightContext.globalCompositeOperation = "lighter";
    for (let index = 0; index < curtains.length; index += 1) {
      const { duration, offset } = curtains[index];
      const age = (seconds + offset) / duration;
      const cycle = Math.floor(age);
      const phase = age - cycle;
      const next = random(index * 7919 + cycle * 104729 + 137);
      const x = next() * AURA_WIDTH;
      const height = (0.05 + next() * 0.7) * AURA_HEIGHT;
      const brush = brushes[Math.floor(next() * brushes.length)];
      // Fade each curtain fully out before it is reborn elsewhere. Starting at
      // distributed phases gives a settled frame without simulating a warm-up.
      const strength = Math.sin(Math.PI * phase) ** 2;
      lightContext.globalAlpha = strength;
      lightContext.drawImage(brush, x - 6, AURA_HEIGHT - height, 12, height);
    }
    context.fillStyle = "#fff";
    context.fillRect(0, 0, AURA_WIDTH, AURA_HEIGHT);
    // Blur the small drawing surface, never a full-size viewport texture.
    context.filter = "blur(15px)";
    context.drawImage(light, 0, 0);
    context.filter = "none";
  };
}
