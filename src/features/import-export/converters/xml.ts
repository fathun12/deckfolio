import { XMLParser } from "fast-xml-parser";

export type XNode = { [key: string]: unknown };

const parser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
  processEntities: true,
  htmlEntities: true,
});

export function parseXml(xml: string): XNode[] {
  return parser.parse(xml) as XNode[];
}

export function tagOf(node: XNode): string {
  return Object.keys(node).find((key) => key !== ":@") ?? "";
}

export function kidsOf(node: XNode): XNode[] {
  const value = node[tagOf(node)];
  return Array.isArray(value) ? (value as XNode[]) : [];
}

export function attrsOf(node: XNode): Record<string, string> {
  return (node[":@"] as Record<string, string> | undefined) ?? {};
}

export function textOf(node: XNode): string {
  const value = node["#text"];
  return typeof value === "string" ? value : "";
}

export function findDeep(nodes: XNode[], tag: string): XNode[] {
  const found: XNode[] = [];
  for (const node of nodes) {
    if (tagOf(node) === tag) found.push(node);
    found.push(...findDeep(kidsOf(node), tag));
  }
  return found;
}