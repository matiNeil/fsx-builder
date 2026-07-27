import Link from "next/link";

type DashboardTopbarProps = {
  name: string;
  initials: string;
  planName: string;
  creditsRemaining: number;
};

export function DashboardTopbar({ name, initials, planName, creditsRemaining }: DashboardTopbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-5 dark:border-zinc-800 sm:px-10">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Welcome back, {name}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{planName} plan</p>
          <p className="text-sm font-medium">{creditsRemaining.toLocaleString()} credits</p>
        </div>
        <Link
          href="/pricing"
          className="btn-gradient rounded-lg px-3 py-1.5 text-xs font-medium text-white"
        >
          Upgrade
        </Link>
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M10 3a4 4 0 00-4 4v2.5c0 .8-.3 1.6-.9 2.2L4 13h12l-1.1-1.3c-.6-.6-.9-1.4-.9-2.2V7a4 4 0 00-4-4zM8.5 15a1.5 1.5 0 003 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </span>
        <Link
          href="/account"
          aria-label="Account"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 text-xs font-semibold text-white"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
