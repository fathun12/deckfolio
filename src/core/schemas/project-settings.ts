import { z } from "zod";
import { isSafeImageUrl } from "./url";

export const projectSettingsSchema = z.object({
  title: z.string().trim().min(1, "Enter a project title.").max(200, "Title is too long."),
  subtitle: z.string().trim().max(300, "Subtitle must be at most 300 characters."),
  slug: z
    .string()
    .trim()
    .min(3, "Address must be at least 3 characters.")
    .max(70, "Address must be at most 70 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Address can only use lowercase letters, numbers and single hyphens."
    ),
  coverUrl: z
    .string()
    .trim()
    .max(8192)
    .refine((v) => v === "" || isSafeImageUrl(v), "Invalid cover image address."),
  stats: z
    .array(z.string().trim().min(1).max(40, "Each stat must be at most 40 characters."))
    .max(6, "Use at most 6 stats."),
});

export const saveSettingsSchema = projectSettingsSchema.extend({
  projectId: z.string().uuid("Invalid request."),
});

export const setVisibilityInputSchema = z.object({
  projectId: z.string().uuid("Invalid request."),
  visibility: z.enum(["private", "public"]),
});