"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MAX_BYTES = 20 * 1024 * 1024;

type Response = { ok: true; id: string } | { ok: false; error: string };

export function useImportProject() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(file: File) {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("File must be 20 MB or smaller.");
      return;
    }

    setPending(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: form });
      const data = (await res.json()) as Response;
      if (data.ok) {
        router.push(`/dashboard/projects/${data.id}/edit`);
        return;
      }
      setError(data.error);
    } catch {
      setError("Import failed. Please try again.");
    }
    setPending(false);
  }

  return { pending, error, submit };
}