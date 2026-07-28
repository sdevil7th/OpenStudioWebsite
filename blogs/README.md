# Blog Authoring Guide

Every published blog post is a Markdown file placed directly inside this `blogs` directory.

## Publishing Rules

- Use `.md` files only.
- Keep posts directly in this folder. Nested directories are not published.
- `README.md` is documentation only and is not published.
- The first Markdown H1 is required and becomes the public post title.
- No frontmatter is required or read.

## Recommended Filename

Use a dated kebab-case filename when possible:

```text
YYYY-MM-DD-kebab-case-title.md
```

Example:

```text
2026-05-02-ara2-hosting-challenges.md
```

The date prefix is optional. If present, it is used as the post date and stripped from the public URL slug. Without a date prefix, the post still publishes, but it appears as an undated engineering note.

## Social Share Image

Add a unique social image for every new post so WhatsApp, LinkedIn, X, and other preview unfurlers do not all show the generic OpenStudio card. The same image is also shown on the blog card and post hero.

- Minimum size: `1200x630`.
- Preferred master size: `3360x1764` for a crisp 80%-viewport post hero on 4K displays.
- Recommended format: `.webp`.
- Keep the image in `public/assets/blogs/`.
- Name the image with the public blog slug.

Example:

```text
blogs/2026-05-02-ara2-hosting-challenges.md
public/assets/blogs/ara2-hosting-challenges.webp
```

For dated posts, the slug excludes the date prefix. If no matching image exists, the post still publishes and falls back to the default OpenStudio social image without rendering a broken visible image.

Run `npm run sync-blog-images` after adding or removing blog images so the React image manifest stays in sync. The build also creates responsive 320–3360px candidates: small screens receive a small file, while wide and high-density displays can select a larger one. `npm run dev` and `npm run build` run both steps automatically.

## Recommended Structure

```md
# Post Title

*Required short dek. This italic paragraph becomes the card summary and article intro metadata.*

Opening paragraph. Start with what changed for the person using OpenStudio before explaining the implementation.

## Section Heading

Write normal Markdown with paragraphs, lists, links, blockquotes, tables, and fenced code blocks.
```

## Writing Style

- Open technical posts with user impact first. For example: what changed in a music session, what got faster, what became safer, or what workflow is now possible.
- Use a two-depth structure for semi-technical posts. The first layer should make sense to musicians and producers. The second layer can go deeper for developers who care about runtime, architecture, APIs, or tradeoffs.
- Keep the tone human and specific. It is fine to be proud of a hard engineering win, but avoid turning the post into release notes.
- Link upstream sources for technical claims, especially model docs, PRs, libraries, papers, or implementation references.
- Do not invent exact benchmark numbers. If a post uses a qualitative claim such as "almost 3x faster," explain the context and avoid fabricated before/after tables.

## Derived Fields

The website derives these fields automatically:

- title from the first `# H1`
- URL slug from the filename
- dek and summary from the required italic intro paragraph
- read time from word count
- date from an optional `YYYY-MM-DD-` filename prefix
- social share image from a matching image file, when present
