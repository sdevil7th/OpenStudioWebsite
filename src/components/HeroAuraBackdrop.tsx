import { useLayoutEffect, useRef, useState } from "react";

const AURA_SRC =
  "https://aura.promad.design/embed/pastel-abstract-background-soft-glowing-hd-web-designs?hideText=true&hideIcons=true&input=off&theme=light";

// Measured against the embed: after its `load` event the scene shows a dark ground, then
// a vivid saturated stage from ~0.8s, and only reaches the soft pastel state ~2.0-2.4s in,
// settling fully by ~3.5s. Waiting 3s past `load` reveals the pastel state, not the vivid one.
const SCENE_SETTLE_MS = 3000;
// Upper bound on how long the intro loader may wait for the backdrop (the loader's own
// global fallback stays the hard ceiling).
const MAX_HOLD_MS = 6500;

let holdCounter = 0;

/** Full-bleed aura embed behind the home hero. Holds the intro loader until it has painted. */
const HeroAuraBackdrop = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const token = `hero-aura-${(holdCounter += 1)}`;
    let released = false;
    let settleTimer = 0;

    window.dispatchEvent(new CustomEvent("openstudio:intro-hold", { detail: { token, maxMs: MAX_HOLD_MS } }));

    const release = () => {
      if (released) return;
      released = true;
      window.clearTimeout(settleTimer);
      setReady(true);
      window.dispatchEvent(new CustomEvent("openstudio:intro-release", { detail: { token } }));
    };
    const handleLoad = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(release, SCENE_SETTLE_MS);
    };

    frame.addEventListener("load", handleLoad);
    frame.addEventListener("error", release);
    const capTimer = window.setTimeout(release, MAX_HOLD_MS);

    return () => {
      frame.removeEventListener("load", handleLoad);
      frame.removeEventListener("error", release);
      window.clearTimeout(capTimer);
      window.clearTimeout(settleTimer);
      if (!released) {
        released = true;
        window.dispatchEvent(new CustomEvent("openstudio:intro-release", { detail: { token } }));
      }
    };
  }, []);

  return (
    <div aria-hidden="true" className="sp-hero-aura__bg" data-ready={ready ? "true" : "false"}>
      <iframe
        allowFullScreen
        className="sp-hero-aura__frame"
        ref={frameRef}
        src={AURA_SRC}
        tabIndex={-1}
        title="Pastel Abstract Background – Soft Glowing HD Web Designs"
      />
    </div>
  );
};

export default HeroAuraBackdrop;
