type InitialIdleOptions = {
  delay?: number;
  timeout?: number;
};

const INPUT_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

export const scheduleAfterInitialLoad = (
  callback: () => void,
  { delay = 2400, timeout = 3200 }: InitialIdleOptions = {},
) => {
  let cancelled = false;
  let delayTimer = 0;
  let idleId = 0;

  const clearInputListeners = () => {
    INPUT_EVENTS.forEach((eventName) => {
      window.removeEventListener(eventName, runSoon);
    });
  };

  const cleanup = () => {
    cancelled = true;
    window.clearTimeout(delayTimer);
    if (idleId) {
      window.cancelIdleCallback?.(idleId);
    }
    clearInputListeners();
    window.removeEventListener("openstudio:app-ready", waitForIntro);
    window.removeEventListener("openstudio:intro-hidden", scheduleIdle);
  };

  const run = () => {
    if (cancelled) {
      return;
    }

    cleanup();
    callback();
  };

  function runSoon() {
    window.clearTimeout(delayTimer);
    if (idleId) {
      window.cancelIdleCallback?.(idleId);
    }
    run();
  }

  function scheduleIdle() {
    if (cancelled) {
      return;
    }

    clearInputListeners();
    INPUT_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, runSoon, { once: true, passive: true });
    });

    delayTimer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(run, { timeout });
        return;
      }

      delayTimer = window.setTimeout(run, Math.min(timeout, 1400));
    }, delay);
  }

  function waitForIntro() {
    if (document.querySelector("[data-brand-intro-overlay]")) {
      window.addEventListener("openstudio:intro-hidden", scheduleIdle, { once: true });
      return;
    }

    scheduleIdle();
  }

  if (window.__openstudioAppReady) {
    waitForIntro();
  } else {
    window.addEventListener("openstudio:app-ready", waitForIntro, { once: true });
  }

  return cleanup;
};
