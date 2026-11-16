"use client";

import { useRef, useState } from "react";
import { useUpload } from "./UploadContext";

type UploadButtonProps = {
  onUploaded: (url: string) => void;
  label?: string;
};

export function UploadButton({ onUploaded, label = "Upload image" }: UploadButtonProps) {
  const upload = useUpload();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!upload) return null;

  async function pick(file: File | undefined) {
    if (!file || !upload) return;
    setBusy(true);
    setError(null);
    const result = await upload(file);
    setBusy(false);
    if ("error" in result) setError(result.error);
    else onUploaded(result.url);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => void pick(e.target.files?.[0])}
      />
      <button
        type="button"
        className="btn-sm disabled:opacity-60"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        {busy ? "Uploading..." : label}
      </button>
      {error && <span className="label-mono text-accent">{error}</span>}
    </div>
  );
}