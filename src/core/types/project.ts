export type ProjectVisibility = "private" | "public";

export type Project = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  stats: string[];
  visibility: ProjectVisibility;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectActionState = {
  error?: string;
  message?: string;
  values?: { title: string; subtitle: string };
} | null;