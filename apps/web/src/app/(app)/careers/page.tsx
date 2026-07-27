import { SiteNav } from "@/components/marketing/site-nav";

export default function CareersPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center sm:px-10">
        <h1 className="text-3xl font-semibold tracking-tight">Careers</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          We don&apos;t have open roles listed yet. Check back soon, or reach out through{" "}
          <a
            href="https://support.forgestackx.com"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Support
          </a>
          .
        </p>
      </main>
    </>
  );
}
