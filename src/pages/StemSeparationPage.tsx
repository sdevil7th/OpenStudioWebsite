import { motion } from "framer-motion";
import { BrainCircuit, Download, FolderCog, Music4, SlidersHorizontal, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import SoundField from "@/components/scene/SoundField";
import { Button } from "@/components/ui/button";
import { designMedia } from "@/data/designMedia";
import { stemArchitectureCards, stemExplainer, stemHero, stemInstallFacts, stemSeparationSeo, stemWhyItMatters } from "@/data/stemSeparation";

const StemSeparationPage = () => (
  <motion.main
    animate={{ opacity: 1, y: 0 }}
    className="design-page-main"
    id="main-content"
    initial={{ opacity: 0, y: 18 }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
  >
    <PageSeo {...stemSeparationSeo} />

    <div className="relative mx-auto max-w-7xl px-6 pb-24 md:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[52rem] overflow-hidden opacity-30">
        <img alt={designMedia.homeHeroTimeline.alt} className="h-full w-full object-cover object-top [mask-image:linear-gradient(180deg,#000_50%,transparent_100%)]" src={designMedia.homeHeroTimeline.src} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
      </div>

      <section className="relative z-10">
        <div className="mb-20 max-w-4xl pt-6">
          <div className="design-badge design-badge-primary mb-8">
            <span className="h-2 w-2 animate-pulse rounded-full bg-secondary shadow-[0_0_10px_#4ae176]" />
            BS Roformer 6-Track Separation Active
          </div>
          <h1 className="font-headline text-7xl font-black tracking-[-0.08em] leading-[0.85] text-white md:text-9xl">
            Sonic <span className="bg-gradient-to-br from-primary via-secondary to-primary bg-clip-text text-transparent">Obsidian</span>
          </h1>
          <p className="mt-8 max-w-3xl text-xl font-light leading-relaxed text-white/74 md:text-2xl">{stemHero.description}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild className="rounded-full px-8 py-4">
              <Link to={stemHero.primaryCta.to}>
                <Sparkles className="h-4 w-4" />
                Process audio
              </Link>
            </Button>
            <Button asChild className="rounded-full px-8 py-4" variant="outline">
              <Link to={stemHero.secondaryCta.to}>View benchmarks</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <SectionReveal className="design-glass-panel relative overflow-hidden rounded-[2rem] border-primary/25 p-8 lg:col-span-8">
            <SoundField accent="lavender" density={0.9} showGrid={false} />
            <div className="relative z-10">
              <div className="mb-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
                    <Music4 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white">Input: MASTER_MIX_FINAL.wav</h2>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/34">Optional local AI runtime</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="design-badge bg-white/[0.06]">6-stem mode</span>
                  <span className="design-badge design-badge-secondary animate-pulse">extracting</span>
                </div>
              </div>

              <div className="space-y-4">
                {stemArchitectureCards.slice(0, 3).map((card, index) => (
                  <div className="group flex min-h-16 items-center gap-6 rounded-[1.25rem] border border-white/5 bg-white/[0.04] px-6 py-4 transition hover:bg-white/[0.08]" key={card.id}>
                    <div className="w-24 text-xs font-mono uppercase tracking-[0.18em]" style={{ color: card.color }}>
                      {card.label}
                    </div>
                    <div className="flex h-8 flex-1 items-center gap-[3px]">
                      {Array.from({ length: index === 2 ? 1 : 10 }).map((_, barIndex) => (
                        <div
                          className={`rounded-full ${index === 2 ? "h-1 w-full" : "eq-bar w-1.5"}`}
                          key={`${card.id}-${barIndex}`}
                          style={{
                            animationDelay: `${barIndex * 0.06}s`,
                            background: card.color,
                            boxShadow: `0 0 12px ${card.color}`,
                            height: index === 2 ? undefined : `${[30, 55, 82, 44, 24, 72, 36, 62, 94, 50][barIndex]}%`,
                            opacity: index === 2 ? 1 : [0.35, 0.55, 0.9, 0.45, 0.25, 0.72, 0.4, 0.6, 1, 0.5][barIndex],
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-3 text-white/28 transition group-hover:text-white/78">
                      <SlidersHorizontal className="h-4 w-4" />
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-3 gap-4">
                  {stemArchitectureCards.slice(3).map((card) => (
                    <div className="flex h-16 items-center justify-center rounded-[1.25rem] border border-white/5 bg-white/[0.04] font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/45 transition hover:border-primary/30 hover:text-primary" key={card.id}>
                      {card.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 rounded-[1.5rem] border border-white/5 bg-black/35 p-6">
                <div className="mb-6 flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <h3 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white">Extraction complete</h3>
                </div>
                <div className="grid items-center gap-8 md:grid-cols-2">
                  <div className="overflow-hidden rounded-[1rem] border border-white/10 shadow-2xl">
                    <img alt={designMedia.stemRenderDialog.alt} className="w-full transition duration-700 hover:scale-105" src={designMedia.stemRenderDialog.src} />
                  </div>
                  <div>
                    <h4 className="font-headline text-lg font-bold text-white">Commit to disk</h4>
                    <p className="mt-4 text-sm leading-7 text-white/62">
                      Once separated, use the integrated render flow to export stems. The value is not just the split, it is the fact that the results move straight back into the same project.
                    </p>
                    <Button asChild className="mt-6 h-auto w-full rounded-2xl px-6 py-3 font-mono text-xs uppercase tracking-[0.18em]" variant="outline">
                      <Link to="/download">Open export path</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>

          <div className="space-y-8 lg:col-span-4">
            <SectionReveal className="design-glass-panel rounded-[2rem] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] p-8" delay={0.08}>
              <div className="flex items-center gap-3">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <h3 className="font-headline text-lg font-bold tracking-tight text-white">BS Roformer Core</h3>
              </div>
              <p className="mt-6 text-sm leading-7 text-white/66">{stemExplainer.paragraphs[0]}</p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.18em]">
                  <span className="text-white/35">Architecture</span>
                  <span className="text-secondary">Band-split transformer</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.18em]">
                  <span className="text-white/35">Install path</span>
                  <span className="text-primary">Optional</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.18em]">
                  <span className="text-white/35">Workflow</span>
                  <span className="text-white">6 stems</span>
                </div>
              </div>
            </SectionReveal>

            <SectionReveal className="design-panel rounded-[2rem] p-8" delay={0.12}>
              <FolderCog className="mb-4 h-6 w-6 text-accent" />
              <h4 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white">Practical setup</h4>
              <div className="mt-4 space-y-4">
                {stemInstallFacts.slice(0, 3).map((fact) => (
                  <p className="text-xs leading-6 text-white/56" key={fact}>
                    {fact}
                  </p>
                ))}
              </div>
              <Button asChild className="mt-6 h-auto w-full rounded-2xl px-6 py-3 font-semibold" variant="outline">
                <Link to="/download">Configure export</Link>
              </Button>
            </SectionReveal>

            <Button asChild className="h-auto w-full rounded-[2rem] px-8 py-6 text-xl font-black shadow-[0_20px_40px_rgba(208,188,255,0.22)]">
              <Link to="/download">
                <Download className="h-5 w-5" />
                Download models
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-36 grid gap-16 border-t border-white/5 pt-20 md:grid-cols-3">
          {stemWhyItMatters.map((item, index) => (
            <SectionReveal className="space-y-6" delay={index * 0.06} key={item.title}>
              <div className={`font-display text-5xl ${index === 0 ? "text-primary/10" : index === 1 ? "text-secondary/10" : "text-accent/10"}`}>{`0${index + 1}`}</div>
              <h3 className="font-headline text-2xl font-bold text-white">{item.title}</h3>
              <p className="text-base leading-8 text-white/58">{item.description}</p>
            </SectionReveal>
          ))}
        </div>
      </section>
    </div>
  </motion.main>
);

export default StemSeparationPage;
