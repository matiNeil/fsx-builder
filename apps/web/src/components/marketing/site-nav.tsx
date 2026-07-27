"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/format";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Templates", href: "/#tools" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
];

export function SiteNav() {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated" && Boolean(session?.apiToken);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/70 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/70">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="flex h-6 w-6 rotate-45 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-blue-500">
            <span className="-rotate-45 text-[10px] font-bold text-white">F</span>
          </span>
          FSX Builder
        </Link>
        <div className="hidden items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://support.forgestackx.com"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            Support
          </a>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isSignedIn ? (
            <Link
              href="/dashboard"
              aria-label="Go to dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 text-xs font-semibold text-white"
            >
              {getInitials(session?.user?.name ?? session?.user?.email)}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-gradient rounded-lg px-4 py-2 text-sm font-medium text-white"
              >
                Start Building
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
