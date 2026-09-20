/** Start decorative work after the route is rendered and the initial loader exits. */
export const afterHeroPageReady = (callback: () => void): (() => void) => {
  let cancelled = false;
  let scheduled = false;
  let firstFrame = 0;
  let secondFrame = 0;
  let idleId = 0;

  const removeListeners = () => {
    window.removeEventListener("openstudio:app-ready", check);
    window.removeEventListener("openstudio:intro-hidden", check);
  };
  const run = () => {
    if (cancelled) return;
    cancelled = true;
    removeListeners();
    callback();
  };
  function check() {
    if (cancelled || scheduled || !window.__openstudioAppReady || !window.__openstudioIntroHidden) return;
    scheduled = true;
    removeListeners();
    // Also paint the newly mounted hero on client navigation, when the one-time
    // readiness flags are already set. Do not wait for lazy below-fold resources.
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (cancelled) return;
        if (typeof window.requestIdleCallback === "function") {
          // Maximum idle scheduling wait, not a mandatory two-second delay.
          idleId = window.requestIdleCallback(run, { timeout: 2000 });
        } else {
          run();
        }
      });
    });
  }
  window.addEventListener("openstudio:app-ready", check);
  window.addEventListener("openstudio:intro-hidden", check);
  check();
  return () => {
    cancelled = true;
    removeListeners();
    window.cancelAnimationFrame(firstFrame);
    window.cancelAnimationFrame(secondFrame);
    if (idleId) window.cancelIdleCallback?.(idleId);
  };
};
