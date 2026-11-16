"use client";

import { useState } from "react";

// Konfirmasi dua langkah untuk aksi berbahaya (misalnya hapus)
export function useConfirm() {
  const [armed, setArmed] = useState(false);
  return {
    armed,
    arm: () => setArmed(true),
    cancel: () => setArmed(false),
  };
}