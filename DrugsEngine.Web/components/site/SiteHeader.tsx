"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SearchBox } from "@/components/search/SearchBox";
import type { SearchMode } from "@/lib/contracts";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/search", label: "Лекарства" },
  { href: "/pharmacies", label: "Аптеки" },
];

function HeaderSearch() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const mode = (params.get("mode") === "semantic" ? "semantic" : "exact") as SearchMode;
  return <SearchBox key={q} defaultValue={q} mode={mode} />;
}

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <div className="container flex h-16 items-center gap-2 sm:gap-6">
        <Logo />
        {!isHome ? (
          <div className="hidden max-w-md flex-1 md:block">
            <Suspense fallback={<div className="h-10 rounded-control border border-line bg-surface" />}>
              <HeaderSearch />
            </Suspense>
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <nav aria-label="Основная навигация" className="ml-auto flex items-center gap-0.5 sm:gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`) ||
              (item.href === "/search" && pathname.startsWith("/drugs"));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "hit rounded-control px-2 py-2 text-sm font-semibold transition-colors sm:px-3",
                  active ? "bg-surface-2 text-ink" : "text-ink-2 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
      {!isHome ? (
        <div className="container pb-3 md:hidden">
          <Suspense fallback={<div className="h-10 rounded-control border border-line bg-surface" />}>
            <HeaderSearch />
          </Suspense>
        </div>
      ) : null}
    </header>
  );
}
