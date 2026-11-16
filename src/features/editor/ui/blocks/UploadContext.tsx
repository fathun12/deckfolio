"use client";

import { createContext, useContext } from "react";
import type { UploadImage } from "../../logic/useImageUpload";

const UploadContext = createContext<UploadImage | null>(null);

export const UploadProvider = UploadContext.Provider;

export function useUpload(): UploadImage | null {
  return useContext(UploadContext);
}