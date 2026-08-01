import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { websiteFontVariables } from "./website-fonts";

export const metadata: Metadata = {
  title: "FSX Studio",
  description: "Website studio, poster generator, and image creator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `
    (function () {
      try {
        var stored = localStorage.getItem("theme");
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var isDark = stored ? stored === "dark" : prefersDark;
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.classList.toggle("light", stored === "light");
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" className={`h-full antialiased ${websiteFontVariables}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
