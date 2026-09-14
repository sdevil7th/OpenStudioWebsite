import { Fragment } from "react";
import { Frame, NoteCallout, WarnCallout, renderInline } from "../primitives";
import type { DocBlock } from "./types";

/** Renders one doc block. Headings carry their anchor id for the sidebar and hash links. */
export const DocBlockView = ({ block }: { block: DocBlock }) => {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="sp-doc-h2" id={block.id}>
          {block.text}
        </h2>
      );
    case "h3":
      return <h3 className="sp-doc-h3">{block.text}</h3>;
    case "p":
      return <p className="sp-body sp-doc-p">{renderInline(block.text)}</p>;
    case "ul":
      return (
        <ul className="sp-doc-list">
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="sp-doc-list sp-doc-list--ordered">
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="sp-card sp-card--tight sp-scroll-x sp-doc-table-wrap">
          <table className="sp-doc-table">
            <thead>
              <tr>
                {block.head.map((cell, index) => (
                  <th key={index}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "code":
      return (
        <pre className="sp-doc-code" data-lang={block.lang}>
          <code>{block.code}</code>
        </pre>
      );
    case "callout":
      return (
        <div className="sp-doc-callout">
          {block.tone === "warn" ? (
            <WarnCallout label={block.label}>{renderInline(block.text)}</WarnCallout>
          ) : (
            <NoteCallout label={block.label}>{renderInline(block.text)}</NoteCallout>
          )}
        </div>
      );
    case "shot":
      return (
        <figure className="sp-doc-shot">
          <Frame alt={block.alt} src={block.src} />
          {block.caption ? <figcaption className="sp-mono">{block.caption}</figcaption> : null}
        </figure>
      );
    case "kv":
      return (
        <div className="sp-card sp-card--tight sp-doc-kv">
          {block.rows.map(([key, value], index) => (
            <Fragment key={key}>
              <div className="sp-doc-kv__row" style={{ borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined }}>
                <span className="sp-doc-kv__key">{renderInline(key)}</span>
                <span className="sp-doc-kv__value">{renderInline(value)}</span>
              </div>
            </Fragment>
          ))}
        </div>
      );
    default:
      return null;
  }
};

export const DocBlocks = ({ blocks }: { blocks: DocBlock[] }) => (
  <>
    {blocks.map((block, index) => (
      <DocBlockView key={index} block={block} />
    ))}
  </>
);
