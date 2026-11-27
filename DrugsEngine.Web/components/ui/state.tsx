import * as React from "react";
import { cn } from "@/lib/utils";

/** Пустое состояние / сообщение об ошибке с иконкой, текстом и действием. */
export function StateMessage({
  icon,
  title,
  children,
  action,
  tone = "neutral",
  className,
}: {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  tone?: "neutral" | "danger";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <div
        className={cn(
          "mb-4 grid size-12 place-items-center rounded-full [&_svg]:size-6",
          tone === "danger" ? "bg-danger-soft text-danger" : "bg-surface-2 text-ink-2",
        )}
      >
        {icon}
      </div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {children ? <div className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-2">{children}</div> : null}
      {action ? <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
