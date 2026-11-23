import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" className="fill-brand" />
      <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" className="fill-brand-ink" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-control" aria-label="DrugsEngine — на главную">
      <LogoMark />
      <span className="text-base font-extrabold tracking-tight text-ink sm:text-[17px]">
        Drugs<span className="text-brand">Engine</span>
      </span>
    </Link>
  );
}
