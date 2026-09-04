import { ArrowLeft, Book, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { SITE_NAME } from "@/constants/site";
import { getLoadedBlogPost, loadBlogPostContent } from "@/data/blogContent";
import { blogPosts, getBlogPostBySlug, getBlogPostJsonLd, type BlogPost, type BlogPostSummary } from "@/data/blogs";
import { V2_PATHS, blogPostPath } from "../content";
import { formatDate } from "../format";
import { ArrowLink, DownloadCta, Kicker } from "../primitives";
import { useSpReveal } from "../useSpReveal";
import { categoryOf } from "./V2BlogPage";

const RelatedPosts = ({ current }: { current: BlogPostSummary }) => {
  const related = blogPosts.filter((post) => post.slug !== current.slug).slice(0, 3);

  return (
    <aside className="sp-blog-aside">
      <Kicker>More from the blog</Kicker>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {related.map((post) => (
          <Link key={post.slug} className="sp-card sp-card--tight" style={{ padding: "14px 16px", display: "block" }} to={blogPostPath(post.slug)}>
            <div className="sp-mono" style={{ marginBottom: 6 }}>
              {categoryOf(post)} · {formatDate(post.date) ?? "—"}
            </div>
            <div style={{ font: "600 14px/1.35 'Space Grotesk', sans-serif", letterSpacing: "-0.01em" }}>{post.title}</div>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 26 }}>
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
    <div className="sp-container" style={{ paddingTop: 44, paddingBottom: 72 }}>
      <div data-sp-reveal="hero">
        <ArrowLink to={V2_PATHS.blog} tone="plain">
          <ArrowLeft aria-hidden="true" size={13} strokeWidth={2} /> All posts
        </ArrowLink>
        <div style={{ height: 26 }} />
        <Kicker>
          {categoryOf(post)} · <Book aria-hidden="true" size={11} style={{ verticalAlign: "-1px" }} /> {SITE_NAME} blog
        </Kicker>
        <h1 className="sp-h1" style={{ maxWidth: 900 }}>
          {post.title}
        </h1>
        <p className="sp-lede" style={{ maxWidth: 760, fontSize: 18 }}>
          {post.dek}
        </p>
        <div className="sp-doc-meta" style={{ marginBottom: 36 }}>
          <span className="sp-mono">{post.author}</span>
          {published ? <span className="sp-mono">Published {published}</span> : null}
          {modified ? <span className="sp-mono">Updated {modified}</span> : null}
          <span className="sp-mono" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Clock aria-hidden="true" size={12} strokeWidth={1.8} />
            {post.readTimeMinutes} min read
          </span>
        </div>
      </div>

      <div className="sp-article-layout">
        <div>
          {post.image ? (
            <figure style={{ margin: "0 0 32px" }} data-sp-reveal="rise">
              <div className="sp-frame">
                <img
                  alt={post.imageAlt ?? post.title}
                  src={post.image}
                  style={{ objectFit: post.imageFit ?? "cover", width: "100%", display: "block" }}
                />
              </div>
            </figure>
          ) : null}
          {loaded ? (
            <div className="sp-article" dangerouslySetInnerHTML={{ __html: loaded.articleHtml }} />
          ) : failed ? (
            <p className="sp-body">This post could not be loaded. Try again in a moment.</p>
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

const V2BlogPostPage = () => {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return <Navigate replace to={V2_PATHS.blog} />;
  }

  return (
    <>
      <PageSeo
        description={post.seoDescription ?? post.summary}
        image={post.image}
        imageAlt={post.imageAlt}
        jsonLd={getBlogPostJsonLd(post)}
        modifiedTime={post.dateModified}
        ogType="article"
        path={blogPostPath(post.slug)}
        publishedTime={post.date}
        robots="noindex"
        title={post.seoTitle ?? `${post.title} | ${SITE_NAME} Blog`}
      />
      {/* Keyed so navigating between posts remounts the article and re-runs the reveal observer. */}
      <Article key={post.slug} post={post} />
    </>
  );
};

export default V2BlogPostPage;
