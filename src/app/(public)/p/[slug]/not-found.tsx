import Link from "next/link";
import { Brand } from "@/ui/layout/Brand";
import { SiteFooter } from "@/ui/layout/SiteFooter";

export default function ProjectNotFound() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4">
      <header className="flex h-16 items-center">
        <Brand />
      </header>

      <main className="flex-1 py-8">
        <section className="cell py-16 text-center">
          <p className="label-mono mb-3 text-muted">404</p>
          <h1 className="text-4xl font-bold">Project not found.</h1>
          <p className="mt-2 text-sm text-muted">
            It may be private, or the address may have changed.
          </p>
          <Link href="/" className="btn-solid mt-6">
            Back to projects
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}