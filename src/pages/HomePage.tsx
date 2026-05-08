import { Download, Github, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import BrandLogoConstructScene from "@/components/brand/BrandLogoConstructScene";
import SectionReveal from "@/components/motion/SectionReveal";
import DawCockpitScene from "@/components/scene/DawCockpitScene";
import { Button } from "@/components/ui/button";
import { BRANDING_ASSETS } from "@/constants/site";
import { designMedia } from "@/data/designMedia";
import {
  homeHero,
  homeOriginStory,
  homePillars,
  homeProofBarItems,
  homeSeo,
  homeWorkflowSteps,
} from "@/data/home";
import { externalLinks } from "@/data/siteLinks";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useScrollScene } from "@/lib/gsap";

const pillarMedia = [
  designMedia.homeUspStems,
  designMedia.homeUspMixer,
  designMedia.homeUspCode,
];

const HOME_LOGO_ASSEMBLED_PROGRESS = 0.62;

const renderOpenSourceText = (text: string) =>
  text.split(/(OpenSource)/g).map((part, index) =>
    part === "OpenSource" ? (
      <span className="open-source-highlight" key={`${part}-${index}`}>
        {part}
      </span>
    ) : (
      part
    ),
  );

const HomeLogoAmbientField = ({ progress }: { progress: number }) => {
  const atmosphereStyle = {
    "--home-logo-atmosphere-opacity": (
      0.78 +
      Math.min(progress, 0.8) * 0.12
    ).toFixed(3),
    "--home-logo-progress": progress.toFixed(3),
  } as CSSProperties;

  return (
    <div
      className="home-logo-atmosphere"
      aria-hidden="true"
      style={atmosphereStyle}
    >
      <span className="home-logo-atmosphere__curtain home-logo-atmosphere__curtain--one" />
      <span className="home-logo-atmosphere__curtain home-logo-atmosphere__curtain--two" />
      <span className="home-logo-atmosphere__curtain home-logo-atmosphere__curtain--three" />
      <span className="home-logo-atmosphere__curtain home-logo-atmosphere__curtain--four" />
      <span className="home-logo-atmosphere__beam home-logo-atmosphere__beam--one" />
      <span className="home-logo-atmosphere__beam home-logo-atmosphere__beam--two" />
      <span className="home-logo-atmosphere__beam home-logo-atmosphere__beam--three" />
      <span className="home-logo-atmosphere__ring home-logo-atmosphere__ring--one" />
      <span className="home-logo-atmosphere__ring home-logo-atmosphere__ring--two" />
      <span className="home-logo-atmosphere__streak home-logo-atmosphere__streak--one" />
      <span className="home-logo-atmosphere__streak home-logo-atmosphere__streak--two" />
      <span className="home-logo-atmosphere__shimmer" />
    </div>
  );
};

