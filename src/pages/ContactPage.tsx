import { ArrowRight, Code2, FileText, Github, Link as LinkIcon, Mail, MapPin } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import { Button } from "@/components/ui/button";
import { contactAvailability, contactHero, contactMethods, contactSeo } from "@/data/contact";
import { contactProfile, externalLinks } from "@/data/siteLinks";

const ContactPage = () => (
  <main
    className="design-page-main overflow-hidden route-appear"
    id="main-content"
  >
    <PageSeo {...contactSeo} />

    <div className="page-frame-wide pb-20">
      <section className="pb-12">
        <div className="hero-shell overflow-hidden rounded-[2.8rem] px-6 py-8 md:px-10 md:py-10 2xl:px-12">
          <div className="grid gap-8 2xl:grid-cols-[minmax(0,0.82fr)_minmax(20rem,0.7fr)] 2xl:items-start">
            <SectionReveal className="max-w-4xl">
              <div className="design-badge design-badge-primary mb-6 w-fit">{contactHero.eyebrow}</div>
              <h1 className="font-headline text-5xl font-bold tracking-[-0.06em] text-white md:text-7xl 2xl:text-[6rem]">
                {contactHero.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/66 2xl:text-[1.35rem]">{contactHero.description}</p>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {contactMethods.map((method) => (
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-5 py-5" key={method.label}>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/38">{method.label}</p>
                    {method.href ? (
                      <a className="mt-3 block font-headline text-xl font-semibold text-white transition hover:text-primary" href={method.href} rel="noreferrer" target={method.href.startsWith("http") ? "_blank" : undefined}>
                        {method.value}
                      </a>
                    ) : (
                      <p className="mt-3 font-headline text-xl font-semibold text-white">{method.value}</p>
                    )}
                    <p className="mt-3 text-sm leading-7 text-white/60">{method.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="rounded-2xl px-8 py-4">
                  <a href={`mailto:${contactProfile.email}`}>
                    <Mail className="h-4 w-4" />
                    Email maintainer
                  </a>
                </Button>
                {externalLinks.maintainerGithub ? (
                  <Button asChild className="rounded-2xl px-8 py-4" variant="outline">
                    <a href={externalLinks.maintainerGithub} rel="noreferrer" target="_blank">
                      <Github className="h-4 w-4" />
                      Maintainer GitHub
                    </a>
                  </Button>
                ) : null}
              </div>
            </SectionReveal>

            <SectionReveal className="h-full" delay={0.08}>
              <div className="design-glass-panel h-full rounded-[2.2rem] p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-[36px] leading-none text-white/92">OS-CONTACT</div>
                    <div className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-primary">Maintainer-facing project surface</div>
                  </div>
                  <div className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary">
                    Public repo live
                  </div>
                </div>

                <div className="mt-8 grid gap-4">
                  <InfoRow icon={Mail} label="Primary contact" value={contactProfile.email} />
                  <InfoRow icon={LinkIcon} label="Website" value={contactProfile.website.replace("https://", "")} />
                  <InfoRow icon={MapPin} label="Location" value={contactProfile.location} />
                </div>

                <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary">Best for</div>
                  <div className="mt-4 grid gap-3">
                    {contactAvailability.map((item) => (
                      <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70" key={item}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {externalLinks.repository ? (
                    <a className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:border-primary/30 hover:bg-white/[0.05]" href={externalLinks.repository} rel="noreferrer" target="_blank">
                      <div className="flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/42">
                        <Code2 className="h-4 w-4 text-primary" />
                        Repository
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/66">Use the live repository for code context, issues, releases, and contribution pathways.</p>
                    </a>
                  ) : null}
                  {externalLinks.documentation ? (
                    <a className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:border-secondary/30 hover:bg-white/[0.05]" href={externalLinks.documentation} rel="noreferrer" target="_blank">
                      <div className="flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/42">
                        <FileText className="h-4 w-4 text-secondary" />
                        Documentation
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/66">The docs surface should stay close to releases and repository truth, not drift into a separate story.</p>
                    </a>
                  ) : null}
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SectionReveal className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-primary">Release feedback</div>
          <h2 className="mt-4 font-headline text-2xl font-semibold text-white">Use contact when the release surface needs correction.</h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            Installer trust, feature wording, download clarity, and public release messaging all belong here if they affect how the project is understood.
          </p>
        </SectionReveal>

        <SectionReveal className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-6" delay={0.05}>
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary">Repository questions</div>
          <h2 className="mt-4 font-headline text-2xl font-semibold text-white">Use GitHub when the issue already belongs in the repo.</h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            Code changes, docs fixes, issue discussion, and contribution flow should stay on the public repo whenever possible so the project history remains legible.
          </p>
        </SectionReveal>

        <SectionReveal className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-6" delay={0.1}>
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-accent">Site collaboration</div>
          <h2 className="mt-4 font-headline text-2xl font-semibold text-white">Use this page for website and motion collaboration.</h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            If the site design, content structure, or motion system needs work, this is the right surface for that conversation before it turns into implementation.
          </p>
        </SectionReveal>
      </section>

      <section className="pt-10">
        <SectionReveal className="scroll-spotlight rounded-[2.4rem] border border-primary/20 p-8 md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="design-badge design-badge-secondary mb-5 w-fit">Direct and project-aware</div>
              <h2 className="font-headline text-3xl font-bold text-white md:text-4xl">Keep project contact grounded in the same public story as the repo and releases.</h2>
              <p className="mt-4 text-sm leading-7 text-white/64">
                The contact page should help people reach the right surface quickly: email for maintainer-level conversation, GitHub for repo-native discussion, and docs/releases for current public context.
              </p>
            </div>
            <Button asChild className="rounded-2xl px-8 py-4">
              <a href={`mailto:${contactProfile.email}`}>
                Start the conversation
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </SectionReveal>
      </section>
    </div>
  </main>
);

interface InfoRowProps {
  icon: typeof Mail;
  label: string;
  value: string;
}

const InfoRow = ({ icon: Icon, label, value }: InfoRowProps) => (
  <div className="flex items-start gap-4 rounded-[1.3rem] border border-white/10 bg-black/20 px-4 py-4">
    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div>
      <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/38">{label}</div>
      <div className="mt-2 text-sm leading-7 text-white/74">{value}</div>
    </div>
  </div>
);

export default ContactPage;
