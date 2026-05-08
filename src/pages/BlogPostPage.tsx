import { ArrowLeft, BookOpen, Clock3, FileText } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Link, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import PageSeo from "@/components/PageSeo";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/constants/site";
import { blogPosts, getBlogPostBySlug, getBlogPostJsonLd, getBlogPostUrl } from "@/data/blogs";
import { cn } from "@/lib/utils";

const markdownComponents: Components = {
  h1: ({ children }) => <h2 className="mt-12 font-headline text-4xl font-bold tracking-tight text-white">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-12 font-headline text-3xl font-bold tracking-tight text-white">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-10 font-headline text-2xl font-semibold tracking-tight text-white">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-8 font-headline text-xl font-semibold tracking-tight text-white">{children}</h4>,
  p: ({ children }) => <p className="mt-6 text-base leading-8 text-white/70 md:text-[1.05rem] md:leading-9">{children}</p>,
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
    <blockquote className="mt-8 border-l-2 border-primary/70 bg-primary/[0.06] px-5 py-4 text-white/76">{children}</blockquote>
  ),
  ul: ({ children }) => <ul className="mt-6 space-y-3 pl-6 text-base leading-8 text-white/70">{children}</ul>,
  ol: ({ children }) => <ol className="mt-6 list-decimal space-y-3 pl-6 text-base leading-8 text-white/70">{children}</ol>,
  li: ({ children }) => <li className="pl-2 marker:text-primary">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="text-white/78">{children}</em>,
  hr: () => <hr className="my-10 border-white/10" />,
  pre: ({ children }) => (
    <pre className="mt-7 overflow-x-auto rounded-[1.25rem] border border-white/10 bg-black/45 p-5 text-sm leading-7 text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {children}
    </pre>
  ),
  code: ({ children, className }) => (
    <code
      className={cn(
        className
          ? "text-sm text-white/86"
          : "rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[0.92em] text-secondary",
        className,
      )}
    >
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="mt-8 overflow-x-auto rounded-[1.25rem] border border-white/10">
      <table className="w-full min-w-[42rem] border-collapse text-left text-sm text-white/70">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-white/[0.06] text-white">{children}</thead>,
  th: ({ children }) => <th className="border-b border-white/10 px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.18em]">{children}</th>,
  td: ({ children }) => <td className="border-b border-white/10 px-4 py-3 align-top">{children}</td>,
  img: ({ alt, src }) => (
    <img alt={alt ?? ""} className="mt-8 w-full rounded-[1.5rem] border border-white/10 object-cover" decoding="async" loading="lazy" src={src ?? ""} />
  ),
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
        description={post.summary}
        image={post.image}
        imageAlt={post.imageAlt}
        jsonLd={getBlogPostJsonLd(post)}
        ogType="article"
        path={getBlogPostUrl(post)}
        title={`${post.title} | ${SITE_NAME} Blog`}
      />

      <div className="page-frame-wide pb-24">
        <section className="pb-10 pt-2">
          <div className="hero-shell overflow-hidden rounded-[2.9rem] px-6 py-8 md:px-10 md:py-10 2xl:px-12">
            <div className="relative z-10 grid gap-8 2xl:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.78fr)] 2xl:items-center">
              <div className="max-w-5xl">
                <Button asChild className="mb-8 rounded-full" variant="outline">
                  <Link to="/blogs">
                    <ArrowLeft className="h-4 w-4" />
                    All posts
                  </Link>
                </Button>
                <div className="design-badge design-badge-secondary mb-6 w-fit">
                  <BookOpen className="h-3.5 w-3.5" />
                  OpenStudio blog
                </div>
                <h1 className="font-headline text-5xl font-bold tracking-[-0.06em] text-white md:text-7xl 2xl:text-[6rem]">{post.title}</h1>
                <p className="mt-6 max-w-4xl text-lg leading-8 text-white/64 2xl:text-[1.25rem]">{post.summary}</p>
                <div className="mt-8 flex flex-wrap gap-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/42">
                  <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4">
                    <Clock3 className="h-3.5 w-3.5 text-primary" />
                    {post.readTimeMinutes} min read
                  </span>
                  <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4">
                    <FileText className="h-3.5 w-3.5 text-secondary" />
                    {post.dateLabel ?? "Engineering note"}
                  </span>
                </div>
              </div>
              {post.image ? (
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-[0_32px_100px_rgba(2,6,19,0.32)]">
                  <img
                    alt={post.imageAlt ?? ""}
                    className="aspect-[1200/630] h-full w-full object-cover"
                    decoding="async"
                    loading="eager"
                    src={post.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/[0.03]" />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-black/25 px-5 py-8 shadow-[0_32px_100px_rgba(2,6,19,0.32)] md:px-10 md:py-12">
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {post.articleContent}
          </ReactMarkdown>
        </article>

        {blogPosts.length > 1 ? (
          <section className="mx-auto mt-10 max-w-4xl rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 md:p-7">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-primary">Keep reading</div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {blogPosts
                .filter((candidate) => candidate.slug !== post.slug)
                .slice(0, 2)
                .map((candidate) => (
                  <Link
                    className="rounded-[1.25rem] border border-white/10 bg-black/25 p-5 transition hover:-translate-y-1 hover:border-primary/35 hover:bg-white/[0.055] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    key={candidate.slug}
                    to={getBlogPostUrl(candidate)}
                  >
                    <div className="font-headline text-lg font-semibold leading-snug text-white">{candidate.title}</div>
                    <div className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/36">{candidate.readTimeMinutes} min read</div>
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
      title={`Blog post not found | ${SITE_NAME}`}
    />
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center md:p-12">
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
