"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type TextFieldProps = ComponentProps<"input"> & { label: string };

export function TextField({ label, id, className, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="field-label">
        {label}
      </label>
      <input id={fieldId} className={cn("input", className)} {...props} />
    </div>
  );
}

type PasswordFieldProps = Omit<ComponentProps<"input">, "type"> & { label: string };

export function PasswordField({ label, id, className, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const fieldId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          className={cn("input pr-16", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="label-mono absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-ink"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}