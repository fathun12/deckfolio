export type Run = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  href?: string;
};

export type Para = { kind: "p" | "bullet" | "ordered"; runs: Run[] };

export type ImportImage = { data: Uint8Array; mime: string };

export type ImportBlock =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "text"; paras: Para[] }
  | { kind: "image"; imageIndex: number; alt: string };

export type ImportSlide = { title: string; blocks: ImportBlock[] };

// title null = slide tanpa section
export type ImportSection = { title: string | null; slides: ImportSlide[] };

export type ImportedDeck = {
  title: string;
  subtitle: string;
  sections: ImportSection[];
  images: ImportImage[];
};

export type ImportResult = { ok: true; id: string } | { ok: false; error: string };