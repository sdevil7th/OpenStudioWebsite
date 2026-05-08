import {
  ArrowRight,
  BrainCircuit,
  Download,
  ShieldCheck,
} from "lucide-react";
import { lazy, memo, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DeferredClientStage from "@/components/DeferredClientStage";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import type { AiNeuralStudioState } from "@/components/scene/AiNeuralStudioStage";
import { Button } from "@/components/ui/button";
import {
  aiArchitectureNodes,
  aiGenesisCopy,
  aiNeuralStudioPhases,
  aiOutroCopy,
  aiPillars,
  aiRuntimePrinciples,
  musicGenerationControls,
  stemFinalCta,
  stemInstallFacts,
  stemSeparationSeo,
  stemUseCases,
  type AiNeuralStudioPhase,
} from "@/data/stemSeparation";
import { useScrollScene } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const AiArchitectureOrbit = lazy(() => import("@/components/scene/AiArchitectureOrbit"));
const AiGenesisStage = lazy(() => import("@/components/scene/AiGenesisStage"));
const AiNeuralStudioStage = lazy(() => import("@/components/scene/AiNeuralStudioStage"));
const AiOutroStage = lazy(() => import("@/components/scene/AiOutroStage"));
const AiSignalWebGLStage = lazy(() => import("@/components/scene/AiSignalWebGLStage"));
const AiUseCaseConstellation = lazy(() => import("@/components/scene/AiUseCaseConstellation"));
const PretextEditorialField = lazy(() => import("@/components/motion/PretextEditorialField"));

const heroTokens = ["BS Roformer", "6 stems", "spectrogram", "ACE-Step", "lyrics", "seed", "full decode", "WAV"];
const stemRibbonLabels = [
  { label: "Vocals", color: "#ff4fbf" },
  { label: "Drums", color: "#58caff" },
  { label: "Bass", color: "#9b72ff" },
  { label: "Guitar", color: "#ffc857" },
  { label: "Piano", color: "#dff8ff" },
  { label: "Other", color: "#43f2a2" },
];

const AiGenesisFallbackStage = () => (
  <div className="ai-genesis-stage ai-genesis-stage--failed" data-ai-genesis-stage>
    <div className="ai-genesis-stage__fallback" aria-hidden="true">
      <div className="ai-genesis-stage__fallback-wave" />
      <div className="ai-genesis-stage__fallback-wave ai-genesis-stage__fallback-wave--alt" />
      <div className="ai-genesis-stage__fallback-core" />
    </div>
  </div>
);

const AiSignalFallbackStage = () => (
  <div className="ai-signal-webgl-stage ai-signal-webgl-stage--failed" data-ai-webgl-stage>
    <div className="ai-signal-webgl-stage__fallback" aria-hidden="true">
      <div className="ai-signal-webgl-stage__fallback-wave ai-signal-webgl-stage__fallback-wave--stem" />
      <div className="ai-signal-webgl-stage__fallback-core" />
      <div className="ai-signal-webgl-stage__fallback-wave ai-signal-webgl-stage__fallback-wave--music" />
    </div>
  </div>
);

const AiArchitectureFallbackStage = () => (
  <div className="ai-arch-stage ai-arch-stage--failed" data-ai-arch-stage>
    <div className="ai-arch-stage__fallback" aria-hidden="true">
      <div className="ai-arch-stage__fallback-core" />
      <div className="ai-arch-stage__fallback-ring" />
    </div>
  </div>
);

const AiUseCaseFallbackStage = () => (
  <div className="ai-constellation-stage ai-constellation-stage--failed" data-ai-constellation-stage>
    <div className="ai-constellation-stage__fallback" aria-hidden="true">
      <div className="ai-constellation-stage__fallback-glow" />
    </div>
  </div>
);

const AiOutroFallbackStage = () => (
  <div className="ai-outro-stage ai-outro-stage--failed" data-ai-outro-stage>
    <div className="ai-outro-stage__fallback" aria-hidden="true">
      <div className="ai-outro-stage__fallback-core" />
    </div>
  </div>
);

const clampProgress = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
};

const phaseIndexForProgress = (progress: number) => {
  const clamped = clampProgress(progress);
  const index = aiNeuralStudioPhases.findIndex(
    (phase) => clamped >= phase.scrollRange[0] && clamped <= phase.scrollRange[1],
  );
  return Math.max(0, index === -1 ? aiNeuralStudioPhases.length - 1 : index);
};

