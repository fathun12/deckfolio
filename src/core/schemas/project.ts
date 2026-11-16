import { z } from "zod";

export const createProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a project title.")
    .max(200, "Title must be at most 200 characters."),
  subtitle: z.string().trim().max(300, "Subtitle must be at most 300 characters."),
});

export const visibilitySchema = z.object({
  id: z.string().uuid("Invalid project."),
  visibility: z.enum(["private", "public"]),
});

export const projectIdSchema = z.object({
  id: z.string().uuid("Invalid project."),
});