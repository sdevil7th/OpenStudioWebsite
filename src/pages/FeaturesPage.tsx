import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, SlidersHorizontal, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import ChapterProgress from "@/components/ChapterProgress";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import { Button } from "@/components/ui/button";
import { designMedia } from "@/data/designMedia";
import { featureChapters, featurePageHero, featurePageSeo } from "@/data/features";

const FeaturesPage = () => {
  const [activeId, setActiveId] = useState(featureChapters[0]?.id ?? "");

  useEffect(() => {
    const observers = featureChapters.map((chapter) => {
      const element = document.getElementById(chapter.id);

      if (!element) {
        return null;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(chapter.id);
          }
        },
        {
          threshold: 0.35,
          rootMargin: "-10% 0px -45% 0px",
        },
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  const arrangement = featureChapters[0]!;
  const midi = featureChapters[1]!;
  const mixer = featureChapters[2]!;
  const engine = featureChapters[3]!;
  const automation = featureChapters[4]!;

  return (
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      className="design-page-main"
      id="main-content"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageSeo {...featurePageSeo} />

      <div className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <header className="mb-20 text-center md:text-left">
          <h1 className="font-headline text-6xl font-extrabold tracking-[-0.06em] text-white md:text-8xl">
            ADVANCED <span className="italic text-primary">WORKFLOWS</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/64">{featurePageHero.description}</p>
        </header>

        <div className="grid gap-10 xl:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="space-y-6 xl:sticky xl:top-28 xl:h-fit">
            <div className="design-panel rounded-[1.75rem] p-5">
              <p className="editorial-kicker mb-4">Feature atlas</p>
              <ChapterProgress activeId={activeId} items={featureChapters.map((item) => ({ id: item.id, label: item.label }))} />
            </div>
            <div className="design-panel rounded-[1.75rem] p-5">
              <p className="editorial-kicker mb-3">Current focus</p>
              <p className="font-headline text-2xl font-semibold text-white">{featureChapters.find((item) => item.id === activeId)?.label ?? arrangement.label}</p>
              <p className="mt-3 text-sm leading-7 text-white/62">{featureChapters.find((item) => item.id === activeId)?.description ?? arrangement.description}</p>
            </div>
          </aside>

          <div className="space-y-32">
            <section className="scroll-mt-28" id={arrangement.id}>
              <div className="grid items-center gap-8 lg:grid-cols-12">
                <SectionReveal className="space-y-6 lg:col-span-5">
                  <div className="design-badge design-badge-primary">Module 01 / Session Control</div>
                  <h2 className="text-4xl font-headline font-bold tracking-tight text-white">{arrangement.label === "Arrangement" ? "The Arrangement Canvas" : arrangement.title}</h2>
                  <p className="text-base leading-8 text-white/64">{arrangement.description}</p>
                  <div className="space-y-4 pt-2">
                    {arrangement.items.slice(0, 2).map((item, index) => (
                      <div className="group flex items-center gap-4" key={item.title}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 ${index === 0 ? "text-primary" : "text-secondary"} bg-black/40`}>
                          {index === 0 ? <SlidersHorizontal className="h-4 w-4" /> : <Waves className="h-4 w-4" />}
                        </div>
                        <div>
                          <h3 className="font-headline text-sm font-bold text-white">{item.title}</h3>
                          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-white/42">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionReveal>
                <SectionReveal className="lg:col-span-7" delay={0.08}>
                  <div className="design-glass-panel overflow-hidden rounded-[1.5rem] p-1">
                    <img alt={designMedia.featuresArrangement.alt} className="w-full rounded-[1.15rem] shadow-2xl" src={designMedia.featuresArrangement.src} />
                  </div>
                </SectionReveal>
              </div>
            </section>

            <section className="scroll-mt-28" id={midi.id}>
              <div className="grid items-center gap-12 lg:grid-cols-12">
                <SectionReveal className="order-2 lg:order-1 lg:col-span-7">
                  <div className="design-glass-panel overflow-hidden rounded-[1.5rem] p-1">
                    <img alt={designMedia.featuresPianoRoll.alt} className="w-full rounded-[1.15rem]" src={designMedia.featuresPianoRoll.src} />
                  </div>
                </SectionReveal>
                <SectionReveal className="order-1 space-y-6 lg:order-2 lg:col-span-5" delay={0.08}>
                  <div className="design-badge border-accent/20 bg-accent/10 text-accent">Module 02 / Composition</div>
                  <h2 className="text-4xl font-headline font-bold tracking-tight text-white">Intelligence-Driven MIDI</h2>
                  <p className="text-base leading-8 text-white/64">{midi.description}</p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="design-panel rounded-[1.25rem] p-4">
                      <h3 className="font-headline text-sm font-bold text-primary">Humanize</h3>
                      <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/45">{midi.items[1]?.title}</p>
                    </div>
                    <div className="design-panel rounded-[1.25rem] p-4">
                      <h3 className="font-headline text-sm font-bold text-secondary">MIDI Poly</h3>
                      <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/45">{midi.items[2]?.title}</p>
                    </div>
                  </div>
                </SectionReveal>
              </div>
            </section>

            <section className="scroll-mt-28" id={mixer.id}>
              <div className="mb-12">
                <h2 className="text-4xl font-headline font-bold tracking-tight text-white">Sonic Architecture: The Mixer</h2>
                <div className="mt-3 h-1 w-24 rounded-full bg-secondary" />
              </div>
              <div className="grid items-start gap-8 lg:grid-cols-12">
                <SectionReveal className="lg:col-span-8">
                  <div className="design-glass-panel overflow-hidden rounded-[1.5rem] p-1">
                    <img alt={designMedia.featuresChannelStrip.alt} className="w-full rounded-[1.15rem]" src={designMedia.featuresChannelStrip.src} />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/15 via-transparent to-background/15" />
                  </div>
                </SectionReveal>
                <SectionReveal className="lg:col-span-4" delay={0.08}>
                  <div className="design-glass-panel rounded-[1.75rem] p-8">
                    <div className="space-y-6">
                      <div>
                        <SlidersHorizontal className="h-10 w-10 text-secondary" />
                        <h3 className="mt-5 font-headline text-2xl font-bold text-white">Console Workflow</h3>
                        <p className="mt-4 text-sm italic leading-7 text-white/62">
                          "{mixer.standout ?? mixer.description}"
                        </p>
                      </div>
                      <ul className="space-y-4 border-t border-white/10 pt-6 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-white/48">
                        {mixer.items.slice(0, 3).map((item) => (
                          <li className="flex items-center gap-3" key={item.title}>
                            <span className="h-1 w-1 rounded-full bg-secondary" />
                            {item.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </SectionReveal>
              </div>
            </section>

            <section className="scroll-mt-28" id={engine.id}>
              <SectionReveal className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-[#0d0d11] px-8 py-20 md:px-12">
                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/5 blur-[100px]" />
                <div className="relative z-10 grid items-center gap-16 lg:grid-cols-2">
                  <div>
                    <h2 className="font-display text-4xl font-bold uppercase text-primary">The Engine</h2>
                    <div className="mt-8 space-y-8">
                      {engine.items.slice(0, 2).map((item, index) => (
                        <div className="flex gap-6" key={item.title}>
                          <div className={`font-display text-2xl ${index === 0 ? "text-primary/30" : "text-secondary/30"}`}>{`0${index + 1}`}</div>
                          <div>
                            <h3 className="font-headline text-xl font-bold uppercase tracking-[0.08em] text-white">{item.title}</h3>
                            <p className="mt-2 leading-7 text-white/64">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="animate-float">
                      <div className="design-glass-panel overflow-hidden rounded-[1.5rem] p-1">
                        <img alt={designMedia.featuresPluginHosting.alt} className="w-full rounded-[1.15rem]" src={designMedia.featuresPluginHosting.src} />
                      </div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 rounded-xl border border-primary/20 bg-black/55 px-4 py-3 backdrop-blur-2xl">
                      <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-primary">
                        <BrainCircuit className="h-3.5 w-3.5" />
                        sandbox active
                      </div>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            </section>

            <section className="scroll-mt-28" id={automation.id}>
              <SectionReveal className="design-glass-panel rounded-[2rem] border border-white/10 p-10 md:p-12">
                <div className="grid items-center gap-12 md:grid-cols-2">
                  <div className="space-y-6">
                    <h2 className="text-4xl font-headline font-bold tracking-tight text-white">Scriptable Automation</h2>
                    <p className="text-lg leading-8 text-white/64">{automation.description}</p>
                    <Button asChild className="h-auto rounded-2xl px-8 py-3 font-mono text-xs uppercase tracking-[0.18em]" variant="outline">
                      <Link to="/github">Explore GitHub</Link>
                    </Button>
                  </div>
                  <div className="design-code-shell">
                    <div className="flex items-center justify-between border-b border-white/10 bg-black/35 px-4 py-4">
                      <div className="flex gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-500/50" />
                        <span className="h-3 w-3 rounded-full bg-amber-500/50" />
                        <span className="h-3 w-3 rounded-full bg-secondary/70" />
                      </div>
                      <div className="font-mono text-[0.62rem] text-white/42">automation.ts</div>
                    </div>
                    <div className="overflow-x-auto p-6 font-mono text-xs leading-7 text-primary/80">
                      <pre>
                        <code>{`// Generate automation inside the session
const track = Session.getTrack(1);
for (let i = 0; i < 100; i++) {
  track.automation.addPoint({
    time: i * 0.1,
    value: Math.sin(i / 10),
    type: "bezier",
  });
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            </section>
          </div>
        </div>
      </div>
    </motion.main>
  );
};

export default FeaturesPage;
