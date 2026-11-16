"use client";

import { useProjectAction, type ProjectAction } from "../logic/useProjectAction";
import { TextField } from "@/ui/primitives/Field";
import { Notice } from "@/ui/primitives/Notice";
import { SubmitButton } from "@/ui/primitives/SubmitButton";

export function NewProjectForm({ action }: { action: ProjectAction }) {
  const { state, formAction, pending } = useProjectAction(action);

  return (
    <section className="cell animate-fade-up">
      <p className="label-mono mb-4 text-accent">01 / New project</p>

      {state?.error && (
        <Notice tone="error" className="mb-4">
          {state.error}
        </Notice>
      )}
      {state?.message && (
        <Notice className="mb-4">{state.message}</Notice>
      )}

      <form
        action={formAction}
        className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
      >
        <TextField
          label="Title"
          name="title"
          maxLength={200}
          placeholder="e.g. House Showcase"
          defaultValue={state?.values?.title}
          required
        />
        <TextField
          label="Subtitle (optional)"
          name="subtitle"
          maxLength={300}
          placeholder="e.g. Modern house with courtyard"
          defaultValue={state?.values?.subtitle}
        />
        <div className="md:w-44">
          <SubmitButton pending={pending}>Create project</SubmitButton>
        </div>
      </form>
    </section>
  );
}