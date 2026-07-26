import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FSX Builder",
  description: "Website builder, poster generator, and image creator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-zinc-200 px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500 sm:px-10">
          <p>
            Powered by{" "}
            <a
              href="https://www.forgestackx.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-zinc-700 hover:underline dark:text-zinc-300"
            >
              <span className="text-red-600 dark:text-red-500">Forge</span>stackX
            </a>{" "}
            &middot;{" "}
            <a
              href="https://support.forgestackx.com"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Support
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
