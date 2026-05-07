import { useMemo, useRef, type CSSProperties, type PointerEventHandler } from "react";
import { Disc3, Piano, SlidersHorizontal, Sparkles } from "lucide-react";
import SectionReveal from "@/components/motion/SectionReveal";
import SoundField from "@/components/scene/SoundField";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { screenshots } from "@/data/screenshots";
import type { AccentTone } from "@/data/marketing";
import { cn } from "@/lib/utils";

interface DawCockpitSceneProps {
  accent?: AccentTone;
  className?: string;
  density?: number;
}

const showcaseCards = [
  {
    asset: screenshots.pluginHostingFx,
    label: "Plugin hosting",
    icon: Sparkles,
  },
  {
    asset: screenshots.pianoRoll,
    label: "MIDI editing",
    icon: Piano,
  },
];

const heroPills = ["Multitrack recording", "Pitch editing", "Detached mixer", "VST3 / CLAP / LV2"];

const DawCockpitScene = ({ accent = "lavender", className, density = 1 }: DawCockpitSceneProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const mixerBars = useMemo(() => [36, 62, 48, 86, 56, 92, 44, 74, 58, 82], []);

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (prefersReducedMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    tiltRef.current?.style.setProperty("--daw-rotate-y", `${(x - 0.5) * 10}deg`);
    tiltRef.current?.style.setProperty("--daw-rotate-x", `${(0.5 - y) * 9}deg`);
    shellRef.current?.style.setProperty("--daw-glow-x", `${x * 100}%`);
    shellRef.current?.style.setProperty("--daw-glow-y", `${y * 100}%`);
  };

  const resetPointer = () => {
    tiltRef.current?.style.setProperty("--daw-rotate-x", "0deg");
    tiltRef.current?.style.setProperty("--daw-rotate-y", "0deg");
    shellRef.current?.style.setProperty("--daw-glow-x", "52%");
    shellRef.current?.style.setProperty("--daw-glow-y", "34%");
  };

  return (
    <SectionReveal className={cn("relative", className)}>
      <div
        className="hero-shell relative overflow-hidden rounded-[2.75rem] p-4 md:p-5 xl:p-6"
        onPointerLeave={resetPointer}
        onPointerMove={handlePointerMove}
        ref={shellRef}
      >
        <div
          className="daw-cockpit-spotlight absolute inset-0 opacity-80"
          style={{
            backgroundImage: prefersReducedMotion
              ? undefined
              : "radial-gradient(circle at var(--daw-glow-x, 52%) var(--daw-glow-y, 34%), rgba(164, 142, 255, 0.22), transparent 24%), radial-gradient(circle at 80% 84%, rgba(123, 255, 171, 0.16), transparent 28%)",
          }}
        />
        <SoundField accent={accent} className="opacity-75" density={density} showGrid={false} showNodes showWave />

        <div className="daw-cockpit-tilt relative z-10" ref={tiltRef}>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.82fr)]">
            <div
              className="daw-cockpit-reveal design-window-shell rounded-[2rem] border border-white/10 bg-black/45"
              style={{ "--daw-reveal-delay": "60ms" } as CSSProperties}
            >
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-secondary/80" />
                </div>
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/42">OpenStudio / arrangement view</div>
              </div>

              <div className="grid gap-4 p-4 md:p-5">
                <div className="relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-black/40">
                  <img
                    alt={screenshots.arrangementOverviewWide.alt}
                    className="h-[20rem] w-full object-cover object-top md:h-[26rem] 2xl:h-[30rem]"
                    decoding="async"
                    fetchpriority="low"
                    loading="lazy"
                    src={screenshots.arrangementOverviewWide.src}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/20 to-transparent" />
                  <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
                    {heroPills.map((item) => (
                      <span className="design-badge bg-black/45 text-white/78" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="absolute inset-x-5 bottom-5 rounded-[1.35rem] border border-white/10 bg-black/52 p-4 backdrop-blur-xl">
                    <div className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-secondary">{screenshots.arrangementOverviewWide.label}</div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/74">{screenshots.arrangementOverviewWide.caption}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)]">
                  <div className="rounded-[1.45rem] border border-white/10 bg-black/35 p-4 md:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-primary">Detached mixer workflow</div>
                        <p className="mt-2 text-sm leading-6 text-white/72">{screenshots.mixerMeters.caption}</p>
                      </div>
                      <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-secondary md:flex">
                        <SlidersHorizontal className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-5 overflow-hidden rounded-[1.2rem] border border-white/10">
                      <img alt={screenshots.mixerMeters.alt} className="h-28 w-full object-cover object-center" decoding="async" loading="lazy" src={screenshots.mixerMeters.src} />
                    </div>
                    <div className="mt-4 flex h-16 items-end gap-2">
                      {mixerBars.map((height, index) => (
                        <span
                          className="daw-cockpit-meter rounded-full bg-gradient-to-t from-primary via-white/90 to-secondary"
                          key={`${height}-${index}`}
                          style={{
                            width: "9%",
                            height: `${height}%`,
                            opacity: 0.46 + index * 0.03,
                            "--daw-meter-height": `${height}%`,
                            "--daw-meter-low": `${Math.max(28, height - 12)}%`,
                            "--daw-meter-duration": `${1.9 + index * 0.08}s`,
                          } as CSSProperties}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.45rem] border border-white/10 bg-black/35 p-4 md:p-5">
                    <div className="flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.26em] text-accent">
                      <Disc3 className="h-3.5 w-3.5" />
                      Session flow
                    </div>
                    <div className="mt-4 grid gap-3">
                      {[
                        "Record takes and trim directly on the timeline.",
                        "Edit MIDI and pitch without leaving the song.",
                        "Keep plugins and mixing visible in the same project.",
                      ].map((item) => (
                        <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/72" key={item}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {showcaseCards.map(({ asset, label, icon: Icon }, index) => (
                <div
                  className="daw-cockpit-reveal design-window-shell rounded-[1.8rem] border border-white/10 bg-black/45"
                  key={asset.id}
                  style={
                    {
                      "--daw-reveal-delay": `${120 + index * 80}ms`,
                      "--daw-reveal-x": `${index === 0 ? 26 : -26}px`,
                      "--daw-reveal-rotate": `${index === 0 ? 1.5 : -1.5}deg`,
                    } as CSSProperties
                  }
                >
                  <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-white/42">{label}</div>
                    <Icon className={`h-4 w-4 ${index === 0 ? "text-primary" : "text-secondary"}`} />
                  </div>
                  <img alt={asset.alt} className="h-64 w-full object-cover object-top" decoding="async" loading="lazy" src={asset.src} />
                  <div className="px-4 py-4">
                    <div className="font-headline text-base font-semibold text-white">{asset.label}</div>
                    <p className="mt-2 text-sm leading-6 text-white/70">{asset.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
};

export default DawCockpitScene;
