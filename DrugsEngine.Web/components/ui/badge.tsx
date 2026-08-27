import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground border-slate-300 dark:border-slate-700",
        generic:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium",
        analog:
          "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium",
        prescription:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium",
        otc:
          "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300 font-medium",
        inStock:
          "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 font-medium",
        lowStock:
          "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 font-medium",
        outOfStock:
          "border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 font-medium",
        onDemand:
          "border-sky-500/30 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60 font-medium",
        success:
          "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
        warning:
          "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
        danger:
          "border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
