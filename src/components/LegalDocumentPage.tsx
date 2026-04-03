import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import type { LegalDocument } from "@/data/legal";

interface LegalDocumentPageProps {
  document: LegalDocument;
}

const LegalDocumentPage = ({ document }: LegalDocumentPageProps) => (
  <motion.main
    animate={{ opacity: 1, y: 0 }}
    className="design-page-main"
    id="main-content"
    initial={{ opacity: 0, y: 18 }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
  >
    <PageSeo {...document.seo} />

    <div className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
      <header className="mb-16 max-w-4xl">
        <div className="design-badge design-badge-secondary mb-6">{document.eyebrow}</div>
        <h1 className="font-headline text-5xl font-bold tracking-[-0.06em] text-white md:text-7xl">{document.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/64 md:text-xl">{document.summary}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          {document.sections.map((section, index) => (
            <SectionReveal className="design-glass-panel rounded-[2rem] p-8 md:p-10" delay={index * 0.04} key={section.title}>
              <h2 className="font-headline text-2xl font-bold text-white">{section.title}</h2>
              <div className="mt-5 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p className="text-sm leading-7 text-white/68 md:text-[0.96rem]" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.bullets?.length ? (
                <div className="mt-6 grid gap-3">
                  {section.bullets.map((bullet) => (
                    <div className="flex gap-3 rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-3" key={bullet}>
                      <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm leading-7 text-white/66">{bullet}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </SectionReveal>
          ))}
        </div>

        <div className="space-y-6">
          <SectionReveal className="design-panel rounded-[2rem] p-8 lg:sticky lg:top-28">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-secondary">Current facts</div>
            <div className="mt-6 space-y-4">
              {document.facts.map((fact) => (
                <div className="rounded-[1.2rem] border border-white/8 bg-black/25 p-4" key={fact.label}>
                  <div className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/34">{fact.label}</div>
                  <p className="mt-2 text-sm leading-7 text-white/72">{fact.value}</p>
                </div>
              ))}
            </div>
          </SectionReveal>

          {document.links?.length ? (
            <SectionReveal className="design-panel rounded-[2rem] p-8" delay={0.08}>
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-secondary">Related links</div>
              <div className="mt-6 flex flex-col gap-3">
                {document.links.map((item) =>
                  item.external ? (
                    <a
                      className="flex items-center justify-between rounded-[1.2rem] border border-white/8 bg-black/25 px-4 py-3 text-sm text-white/72 transition hover:border-primary/30 hover:text-white"
                      href={item.href}
                      key={item.label}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </a>
                  ) : item.href.startsWith("/") ? (
                    <Link
                      className="flex items-center justify-between rounded-[1.2rem] border border-white/8 bg-black/25 px-4 py-3 text-sm text-white/72 transition hover:border-primary/30 hover:text-white"
                      key={item.label}
                      to={item.href}
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </Link>
                  ) : (
                    <a className="flex items-center justify-between rounded-[1.2rem] border border-white/8 bg-black/25 px-4 py-3 text-sm text-white/72 transition hover:border-primary/30 hover:text-white" href={item.href} key={item.label}>
                      <span>{item.label}</span>
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </a>
                  ),
                )}
              </div>
            </SectionReveal>
          ) : null}
        </div>
      </div>
    </div>
  </motion.main>
);

export default LegalDocumentPage;
