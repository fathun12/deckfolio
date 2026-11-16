"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { ConfirmButton } from "./ConfirmButton";

type BlockCardProps = {
  index: number;
  label: string;
  isFirst: boolean;
  isLast: boolean;
  issue: string | null;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
};

export function BlockCard({
  index,
  label,
  isFirst,
  isLast,
  issue,
  onMove,
  onRemove,
  children,
}: BlockCardProps) {
  return (
    <article className="cell flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="label-mono text-muted">
          {String(index + 1).padStart(2, "0")} / {label}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-sm disabled:opacity-40"
            aria-label="Move block up"
            disabled={isFirst}
            onClick={() => onMove(-1)}
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            className="btn-sm disabled:opacity-40"
            aria-label="Move block down"
            disabled={isLast}
            onClick={() => onMove(1)}
          >
            <ChevronDown size={14} />
          </button>
          <ConfirmButton label="Delete" confirmLabel="Confirm delete" onConfirm={onRemove} />
        </div>
      </div>

      {children}

      {issue && (
        <p className="label-mono text-accent">Incomplete, not saved yet: {issue}</p>
      )}
    </article>
  );
}