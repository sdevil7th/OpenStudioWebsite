import { ArrowRight, Download, Github, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import BrandLogoConstructScene from "@/components/brand/BrandLogoConstructScene";
import SectionReveal from "@/components/motion/SectionReveal";
import DawCockpitScene from "@/components/scene/DawCockpitScene";
import SoundField from "@/components/scene/SoundField";
import { Button } from "@/components/ui/button";
import { BRANDING_ASSETS } from "@/constants/site";
import { designMedia } from "@/data/designMedia";
import {
  homeCapabilityGrid,
  homeFinalCta,
  homeHero,
  homeOriginStory,
  homePillars,
  homeProofBarItems,
  homeSeo,
  homeWorkflowSteps,
} from "@/data/home";
import { externalLinks } from "@/data/siteLinks";
import { type ScrollTriggerInstance, useScrollScene } from "@/lib/gsap";

const pillarMedia = [
  designMedia.homeUspStems,
  designMedia.homeUspMixer,
  designMedia.homeUspCode,
];

const HomePage = () => {
  const pageRef = useRef<HTMLElement | null>(null);
  const [logoProgress, setLogoProgress] = useState(0);

  useScrollScene(pageRef, ({ prefersReducedMotion, isDesktop, gsap, ScrollTrigger }) => {
    let logoTrigger: ScrollTriggerInstance | undefined;
    let logoPinTrigger: ScrollTriggerInstance | undefined;

    if (prefersReducedMotion) {
      setLogoProgress(0.5);
    } else if (isDesktop) {
      logoPinTrigger = ScrollTrigger.create({
        trigger: "[data-home-logo-scroll-section]",
        start: "top top+=96",
        end: "bottom top",
        pin: "[data-home-logo-pin-stage]",
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      logoTrigger = ScrollTrigger.create({
        trigger: "[data-home-logo-scroll-section]",
        start: "top top",
        end: "bottom top",
        scrub: 0.7,
        onUpdate: (self) => {
          setLogoProgress(Number(self.progress.toFixed(3)));
        },
      });
    } else {
      setLogoProgress(0.5);
    }

    if (!prefersReducedMotion) {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-home-hero-eyebrow]", { y: 18, duration: 0.48 })
        .from("[data-home-hero-title]", { y: 14, duration: 0.52 }, 0.06)
        .from("[data-home-hero-support]", { y: 12, duration: 0.32 }, 0.12)
        .from("[data-home-hero-body]", { y: 14, duration: 0.38 }, 0.16)
        .from(
          "[data-home-hero-action]",
          { y: 12, stagger: 0.08, duration: 0.34 },
          0.18,
        )
        .from(
          "[data-home-proof-item]",
          { y: 16, opacity: 0, stagger: 0.05, duration: 0.38 },
          0.32,
        )
        .from(
          "[data-home-logo-stage]",
          { y: 28, opacity: 0, scale: 0.97, duration: 0.72 },
          0.1,
        );
    }

    gsap.from("[data-home-card]", {
      y: 44,
      opacity: 0,
      duration: 1,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "[data-home-card-grid]",
        start: "top 72%",
      },
    });

    gsap.utils
      .toArray<HTMLElement>("[data-parallax-image]")
      .forEach((image) => {
        gsap.fromTo(
          image,
          { scale: 1.15, yPercent: -6 },
          {
            scale: 1,
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: image,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      });

    return () => {
      logoPinTrigger?.kill();
      logoTrigger?.kill();
    };
  });

  return (
    <main
      ref={pageRef}
      className="relative"
      id="main-content"
    >
      <PageSeo {...homeSeo} />

      <section
        className="home-logo-scroll-section relative min-h-[auto] overflow-hidden px-4 pb-12 pt-24 md:px-8 xl:min-h-[214vh] xl:px-12"
        data-home-logo-scroll-section
      >
        <div className="absolute inset-0 design-mesh-bg" />
        <div className="floating-audio-orb left-[5%] top-[10%] h-72 w-72 bg-primary/24" />
        <div className="floating-audio-orb bottom-[6%] right-[6%] h-[32rem] w-[32rem] bg-secondary/18 [animation-delay:-2s]" />
        {/* <SoundField accent="lavender" density={1.15} showGrid={false} /> */}

        <div className="home-logo-sticky-stage page-frame-wide relative z-10" data-home-logo-pin-stage>
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-center">
            <div className="xl:hidden" data-home-logo-stage>
              <BrandLogoConstructScene progress={0.5} size="compact" />
            </div>
            <div className="max-w-4xl pt-4 xl:pt-8">
              <div
                className="design-badge design-badge-primary mb-8 w-fit"
                data-home-hero-eyebrow
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{homeHero.eyebrow}</span>
              </div>
              <h1
                className="design-display-title max-w-5xl font-headline font-bold text-white [text-wrap:balance]"
                data-home-hero-title
              >
                {homeHero.title}
              </h1>
              <p
                className="mt-5 font-headline text-sm uppercase tracking-[0.34em] text-white/54 md:text-base"
                data-home-hero-support
              >
                {homeHero.supportLine}
              </p>
              <p
                className="mt-6 max-w-4xl font-headline text-xl leading-relaxed text-white/76 md:text-2xl 2xl:text-[1.7rem]"
                data-home-hero-body
              >
                {homeHero.description}
              </p>

              <div
                className="mt-10 flex flex-col gap-4 sm:flex-row"
                data-home-hero-actions
              >
                <span className="home-action-slot" data-home-hero-action>
                  <Button asChild className="h-auto min-w-[min(100%,17rem)] px-10 py-4 text-base font-bold">
                    <Link to={homeHero.primaryCta.to}>
                      <span className="openstudio-button__icon">
                        <Download className="h-4 w-4" />
                      </span>
                      <span className="openstudio-button__label">{homeHero.primaryCta.label}</span>
                    </Link>
                  </Button>
                </span>
                {externalLinks.repository ? (
                  <span className="home-action-slot" data-home-hero-action>
                    <Button asChild className="h-auto min-w-[min(100%,11rem)] px-10 py-4 text-base font-semibold" variant="outline">
                      <a href={externalLinks.repository} rel="noreferrer" target="_blank">
                        <span className="openstudio-button__icon">
                          <Github className="h-4 w-4" />
                        </span>
                        <span className="openstudio-button__label">GitHub</span>
                      </a>
                    </Button>
                  </span>
                ) : (
                  <span className="home-action-slot" data-home-hero-action>
                    <Button asChild className="h-auto min-w-[min(100%,11rem)] px-10 py-4 text-base font-semibold" variant="outline">
                      <Link to="/github">
                        <span className="openstudio-button__icon">
                          <Github className="h-4 w-4" />
                        </span>
                        <span className="openstudio-button__label">GitHub</span>
                      </Link>
                    </Button>
                  </span>
                )}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:max-w-3xl">
                {homeProofBarItems.slice(0, 4).map((item) => (
                  <div
                    className="design-glass-panel rounded-[1.4rem] px-4 py-3 text-sm text-white/76"
                    data-home-proof-item
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden xl:block" data-home-logo-stage>
              <BrandLogoConstructScene progress={logoProgress} showWordmark />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8 xl:px-12">
        <div className="page-frame-wide">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-end">
            <DawCockpitScene accent="lavender" />
            <div className="flex flex-wrap items-center gap-4 rounded-[1.5rem] border border-white/10 bg-black/30 px-5 py-4 xl:flex-col xl:items-start">
              <div className="flex items-center gap-4">
                <div className="flex aspect-square w-14 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] p-3">
                  <img
                    alt="OpenStudio icon"
                    className="h-full w-full object-contain"
                    decoding="async"
                    src={BRANDING_ASSETS.mark}
                  />
                </div>
                <div>
                  <div className="font-headline text-lg font-bold text-white">
                    OpenStudio live session
                  </div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-white/36">
                    recording, MIDI, mixing, plugin hosting
                  </div>
                </div>
              </div>
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary">
                Windows + macOS + Linux | optional AI tools separate
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8 xl:px-12">
        <div className="page-frame-wide">
          <div className="scroll-spotlight grid gap-12 overflow-hidden rounded-[2.75rem] border border-white/10 p-6 md:p-10 xl:grid-cols-[0.86fr_1.14fr] xl:items-center xl:p-12">
            <div className="space-y-7" data-home-origin-copy>
              <div className="design-badge design-badge-secondary w-fit">
                {homeOriginStory.eyebrow}
              </div>
              <h2 className="section-display max-w-xl font-headline font-bold text-white">
                Open Source. Product-Led. Built in Public.
              </h2>
              <p className="max-w-xl text-lg leading-8 text-white/66">
                {homeOriginStory.description}
              </p>
              <div className="grid gap-4">
                {homeOriginStory.points.map((point) => (
                  <div
                    className="rounded-[1.45rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-sm leading-7 text-white/70"
                    key={point}
                  >
                    {point}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="h-1 w-24 rounded-full bg-primary" />
                <span className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
                  Project active
                </span>
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-[2.3rem] border border-white/10"
              data-home-origin-media
            >
              <img
                alt={designMedia.homeStoryServer.alt}
                className="h-full w-full object-cover grayscale contrast-125"
                data-parallax-image
                decoding="async"
                loading="lazy"
                src={designMedia.homeStoryServer.src}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/16 via-transparent to-secondary/10 mix-blend-screen" />
              <div className="absolute inset-x-6 bottom-6 rounded-[1.4rem] border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary">
                  Public direction
                </div>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/72">
                  The site, release surface, and repository all reinforce the
                  same story: real desktop workflows, visible tradeoffs, and a
                  project people can inspect before they commit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 xl:px-12">
        <div className="page-frame-wide">
          <div className="mb-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="design-badge design-badge-primary mb-4 w-fit">
                Connected workflow
              </div>
              <h2 className="font-display text-4xl font-bold uppercase tracking-tight text-white md:text-6xl">
                Scroll Through the Session
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/62">
              These are not isolated feature bullets. They are the moments that
              make the whole project feel cohesive when you move from
              composition to finishing work.
            </p>
          </div>

          <div className="grid gap-6 2xl:grid-cols-2" data-home-card-grid>
            {homeWorkflowSteps.slice(0, 4).map((step, index) => (
              <article
                className="design-glass-panel group overflow-hidden rounded-[2rem] border border-white/10"
                data-home-card
                key={step.id}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    alt={step.screenshot.alt}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    data-parallax-image
                    decoding="async"
                    loading="lazy"
                    src={step.screenshot.src}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
                  <div className="absolute left-5 top-5 design-badge bg-black/40 text-white/75">
                    {step.eyebrow}
                  </div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="font-display text-4xl text-white/18">{`0${index + 1}`}</div>
                    <h3 className="mt-2 max-w-lg font-headline text-2xl font-bold text-white">
                      {step.title}
                    </h3>
                  </div>
                </div>
                <div className="grid gap-4 p-6">
                  <p className="text-sm leading-7 text-white/66">
                    {step.description}
                  </p>
                  <div className="grid gap-3">
                    {step.bullets.slice(0, 2).map((bullet) => (
                      <div
                        className="rounded-[1.3rem] border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/70"
                        key={bullet}
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black/20 px-4 py-14 md:px-8 xl:px-12">
        <div className="page-frame-wide">
          <div className="mb-14 text-center">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">
              Engineered for Serious Work
            </h2>
            <div className="mx-auto mt-4 h-1 w-32 rounded-full bg-secondary" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {homePillars.slice(0, 3).map((pillar, index) => (
              <SectionReveal
                className="design-glass-panel rounded-[2.4rem] p-7"
                delay={index * 0.06}
                key={pillar.title}
              >
                <div className="relative h-56 overflow-hidden rounded-[1.75rem]">
                  <img
                    alt={pillarMedia[index]!.alt}
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    data-parallax-image
                    decoding="async"
                    loading="lazy"
                    src={pillarMedia[index]!.src}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                </div>
                <h3 className="mt-7 font-headline text-2xl font-bold text-white">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/66">
                  {pillar.description}
                </p>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 xl:px-12">
        <div className="page-frame-wide grid gap-4 md:grid-cols-4 md:grid-rows-2">
          <SectionReveal
            className="design-panel relative overflow-hidden rounded-[2.5rem] p-10 md:col-span-2 md:row-span-2"
            delay={0.02}
          >
            <SoundField
              accent="emerald"
              density={0.9}
              showGrid={false}
              showNodes={false}
            />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <h3 className="font-display text-4xl font-bold text-white">
                  {homeCapabilityGrid[0]?.title ?? "Hyper-scale recording"}
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/68">
                  {homeCapabilityGrid[0]?.description}
                </p>
              </div>
              <div className="mt-12 border-t border-white/10 pt-8">
                <div className="flex h-32 items-end gap-2">
                  {[60, 82, 100, 40, 90, 50, 72, 100, 34].map(
                    (height, index) => (
                      <div
                        className="eq-bar w-2 rounded-full bg-secondary"
                        key={height}
                        style={{
                          animationDelay: `${index * 0.08}s`,
                          height: `${height}%`,
                          opacity: Math.max(0.25, height / 100),
                        }}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal
            className="design-panel flex items-center justify-between rounded-[2.5rem] p-10 md:col-span-2"
            delay={0.08}
          >
            <div>
              <h3 className="font-headline text-2xl font-bold text-white">
                {homeCapabilityGrid[1]?.title ?? "Mixer architecture"}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/66">
                {homeCapabilityGrid[1]?.description}
              </p>
            </div>
            <div className="hidden h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary md:flex">
              <Sparkles className="h-8 w-8" />
            </div>
          </SectionReveal>

          <SectionReveal
            className="design-panel flex flex-col items-center justify-center gap-4 rounded-[2.5rem] p-8 text-center"
            delay={0.12}
          >
            <Github className="h-10 w-10 text-accent" />
            <h3 className="font-headline text-xl font-bold text-white">
              {homeCapabilityGrid[2]?.title ?? "Plugin hosting"}
            </h3>
          </SectionReveal>

          <SectionReveal
            className="design-panel flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-primary/20 bg-primary/10 p-8 text-center"
            delay={0.16}
          >
            <ArrowRight className="h-10 w-10 text-primary" />
            <h3 className="font-headline text-xl font-bold text-primary">
              {homeCapabilityGrid[3]?.title ?? "Collaborative future"}
            </h3>
          </SectionReveal>
        </div>
      </section>

      <section className="px-4 pb-20 md:px-8 xl:px-12">
        <SectionReveal className="scroll-spotlight page-frame-narrow relative overflow-hidden rounded-[2.75rem] border border-primary/20 p-12 text-center md:p-16">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="relative z-10">
            <div className="design-badge design-badge-secondary mx-auto mb-6 w-fit">
              Open project, real workflow
            </div>
            <h2 className="font-display text-4xl font-bold text-white md:text-6xl">
              Build in the Same Session
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/66">
              {homeFinalCta.description}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild className="rounded-2xl px-10">
                <Link to={homeFinalCta.primaryCta.to}>
                  {homeFinalCta.primaryCta.label}
                </Link>
              </Button>
              <Button asChild className="rounded-2xl px-10" variant="outline">
                <Link to={homeFinalCta.secondaryCta.to}>
                  {homeFinalCta.secondaryCta.label}
                </Link>
              </Button>
            </div>
            <div className="mt-8 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-white/34">
              Windows + macOS + Linux live | optional AI tools separate
            </div>
          </div>
        </SectionReveal>
      </section>
    </main>
  );
};

export default HomePage;
