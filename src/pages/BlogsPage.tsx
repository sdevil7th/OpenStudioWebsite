import { ArrowRight, BookOpen, CalendarDays, Clock3, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import { blogPosts, blogsSeo, getBlogIndexJsonLd, getBlogPostUrl } from "@/data/blogs";

const [featuredPost, ...archivePosts] = blogPosts;

const BlogsPage = () => (
  <main
    className="design-page-main audio-scan-grid route-appear"
    id="main-content"
  >
    <PageSeo {...blogsSeo} jsonLd={getBlogIndexJsonLd()} />

    <div className="page-frame-wide pb-24">
      <section className="mx-auto max-w-5xl pb-12 pt-4 text-center md:pb-14 md:pt-8">
        <div className="design-badge design-badge-secondary mx-auto mb-6 w-fit">
          <BookOpen className="h-3.5 w-3.5" />
          OpenStudio blog
        </div>
        <h1 className="font-headline text-4xl font-bold leading-tight text-white md:text-6xl">
          Engineering notes from the OpenStudio build.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/64 md:text-lg md:leading-9">
          Human write-ups on audio architecture, AI generation workflows, plugin hosting, and the decisions behind an open source DAW.
        </p>
      </section>

      {featuredPost ? (
        <section aria-labelledby="featured-blog-title" className="pb-14">
          <SectionReveal>
            <Link
              className="group block overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] transition duration-300 hover:border-primary/35 hover:bg-white/[0.055] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              data-blog-card
              to={getBlogPostUrl(featuredPost)}
            >
              <article className="grid gap-0 lg:grid-cols-[minmax(0,1.04fr)_minmax(22rem,0.96fr)]">
                {featuredPost.image ? (
                  <div className="relative aspect-[1200/630] overflow-hidden bg-black/35 lg:aspect-auto lg:min-h-[26rem]">
                    <img
                      alt={featuredPost.imageAlt ?? ""}
                      className="h-full w-full object-cover opacity-[0.9] transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
                      decoding="async"
                      loading="eager"
                      src={featuredPost.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/52 via-transparent to-black/10" />
                  </div>
                ) : null}

                <div className="flex min-h-full flex-col justify-center p-6 md:p-8 lg:p-10">
                  <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/42">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-secondary" />
                      {featuredPost.dateLabel ?? "Engineering note"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5 text-primary" />
                      {featuredPost.readTimeMinutes} min read
                    </span>
                  </div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-primary">Latest post</p>
                  <h2 className="mt-4 font-headline text-3xl font-semibold leading-tight text-white transition group-hover:text-primary md:text-5xl" id="featured-blog-title">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-5 text-base leading-8 text-white/66 md:text-lg md:leading-9">{featuredPost.dek}</p>
                  <div className="mt-8 inline-flex items-center gap-3 text-sm font-semibold text-primary">
                    Read the post
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            </Link>
          </SectionReveal>
        </section>
      ) : null}

      <section aria-labelledby="blog-list-title" className="pb-16">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-secondary">Archive</p>
            <h2 className="mt-3 font-headline text-3xl font-semibold text-white md:text-4xl" id="blog-list-title">
              More from the build log.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/52">
            Posts are published from Markdown and sorted by date, with summaries and reading time derived automatically.
          </p>
        </div>

        {archivePosts.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {archivePosts.map((post, index) => (
              <SectionReveal delay={index * 0.04} key={post.slug}>
                <Link
                  className="group block min-h-full rounded-lg border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/[0.052] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  data-blog-card
                  to={getBlogPostUrl(post)}
                >
                  <article className="flex min-h-full flex-col overflow-hidden rounded-lg">
                    {post.image ? (
                      <div className="relative aspect-[1200/630] overflow-hidden bg-black/35">
                        <img
                          alt={post.imageAlt ?? ""}
                          className="h-full w-full object-cover opacity-[0.88] transition duration-500 group-hover:scale-[1.025] group-hover:opacity-100"
                          decoding="async"
                          loading="lazy"
                          src={post.image}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/46 via-transparent to-black/10" />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col p-5 md:p-6">
                      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/40">
                        <span>{post.dateLabel ?? "Engineering note"}</span>
                        <span aria-hidden="true">/</span>
                        <span>{post.readTimeMinutes} min</span>
                      </div>
                      <h3 className="font-headline text-2xl font-semibold leading-snug text-white transition group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mt-4 flex-1 text-sm leading-7 text-white/62">{post.dek}</p>
                      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                        Read
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </article>
                </Link>
              </SectionReveal>
            ))}
          </div>
        ) : featuredPost ? null : (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/30">
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

export default BlogsPage;
