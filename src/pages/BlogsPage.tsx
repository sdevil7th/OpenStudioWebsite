import { ArrowRight, BookOpen, Clock3, FileText, Radio, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import { blogPosts, blogsSeo, getBlogIndexJsonLd, getBlogPostUrl } from "@/data/blogs";
import { designMedia } from "@/data/designMedia";

const BlogsPage = () => (
  <main
    className="design-page-main audio-scan-grid route-appear"
    id="main-content"
  >
    <PageSeo {...blogsSeo} jsonLd={getBlogIndexJsonLd()} />

    <div className="page-frame-wide pb-24">
      <section className="pb-14 pt-2">
        <div className="hero-shell overflow-hidden rounded-[2.9rem] px-6 py-8 md:px-10 md:py-10 2xl:px-12">
          <div className="grid gap-8 2xl:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.7fr)] 2xl:items-stretch">
            <div className="relative z-10 flex max-w-4xl flex-col justify-center">
              <div className="design-badge design-badge-secondary mb-8 w-fit">
                <Radio className="h-3.5 w-3.5" />
                Engineering archive
              </div>
              <h1 className="font-headline text-5xl font-bold tracking-[-0.06em] text-white md:text-7xl 2xl:text-[6rem]">
                Notes from the OpenStudio build.
              </h1>
              <p className="mt-6 max-w-4xl text-lg leading-8 text-white/64 2xl:text-[1.3rem]">
                Deep dives on audio architecture, AI runtime packaging, plugin hosting, and the tradeoffs behind a free, open source DAW.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <BlogStat icon={FileText} label="Posts" value={String(blogPosts.length)} />
                <BlogStat icon={BookOpen} label="Format" value="Markdown" />
                <BlogStat icon={Clock3} label="Source" value="./blogs" />
              </div>
            </div>

            <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-black/30">
              <img
                alt={designMedia.githubCodeLiquid.alt}
                className="h-[22rem] w-full object-cover opacity-80 md:h-full"
                decoding="async"
                loading="eager"
                src={designMedia.githubCodeLiquid.src}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 rounded-[1.4rem] border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary">Auto-discovered content</div>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  Drop a Markdown file into the blogs folder and the archive picks it up without a hand-maintained post registry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="blog-list-title" className="pb-16">
        <div className="mb-8 max-w-5xl">
          <div className="design-badge design-badge-primary mb-4 w-fit">Available posts</div>
          <h2 className="font-headline text-4xl font-bold text-white md:text-5xl" id="blog-list-title">
            Current engineering write-ups.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">
            Each post is loaded from the repository Markdown source, with title, summary, slug, and reading time derived automatically.
          </p>
        </div>

        {blogPosts.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {blogPosts.map((post, index) => (
              <SectionReveal delay={index * 0.04} key={post.slug}>
                <Link
                  className="group block min-h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/[0.055] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  data-blog-card
                  to={getBlogPostUrl(post)}
                >
                  <article className="flex min-h-[20rem] flex-col">
                    {post.image ? (
                      <div className="relative aspect-[1200/630] overflow-hidden border-b border-white/10 bg-black/30">
                        <img
                          alt={post.imageAlt ?? ""}
                          className="h-full w-full object-cover opacity-[0.88] transition duration-500 group-hover:scale-[1.025] group-hover:opacity-100"
                          decoding="async"
                          loading="lazy"
                          src={post.image}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-transparent to-black/10" />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col p-6 md:p-7">
                      <div className="mb-6 flex flex-wrap items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/42">
                        <span>{post.dateLabel ?? "Engineering note"}</span>
                        <span aria-hidden="true">|</span>
                        <span>{post.readTimeMinutes} min read</span>
                      </div>
                      <h3 className="font-headline text-3xl font-semibold leading-tight text-white transition group-hover:text-primary md:text-4xl">
                        {post.title}
                      </h3>
                      <p className="mt-5 flex-1 text-sm leading-7 text-white/64 md:text-base md:leading-8">{post.summary}</p>
                      <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/36">{post.filename}</span>
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-primary transition group-hover:border-primary/40 group-hover:bg-primary/10">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </SectionReveal>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/30">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-5 font-headline text-2xl font-semibold text-white">No blog posts found yet.</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/62">
              Add a Markdown file directly inside the blogs directory and it will appear here automatically.
            </p>
          </div>
        )}
      </section>
    </div>
  </main>
);

interface BlogStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

const BlogStat = ({ icon: Icon, label, value }: BlogStatProps) => (
  <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <div className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/35">{label}</div>
        <div className="mt-1 text-sm font-semibold text-white/82">{value}</div>
      </div>
    </div>
  </div>
);

export default BlogsPage;
