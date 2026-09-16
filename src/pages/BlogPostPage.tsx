import { ResponsiveImage } from "@/components/ResponsiveImage";
import NotFound from "@/pages/NotFound";
import { ArrowLeft, Book, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { SITE_NAME, SITE_URL } from "@/constants/site";
import { getBreadcrumbJsonLd } from "@/lib/structuredData";
import { getLoadedBlogPost, loadBlogPostContent } from "@/data/blogContent";
import { blogPosts, getBlogPostBySlug, getBlogPostJsonLd, type BlogPost, type BlogPostSummary } from "@/data/blogs";
import { SITE_PATHS, blogPostPath } from "@/constants/routes";
import { formatDate } from "@/lib/format";
import { ArrowLink, DownloadCta, Kicker } from "@/components/ui/primitives";
import { useSpReveal } from "@/hooks/useSpReveal";
import { categoryOf } from "@/data/blogCategories";

const RelatedPosts = ({ current }: { current: BlogPostSummary }) => {
  const related = blogPosts.filter((post) => post.slug !== current.slug).slice(0, 3);

  return (
    <aside className="sp-blog-aside">
      <Kicker>More from the blog</Kicker>
      <div className="flex flex-col gap-[12px]">
        {related.map((post) => (
          <Link key={post.slug} className="sp-card sp-card--tight p-[14px_16px] block" to={blogPostPath(post.slug)}>
            <div className="sp-mono mb-[6px]">
              {categoryOf(post)} · {formatDate(post.date) ?? "—"}
            </div>
            <div className="[font:600_14px/1.35_'Space_Grotesk',_sans-serif] tracking-[-0.01em]">{post.title}</div>
          </Link>
        ))}
      </div>
      <div className="mt-[26px]">
        <Kicker>Try it</Kicker>
        <DownloadCta variant="sm" />
      </div>
    </aside>
  );
};

const Article = ({ post }: { post: BlogPostSummary }) => {
  const [loaded, setLoaded] = useState<BlogPost | undefined>(() => getLoadedBlogPost(post));
  const [failed, setFailed] = useState(false);

  useSpReveal();

  useEffect(() => {
    let active = true;
    loadBlogPostContent(post)
      .then((hydrated) => {
        if (active) {
          setLoaded(hydrated);
        }
      })
      .catch(() => {
        if (active) {
          setFailed(true);
        }
      });
    return () => {
      active = false;
    };
  }, [post]);

  const published = formatDate(post.date);
  const modified = post.dateModified && post.dateModified !== post.date ? formatDate(post.dateModified) : null;

  return (
    <div className="sp-container pt-[44px] pb-[72px]">
      <div data-sp-reveal="hero">
        <ArrowLink to={SITE_PATHS.blog} tone="plain">
          <ArrowLeft aria-hidden="true" size={13} strokeWidth={2} /> All posts
        </ArrowLink>
        <div className="h-[26px]" />
        <Kicker>
          {categoryOf(post)} · <Book aria-hidden="true" size={11} className="inline-block align-[-1px]" /> {SITE_NAME} blog
        </Kicker>
        <h1 className="sp-h1 max-w-[900px]">{post.title}</h1>
        <p className="sp-lede max-w-[760px] text-[18px]">{post.dek}</p>
        <div className="sp-doc-meta mb-[36px]">
          <span className="sp-mono">{post.author}</span>
          {published ? <span className="sp-mono">Published {published}</span> : null}
          {modified ? <span className="sp-mono">Updated {modified}</span> : null}
          <span className="sp-mono inline-flex items-center gap-[6px]">
            <Clock aria-hidden="true" size={12} strokeWidth={1.8} />
            {post.readTimeMinutes} min read
          </span>
        </div>
      </div>

      <div className="sp-article-layout">
        <div>
          {post.image ? (
            <figure className="m-[0_0_32px]" data-sp-reveal="rise">
              <div className="sp-frame">
                <ResponsiveImage
                  className="w-full block"
                  alt={post.imageAlt ?? post.title}
                  src={post.image}
                  sizes="(max-width: 640px) calc(100vw - 58px), (max-width: 1000px) calc(100vw - 86px), (max-width: 1144px) calc(100vw - 402px), 742px"
                  style={{ objectFit: post.imageFit ?? "cover" }}
                />
              </div>
            </figure>
          ) : null}
          {loaded ? (
            <div className="sp-article" dangerouslySetInnerHTML={{ __html: loaded.articleHtml }} />
          ) : failed ? (
            <section role="alert" className="sp-body">
              <p>This post could not load.</p>
              <button
                className="mt-3 rounded border border-current px-3 py-2 focus-visible:outline"
                onClick={() => window.location.reload()}
                type="button"
              >
                Reload article
              </button>
            </section>
          ) : (
            <p aria-live="polite" className="sp-mono">
              Loading…
            </p>
          )}
        </div>
        <RelatedPosts current={post} />
      </div>
    </div>
  );
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return <NotFound />;
  }

  return (
    <>
      <PageSeo
        description={post.seoDescription ?? post.summary}
        image={post.image}
        imageAlt={post.imageAlt}
        jsonLd={[
          getBlogPostJsonLd(post),
          getBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: SITE_PATHS.blog },
            { name: post.title, path: blogPostPath(post.slug) },
          ]),
        ]}
        authorProfileUrl={SITE_URL}
        modifiedTime={post.dateModified}
        ogType="article"
        path={blogPostPath(post.slug)}
        publishedTime={post.date}
        title={post.seoTitle ?? `${post.title} | ${SITE_NAME} Blog`}
      />
      {/* Keyed so navigating between posts remounts the article and re-runs the reveal observer. */}
      <Article key={post.slug} post={post} />
    </>
  );
};

export default BlogPostPage;
