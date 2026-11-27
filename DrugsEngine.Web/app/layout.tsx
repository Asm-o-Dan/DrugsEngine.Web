import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { DemoBanner } from "@/components/site/DemoBanner";
import { getDataSource } from "@/lib/server/source";

export const metadata: Metadata = {
  title: { default: "DrugsEngine — цены на лекарства в аптеках", template: "%s — DrugsEngine" },
  description: "Найдите лекарство и сравните цены в аптеках вашего города.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#111214" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const demo = getDataSource().kind === "demo";
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col font-sans">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:shadow-pop"
          >
            Перейти к содержимому
          </a>
          {demo ? <DemoBanner /> : null}
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter demo={demo} />
        </ThemeProvider>
      </body>
    </html>
  );
}
