import { Download } from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import {
  downloadCinematicPlates,
  downloadCinematicScenePlateMap,
  downloadCinematicScenes,
  downloadCinematicScreenshot,
  downloadCinematicSourceLabels,
  type DownloadCinematicPlateId,
} from "@/data/downloadCinematic";
import { useScrollScene } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const DOWNLOAD_CINEMATIC_SCROLL_VH = 620;
const sceneStops = [0, 0.2, 0.4, 0.64, 0.84] as const;

interface DownloadCinematicStoryProps {
  activePlatformLabel: string;
  className?: string;
  onDownload: () => void;
}

const initialStaticMode = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !window.matchMedia("(min-width: 1024px)").matches);

const sceneIndexForProgress = (progress: number) => {
  for (let index = sceneStops.length - 1; index >= 0; index -= 1) {
    if (progress >= sceneStops[index]) return index;
  }

  return 0;
};

const sourceCalloutPositions: CSSProperties[] = [
  { right: "25%", top: "23%" },
  { left: "38%", bottom: "30%" },
  { left: "43%", bottom: "24%" },
  { right: "24%", bottom: "31%" },
];

const CinematicPlate = ({
  className,
  loading = "lazy",
  plateId,
}: {
  className?: string;
  loading?: "eager" | "lazy";
  plateId: DownloadCinematicPlateId;
}) => {
  const plate = downloadCinematicPlates[plateId];

  return (
    <figure
      className={cn("download-cinematic__plate", className)}
      data-download-cinematic-asset={plate.id}
    >
      <img
        alt={plate.alt}
        decoding="async"
        height={plate.height}
        loading={loading}
        src={plate.src}
        width={plate.width}
      />
    </figure>
  );
};

const OpenStudioScreenPicture = ({ className }: { className?: string }) => (
  <picture className={cn("download-cinematic__screen-picture", className)}>
    <source srcSet={downloadCinematicScreenshot.webpSrc} type="image/webp" />
    <img
      alt={downloadCinematicScreenshot.alt}
      decoding="async"
      loading="lazy"
      src={downloadCinematicScreenshot.src}
    />
  </picture>
);

const SourceCallouts = () => (
  <div className="download-cinematic__source-callouts" aria-hidden="true">
    {downloadCinematicSourceLabels.map((label, index) => (
      <span
        className="download-cinematic__source-callout"
        data-source-index={index + 1}
        key={label}
        style={sourceCalloutPositions[index]}
      >
        <i />
        {label}
      </span>
    ))}
  </div>
);

const SignalOverlay = () => (
  <div className="download-cinematic__signal-overlay" aria-hidden="true">
    <svg className="download-cinematic__signal-paths" viewBox="0 0 1200 620">
      <path d="M104 448 C262 420 306 332 478 334 C650 336 680 276 824 228" />
      <path d="M142 246 C298 266 356 304 500 304 C654 304 724 258 910 304" />
      <path d="M248 506 C394 464 438 384 584 378 C738 370 812 428 1048 390" />
    </svg>
    <div className="download-cinematic__transport-strip">
      {Array.from({ length: 18 }, (_, index) => (
        <span key={`transport-${index}`} />
      ))}
    </div>
    <div className="download-cinematic__meter-bridge">
      {Array.from({ length: 16 }, (_, index) => (
        <span
          key={`meter-${index}`}
          style={{ "--meter": `${38 + ((index * 17) % 54)}%` } as CSSProperties}
        />
      ))}
    </div>
  </div>
);

const ChapterRail = ({ activeSceneIndex }: { activeSceneIndex: number }) => (
  <div className="download-cinematic__chapter-rail" aria-label="Download cinematic scenes">
    {downloadCinematicScenes.map((scene, index) => (
      <span
        className={cn(index === activeSceneIndex && "is-active")}
        data-download-cinematic-chip
        key={scene.id}
      >
        <i>{String(index + 1).padStart(2, "0")}</i>
        {scene.id}
      </span>
    ))}
  </div>
);

