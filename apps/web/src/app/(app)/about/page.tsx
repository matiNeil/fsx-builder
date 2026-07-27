import { SiteNav } from "@/components/marketing/site-nav";

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center sm:px-10">
        <h1 className="text-3xl font-semibold tracking-tight">About FSX Builder</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Our story page is coming soon. FSX Builder is built by ForgeStackX — an all-in-one AI
          creative workspace for websites, posters, and images.
        </p>
      </main>
    </>
  );
}
