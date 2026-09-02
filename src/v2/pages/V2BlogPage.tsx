import { Book } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { blogPosts, getBlogPostUrl, type BlogPostSummary } from "@/data/blogs";
import { V2_PATHS } from "../content";
import { ArrowLink, Eyebrow } from "../primitives";

const CATEGORY_BY_SLUG: Record<string, string> = {
  "build-guitar-tones-with-openstudio-nam-rack": "NAM Rack",
  "building-openstudio-nam-rack": "Engineering",
  "ace-step-diffusers-almost-3x-faster": "AI",
  "building-the-midi-editor-harness": "Engineering",
  "ace-step-integration-challenges": "AI",
  "ara2-hosting-challenges-blog": "Plugins",
};

const shortDate = (post: BlogPostSummary) => {
  if (!post.date) return "—";
  const parsed = new Date(`${post.date}T00:00:00Z`);
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
};

const category = (post: BlogPostSummary) => CATEGORY_BY_SLUG[post.slug] ?? "Engineering";

const V2BlogPage = () => {
  const [featured, ...rest] = blogPosts;

  return (
    <>
      <PageSeo
        description="Read OpenStudio engineering notes on DAW development, audio plugin hosting, AI music workflows, runtime packaging, and open source product decisions."
        path={V2_PATHS.blog}
        robots="noindex"
        title="OpenStudio Blog | Engineering Notes from an Open Source DAW"
      />

      <div className="sp-container" style={{ paddingTop: 64 }}>
        <Eyebrow icon={Book}>Development notes from the maintainer</Eyebrow>
        <h1 className="sp-h1">Blog.</h1>
        <p className="sp-lede" style={{ maxWidth: 600 }}>
          What broke, what got faster, and why a decision went the way it did. Dev-log content, not marketing.
        </p>
      </div>

      {/* Featured post */}
      {featured ? (
        <div className="sp-container" style={{ paddingTop: 34 }}>
          <div className="sp-card sp-card--interactive sp-featured-post" style={{ overflow: "hidden" }}>
            {featured.image ? (
              <img
                alt={featured.imageAlt ?? featured.title}
                src={featured.image}
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
            <div style={{ padding: "32px 34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span
                  style={{
                    font: "500 9.5px/1 'JetBrains Mono', monospace",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#fff",
                    background: "var(--sp-cta)",
                    padding: "6px 9px",
                    borderRadius: 4,
                  }}
                >
                  Latest
                </span>
                <div className="sp-mono">
                  {category(featured)} · {shortDate(featured)}
                </div>
              </div>
              <h2 className="sp-h2" style={{ fontSize: 30, lineHeight: 1.15, marginBottom: 12 }}>
                {featured.title}
              </h2>
              <p className="sp-body" style={{ marginBottom: 20 }}>
                {featured.summary}
              </p>
              <span>
                <ArrowLink to={getBlogPostUrl(featured)}>Read the post</ArrowLink>
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Remaining posts */}
      <div className="sp-container" style={{ padding: "34px 34px 62px" }}>
        <div className="sp-grid-3">
          {rest.map((post) => (
            <div key={post.slug} className="sp-card sp-card--interactive" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {post.image ? (
                <img
                  alt={post.imageAlt ?? post.title}
                  loading="lazy"
                  src={post.image}
                  style={{ display: "block", width: "100%", height: 150, objectFit: "cover" }}
                />
              ) : null}
              <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="sp-mono">{category(post)}</div>
                  <span style={{ color: "var(--sp-hairline)" }}>·</span>
                  <div className="sp-mono">{shortDate(post)}</div>
                </div>
                <div style={{ font: "700 17px/1.28 'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
                  {post.title}
                </div>
                <p className="sp-body" style={{ fontSize: 13, lineHeight: 1.6, flex: 1 }}>
                  {post.summary}
                </p>
                <span>
                  <ArrowLink to={getBlogPostUrl(post)}>Read</ArrowLink>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default V2BlogPage;
