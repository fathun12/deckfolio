import { z } from "zod";

const uuid = z.string().uuid("Invalid request.");
const title = z
  .string()
  .trim()
  .min(1, "Enter a title.")
  .max(200, "Title must be at most 200 characters.");

export const addSlideSchema = z.object({
  projectId: uuid,
  sectionId: uuid.nullable(),
  title,
});
export const renameSlideSchema = z.object({ projectId: uuid, id: uuid, title });
export const deleteSlideSchema = z.object({ projectId: uuid, id: uuid });
export const moveSlideSchema = z.object({
  projectId: uuid,
  id: uuid,
  sectionId: uuid.nullable(),
});
export const reorderSlidesSchema = z.object({
  projectId: uuid,
  sectionId: uuid.nullable(),
  orderedIds: z.array(uuid).max(500),
});

export const addSectionSchema = z.object({ projectId: uuid, title });
export const renameSectionSchema = z.object({ projectId: uuid, id: uuid, title });
export const deleteSectionSchema = z.object({ projectId: uuid, id: uuid });
export const reorderSectionsSchema = z.object({
  projectId: uuid,
  orderedIds: z.array(uuid).max(200),
});