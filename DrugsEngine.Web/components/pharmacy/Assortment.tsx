"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { PharmacyOffer } from "@/lib/contracts";
import { formatPrice } from "@/lib/format";

export function Assortment({ offers }: { offers: PharmacyOffer[] }) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const visible = q
    ? offers.filter((o) => `${o.drug.name} ${o.drug.manufacturer}`.toLowerCase().includes(q))
    : offers;

  return (
    <div>
      <label className="relative block max-w-sm">
        <span className="sr-only">Фильтр по ассортименту</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти в этой аптеке"
          className="h-10 w-full rounded-control border border-line-strong bg-surface pl-9 pr-3 text-sm placeholder:text-ink-3 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
        />
      </label>
      {visible.length > 0 ? (
        <ul className="mt-4 divide-y divide-dashed divide-line rounded-card border border-line bg-surface shadow-card">
          {visible.map((o) => (
            <li key={o.drug.id}>
              <Link href={`/drugs/${o.drug.id}`} className="group flex items-baseline gap-3 px-4 py-3 sm:px-5">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink group-hover:text-brand">{o.drug.name}</span>
                  <span className="block truncate text-xs text-ink-3">{o.drug.manufacturer}</span>
                </span>
                <span className="leader" aria-hidden />
                <span className="num shrink-0 font-bold text-ink">{formatPrice(o.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-card border border-dashed border-line-strong p-5 text-sm text-ink-2">
          {offers.length === 0 ? "Цены этой аптеки пока не собраны." : "В этой аптеке такого препарата не нашлось."}
        </p>
      )}
    </div>
  );
}
