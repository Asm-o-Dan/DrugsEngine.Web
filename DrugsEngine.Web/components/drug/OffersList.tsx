"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import type { Offer } from "@/lib/contracts";
import { formatPrice, formatUpdatedAt, mapHref, telHref } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ALL = "__all__";

/**
 * Предложения аптек в виде «чека»: аптека … цена.
 * Отсортированы по цене; самое дешёвое помечено маркером.
 */
export function OffersList({ offers }: { offers: Offer[] }) {
  const cities = React.useMemo(
    () => [...new Set(offers.map((o) => o.pharmacy.city))].sort((a, b) => a.localeCompare(b, "ru")),
    [offers],
  );
  const [city, setCity] = React.useState<string>(ALL);
  const visible = React.useMemo(
    () => offers.filter((o) => city === ALL || o.pharmacy.city === city).sort((a, b) => a.price - b.price),
    [offers, city],
  );
  const best = visible[0]?.price;

  return (
    <div>
      {cities.length > 1 ? (
        <div role="group" aria-label="Город" className="mb-3 flex flex-wrap gap-1.5">
          {[ALL, ...cities].map((c) => {
            const count = c === ALL ? offers.length : offers.filter((o) => o.pharmacy.city === c).length;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={city === c}
                onClick={() => setCity(c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-semibold transition-colors",
                  city === c
                    ? "border-ink bg-ink text-bg"
                    : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
                )}
              >
                {c === ALL ? "Все города" : c}
                <span className={cn("num ml-1.5", city === c ? "text-bg/70" : "text-ink-3")}>{count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <ol className="divide-y divide-dashed divide-line rounded-card border border-line bg-surface shadow-card">
        {visible.map((offer) => {
          const p = offer.pharmacy;
          const isBest = offer.price === best && visible.length > 1;
          return (
            <li key={p.id} className="px-4 py-4 sm:px-5">
              <div className="flex items-baseline gap-3">
                <Link
                  href={`/pharmacies/${p.id}`}
                  className="min-w-0 shrink font-bold text-ink hover:text-brand"
                >
                  {p.network} №{p.number}
                </Link>
                <span className="leader" aria-hidden />
                <span className="flex shrink-0 items-baseline gap-2">
                  {isBest ? <Badge tone="deal">Дешевле всего</Badge> : null}
                  <span className={cn("num text-lg font-extrabold", isBest ? "text-ink" : "text-ink")}>
                    {formatPrice(offer.price)}
                  </span>
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-2">
                <span>
                  {p.city}, {p.address}
                </span>
                {p.hours ? <span className="text-ink-3">{p.hours}</span> : null}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {p.phone ? (
                  <a href={telHref(p.phone)} className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
                    <Phone className="size-4" aria-hidden /> {p.phone}
                  </a>
                ) : null}
                <a
                  href={mapHref(p.city, p.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
                >
                  <MapPin className="size-4" aria-hidden /> На карте
                </a>
                <span className="ml-auto text-xs text-ink-3">Цена обновлена {formatUpdatedAt(offer.updatedAt)}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