const HomePage = () => {
  const pageRef = useRef<HTMLElement | null>(null);
  const logoSectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [logoProgress, setLogoProgress] = useState(0);

  useEffect(() => {
    const section = logoSectionRef.current;

    if (!section) {
      return;
    }

    if (prefersReducedMotion) {
      setLogoProgress(0.5);
      section.style.setProperty("--home-logo-progress", "0.500");
      return;
    }

    let frame = 0;
    let lastProgress = -1;
    const desktopQuery = window.matchMedia("(min-width: 1280px)");

    const writeProgress = (value: number) => {
      const rounded = Number(value.toFixed(3));

      section.style.setProperty("--home-logo-progress", rounded.toFixed(3));
      if (rounded !== lastProgress) {
        lastProgress = rounded;
        setLogoProgress(rounded);
      }
    };

    const update = () => {
      frame = 0;

      if (!desktopQuery.matches) {
        writeProgress(0.5);
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollRange = Number.parseFloat(
        window
          .getComputedStyle(section)
          .getPropertyValue("--home-logo-scroll-range"),
      );
      const travel = Number.isFinite(scrollRange)
        ? Math.max(1, scrollRange)
        : Math.max(1, section.offsetHeight - window.innerHeight);
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / travel));
      const progress = Math.min(scrollProgress, HOME_LOGO_ASSEMBLED_PROGRESS);
      writeProgress(progress);
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    desktopQuery.addEventListener("change", requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      desktopQuery.removeEventListener("change", requestUpdate);
    };
  }, [prefersReducedMotion]);

  useScrollScene(pageRef, ({ prefersReducedMotion, gsap }) => {
    if (prefersReducedMotion) {
      return undefined;
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

    return undefined;
  });

  return (
    <main ref={pageRef} className="relative" id="main-content">
      <PageSeo {...homeSeo} />

      <section
        className="home-logo-scroll-section relative min-h-[auto] px-4 pb-12 pt-24 md:px-8 xl:px-12 xl:pb-0"
        data-home-logo-scroll-section
        ref={logoSectionRef}
        style={
          { "--home-logo-progress": logoProgress.toFixed(3) } as CSSProperties
        }
      >
        <div className="absolute inset-0 design-mesh-bg" />
        <HomeLogoAmbientField progress={logoProgress} />
        <div className="floating-audio-orb left-[5%] top-[10%] h-72 w-72 bg-primary/24" />
        <div className="floating-audio-orb bottom-[6%] right-[6%] h-[32rem] w-[32rem] bg-secondary/18 [animation-delay:-2s]" />
        {/* <SoundField accent="lavender" density={1.15} showGrid={false} /> */}

        <div
          className="home-logo-sticky-stage page-frame-wide relative z-10"
          data-home-logo-pin-stage
        >
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
                className="home-hero-support mt-5 font-headline text-sm uppercase md:text-base"
                data-home-hero-support
              >
                {homeHero.supportLine}
              </p>
              <p
                className="mt-6 max-w-4xl font-headline text-xl leading-relaxed text-white/76 md:text-2xl 2xl:text-[1.7rem]"
                data-home-hero-body
              >
                {renderOpenSourceText(homeHero.description)}
              </p>

              <div
                className="mt-10 flex flex-col gap-4 sm:flex-row"
                data-home-hero-actions
              >
                <span className="home-action-slot" data-home-hero-action>
                  <Button
                    asChild
                    className="h-auto min-w-[min(100%,17rem)] px-10 py-4 text-base font-bold"
                  >
                    <Link to={homeHero.primaryCta.to}>
                      <span className="openstudio-button__icon">
                        <Download className="h-4 w-4" />
                      </span>
                      <span className="openstudio-button__label">
                        {homeHero.primaryCta.label}
                      </span>
                    </Link>
                  </Button>
                </span>
                {externalLinks.repository ? (
                  <span className="home-action-slot" data-home-hero-action>
                    <Button
                      asChild
                      className="h-auto min-w-[min(100%,11rem)] px-10 py-4 text-base font-semibold"
                      variant="outline"
                    >
                      <a
                        href={externalLinks.repository}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <span className="openstudio-button__icon">
                          <Github className="h-4 w-4" />
                        </span>
                        <span className="openstudio-button__label">GitHub</span>
                      </a>
                    </Button>
                  </span>
                ) : (
                  <span className="home-action-slot" data-home-hero-action>
                    <Button
                      asChild
                      className="h-auto min-w-[min(100%,11rem)] px-10 py-4 text-base font-semibold"
                      variant="outline"
                    >
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
                    className="home-proof-card"
                    data-home-proof-item
                    key={item}
                  >
                    <span>{item}</span>
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
          <div className="grid gap-6">
            <DawCockpitScene accent="lavender" />
            <div className="home-session-strip">
              <div className="flex items-center gap-4">
                <div className="home-session-strip__mark">
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
                    recording, MIDI, pitch, plugins, scripting
                  </div>
                </div>
              </div>
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary">
                {renderOpenSourceText(
                  "Windows + macOS + Linux | OpenSource / AGPLv3 | optional AI tools separate",
                )}
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
              <h2 className="home-origin-title section-display max-w-xl font-headline font-bold text-white">
                {renderOpenSourceText(
                  "OpenSource. Product-led. Built in public.",
                )}
              </h2>
              <p className="max-w-xl text-lg leading-8 text-white/66">
                {renderOpenSourceText(homeOriginStory.description)}
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
              className="home-origin-media-panel relative min-h-[34rem] overflow-hidden rounded-[2.3rem] border border-white/10 bg-black/20 p-5 md:p-6"
              data-home-origin-media
            >
              <img
                alt={designMedia.homeStoryServer.alt}
                className="absolute inset-0 h-full w-full object-cover opacity-58 grayscale contrast-125"
                data-parallax-image
                decoding="async"
                loading="lazy"
                src={designMedia.homeStoryServer.src}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/48 via-black/8 to-secondary/8" />
              <div className="home-origin-license-card">
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary">
                  License
                </div>
                <div className="mt-4 font-headline text-2xl font-bold text-white">
                  GNU AGPLv3
                </div>
                <p className="mt-3 text-sm leading-7 text-white/76">
                  {renderOpenSourceText(
                    "OpenSource by default, with source access and license terms visible before people download, modify, or contribute.",
                  )}
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
            <p className="home-workflow-note max-w-2xl text-sm leading-7">
              Move from a first take to pitch work, stems, plugins, MIDI, and
              final render without losing the shape of the song. Each card is a
              production moment, not a disconnected feature bullet.
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
        <div className="page-frame-wide">
          <SectionReveal className="home-aurora-cta" delay={0.02}>
            <div className="home-aurora-cta__content flex flex-col items-center text-center">
              <div className="design-badge design-badge-secondary w-fit">
                Ready when the session is
              </div>
              <h2 className="mt-6 font-headline text-4xl font-bold leading-tight text-white md:text-6xl">
                Download OpenStudio or inspect the project on GitHub.
              </h2>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/72 md:text-base">
                {renderOpenSourceText(
                  "Start with the native DAW, then go deeper into the OpenSource code, AGPLv3 license, releases, and roadmap whenever you want the full picture.",
                )}
              </p>
              <div className="w-full mt-8 flex flex-col gap-3 sm:flex-row items-center justify-center">
                <Button
                  asChild
                  className="h-auto px-8 py-4 text-base font-bold"
                >
                  <Link to="/download">
                    <span className="openstudio-button__icon">
                      <Download className="h-4 w-4" />
                    </span>
                    <span className="openstudio-button__label">
                      Download OpenStudio
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-auto px-8 py-4 text-base font-semibold"
                  variant="outline"
                >
                  {externalLinks.repository ? (
                    <a
                      href={externalLinks.repository}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="openstudio-button__icon">
                        <Github className="h-4 w-4" />
                      </span>
                      <span className="openstudio-button__label">GitHub</span>
                    </a>
                  ) : (
                    <Link to="/github">
                      <span className="openstudio-button__icon">
                        <Github className="h-4 w-4" />
                      </span>
                      <span className="openstudio-button__label">GitHub</span>
                    </Link>
                  )}
                </Button>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
