/** Schedule a meter only when its own canvas is visible and its stage can play.
 * Keep the canvas and elapsed animation time across pauses; never clear on exit.
 */
export function startMeterPlayback(canvas: HTMLCanvasElement, draw: (time: number) => void, initialTime = 0) {
  const stage = canvas.closest<HTMLElement>(".daw-session");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let intersecting = !("IntersectionObserver" in window);
  let frame: number | null = null;
  let lastTime: number | null = null;
  let elapsed = initialTime;
  let disposed = false;
  const visible = () => intersecting && document.visibilityState === "visible";
  const playing = () => visible() && !motion.matches && (!stage || stage.dataset.stagePlaying === "true");
  const tick = (time: number) => {
    frame = null;
    if (disposed || !visible()) return;
    // The upstream meter uses timestamps for peak hold/decay. Hidden time must
    // not advance it or produce a jump when the same canvas resumes.
    elapsed += lastTime === null ? 50 : time - lastTime;
    lastTime = time;
    draw(elapsed);
    if (playing()) frame = requestAnimationFrame(tick);
    else lastTime = null;
  };
  const sync = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
    // One rest-frame paint also keeps reduced-motion and resized meters legible.
    if (visible()) frame = requestAnimationFrame(tick);
  };
  const observer = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.target === canvas) intersecting = entry.isIntersecting;
    sync();
  }) : null;
  observer?.observe(canvas);
  const stageObserver = new MutationObserver(sync);
  if (stage) stageObserver.observe(stage, { attributes: true, attributeFilter: ["data-stage-playing"] });
  const resizeObserver = new ResizeObserver(sync);
  resizeObserver.observe(canvas);
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", sync);
  sync();
  return () => {
    disposed = true;
    if (frame !== null) cancelAnimationFrame(frame);
    observer?.disconnect();
    stageObserver.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", sync);
    motion.removeEventListener("change", sync);
  };
}
