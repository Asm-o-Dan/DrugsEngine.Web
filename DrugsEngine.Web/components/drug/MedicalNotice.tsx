import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function MedicalNotice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-3 rounded-card border border-line bg-surface-2/60 p-4 text-sm leading-relaxed text-ink-2", className)}>
      <Info className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
