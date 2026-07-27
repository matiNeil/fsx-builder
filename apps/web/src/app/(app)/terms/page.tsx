import { SiteNav } from "@/components/marketing/site-nav";

export default function TermsPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-24 sm:px-10">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          Placeholder page — replace this with your real terms of service before launch.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          This page is a placeholder. FSX Builder does not yet have published terms of service.
        </p>
      </main>
    </>
  );
}
