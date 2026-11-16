"use client";

export function PrintButton() {
  return (
    <button type="button" className="btn-outline" onClick={() => window.print()}>
      Save as PDF
    </button>
  );
}