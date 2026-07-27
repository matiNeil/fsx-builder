const COLUMNS: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    heading: "Products",
    links: [
      { label: "Website Builder", href: "/website-builder" },
      { label: "Poster Generator", href: "/poster-generator" },
      { label: "Image Creator", href: "/image-creator" },
      { label: "All Features", href: "/#features" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Templates", href: "/#tools" },
      { label: "Pricing", href: "/pricing" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Support", href: "https://support.forgestackx.com", external: true },
    ],
  },
];

const SOCIAL_ICONS: { label: string; path: string }[] = [
  { label: "Twitter", path: "M18 5.3a7 7 0 01-2 .6 3.5 3.5 0 001.5-1.9 7 7 0 01-2.2.9 3.5 3.5 0 00-6 3.2A9.9 9.9 0 013 4.8a3.5 3.5 0 001.1 4.7 3.5 3.5 0 01-1.6-.4v.1a3.5 3.5 0 002.8 3.4 3.5 3.5 0 01-1.6.1 3.5 3.5 0 003.3 2.4A7 7 0 012 16.6a9.9 9.9 0 005.4 1.6c6.5 0 10-5.4 10-10v-.5A7 7 0 0018 5.3z" },
  { label: "LinkedIn", path: "M4.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3 8h3v9H3zM9 8h3v1.3c.5-.8 1.4-1.5 3-1.5 2.2 0 3.5 1.5 3.5 4.5V17h-3v-4.2c0-1.4-.5-2.3-1.7-2.3-1 0-1.6.7-1.8 1.3-.1.2-.1.6-.1.9V17H9z" },
  { label: "YouTube", path: "M17.5 6.5S17.3 5 16.7 4.4c-.7-.8-1.6-.8-2-.9C11.9 3.3 10 3.3 10 3.3h0s-1.9 0-4.7.2c-.4 0-1.3.1-2 .9C2.7 5 2.5 6.5 2.5 6.5S2.3 8.3 2.3 10v1.5c0 1.7.2 3.5.2 3.5s.2 1.5.8 2.1c.7.8 1.7.8 2.1.9 1.5.1 6.6.2 6.6.2s1.9 0 4.7-.2c.4 0 1.3-.1 2-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.5V10c0-1.7-.2-3.5-.2-3.5zM8.4 13V7.5l4.8 2.8z" },
  { label: "Instagram", path: "M7 3h6a4 4 0 014 4v6a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm0 1.6A2.4 2.4 0 004.6 7v6A2.4 2.4 0 007 15.4h6a2.4 2.4 0 002.4-2.4V7A2.4 2.4 0 0013 4.6zm3 2.9a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm0 1.6a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zm3.6-2.6a.8.8 0 110 1.6.8.8 0 010-1.6z" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 px-6 py-12 dark:border-zinc-800 sm:px-10">
      <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-6">
        <div className="space-y-3 sm:col-span-2">
          <p className="text-sm font-semibold">FSX Builder</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            The all-in-one AI creative workspace for websites, posters, and images.
          </p>
          <div className="flex gap-2 pt-1">
            {SOCIAL_ICONS.map((icon) => (
              <span
                key={icon.label}
                title={`${icon.label} (coming soon)`}
                className="flex h-8 w-8 cursor-default items-center justify-center rounded-full border border-zinc-200 text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                  <path d={icon.path} />
                </svg>
              </span>
            ))}
          </div>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.heading} className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {column.heading}
            </p>
            <ul className="space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              {column.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className="hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-5xl border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        Powered by{" "}
        <a
          href="https://www.forgestackx.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-zinc-700 hover:underline dark:text-zinc-300"
        >
          <span className="text-red-600 dark:text-red-500">Forge</span>stackX
        </a>{" "}
        &middot; &copy; 2026 ForgeStackX. All rights reserved.
      </p>
    </footer>
  );
}
