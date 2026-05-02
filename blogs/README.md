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

- Recommended size: `1200x630`.
- Recommended format: `.webp`.
- Keep the image in `public/assets/blogs/`.
- Name the image with the public blog slug.

Example:

```text
blogs/2026-05-02-ara2-hosting-challenges.md
public/assets/blogs/ara2-hosting-challenges.webp
```

For dated posts, the slug excludes the date prefix. If no matching image exists, the post still publishes and falls back to the default OpenStudio social image without rendering a broken visible image.

Run `npm run sync-blog-images` after adding or removing blog images so the React image manifest stays in sync. `npm run dev` and `npm run build` also run this automatically.

## Recommended Structure

```md
# Post Title

*Optional short intro. If present, this italic paragraph becomes the card summary.*

Opening paragraph if there is no italic intro.

## Section Heading

Write normal Markdown with paragraphs, lists, links, blockquotes, tables, and fenced code blocks.
```

## Derived Fields

The website derives these fields automatically:

- title from the first `# H1`
- URL slug from the filename
- summary from the first italic intro paragraph or first body paragraph
- read time from word count
- date from an optional `YYYY-MM-DD-` filename prefix
- social share image from a matching image file, when present
