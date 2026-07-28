import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  History,
  UserRound,
} from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Link, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import PageSeo from "@/components/PageSeo";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_URL } from "@/constants/site";
import { blogPosts, getBlogPostBySlug, getBlogPostJsonLd, getBlogPostUrl } from "@/data/blogs";
import { getResponsiveImageAttributes } from "@/lib/assetLoading";
import { cn } from "@/lib/utils";

const BLOG_HERO_SIZES =
  "(min-width: 1984px) 1920px, (min-width: 768px) calc(100vw - 4rem), calc(100vw - 2rem)";
const BLOG_INLINE_IMAGE_SIZES =
  "(min-width: 824px) 760px, (min-width: 768px) calc(100vw - 4rem), calc(100vw - 2rem)";

const markdownComponents: Components = {
  h1: ({ children }) => <h2 className="mt-12 font-headline text-3xl font-bold leading-tight text-white md:text-[2.45rem]">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-12 font-headline text-3xl font-bold leading-tight text-white md:text-[2.45rem]">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-10 font-headline text-2xl font-semibold leading-tight text-white">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-8 font-headline text-xl font-semibold leading-tight text-white">{children}</h4>,
  p: ({ children }) => <p className="mt-5 text-[1.06rem] leading-[1.82] text-white/82 md:text-[1.12rem]">{children}</p>,
  a: ({ children, href }) => {
    const external = href?.startsWith("http");

    return (
      <a
        className="font-medium text-primary underline decoration-primary/35 underline-offset-4 transition hover:text-secondary hover:decoration-secondary/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        href={href}
        rel={external ? "noreferrer" : undefined}
        target={external ? "_blank" : undefined}
      >
        {children}
      </a>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="mt-8 border-l-2 border-secondary/70 pl-6 text-white/82 [&>p]:mt-0 [&>p]:text-xl [&>p]:leading-9 [&>p]:text-white/82">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => <ul className="mt-6 space-y-3 pl-6 text-[1.04rem] leading-8 text-white/80 marker:text-primary">{children}</ul>,
  ol: ({ children }) => <ol className="mt-6 list-decimal space-y-3 pl-6 text-[1.04rem] leading-8 text-white/80 marker:text-primary">{children}</ol>,
  li: ({ children }) => <li className="pl-2">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="text-white/82">{children}</em>,
  hr: () => <hr className="my-12 border-white/10" />,
  pre: ({ children }) => (
    <pre className="mt-8 overflow-x-auto rounded-lg border border-white/10 bg-black/55 p-5 text-sm leading-7 text-white/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {children}
    </pre>
  ),
  code: ({ children, className }) => (
    <code
      className={cn(
        className
          ? "text-sm text-white/88"
          : "rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[0.9em] text-secondary",
        className,
      )}
    >
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="mt-9 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[42rem] border-collapse text-left text-sm text-white/80">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-white/[0.06] text-white">{children}</thead>,
  th: ({ children }) => <th className="border-b border-white/10 px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.18em]">{children}</th>,
  td: ({ children }) => <td className="border-b border-white/10 px-4 py-3 align-top">{children}</td>,
  img: ({ alt, src }) => {
    const imageSrc = src ?? "";

    return (
      <img
        {...getResponsiveImageAttributes(imageSrc, "below-fold", {
          maxWidth: 1920,
          sizes: BLOG_INLINE_IMAGE_SIZES,
        })}
        alt={alt ?? ""}
        className="mt-9 block h-auto w-full rounded-lg border border-white/10 object-contain"
      />
    );
  },
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return <BlogPostNotFound slug={slug} />;
  }

  return (
    <main
      className="design-page-main audio-scan-grid route-appear"
      id="main-content"
    >
      <PageSeo
        authorProfileUrl={SITE_URL}
        description={post.seoDescription ?? post.dek}
        image={post.image}
        imageAlt={post.imageAlt}
        jsonLd={getBlogPostJsonLd(post)}
        modifiedTime={post.dateModified}
        ogType="article"
        path={getBlogPostUrl(post)}
        publishedTime={post.date}
        title={post.seoTitle ?? `${post.title} | ${SITE_NAME} Blog`}
      />

      <div className="px-4 pb-24 md:px-8">
        <article className="mx-auto max-w-[1920px] pt-3 md:pt-6">
          <div className="w-full" data-blog-masthead>
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 text-sm font-medium text-white/70 transition hover:border-primary/35 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              to="/blogs"
            >
              <ArrowLeft className="h-4 w-4" />
              All posts
            </Link>

            <header className="pt-8 md:pt-10">
              <div className="design-badge design-badge-secondary mb-6 w-fit">
                <BookOpen className="h-3.5 w-3.5" />
                OpenStudio blog
              </div>
              <h1 className="max-w-[1200px] font-headline text-4xl font-bold leading-[1.08] text-white md:text-[3.45rem] md:leading-[1.04]">
                {post.title}
              </h1>
              <p className="mt-5 max-w-[960px] text-lg leading-8 text-white/70 md:text-xl md:leading-9">{post.dek}</p>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/48">
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-3.5 w-3.5 text-primary" />
                  By {post.author}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-secondary" />
                  {post.dateLabel ?? "Engineering note"}
                </span>
                {post.dateModified &&
                post.dateModified !== post.date &&
                post.dateModifiedLabel ? (
                  <span className="inline-flex items-center gap-2">
                    <History className="h-3.5 w-3.5 text-secondary" />
                    Updated {post.dateModifiedLabel}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
                  {post.readTimeMinutes} min read
                </span>
              </div>
            </header>
          </div>

          {post.image ? (
            <figure
              className="mt-9 aspect-[1200/630] w-full overflow-hidden rounded-lg border border-white/10 bg-black/30 md:mt-10"
              data-blog-hero
            >
              <img
                {...getResponsiveImageAttributes(post.image, "hero/eager", {
                  maxWidth: 3360,
                  sizes: BLOG_HERO_SIZES,
                })}
                alt={post.imageAlt ?? ""}
                className={cn(
                  "h-full w-full bg-black",
                  post.imageFit === "contain" ? "object-contain" : "object-cover",
                )}
              />
            </figure>
          ) : null}

          <div className="mx-auto mt-10 max-w-[760px] md:mt-12" data-blog-body>
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
              {post.articleContent}
            </ReactMarkdown>
          </div>
        </article>

        {blogPosts.length > 1 ? (
          <section className="mx-auto mt-16 max-w-[760px] border-t border-white/10 pt-8">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-primary">Keep reading</div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {blogPosts
                .filter((candidate) => candidate.slug !== post.slug)
                .slice(0, 2)
                .map((candidate) => (
                  <Link
                    className="group rounded-lg border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-primary/35 hover:bg-white/[0.052] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    key={candidate.slug}
                    to={getBlogPostUrl(candidate)}
                  >
                    <div className="font-headline text-lg font-semibold leading-snug text-white transition group-hover:text-primary">{candidate.title}</div>
                    <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary">
                      Read
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
};

const BlogPostNotFound = ({ slug }: { slug?: string }) => (
  <main
    className="flex min-h-screen items-center px-4 pb-16 pt-28 md:px-6 md:pt-32 route-appear"
    id="main-content"
  >
    <PageSeo
      description="That OpenStudio blog post could not be found. Return to the blog archive to browse the available engineering notes."
      path={slug ? `/blogs/${slug}` : "/blogs"}
      robots="noindex, nofollow"
      title={`Blog post not found | ${SITE_NAME}`}
    />
    <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/[0.03] p-8 text-center md:p-12">
      <p className="signal-label mb-4">Blog route not found</p>
      <h1 className="font-headline text-4xl font-semibold text-white md:text-5xl">That post is not in the current archive.</h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
        The blog index is generated from Markdown files in the blogs directory. This slug does not match a published post.
      </p>
      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline">
          <Link to="/blogs">
            <ArrowLeft className="h-4 w-4" />
            Return to blogs
          </Link>
        </Button>
      </div>
    </div>
  </main>
);

export default BlogPostPage;
