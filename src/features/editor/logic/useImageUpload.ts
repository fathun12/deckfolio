"use client";

import { useCallback } from "react";
import { createClient } from "@/server/supabase/client";

export type UploadImage = (file: File) => Promise<{ url: string } | { error: string }>;

const BUCKET = "project-assets";
const MAX_BYTES = 10 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function useImageUpload(ownerId: string, projectId: string): UploadImage {
  return useCallback(
    async (file: File) => {
      const extension = EXTENSIONS[file.type];
      if (!extension) return { error: "Use a JPEG, PNG, WebP, GIF or AVIF image." };
      if (file.size > MAX_BYTES) return { error: "Image must be 10 MB or smaller." };

      const supabase = createClient();
      const path = `${ownerId}/${projectId}/${crypto.randomUUID()}.${extension}`;

      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        cacheControl: "31536000",
      });
      if (error) return { error: "Upload failed. Please try again." };

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return { url: data.publicUrl };
    },
    [ownerId, projectId]
  );
}