const phaseProgressFor = (phase: AiNeuralStudioPhase, progress: number) => {
  const [start, end] = phase.scrollRange;
  return end <= start ? 1 : clampProgress((progress - start) / (end - start));
};

const AiKineticTextFallback = ({ className, text }: { className?: string; text: string }) => (
  <p className={cn("ai-editorial-copy", className)}>{text}</p>
);

const AiKineticText = ({ className, text }: { className?: string; text: string }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      const id = window.setTimeout(() => setShouldRender(true), 600);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "280px 0px", threshold: 0.01 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={ref}>
      {shouldRender ? (
        <Suspense fallback={<AiKineticTextFallback className={className} text={text} />}>
          <PretextEditorialField
            className={cn("ai-editorial-copy", className)}
            forceCount={2}
            text={text}
            variant="ai"
            visibleObjects
          />
        </Suspense>
      ) : (
        <AiKineticTextFallback className={className} text={text} />
      )}
    </div>
  );
};

const TokenOrbit = () => (
  <div className="ai-token-orbit ai-neural-token-strip" aria-hidden="true">
    {heroTokens.map((token, index) => (
      <span data-ai-token key={token} style={{ ["--ai-token-index" as string]: index }}>
        {token}
      </span>
    ))}
  </div>
);

const NeuralFallbackInstrument = ({ phase }: { phase: AiNeuralStudioPhase }) => (
  <div className={cn("ai-neural-fallback-instrument", `ai-neural-fallback-instrument--${phase.mode}`)} data-ai-neural-fallback>
    <div className="ai-neural-fallback-instrument__liquid" aria-hidden="true">
      <div className="ai-neural-fallback-instrument__boundary">
        {Array.from({ length: 3 }).map((_, index) => (
          <span key={index} style={{ ["--ring-index" as string]: index }} />
        ))}
      </div>
      <div className="ai-neural-fallback-instrument__membranes">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} style={{ ["--sheet-index" as string]: index }} />
        ))}
      </div>
      <div className="ai-neural-fallback-instrument__currents">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} style={{ ["--current-index" as string]: index }} />
        ))}
      </div>
      <div className="ai-neural-fallback-instrument__shared-playhead" />
      <div className="ai-neural-fallback-instrument__prompt-filament" />
      <div className="ai-neural-fallback-instrument__shockwave" />
      <div className="ai-neural-fallback-instrument__ace-transform">
        <span className="ai-neural-fallback-instrument__prompt-wave" />
        <span className="ai-neural-fallback-instrument__transform-orb" />
        <span className="ai-neural-fallback-instrument__generated-wave" />
      </div>
      <div className="ai-neural-fallback-instrument__waveform-spine" />
      <div className="ai-neural-fallback-instrument__caustics" />
      <div className="ai-neural-fallback-instrument__floor" />
      <div className="ai-neural-fallback-instrument__glints">
        {Array.from({ length: 24 }).map((_, index) => (
          <i key={index} style={{ ["--glint-index" as string]: index }} />
        ))}
      </div>
    </div>
    <div className="ai-neural-fallback-instrument__core">
      <BrainCircuit className="h-5 w-5" />
    </div>
  </div>
);

const NeuralCinematicExplainer = memo(({ activePhase }: { activePhase: AiNeuralStudioPhase }) => (
  <section
    className={cn("ai-neural-explainer", `ai-neural-explainer--${activePhase.mode}`)}
    data-ai-neural-explainer
  >
    <span className="ai-neural-explainer__eyebrow">Cinematic AI Lab / {activePhase.label}</span>
    <h2>{activePhase.headline}</h2>
    <p>{activePhase.description}</p>
    <ul>
      {activePhase.sceneBullets.map((bullet) => (
        <li key={bullet}>{bullet}</li>
      ))}
    </ul>
    {activePhase.mode === "separate" ? (
      <div className="ai-neural-explainer__stem-labels" data-ai-neural-stem-labels>
        {stemRibbonLabels.map((stem) => (
          <span key={stem.label} style={{ ["--stem-color" as string]: stem.color }}>
            {stem.label}
          </span>
        ))}
      </div>
    ) : null}
    {activePhase.mode === "generate" ? (
      <div className="ai-neural-explainer__formula" data-ai-neural-generation-formula>
        <span>Prompt waveform</span>
        <strong>ACE-Step transform</strong>
        <span>Generated color waveform</span>
      </div>
    ) : null}
    {activePhase.mode === "commit" ? (
      <div className="ai-neural-explainer__tableau" data-ai-neural-final-tableau>
        <span>Six stems</span>
        <span>Generated wave</span>
        <span>Synchronized motion</span>
        <span>Session-ready WAV</span>
      </div>
    ) : null}
    <TokenOrbit />
  </section>
));
NeuralCinematicExplainer.displayName = "NeuralCinematicExplainer";

