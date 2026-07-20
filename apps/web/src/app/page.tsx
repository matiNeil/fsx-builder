
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-12 sm:px-10">
      <section className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">FSX Builder</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Build websites, posters, and custom images from one visual workspace.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <a className="rounded-xl border border-zinc-200 p-5 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900" href="/website-builder">
          <h2 className="text-lg font-medium">Website Builder</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Create responsive pages and export static HTML/CSS.</p>
        </a>
        <a className="rounded-xl border border-zinc-200 p-5 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900" href="/poster-generator">
          <h2 className="text-lg font-medium">Poster Generator</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Design posters from templates and export PNG/PDF.</p>
        </a>
        <a className="rounded-xl border border-zinc-200 p-5 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900" href="/image-creator">
          <h2 className="text-lg font-medium">Image Creator</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Edit layers, apply effects, and generate images with AI.</p>
        </a>
      </section>
    </main>
  );
}
