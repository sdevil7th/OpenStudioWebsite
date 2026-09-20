import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { afterHeroPageReady } from "@/features/hero-aura/startup";
import { AURA_ORIGIN, observeAuraReadiness } from "@/features/hero-aura/readiness";

const AURA_SCENE = "pastel-abstract-background-soft-glowing-hd-web-designs";
const AURA_SRC = `${AURA_ORIGIN}/embed/${AURA_SCENE}?theme=light`;
/**
 * Full-bleed original Aura scene behind the home hero.
 *
 * The host repeats the intro loader's surface, so the reveal is continuous, and is what
 * prerendering, no-JavaScript and reduced-motion visitors see. The live embed is requested only after the page has
 * rendered and the initial loader has finished, and only
 * while the hero is on screen in a visible tab. It fades in once its scene has settled,
 * and fades out to `visibility: hidden` whenever the hero leaves the viewport or the tab
 * is hidden, so the embed stops compositing when nobody can see it.
 */
const HeroAuraBackdrop = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [triggered, setTriggered] = useState(false);
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hero on screen and the document visible.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !("IntersectionObserver" in window)) return;
    let intersecting = false;
    const update = () => setActive(intersecting && document.visibilityState === "visible");
    const observer = new IntersectionObserver((entries) => {
      // A busy main thread can batch the hidden initial layout and its reveal.
      // Consume every record so an earlier hidden state cannot strand startup.
      for (const entry of entries) {
        if (entry.target === host) intersecting = entry.isIntersecting;
      }
      update();
    });
    observer.observe(host);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Start automatically after the page is ready; no interaction or quiet timer.
  useEffect(() => {
    if (reducedMotion || triggered) return;
    return afterHeroPageReady(() => setTriggered(true));
  }, [reducedMotion, triggered]);

  useEffect(() => {
    if (triggered && active && !reducedMotion) setMounted(true);
  }, [triggered, active, reducedMotion]);

  const showFrame = mounted && !reducedMotion;

  return (
    <div
      aria-hidden="true"
      className="sp-hero-aura__bg"
      data-aura-scene={AURA_SCENE}
      data-playing={showFrame && active ? "true" : "false"}
      ref={hostRef}
    >
      {showFrame ? <AuraFrame active={active} /> : null}
    </div>
  );
};

// Own readiness alongside the iframe: removing it for reduced motion also
// discards readiness. Scrolling offscreen keeps this same instance mounted.
const AuraFrame = ({ active }: { active: boolean }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !active || ready || failed) return;
    return observeAuraReadiness(frame, () => setReady(true), () => setFailed(true));
  }, [active, ready, failed]);

  if (failed) return null;
  return (
    <iframe
      ref={frameRef}
      className="sp-hero-aura__frame"
      data-ready={ready ? "true" : "false"}
      src={AURA_SRC}
      tabIndex={-1}
      title="Pastel Abstract Background – Soft Glowing HD Web Designs"
    />
  );
};

export default HeroAuraBackdrop;