const NeuralHud = memo(({ activePhase }: { activePhase: AiNeuralStudioPhase }) => (
  <div className="ai-neural-hud ai-neural-hud--compact" data-ai-neural-hud>
    <div className="ai-neural-hud__status">
      <div>
        <span>OpenStudio AI</span>
        <strong>Neural Studio</strong>
      </div>
      <i>{activePhase.mode}</i>
    </div>

    <div className="ai-neural-hud__metrics">
      {activePhase.metrics.map((metric) => (
        <div key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <p>{metric.detail}</p>
        </div>
      ))}
    </div>

    <div className="ai-neural-hud__bottom">
      <div>
        <span>Global pass</span>
        <strong data-ai-neural-global-pct>00%</strong>
      </div>
      <div className="ai-neural-progress">
        <i data-ai-neural-progress-bar style={{ width: "6%" }} />
      </div>
      <div>
        <span>Phase resolve</span>
        <strong data-ai-neural-phase-pct>00%</strong>
      </div>
    </div>
  </div>
));
NeuralHud.displayName = "NeuralHud";

const MobileInstrument = ({ phase }: { phase: AiNeuralStudioPhase }) => (
  <article className="ai-neural-mobile-instrument" data-ai-neural-mobile>
    <NeuralFallbackInstrument phase={phase} />
    <div className="ai-neural-mobile-instrument__copy">
      <span>{phase.label}</span>
      <h2>{phase.headline}</h2>
      <p>{phase.description}</p>
      <ul className="ai-neural-mobile-instrument__bullets">
        {phase.sceneBullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      {phase.mode === "separate" ? (
        <div className="ai-neural-mobile-instrument__stems">
          {stemRibbonLabels.map((stem) => (
            <span key={stem.label} style={{ ["--stem-color" as string]: stem.color }}>
              {stem.label}
            </span>
          ))}
        </div>
      ) : null}
      {phase.mode === "generate" ? (
        <div className="ai-neural-mobile-instrument__formula">Prompt waveform -&gt; ACE-Step -&gt; generated color waveform</div>
      ) : null}
      {phase.mode === "commit" ? (
        <div className="ai-neural-mobile-instrument__tableau">
          <span>Six stems</span>
          <span>Generated wave</span>
          <span>Synchronized motion</span>
          <span>Session WAV</span>
        </div>
      ) : null}
      <div>
        {phase.hudLines.map((line) => (
          <i key={line}>{line}</i>
        ))}
      </div>
    </div>
  </article>
);

const StemSeparationPage = () => {
  const pageRef = useRef<HTMLElement | null>(null);
  const studioStateRef = useRef<AiNeuralStudioState>({
    globalProgress: 0,
    phaseIndex: 0,
    phaseProgress: 0,
    pointer: { x: 0, y: 0 },
    audioEnergy: 0,
    reducedMotion: false,
  }, { delay: 360, runOnInput: false, timeout: 1400 });
  const globalProgressRef = useRef(0);
  const phaseProgressRef = useRef(0);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const genesisProgressRef = useRef(0);
  const genesisPointerRef = useRef({ x: 0, y: 0 });
  const pillarsProgressRef = useRef(0);
  const pillarsPhaseRef = useRef(0);
  const [archActiveNode, setArchActiveNode] = useState(0);
  const archPointerRef = useRef({ x: 0, y: 0 });
  const [useCaseActive, setUseCaseActive] = useState(0);
  const useCasePointerRef = useRef({ x: 0, y: 0 });
  const outroCollapseRef = useRef(0);

  const activePhase = aiNeuralStudioPhases[activePhaseIndex] ?? aiNeuralStudioPhases[0]!;

  useScrollScene(pageRef, ({ prefersReducedMotion, isDesktop, gsap, ScrollTrigger }) => {
    const cleanups: Array<() => void> = [];
    studioStateRef.current.reducedMotion = prefersReducedMotion;

    if (!prefersReducedMotion) {
      gsap.fromTo(
        "[data-ai-neural-hud] > *",
        { y: 22, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          clearProps: "transform,opacity,visibility",
          duration: 0.76,
          stagger: 0.07,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        "[data-ai-token]",
        { y: 18, scale: 0.72, autoAlpha: 0 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          clearProps: "transform,opacity,visibility",
          duration: 0.62,
          ease: "back.out(1.6)",
          stagger: { amount: 0.56, from: "center" },
        },
      );

      gsap.from("[data-ai-neural-detail]", {
        y: 28,
        opacity: 0,
        duration: 0.74,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-ai-neural-details]",
          start: "top 80%",
        },
      });

      gsap.fromTo(
        "[data-ai-genesis-headline] .ai-genesis-overlay__line",
        { y: 36, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          clearProps: "transform,opacity,visibility",
          duration: 0.96,
          stagger: 0.12,
          ease: "power4.out",
          delay: 0.1,
        },
      );

      gsap.fromTo(
        "[data-ai-genesis-ticker] span",
        { y: 14, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          clearProps: "transform,opacity,visibility",
          duration: 0.5,
          stagger: 0.04,
          ease: "power3.out",
          delay: 0.4,
        },
      );

      gsap.fromTo(
        "[data-ai-pillar-card]",
        { y: 36, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          clearProps: "transform,opacity,visibility",
          duration: 0.72,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-ai-pillars]", start: "top 88%", once: true },
        },
      );

      gsap.fromTo(
        "[data-ai-arch-card]",
        { y: 26, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          clearProps: "transform,opacity,visibility",
          duration: 0.6,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-ai-arch]", start: "top 88%", once: true },
        },
      );

      gsap.fromTo(
        "[data-ai-usecase-card]",
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          clearProps: "transform,opacity,visibility",
          duration: 0.6,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-ai-usecases]", start: "top 88%", once: true },
        },
      );
    }

    if (isDesktop) {
      const trigger = ScrollTrigger.create({
        trigger: "[data-ai-neural-lab]",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const nextProgress = clampProgress(self.progress);
          const nextIndex = phaseIndexForProgress(nextProgress);
          const nextPhase = aiNeuralStudioPhases[nextIndex] ?? aiNeuralStudioPhases[0]!;
          const nextPhaseProgress = phaseProgressFor(nextPhase, nextProgress);

          studioStateRef.current.globalProgress = nextProgress;
          studioStateRef.current.phaseIndex = nextIndex;
          studioStateRef.current.phaseProgress = nextPhaseProgress;
          studioStateRef.current.audioEnergy = 0.4 + Math.sin(nextProgress * Math.PI * 4) * 0.18 + nextPhaseProgress * 0.16;
          globalProgressRef.current = nextProgress;
          phaseProgressRef.current = nextPhaseProgress;
          setActivePhaseIndex((previous) => (previous === nextIndex ? previous : nextIndex));
        },
      });
      cleanups.push(() => trigger.kill());

      const genesisTrigger = ScrollTrigger.create({
        trigger: "[data-ai-genesis]",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          genesisProgressRef.current = clampProgress(self.progress);
        },
      });
      cleanups.push(() => genesisTrigger.kill());

      const pillarsTrigger = ScrollTrigger.create({
        trigger: "[data-ai-pillars]",
        start: "top 90%",
        end: "bottom 10%",
        scrub: true,
        onUpdate: (self) => {
          const next = clampProgress(self.progress);
          pillarsProgressRef.current = next;
          pillarsPhaseRef.current = next < 0.33 ? 0 : next < 0.66 ? 1 : 2;
        },
      });
      cleanups.push(() => pillarsTrigger.kill());

      const archTrigger = ScrollTrigger.create({
        trigger: "[data-ai-arch]",
        start: "top 80%",
        end: "bottom 20%",
        scrub: true,
        onUpdate: (self) => {
          const next = clampProgress(Number(self.progress.toFixed(3)));
          const node = Math.min(
            aiArchitectureNodes.length - 1,
            Math.floor(next * aiArchitectureNodes.length),
          );
          setArchActiveNode((prev) => (prev === node ? prev : node));
        },
      });
      cleanups.push(() => archTrigger.kill());

      const useCaseTrigger = ScrollTrigger.create({
        trigger: "[data-ai-usecases]",
        start: "top 80%",
        end: "bottom 20%",
        scrub: true,
        onUpdate: (self) => {
          const next = clampProgress(Number(self.progress.toFixed(3)));
          const idx = Math.min(3, Math.floor(next * 4));
          setUseCaseActive((prev) => (prev === idx ? prev : idx));
        },
      });
      cleanups.push(() => useCaseTrigger.kill());

      const outroTrigger = ScrollTrigger.create({
        trigger: "[data-ai-outro]",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          outroCollapseRef.current = clampProgress(self.progress);
        },
      });
      cleanups.push(() => outroTrigger.kill());
    }

    const stage = document.querySelector<HTMLElement>("[data-ai-neural-stage-wrap]");
    if (stage) {
      let pointerFrame = 0;
      const pointerState = { x: 0, y: 0, targetX: 0, targetY: 0 };

      const tickPointer = () => {
        pointerState.x += (pointerState.targetX - pointerState.x) * 0.12;
        pointerState.y += (pointerState.targetY - pointerState.y) * 0.12;
        studioStateRef.current.pointer = { x: pointerState.x, y: pointerState.y };
        stage.style.setProperty("--ai-neural-pointer-x", `${pointerState.x}`);
        stage.style.setProperty("--ai-neural-pointer-y", `${pointerState.y}`);
        pointerFrame = window.requestAnimationFrame(tickPointer);
      };

      const handlePointerMove = (event: PointerEvent) => {
        const bounds = stage.getBoundingClientRect();
        pointerState.targetX = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1;
        pointerState.targetY = ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1;
      };

      const handlePointerLeave = () => {
        pointerState.targetX = 0;
        pointerState.targetY = 0;
      };

      stage.addEventListener("pointermove", handlePointerMove);
      stage.addEventListener("pointerleave", handlePointerLeave);
      pointerFrame = window.requestAnimationFrame(tickPointer);
      cleanups.push(() => {
        window.cancelAnimationFrame(pointerFrame);
        stage.removeEventListener("pointermove", handlePointerMove);
        stage.removeEventListener("pointerleave", handlePointerLeave);
      });
    }

    const attachStagePointer = (
      selector: string,
      target: { current: { x: number; y: number } },
    ) => {
      const node = document.querySelector<HTMLElement>(selector);
      if (!node) {
        return;
      }
      const state = { x: 0, y: 0, targetX: 0, targetY: 0 };
      let raf = 0;
      const tick = () => {
        state.x += (state.targetX - state.x) * 0.1;
        state.y += (state.targetY - state.y) * 0.1;
        target.current = { x: state.x, y: state.y };
        raf = window.requestAnimationFrame(tick);
      };
      const onMove = (event: PointerEvent) => {
        const bounds = node.getBoundingClientRect();
        state.targetX = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1;
        state.targetY = ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1;
      };
      const onLeave = () => {
        state.targetX = 0;
        state.targetY = 0;
      };
      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerleave", onLeave);
      raf = window.requestAnimationFrame(tick);
      cleanups.push(() => {
        window.cancelAnimationFrame(raf);
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", onLeave);
      });
    };

    attachStagePointer("[data-ai-genesis]", genesisPointerRef);
    attachStagePointer("[data-ai-arch]", archPointerRef);
    attachStagePointer("[data-ai-usecases]", useCasePointerRef);

    // HUD percentage / progress-bar live updates via direct DOM (no React re-render per scroll tick).
    let hudElements:
      | {
          globalPctEl: HTMLElement | null;
          phasePctEl: HTMLElement | null;
          progressBarEl: HTMLElement | null;
        }
      | undefined;
    const resolveHudElements = () => {
      if (
        hudElements?.globalPctEl?.isConnected &&
        hudElements.phasePctEl?.isConnected &&
        hudElements.progressBarEl?.isConnected
      ) {
        return hudElements;
      }

      const root = pageRef.current;
      hudElements = {
        globalPctEl: root?.querySelector<HTMLElement>("[data-ai-neural-global-pct]") ?? null,
        phasePctEl: root?.querySelector<HTMLElement>("[data-ai-neural-phase-pct]") ?? null,
        progressBarEl: root?.querySelector<HTMLElement>("[data-ai-neural-progress-bar]") ?? null,
      };
      return hudElements;
    };
    let lastHudGlobal = -1;
    let lastHudPhase = -1;
    let hudFrame = 0;
    const tickHud = () => {
      const { globalPctEl, phasePctEl, progressBarEl } = resolveHudElements();
      const g = Math.round(globalProgressRef.current * 100);
      const p = Math.round(phaseProgressRef.current * 100);

      if (g !== lastHudGlobal || globalPctEl?.textContent === "00%") {
        lastHudGlobal = g;
        if (globalPctEl) globalPctEl.textContent = `${String(g).padStart(2, "0")}%`;
        if (progressBarEl) progressBarEl.style.width = `${Math.max(6, g)}%`;
      }
      if (p !== lastHudPhase || phasePctEl?.textContent === "00%") {
        lastHudPhase = p;
        if (phasePctEl) phasePctEl.textContent = `${String(p).padStart(2, "0")}%`;
      }
      hudFrame = window.requestAnimationFrame(tickHud);
    };
    hudFrame = window.requestAnimationFrame(tickHud);
    cleanups.push(() => window.cancelAnimationFrame(hudFrame));

    return () => cleanups.forEach((cleanup) => cleanup());
  });

  return (
    <main
      ref={pageRef}
      className="design-page-main ai-page-main ai-neural-page route-appear"
      id="main-content"
    >
      <PageSeo {...stemSeparationSeo} />

      {/* Act 0 — Genesis Hero */}
      <section className="ai-genesis-section" data-ai-genesis>
        <DeferredClientStage className="absolute inset-0" fallback={<AiGenesisFallbackStage />} idleDelay={620} idleTimeout={1800} rootMargin="0px">
          <Suspense fallback={<AiGenesisFallbackStage />}>
            <AiGenesisStage progressRef={genesisProgressRef} pointerRef={genesisPointerRef} />
          </Suspense>
        </DeferredClientStage>
        <div className="ai-genesis-overlay" data-ai-genesis-headline>
          <div className="ai-genesis-overlay__inner">
            <span className="ai-genesis-overlay__eyebrow">{aiGenesisCopy.eyebrow}</span>
            <h1 className="ai-genesis-overlay__headline">
              {aiGenesisCopy.headline.split(/(?<=\.)\s+/).map((line) => (
                <span className="ai-genesis-overlay__line" key={line}>
                  {line}
                </span>
              ))}
            </h1>
            <p className="ai-genesis-overlay__subhead">
              <span className="ai-genesis-overlay__line">{aiGenesisCopy.subhead}</span>
            </p>
            <div className="ai-genesis-overlay__badge">{aiGenesisCopy.badge}</div>
            <div className="ai-genesis-overlay__proof" aria-label="OpenStudio AI capability summary">
              <span>
                <strong>6</strong>
                Stem lanes
              </span>
              <span>
                <strong>ACE</strong>
                Prompt audio
              </span>
              <span>
                <strong>WAV</strong>
                Session return
              </span>
            </div>
            <div className="ai-genesis-overlay__ticker" data-ai-genesis-ticker aria-hidden="true">
              {aiGenesisCopy.ticker.map((token) => (
                <span key={token}>{token}</span>
              ))}
            </div>
            <div className="ai-genesis-overlay__cta">
              <Button asChild className="rounded-2xl px-7">
                <Link to={aiGenesisCopy.primaryCta.to}>
                  <Download className="h-4 w-4" />
                  {aiGenesisCopy.primaryCta.label}
                </Link>
              </Button>
              <Button asChild className="rounded-2xl px-7" variant="outline">
                <a href={aiGenesisCopy.secondaryCta.to}>
                  {aiGenesisCopy.secondaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          <div className="ai-genesis-overlay__chrome" aria-hidden="true">
            <span>SIG · 01</span>
            <span>BS Roformer · ACE-Step</span>
            <span>WAV · LOCAL</span>
          </div>
        </div>
      </section>

      {/* Act 1 — Dual pillars */}
      <section className="ai-pillars-section" data-ai-pillars>
        <div className="ai-pillars-canvas">
          <DeferredClientStage className="absolute inset-0" fallback={<AiSignalFallbackStage />} idleDelay={720} idleTimeout={2000} rootMargin="1400px 0px">
            <Suspense fallback={<AiSignalFallbackStage />}>
              <AiSignalWebGLStage progressRef={pillarsProgressRef} sectionPhaseRef={pillarsPhaseRef} />
            </Suspense>
          </DeferredClientStage>
        </div>
        <div className="page-frame-wide ai-pillars-grid">
          <header className="ai-pillars-header">
            <div className="design-badge design-badge-secondary mb-5 w-fit">Two pillars · one engine</div>
            <h2>Pull a mix apart. Compose a new one. Same surface, same session.</h2>
            <p>
              OpenStudio AI is not a side panel. The same engine that powers the rest of the DAW now reads spectrograms,
              writes diffusion latents, and drops finished WAVs back onto the timeline.
            </p>
          </header>
          <div className="ai-pillars-cards">
            {aiPillars.map((pillar, index) => (
              <article
                className={cn("ai-pillar-card", `ai-pillar-card--${pillar.id}`)}
                data-ai-pillar-card
                key={pillar.id}
              >
                <span className="ai-pillar-card__signal" aria-hidden="true" />
                <span className="ai-pillar-card__index">{String(index + 1).padStart(2, "0")}</span>
                <span className="ai-pillar-card__eyebrow">{pillar.eyebrow}</span>
                <h3 className="ai-pillar-card__title">{pillar.title}</h3>
                <p className="ai-pillar-card__description">{pillar.description}</p>
                <ul className="ai-pillar-card__details">
                  {pillar.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Act 2 — Neural Studio Lab (pinned WebGL centerpiece) */}
      <section className="ai-neural-lab" data-ai-neural-lab id="ai-neural-lab">
        <div className="ai-neural-stage-wrap" data-ai-neural-stage-wrap>
          <DeferredClientStage
            className="absolute inset-0"
            fallback={<NeuralFallbackInstrument phase={activePhase} />}
            idleDelay={720}
            idleTimeout={2000}
            rootMargin="1400px 0px"
          >
            <Suspense fallback={<NeuralFallbackInstrument phase={activePhase} />}>
              <AiNeuralStudioStage
                fallback={<NeuralFallbackInstrument phase={activePhase} />}
                phases={aiNeuralStudioPhases}
                stateRef={studioStateRef}
              />
            </Suspense>
          </DeferredClientStage>
          <NeuralCinematicExplainer activePhase={activePhase} key={`explainer-${activePhase.id}`} />
          <NeuralHud activePhase={activePhase} key={`hud-${activePhase.id}`} />
        </div>
      </section>

      <section className="ai-neural-mobile-stack">
        <div className="page-frame-wide">
          {aiNeuralStudioPhases.map((phase) => (
            <MobileInstrument key={phase.id} phase={phase} />
          ))}
        </div>
      </section>

      {/* Act 3 — Architecture Orbit */}
      <section className="ai-arch-section" data-ai-arch data-ai-neural-details>
        <div className="ai-arch-canvas">
          <DeferredClientStage className="absolute inset-0" fallback={<AiArchitectureFallbackStage />} idleDelay={720} idleTimeout={2000} rootMargin="1400px 0px">
            <Suspense fallback={<AiArchitectureFallbackStage />}>
              <AiArchitectureOrbit activeNode={archActiveNode} pointerRef={archPointerRef} />
            </Suspense>
          </DeferredClientStage>
        </div>
        <div className="page-frame-wide ai-arch-grid">
          <header className="ai-arch-header" data-ai-neural-detail>
            <div className="design-badge design-badge-secondary mb-5 w-fit">The runtime, in the open</div>
            <h2>Every model, every dial, every WAV — owned by OpenStudio.</h2>
            <p>
              No black-box graph apps. No hidden fallbacks. The entire AI pipeline lives inside the app, validated before it
              runs and visible the entire way through.
            </p>
          </header>
          <div className="ai-arch-nodes">
            {aiArchitectureNodes.map((node, index) => (
              <article
                className={cn(
                  "ai-arch-node-card",
                  `ai-arch-node-card--${node.accent}`,
                  archActiveNode === index && "ai-arch-node-card--active",
                )}
                data-ai-arch-card
                data-ai-neural-detail
                key={node.id}
              >
                <span className="ai-arch-node-card__index">{String(index + 1).padStart(2, "0")}</span>
                <span className="ai-arch-node-card__role">{node.role}</span>
                <h3 className="ai-arch-node-card__label">{node.label}</h3>
                <AiKineticText className="ai-arch-node-card__description" text={node.description} />
              </article>
            ))}
          </div>

          <div className="ai-arch-controls">
            <header>
              <div className="design-badge design-badge-secondary mb-5 w-fit">Generation controls</div>
              <h3>Prompt, lyrics, seed, decode. Every parameter stays on the surface.</h3>
            </header>
            <div className="ai-arch-controls__grid">
              {musicGenerationControls.map((control, index) => (
                <SectionReveal className="ai-arch-control-card" delay={index * 0.04} key={control.title}>
                  <span>{control.note}</span>
                  <strong>{control.title}</strong>
                  <p>{control.description}</p>
                </SectionReveal>
              ))}
            </div>
          </div>

          <div className="ai-arch-trust">
            <div className="ai-arch-trust__column">
              <header>
                <div className="design-badge design-badge-secondary mb-4 w-fit">Trust</div>
                <h3>Optional, validated, offline after setup.</h3>
              </header>
              <ul className="ai-arch-trust__list">
                {stemInstallFacts.map((fact) => (
                  <li className="ai-arch-trust__item" key={fact}>
                    <ShieldCheck className="h-5 w-5 text-secondary" />
                    <AiKineticText text={fact} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="ai-arch-trust__column">
              <header>
                <div className="design-badge design-badge-secondary mb-4 w-fit">Principles</div>
                <h3>The rules the runtime keeps so the music stays yours.</h3>
              </header>
              <ul className="ai-arch-trust__list">
                {aiRuntimePrinciples.map((principle) => (
                  <li className="ai-arch-trust__item" key={principle.title}>
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    <div>
                      <strong>{principle.title}</strong>
                      <AiKineticText text={principle.description} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Act 4 — Use case constellation */}
      <section className="ai-usecases-section" data-ai-usecases>
        <div className="ai-usecases-canvas">
          <DeferredClientStage className="absolute inset-0" fallback={<AiUseCaseFallbackStage />} idleDelay={720} idleTimeout={2000} rootMargin="1400px 0px">
            <Suspense fallback={<AiUseCaseFallbackStage />}>
              <AiUseCaseConstellation activeIndex={useCaseActive} pointerRef={useCasePointerRef} />
            </Suspense>
          </DeferredClientStage>
        </div>
        <div className="page-frame-wide ai-usecases-grid">
          <header className="ai-usecases-header">
            <div className="design-badge design-badge-secondary mb-5 w-fit">Production uses</div>
            <h2>Four moves that AI actually unlocks once it lives in the session.</h2>
          </header>
          <div className="ai-usecases-list">
            {stemUseCases.slice(0, 4).map((item, index) => (
              <article
                className={cn(
                  "ai-usecase-card",
                  useCaseActive === index && "ai-usecase-card--active",
                )}
                data-ai-usecase-card
                key={item.title}
              >
                <span className="ai-usecase-card__index">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="ai-usecase-card__title">{item.title}</h3>
                <AiKineticText className="ai-usecase-card__description" text={item.description} />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Act 5 — Outro collapse / final CTA */}
      <section className="ai-outro-section ai-final-section" data-ai-outro>
        <div className="ai-outro-canvas">
          <DeferredClientStage className="absolute inset-0" fallback={<AiOutroFallbackStage />} idleDelay={720} idleTimeout={2000} rootMargin="1400px 0px">
            <Suspense fallback={<AiOutroFallbackStage />}>
              <AiOutroStage collapseRef={outroCollapseRef} />
            </Suspense>
          </DeferredClientStage>
        </div>
        <SectionReveal className="page-frame-wide ai-outro-shell">
          <div className="ai-outro-cta ai-outro-cta--premium">
            <div>
              <div className="design-badge design-badge-secondary mb-5 w-fit">{aiOutroCopy.eyebrow}</div>
              <h2 className="font-headline text-4xl font-bold leading-tight text-white md:text-5xl">
                {aiOutroCopy.headline}
              </h2>
              <AiKineticText
                className="mt-4 max-w-3xl text-base leading-8 text-white/64"
                text={`${aiOutroCopy.body} ${stemFinalCta.description}`}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild className="rounded-2xl px-8">
                <Link to={aiOutroCopy.primaryCta.to}>
                  <Download className="h-4 w-4" />
                  {aiOutroCopy.primaryCta.label}
                </Link>
              </Button>
              <Button asChild className="rounded-2xl px-8" variant="outline">
                <Link to={aiOutroCopy.secondaryCta.to}>
                  {aiOutroCopy.secondaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </SectionReveal>
      </section>
    </main>
  );
};

export default StemSeparationPage;
