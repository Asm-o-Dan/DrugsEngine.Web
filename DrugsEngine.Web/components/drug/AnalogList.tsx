import Link from "next/link";
import type { Analog } from "@/lib/contracts";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

function PriceDelta({ price, base }: { price: number | null; base: number | null }) {
  if (price == null || base == null || base === 0) return null;
  const pct = Math.round(((price - base) / base) * 100);
  if (Math.abs(pct) < 1) return <span className="text-xs font-semibold text-ink-3">та же цена</span>;
  const cheaper = pct < 0;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-bold",
        cheaper ? "bg-deal text-deal-ink" : "bg-surface-2 text-ink-2",
      )}
    >
      {cheaper ? `на ${Math.abs(pct)}% дешевле` : `на ${pct}% дороже`}
    </span>
  );
}

export function AnalogList({ analogs, basePrice, baseIngredient }: { analogs: Analog[]; basePrice: number | null; baseIngredient: string | null }) {
  return (
    <ul className="divide-y divide-line rounded-card border border-line bg-surface shadow-card">
      {analogs.map((a) => {
        const sameIngredient = baseIngredient != null && a.activeIngredient === baseIngredient;
        return (
          <li key={a.id}>
            <Link href={`/drugs/${a.id}`} className="group flex items-center gap-4 px-4 py-3.5 sm:px-5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink group-hover:text-brand">{a.name}</p>
                <p className="mt-0.5 truncate text-sm text-ink-2">
                  {sameIngredient ? (
                    <span className="font-semibold text-brand">То же вещество</span>
                  ) : (
                    a.activeIngredient ?? a.manufacturer
                  )}
                  <span className="text-ink-3"> · {a.manufacturer}</span>
                </p>
                <div className="mt-2 flex items-center gap-2" title="Насколько похожи описания препаратов">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                    <div className="h-full rounded-full bg-brand" style={{ width: `${Math.round(a.similarity * 100)}%` }} />
                  </div>
                  <span className="num text-xs text-ink-3">сходство {Math.round(a.similarity * 100)}%</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {a.minPrice != null ? (
                  <span className="num font-bold text-ink">от {formatPrice(a.minPrice)}</span>
                ) : (
                  <span className="text-sm text-ink-3">нет в продаже</span>
                )}
                <PriceDelta price={a.minPrice} base={basePrice} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
