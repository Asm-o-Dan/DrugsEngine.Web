"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-600" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 text-emerald-400 transition-transform rotate-0" />
      ) : (
        <Sun className="h-5 w-5 text-amber-500 transition-transform rotate-0" />
      )}
    </Button>
  );
}
