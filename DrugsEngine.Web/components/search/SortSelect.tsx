"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { SearchParams, SearchSort } from "@/lib/contracts";
import { searchHref } from "@/lib/search-params";
import { cn } from "@/lib/utils";

const OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "relevance", label: "По релевантности" },
  { value: "price_asc", label: "Сначала дешёвые" },
  { value: "price_desc", label: "Сначала дорогие" },
  { value: "name", label: "По названию" },
];

export function SortSelect({ params }: { params: SearchParams }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <label className="flex items-center gap-2 text-sm text-ink-2">
      <span className="sr-only sm:not-sr-only">Сортировка</span>
      <select
        value={params.sort}
        onChange={(e) =>
          startTransition(() => router.push(searchHref({ ...params, sort: e.target.value as SearchSort, page: 1 })))
        }
        className={cn(
          "h-9 rounded-control border border-line bg-surface px-2.5 text-sm font-semibold text-ink hover:border-line-strong",
          pending && "opacity-60",
        )}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
