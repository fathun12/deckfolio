"use client";

import { useState } from "react";

type ConfirmButtonProps = {
  label: string;
  confirmLabel: string;
  hint?: string;
  onConfirm: () => void;
};

export function ConfirmButton({ label, confirmLabel, hint, onConfirm }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button type="button" className="btn-sm" onClick={() => setArmed(true)}>
        {label}
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="btn-sm-danger"
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </button>
      <button type="button" className="btn-sm" onClick={() => setArmed(false)}>
        Cancel
      </button>
      {hint && <span className="label-mono w-full text-accent">{hint}</span>}
    </span>
  );
}