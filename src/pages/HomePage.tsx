import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Download, Github, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import SoundField from "@/components/scene/SoundField";
import { Button } from "@/components/ui/button";
import { BRANDING_ASSETS } from "@/constants/site";
import { designMedia } from "@/data/designMedia";
import { homeCapabilityGrid, homeFinalCta, homeHero, homeOriginStory, homePillars, homeSeo } from "@/data/home";
import { externalLinks } from "@/data/siteLinks";

const pillarMedia = [designMedia.homeUspStems, designMedia.homeUspMixer, designMedia.homeUspCode];

const HomePage = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const stageY = useTransform(scrollYProgress, [0, 1], [0, -38]);

  return (
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
      id="main-content"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageSeo {...homeSeo} />

      <section className="design-mesh-bg relative min-h-screen overflow-hidden px-6 pb-20 pt-32 md:px-10" ref={heroRef}>
        <div className="floating-audio-orb left-[8%] top-[18%] h-72 w-72 bg-primary/30" />
        <div className="floating-audio-orb bottom-[15%] right-[10%] h-[28rem] w-[28rem] bg-secondary/20 [animation-delay:-2s]" />
        <SoundField accent="lavender" density={1.2} showGrid={false} />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="design-badge design-badge-primary mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{homeHero.eyebrow}</span>
          </div>
          <h1 className="design-display-title bg-gradient-to-b from-white to-white/40 bg-clip-text font-headline font-bold text-transparent">
            {homeHero.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-headline text-sm uppercase tracking-[0.34em] text-white/42 md:text-base">
            {homeHero.supportLine}
          </p>
          <p className="mx-auto mt-6 max-w-3xl font-headline text-xl leading-relaxed text-white/70 md:text-2xl">
            {homeHero.description}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild className="h-auto rounded-2xl px-10 py-4 text-base">
              <Link to={homeHero.primaryCta.to}>
                <Download className="h-4 w-4" />
                {homeHero.primaryCta.label}
              </Link>
            </Button>
            {externalLinks.repository ? (
              <Button asChild className="h-auto rounded-2xl px-10 py-4 text-base" variant="outline">
                <a href={externalLinks.repository} rel="noreferrer" target="_blank">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </Button>
            ) : (
              <Button asChild className="h-auto rounded-2xl px-10 py-4 text-base" variant="outline">
                <Link to="/github">
                  <Github className="h-4 w-4" />
                  GitHub
                </Link>
              </Button>
            )}
          </div>

          <div className="relative mx-auto mt-12 flex w-full max-w-sm justify-center md:max-w-md">
            <div className="absolute inset-0 rounded-full bg-primary/12 blur-3xl" />
            <div className="relative flex aspect-square w-[clamp(10rem,24vw,15rem)] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_80px_rgba(208,188,255,0.18)]">
              <img alt="OpenStudio icon" className="h-full w-full object-contain" src={BRANDING_ASSETS.mark} />
            </div>
          </div>
        </div>

        <motion.div className="relative z-10 mx-auto mt-16 w-full max-w-6xl" style={{ y: stageY }}>
          <div className="design-window-shell rounded-[1.75rem]">
            <div className="flex h-10 items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/40" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/40" />
                <span className="h-3 w-3 rounded-full bg-green-500/40" />
              </div>
              <span className="ml-4 font-mono text-[0.58rem] uppercase tracking-[0.24em] text-white/34">openstudio_sonic_obsidian_v1.0</span>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                alt={designMedia.homeHeroTimeline.alt}
                className="h-full w-full object-cover"
                src={designMedia.homeHeroTimeline.src}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
              <div className="absolute left-6 top-6 hidden gap-2 md:flex">
                {["Stem work", "Pitch edits", "Native mixing", "Open source"].map((item) => (
                  <span className="design-badge bg-black/30 text-white/70 backdrop-blur-lg" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 grid gap-3 border-t backdrop-blur-xl border-white/10 bg-black/35 p-4 md:grid-cols-3 md:p-6">
                {[
                  "Recording, MIDI, pitch work, and plugin hosting stay in one session.",
                  "Optional AI tooling stays honest and separate from the base install.",
                  "The product story stays close to the actual release and repository surface.",
                ].map((item) => (
                  <p className="text-sm leading-7 text-white/72" key={item}>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_0.92fr]">
          <SectionReveal className="space-y-8">
            <div className="design-badge design-badge-secondary">{homeOriginStory.eyebrow}</div>
            <h2 className="section-display font-headline font-bold text-white">One Developer. Product-First. Built in the Open.</h2>
            <p className="text-lg leading-8 text-white/66">{homeOriginStory.description}</p>
            <p className="text-lg leading-8 text-white/66">
              The visual direction can be cinematic without losing the factual center: serious desktop workflows, visible release tradeoffs, and a public product story that still feels grounded.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="h-1 w-24 rounded-full bg-primary" />
              <span className="font-mono text-xs uppercase tracking-[0.28em] text-primary">Project active</span>
            </div>
          </SectionReveal>

          <SectionReveal className="relative mx-auto w-full max-w-[34rem]" delay={0.08}>
            <div className="absolute -inset-6 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative aspect-square overflow-hidden rounded-[2.75em] border border-white/10 bg-white/[0.04] shadow-2xl">
              <img
                alt={designMedia.homeStoryServer.alt}
                className="h-full w-full object-cover grayscale contrast-125"
                src={designMedia.homeStoryServer.src}
              />
              <div className="absolute inset-0 bg-primary/15 mix-blend-screen" />
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="bg-black/20 px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="font-headline text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">Engineered for the Future</h2>
            <div className="mx-auto mt-4 h-1 w-32 rounded-full bg-[linear-gradient(135deg,rgba(164,142,255,0.95),rgba(123,255,171,0.9))]" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {homePillars.slice(0, 3).map((pillar, index) => (
              <SectionReveal
                className="design-glass-panel rounded-[2.75rem] p-8"
                delay={index * 0.06}
                key={pillar.title}
              >
                <div className="h-48 overflow-hidden rounded-2xl">
                  <img alt={pillarMedia[index]!.alt} className="h-full w-full object-cover transition duration-700 hover:scale-110" src={pillarMedia[index]!.src} />
                </div>
                <h3 className="mt-8 font-headline text-2xl font-bold text-white">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/66">{pillar.description}</p>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4 md:grid-rows-2">
          <SectionReveal className="design-panel relative overflow-hidden rounded-[2.5rem] p-10 md:col-span-2 md:row-span-2" delay={0.02}>
            <SoundField accent="emerald" bars={42}  density={0.9} showGrid={false} showNodes={false} showWave={false}/>
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <h3 className="font-headline text-4xl font-bold text-white">{homeCapabilityGrid[0]?.title ?? "Hyper-Scale Recording"}</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/68">{homeCapabilityGrid[0]?.description}</p>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal className="design-panel flex items-center justify-between rounded-[2.5rem] p-10 md:col-span-2" delay={0.08}>
            <div>
              <h3 className="font-headline text-2xl font-bold text-white">{homeCapabilityGrid[1]?.title ?? "Sonic Obsidian Mixer"}</h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/66">{homeCapabilityGrid[1]?.description}</p>
            </div>
            <div className="hidden h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary md:flex">
              <Sparkles className="h-8 w-8" />
            </div>
          </SectionReveal>

          <SectionReveal className="design-panel flex flex-col items-center justify-center gap-4 rounded-[2.5rem] p-8 text-center" delay={0.12}>
            <Github className="h-10 w-10 text-accent" />
            <h3 className="font-headline text-xl font-bold text-white">{homeCapabilityGrid[2]?.title ?? "Plugin Hosting"}</h3>
          </SectionReveal>

          <SectionReveal className="design-panel flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-primary/20 bg-primary/10 p-8 text-center" delay={0.16}>
            <ArrowRight className="h-10 w-10 text-primary" />
            <h3 className="font-headline text-xl font-bold text-primary">{homeCapabilityGrid[3]?.title ?? "Collaborate"}</h3>
          </SectionReveal>
        </div>
      </section>

      <section className="px-6 pb-28 md:px-10">
        <SectionReveal className="design-glass-panel relative mx-auto max-w-4xl overflow-hidden rounded-[2.75rem] border border-primary/20 p-12 text-center md:p-16">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="relative z-10">
            <h2 className="font-headline text-4xl font-bold text-white md:text-6xl">Ready to join the revolution?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/66">{homeFinalCta.description}</p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild className="rounded-2xl px-10">
                <Link to={homeFinalCta.primaryCta.to}>{homeFinalCta.primaryCta.label}</Link>
              </Button>
              <Button asChild className="rounded-2xl px-10" variant="outline">
                <Link to={homeFinalCta.secondaryCta.to}>{homeFinalCta.secondaryCta.label}</Link>
              </Button>
            </div>
            <div className="mt-8 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-white/34">Windows + macOS live | optional AI tools separate</div>
          </div>
        </SectionReveal>
      </section>
    </motion.main>
  );
};

export default HomePage;
