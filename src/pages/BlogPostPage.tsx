import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  History,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_URL } from "@/constants/site";
import {
  getLoadedBlogPost,
  loadBlogPostContent,
  preloadBlogPostContent,
} from "@/data/blogContent";
import { blogPosts, getBlogPostBySlug, getBlogPostJsonLd, getBlogPostUrl } from "@/data/blogs";
import { getResponsiveImageAttributes } from "@/lib/assetLoading";
import "@/lib/generatedImageRoutes/blogs";
import { cn } from "@/lib/utils";

const BLOG_HERO_SIZES =
  "(min-width: 1984px) 1920px, (min-width: 768px) calc(100vw - 4rem), calc(100vw - 2rem)";
const BLOG_ARTICLE_BODY_CLASS = "mx-auto mt-10 max-w-[760px] md:mt-12";

if (typeof window !== "undefined") {
  const initialSlug = window.location.pathname.match(/^\/blogs\/([^/]+)\/?$/)?.[1];
  const initialPost = getBlogPostBySlug(initialSlug);
  if (initialPost) {
    preloadBlogPostContent(initialPost);
  }
}

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);
  const [loadedPost, setLoadedPost] = useState(() =>
    post ? getLoadedBlogPost(post) : undefined,
  );
  const [articleLoadError, setArticleLoadError] = useState(false);
  const [articleLoadAttempt, setArticleLoadAttempt] = useState(0);

  useEffect(() => {
    setArticleLoadError(false);

    if (!post) {
      setLoadedPost(undefined);
      return undefined;
    }

    const cachedPost = getLoadedBlogPost(post);
    if (cachedPost) {
      setLoadedPost(cachedPost);
      return undefined;
    }

    setLoadedPost(undefined);
    let active = true;
    void loadBlogPostContent(post)
      .then((hydratedPost) => {
        if (active) {
          setLoadedPost(hydratedPost);
        }
      })
      .catch(() => {
        if (active) {
          setArticleLoadError(true);
        }
      });

    return () => {
      active = false;
    };
  }, [articleLoadAttempt, post]);

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

          {loadedPost?.slug === post.slug ? (
            <div
              className={BLOG_ARTICLE_BODY_CLASS}
              dangerouslySetInnerHTML={{ __html: loadedPost.articleHtml }}
              data-blog-body
            />
          ) : (
            <div className={BLOG_ARTICLE_BODY_CLASS} data-blog-body>
              {articleLoadError ? (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-6 text-center"
                  role="alert"
                >
                  <p className="text-base leading-7 text-white/72">
                    The article text could not be loaded. Check your connection and try again.
                  </p>
                  <Button
                    className="mt-5 rounded-full"
                    onClick={() => setArticleLoadAttempt((attempt) => attempt + 1)}
                    variant="outline"
                  >
                    Retry article
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-white/48" role="status">
                  Loading article…
                </p>
              )}
            </div>
          )}
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
                    onFocus={() => preloadBlogPostContent(candidate)}
                    onPointerDown={() => preloadBlogPostContent(candidate)}
                    onPointerEnter={() => preloadBlogPostContent(candidate)}
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
