import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NoticeProps = {
  tone?: "info" | "error";
  className?: string;
  children: ReactNode;
};

export function Notice({ tone = "info", className, children }: NoticeProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(tone === "error" ? "notice-error" : "notice", className)}
    >
      {children}
    </p>
  );
}