import type { ReactNode } from "react";

type SubmitButtonProps = {
  pending: boolean;
  children: ReactNode;
};

export function SubmitButton({ pending, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-solid w-full disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Please wait..." : children}
    </button>
  );
}