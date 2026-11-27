import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import type { DrugSummary } from "@/lib/contracts";
import { countLabel, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DrugMeta({ drug, className }: { drug: Pick<DrugSummary, "manufacturer" | "country">; className?: string }) {
  return (
    <p className={cn("truncate text-sm text-ink-2", className)}>
      {drug.manufacturer}
      {drug.country ? <span className="text-ink-3"> · {drug.country.name}</span> : null}
    </p>
  );
}

export function PriceFrom({ drug, align = "right" }: { drug: DrugSummary; align?: "left" | "right" }) {
  if (drug.minPrice == null) {
    return <p className={cn("text-sm font-semibold text-ink-3", align === "right" && "text-right")}>Нет в продаже</p>;
  }
  return (
    <div className={cn(align === "right" && "text-right")}>
      <p className="num whitespace-nowrap text-base font-extrabold leading-tight text-ink sm:text-lg">
        <span className="mr-1 text-sm font-semibold text-ink-3">от</span>
        {formatPrice(drug.minPrice)}
      </p>
      <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-ink-2">
        <Store className="size-3.5" aria-hidden />
        {countLabel(drug.pharmacyCount, "аптека", "аптеки", "аптек")}
      </p>
    </div>
  );
}

/** Строка результата поиска: вся карточка — ссылка на препарат. */
export function DrugRow({ drug, extra }: { drug: DrugSummary; extra?: React.ReactNode }) {
  return (
    <Link
      href={`/drugs/${drug.id}`}
      className="group flex items-center gap-4 rounded-card border border-line bg-surface px-4 py-4 shadow-card transition-colors hover:border-line-strong sm:px-5"
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold leading-snug text-ink group-hover:text-brand">{drug.name}</h3>
        <DrugMeta drug={drug} className="mt-0.5" />
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
          {drug.activeIngredient ? <span>{drug.activeIngredient}</span> : null}
          {drug.form ? <span>{drug.form}</span> : null}
          {extra}
        </div>
      </div>
      <PriceFrom drug={drug} />
      <ChevronRight className="hidden size-5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden />
    </Link>
  );
}

/** Плитка для подборок на главной. */
export function DrugTile({ drug }: { drug: DrugSummary }) {
  return (
    <Link
      href={`/drugs/${drug.id}`}
      className="group flex h-full flex-col justify-between gap-4 rounded-card border border-line bg-surface p-3.5 shadow-card sm:p-4 transition-colors hover:border-line-strong"
    >
      <div className="min-w-0">
        <h3 className="line-clamp-2 font-bold leading-snug text-ink group-hover:text-brand">{drug.name}</h3>
        <DrugMeta drug={drug} className="mt-1" />
      </div>
      <PriceFrom drug={drug} align="left" />
    </Link>
  );
}
