import { motion } from "framer-motion";
import { ArrowRight, Code2, Github, Link as LinkIcon, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import { designMedia } from "@/data/designMedia";
import { contactSeo } from "@/data/contact";
import { contactProfile, externalLinks } from "@/data/siteLinks";

const ContactPage = () => (
  <motion.main
    animate={{ opacity: 1, y: 0 }}
    className="design-page-main overflow-hidden"
    id="main-content"
    initial={{ opacity: 0, y: 18 }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
  >
    <PageSeo {...contactSeo} />

    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-10 top-[-10%] h-[40%] w-[40%] rounded-full bg-primary/12 blur-[100px]" />
      <div className="absolute -bottom-10 right-[-5%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[120px] opacity-50" />
      <div className="absolute right-[10%] top-[30%] h-[30%] w-[30%] rounded-full bg-secondary/5 blur-[80px]" />
    </div>

    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-5xl items-center px-6 pb-20 md:px-10">
      <div className="grid w-full items-center gap-8 lg:grid-cols-12">
        <SectionReveal className="space-y-8 lg:col-span-5">
          <div>
            <h4 className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-primary">The Synthetic Atmosphere</h4>
            <h1 className="font-headline text-6xl font-bold leading-none tracking-[-0.06em] text-white lg:text-7xl">
              Let&apos;s <br />
              <span className="text-secondary">Connect</span>.
            </h1>
          </div>
          <p className="max-w-sm text-lg leading-relaxed text-white/60">{contactProfile.summary}</p>
          <div className="flex flex-col gap-6">
            <div className="group flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition group-hover:bg-primary/20">
                <Mail className="h-5 w-5 text-white/70 transition group-hover:text-primary" />
              </div>
              <div>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/35">Email</p>
                <a className="font-headline text-lg text-white transition hover:text-primary" href={`mailto:${contactProfile.email}`}>
                  {contactProfile.email}
                </a>
              </div>
            </div>
            <div className="group flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition group-hover:bg-secondary/20">
                <LinkIcon className="h-5 w-5 text-white/70 transition group-hover:text-secondary" />
              </div>
              <div>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/35">Website</p>
                <a className="font-headline text-lg text-white transition hover:text-secondary" href={contactProfile.website} rel="noreferrer" target="_blank">
                  {contactProfile.website.replace("https://", "")}
                </a>
              </div>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal className="lg:col-span-7" delay={0.08}>
          <div className="group relative">
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary to-secondary opacity-20 blur transition duration-1000 group-hover:opacity-30" />
            <div className="design-glass-panel relative overflow-hidden rounded-[2rem] p-10 shadow-2xl">
              <div className="bg-carbon-fibre absolute inset-0 opacity-[0.03]" />
              <div className="relative z-10 space-y-10">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-display text-[40px] text-white/90">OS-ID</div>
                    <div className="font-mono text-[0.62rem] tracking-[0.2em] text-primary">PUBLIC BUILD CONTACT</div>
                  </div>
                  <div className="h-16 w-16 overflow-hidden rounded-2xl border border-primary/30">
                    <img alt={designMedia.contactPortrait.alt} className="h-full w-full object-cover" src={designMedia.contactPortrait.src} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/5 bg-black/40 p-4">
                      <p className="mb-1 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-white/28">Status</p>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-secondary">Public repo live</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-4">
                      <p className="mb-1 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-white/28">Location</p>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-white">{contactProfile.location}</p>
                    </div>
                  </div>

                  <a
                    className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 p-6 transition hover:bg-primary/15"
                    href={`mailto:${contactProfile.email}`}
                  >
                    <div className="flex items-center gap-4">
                      <Mail className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-headline font-bold text-white">Send Message</p>
                        <p className="text-xs text-primary/70">Release feedback, collaboration, and product discussion</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
                  </a>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                  <div className="flex gap-4">
                    <a className="rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white" href={contactProfile.website} rel="noreferrer" target="_blank">
                      <LinkIcon className="h-5 w-5" />
                    </a>
                    {externalLinks.creatorGithub ? (
                      <a className="rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white" href={externalLinks.creatorGithub} rel="noreferrer" target="_blank">
                        <Github className="h-5 w-5" />
                      </a>
                    ) : externalLinks.repository ? (
                      <a className="rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white" href={externalLinks.repository} rel="noreferrer" target="_blank">
                        <Code2 className="h-5 w-5" />
                      </a>
                    ) : (
                      <Link className="rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white" to="/github">
                        <Code2 className="h-5 w-5" />
                      </Link>
                    )}
                  </div>
                  <div className="font-display text-[0.62rem] tracking-[0.2em] text-white/20">Copyright 2026 OpenStudio</div>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </div>
  </motion.main>
);

export default ContactPage;