const DownloadCinematicStory = ({
  activePlatformLabel,
  className,
  onDownload,
}: DownloadCinematicStoryProps) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [staticOnly, setStaticOnly] = useState(initialStaticMode);
  const activeScene = downloadCinematicScenes[activeSceneIndex] ?? downloadCinematicScenes[0]!;

  useScrollScene(sectionRef, ({ isDesktop, prefersReducedMotion, gsap, ScrollTrigger }) => {
    const section = sectionRef.current;
    const stage = stageRef.current;

    if (!section) return undefined;

    if (prefersReducedMotion || !isDesktop || !stage) {
      setStaticOnly(true);
      setActiveSceneIndex(0);
      section.style.setProperty("--download-cinema-progress", "0");
      return undefined;
    }

    setStaticOnly(false);

    const q = gsap.utils.selector(section);
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        pin: stage,
        pinSpacing: false,
        anticipatePin: 1,
        scrub: 0.9,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          section.style.setProperty("--download-cinema-progress", self.progress.toFixed(4));
          const nextIndex = sceneIndexForProgress(self.progress);
          setActiveSceneIndex((previous) => (previous === nextIndex ? previous : nextIndex));
        },
      },
    });

    timeline
      .set(q(".download-cinematic__plate"), { autoAlpha: 0, scale: 1.08 })
      .set(q(".download-cinematic__plate--wide"), { autoAlpha: 1, scale: 1.04, xPercent: 0 })
      .set(q(".download-cinematic__source-callout"), { autoAlpha: 0, y: 18 })
      .set(q(".download-cinematic__signal-overlay"), { autoAlpha: 0 })
      .set(q(".download-cinematic__screen-composite"), { autoAlpha: 0, scale: 0.965 })
      .set(q(".download-cinematic__ready-panel"), { autoAlpha: 0, y: 34, scale: 0.98 })
      .to(q(".download-cinematic__blackout"), { autoAlpha: 0.05, duration: 0.14 }, 0)
      .to(q(".download-cinematic__plate--wide"), { scale: 1, duration: 0.18 }, 0)
      .to(q(".download-cinematic__practical-light"), { autoAlpha: 1, duration: 0.18 }, 0.04)
      .to(q(".download-cinematic__plate--wide"), { scale: 1.08, xPercent: -4, duration: 0.25 }, 0.18)
      .to(q(".download-cinematic__source-callout"), { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.08 }, 0.16)
      .to(q(".download-cinematic__signal-overlay"), { autoAlpha: 0.48, duration: 0.16 }, 0.26)
      .to(q(".download-cinematic__plate--wide"), { autoAlpha: 0, scale: 1.12, duration: 0.14 }, 0.38)
      .to(q(".download-cinematic__source-callout"), { autoAlpha: 0, y: -12, duration: 0.08 }, 0.4)
      .fromTo(
        q(".download-cinematic__plate--signal"),
        { autoAlpha: 0, scale: 1.08, xPercent: 4 },
        { autoAlpha: 1, scale: 1, xPercent: 0, duration: 0.16 },
        0.38,
      )
      .to(q(".download-cinematic__signal-overlay"), { autoAlpha: 1, duration: 0.16 }, 0.42)
      .to(q(".download-cinematic__plate--signal"), { scale: 1.07, xPercent: -3, duration: 0.24 }, 0.5)
      .to(q(".download-cinematic__plate--signal"), { autoAlpha: 0, scale: 1.12, duration: 0.14 }, 0.64)
      .to(q(".download-cinematic__signal-overlay"), { autoAlpha: 0, duration: 0.18 }, 0.62)
      .fromTo(
        q(".download-cinematic__plate--screen"),
        { autoAlpha: 0, scale: 1.07, yPercent: 2 },
        { autoAlpha: 1, scale: 1, yPercent: 0, duration: 0.16 },
        0.64,
      )
      .to(q(".download-cinematic__screen-composite"), { autoAlpha: 1, scale: 1, duration: 0.12 }, 0.66)
      .to(q(".download-cinematic__plate--screen"), { scale: 1.04, duration: 0.2 }, 0.78)
      .to(q(".download-cinematic__ready-panel"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.16 }, 0.84)
      .to(q(".download-cinematic__blackout"), { autoAlpha: 0.38, duration: 0.14 }, 0.86);

    ScrollTrigger.refresh();

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  });

  return (
    <section
      aria-label="Cinematic home studio workflow"
      className={cn("download-cinematic", staticOnly && "download-cinematic--static", className)}
      data-download-cinema
      data-download-cinematic-story
      data-download-cinematic-static={staticOnly ? "true" : "false"}
      ref={sectionRef}
      style={{ "--download-cinema-scroll-vh": `${DOWNLOAD_CINEMATIC_SCROLL_VH}vh` } as CSSProperties}
    >
      {!staticOnly ? (
        <div
          className="download-cinematic__stage"
          data-download-cinematic-stage
          data-download-cinematic-timeline
          ref={stageRef}
        >
          <div className="download-cinematic__film">
            <CinematicPlate className="download-cinematic__plate--wide" loading="eager" plateId="studioWide" />
            <CinematicPlate className="download-cinematic__plate--signal" plateId="signalCloseup" />
            <CinematicPlate className="download-cinematic__plate--screen" plateId="screenReveal" />
          </div>
          <div className="download-cinematic__blackout" aria-hidden="true" />
          <div className="download-cinematic__grain" aria-hidden="true" />
          <div className="download-cinematic__practical-light" aria-hidden="true" />
          <SourceCallouts />
          <SignalOverlay />
          <div className="download-cinematic__screen-composite" data-download-cinematic-screen-reveal>
            <OpenStudioScreenPicture />
            <span aria-hidden="true" />
          </div>
          <ChapterRail activeSceneIndex={activeSceneIndex} />
          <div
            className="download-cinematic__scene-copy"
            data-download-cinematic-copy
            data-scene={activeScene.id}
            key={activeScene.id}
          >
            <span>{activeScene.eyebrow}</span>
            <h2>{activeScene.headline}</h2>
            <p>{activeScene.description}</p>
            <strong>{activeScene.metric}</strong>
          </div>
          <div
            aria-hidden={activeScene.id !== "ready"}
            className={cn("download-cinematic__ready-panel", activeScene.id === "ready" && "is-active")}
          >
            <span>OpenStudio</span>
            <strong>Free, open source, and ready for the next take.</strong>
            <Button
              className="h-auto px-7 py-4 font-bold"
              onClick={onDownload}
              tabIndex={activeScene.id === "ready" ? 0 : -1}
              type="button"
            >
              <Download className="h-4 w-4" />
              Download {activePlatformLabel}
            </Button>
          </div>
        </div>
      ) : null}

      {staticOnly ? (
        <div
          className="download-cinematic__fallback"
          data-download-cinematic-fallback
          data-download-cinematic-mobile-fallback
          data-download-cinematic-reduced-motion
        >
          {downloadCinematicScenes.map((scene) => (
            <article
              className="download-cinematic__fallback-card"
              data-scene={scene.id}
              key={`fallback-${scene.id}`}
            >
              <div className="download-cinematic__fallback-media">
                <CinematicPlate plateId={downloadCinematicScenePlateMap[scene.id]} />
                {scene.id === "openstudio" ? (
                  <div
                    className="download-cinematic__fallback-screen"
                    data-download-cinematic-screen-reveal
                  >
                    <OpenStudioScreenPicture />
                  </div>
                ) : null}
              </div>
              <div className="download-cinematic__fallback-copy">
                <span>{scene.eyebrow}</span>
                <h3>{scene.headline}</h3>
                <p>{scene.description}</p>
                <strong>{scene.metric}</strong>
              </div>
            </article>
          ))}
          <Button className="h-auto px-7 py-4 font-bold" onClick={onDownload} type="button">
            <Download className="h-4 w-4" />
            Download {activePlatformLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
};

export default DownloadCinematicStory;
