import { SiteNav } from "@/components/marketing/site-nav";

export default function ChangelogPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center sm:px-10">
        <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          We&apos;re not yet publishing a public changelog. Check back soon for release notes.
        </p>
      </main>
    </>
  );
}
