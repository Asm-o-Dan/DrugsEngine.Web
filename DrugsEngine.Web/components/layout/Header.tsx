"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pill, Activity, MapPin, Search, Menu, X, Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/search", label: "Умный поиск", icon: Search },
  { href: "/pharmacies", label: "Аптеки & Наличие", icon: MapPin },
  { href: "/telemetry", label: "Телеметрия", icon: Activity },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform dark:bg-emerald-500">
              <Pill className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                Drugs<span className="text-emerald-600 dark:text-emerald-400">Engine</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                Гибридный поиск v1.4
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/telemetry"
            className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="h-3 w-3 text-emerald-500" />
            Qdrant + CQRS Online
          </Link>

          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 shadow-xl">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === "/"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <Pill className="h-4 w-4" />
              Главная
            </Link>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
