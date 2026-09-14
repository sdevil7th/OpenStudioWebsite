/**
 * Content model for the Studio Paper docs. Each doc is an ordered list of
 * blocks; prose strings accept a tiny inline vocabulary handled by
 * `renderInline` in primitives.tsx:
 *
 *   **bold**   `code`   [label](url)
 *
 * Internal links use v2 paths (`/v2/docs/audio-setup`), external ones full URLs.
 */
export type DocBlock =
  /** Section heading. `id` becomes the anchor and the "On this page" entry. */
  | { type: "h2"; id: string; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "code"; lang?: string; code: string }
  | { type: "callout"; tone: "warn" | "note" | "good"; label: string; text: string }
  | { type: "shot"; src: string; alt: string; caption?: string }
  /** Two-column definition rows, e.g. per-OS values. */
  | { type: "kv"; rows: [string, string][] };

export type DocGroupId = "start" | "working" | "optional" | "reference";

export interface DocMeta {
  slug: string;
  title: string;
  /** One line under the title, also used on the docs landing page. */
  summary: string;
  group: DocGroupId;
  /** Upstream file this page was written from — surfaces as "Edit on GitHub". */
  sourceUrl: string;
}

export interface DocContent {
  /** ISO date of the last content pass. */
  updated: string;
  blocks: DocBlock[];
}
