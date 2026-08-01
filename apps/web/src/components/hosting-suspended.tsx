export function HostingSuspended({ siteName }: { siteName?: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      {siteName ? (
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-400">{siteName}</p>
      ) : null}
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        This site is temporarily unavailable
      </h1>
      <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        The owner needs to renew hosting to bring it back online.
      </p>
    </main>
  );
}
