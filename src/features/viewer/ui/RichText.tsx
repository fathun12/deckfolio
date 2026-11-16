import { Fragment, type ReactNode } from "react";
import { isSafeHref } from "@/core/schemas/url";

type Mark = { type?: string; attrs?: Record<string, unknown> };
type TNode = {
  type?: string;
  text?: string;
  content?: unknown[];
  attrs?: Record<string, unknown>;
  marks?: Mark[];
};

type Links = Record<string, string>;

function isNode(value: unknown): value is TNode {
  return typeof value === "object" && value !== null;
}

function applyMarks(text: string, marks: Mark[] | undefined, links: Links): ReactNode {
  let out: ReactNode = text;

  for (const mark of marks ?? []) {
    switch (mark.type) {
      case "bold":
        out = <strong>{out}</strong>;
        break;
      case "italic":
        out = <em>{out}</em>;
        break;
      case "code":
        out = <code className="bg-line-soft px-1 font-mono text-[0.9em]">{out}</code>;
        break;
      case "link": {
        const slideId = mark.attrs?.slideId;
        const href = mark.attrs?.href;
        const target =
          typeof slideId === "string"
            ? links[slideId]
            : typeof href === "string" && isSafeHref(href)
              ? href
              : undefined;
        if (target) {
          const external = target.startsWith("http");
          out = (
            <a
              href={target}
              className="link-underline"
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {out}
            </a>
          );
        }
        break;
      }
    }
  }

  return out;
}

function renderChildren(node: TNode, links: Links): ReactNode[] {
  return (node.content ?? []).filter(isNode).map((child, i) => renderNode(child, i, links));
}

function renderNode(node: TNode, key: number, links: Links): ReactNode {
  switch (node.type) {
    case "doc":
      return <Fragment key={key}>{renderChildren(node, links)}</Fragment>;
    case "paragraph":
      return (
        <p key={key} className="leading-relaxed">
          {renderChildren(node, links)}
        </p>
      );
    case "heading": {
      const level = node.attrs?.level;
      const Tag = level === 1 ? "h3" : level === 2 ? "h4" : "h5";
      const size = level === 1 ? "text-3xl" : level === 2 ? "text-2xl" : "text-lg";
      return (
        <Tag key={key} className={`${size} font-semibold`}>
          {renderChildren(node, links)}
        </Tag>
      );
    }
    case "bulletList":
      return (
        <ul key={key} className="list-disc space-y-1 pl-5">
          {renderChildren(node, links)}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="list-decimal space-y-1 pl-5">
          {renderChildren(node, links)}
        </ol>
      );
    case "listItem":
      return <li key={key}>{renderChildren(node, links)}</li>;
    case "hardBreak":
      return <br key={key} />;
    case "text":
      return (
        <Fragment key={key}>
          {applyMarks(typeof node.text === "string" ? node.text : "", node.marks, links)}
        </Fragment>
      );
    default:
      return null;
  }
}

export function RichText({ content, slideLinks }: { content: unknown; slideLinks: Links }) {
  if (!isNode(content)) return null;
  return <div className="max-w-prose space-y-4">{renderNode(content, 0, slideLinks)}</div>;
}