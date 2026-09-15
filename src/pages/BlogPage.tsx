import { categoryOf } from "@/data/blogCategories";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { Book } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { blogPosts, getBlogIndexJsonLd } from "@/data/blogs";
import { SITE_PATHS, blogPostPath } from "@/constants/routes";
import { formatDate } from "@/lib/format";
import { ArrowLink, Eyebrow } from "@/components/ui/primitives";
import { useSpReveal } from "@/hooks/useSpReveal";

const BlogPage = () => {
  const [featured, ...rest] = blogPosts;

  useSpReveal();

  return (
    <>
      <PageSeo
        description="Read OpenStudio engineering notes on DAW development, audio plugin hosting, AI music workflows, runtime packaging, and open source product decisions."
        path={SITE_PATHS.blog}
        jsonLd={getBlogIndexJsonLd()}
        title="OpenStudio Blog | Engineering Notes from an Open Source DAW"
      />

      <div className="sp-container pt-[64px]" data-sp-reveal="hero">
        <Eyebrow icon={Book}>Development notes from the maintainer</Eyebrow>
        <h1 className="sp-h1">Blog.</h1>
        <p className="sp-lede max-w-[600px]">
          What broke, what got faster, and why a decision went the way it did. These are development notes, written as
          the work happened.
        </p>
      </div>

      {/* Featured post */}
      {featured ? (
        <div className="sp-container pt-[34px]">
          <div className="sp-card sp-card--interactive sp-featured-post overflow-hidden" data-sp-reveal="panel">
            {featured.image ? (
              <ResponsiveImage
                className="block w-full h-full object-cover"
                alt={featured.imageAlt ?? featured.title}
                src={featured.image}
              />
            ) : null}
            <div className="p-[32px_34px] flex flex-col justify-center">
              <div className="flex items-center gap-[10px] mb-[14px]">
                <span className="[font:500_9.5px/1_'JetBrains_Mono',_monospace] tracking-[0.14em] uppercase text-[#fff] [background:var(--sp-cta)] p-[6px_9px] rounded-[4px]">
                  Latest
                </span>
                <div className="sp-mono">
                  {categoryOf(featured)} · {formatDate(featured.date) ?? "—"} · {featured.readTimeMinutes} min read
                </div>
              </div>
              <h2 className="sp-h2 text-[30px] leading-[1.15] mb-[12px]">{featured.title}</h2>
              <p className="sp-body mb-[20px]">{featured.summary}</p>
              <span>
                <ArrowLink to={blogPostPath(featured.slug)}>Read the post</ArrowLink>
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Remaining posts */}
      <div className="sp-container pt-[34px] pb-[62px]">
        <div className="sp-grid-3" data-sp-reveal="stagger">
          {rest.map((post) => (
            <div key={post.slug} className="sp-card sp-card--interactive overflow-hidden flex flex-col">
              {post.image ? (
                <ResponsiveImage
                  className="block w-full h-[150px] object-cover"
                  alt={post.imageAlt ?? post.title}
                  loading="lazy"
                  src={post.image}
                />
              ) : null}
              <div className="p-[20px_22px_22px] flex flex-col gap-[9px] flex-1">
                <div className="flex items-center gap-[8px] flex-wrap">
                  <div className="sp-mono">{categoryOf(post)}</div>
                  <span className="text-[var(--sp-hairline)]">·</span>
                  <div className="sp-mono">{formatDate(post.date) ?? "—"}</div>
                  <span className="text-[var(--sp-hairline)]">·</span>
                  <div className="sp-mono">{post.readTimeMinutes} min</div>
                </div>
                <div className="[font:700_17px/1.28_'Space_Grotesk',_sans-serif] tracking-[-0.02em]">{post.title}</div>
                <p className="sp-body text-[13px] leading-[1.6] flex-1">{post.summary}</p>
                <span>
                  <ArrowLink to={blogPostPath(post.slug)}>Read</ArrowLink>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BlogPage;
