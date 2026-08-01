import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const NAV_ITEMS: { label: string; href?: string; active?: boolean }[] = [
  { label: "Dashboard", href: "/dashboard", active: true },
  { label: "Projects", href: "/dashboard#recent-projects" },
  { label: "Templates", href: "/website-studio/new" },
  { label: "FSX Assistant", href: "/website-studio/new" },
  { label: "Domains" },
  { label: "Billing", href: "/account" },
  { label: "Settings", href: "/account" },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50 sm:flex">
      <Link href="/" className="flex items-center px-2">
        <Logo size="sm" />
      </Link>
      <nav className="mt-6 flex-1 space-y-1">
        {NAV_ITEMS.map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm ${
                item.active
                  ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              key={item.label}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-400 dark:text-zinc-600"
            >
              {item.label}
              <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] dark:bg-zinc-800">
                Soon
              </span>
            </span>
          )
        )}
      </nav>
      <a
        href="https://support.forgestackx.com"
        target="_blank"
        rel="noreferrer"
        className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
      >
        Help Center
      </a>
    </aside>
  );
}
