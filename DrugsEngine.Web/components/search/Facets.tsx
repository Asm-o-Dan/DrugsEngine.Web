import Link from "next/link";
import { Check } from "lucide-react";
import type { Facet, SearchParams } from "@/lib/contracts";
import { searchHref } from "@/lib/search-params";
import { cn } from "@/lib/utils";

const LIMIT = 8;

export function FacetGroup({
  title,
  facets,
  param,
  params,
}: {
  title: string;
  facets: Facet[];
  param: "manufacturer" | "country";
  params: SearchParams;
}) {
  if (facets.length === 0) return null;
  const selected = params[param];
  const shown = selected ? facets.filter((f) => f.value === selected) : facets.slice(0, LIMIT);

  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-3">{title}</legend>
      <ul className="space-y-0.5">
        {shown.map((facet) => {
          const active = facet.value === selected;
          return (
            <li key={facet.value}>
              <Link
                href={searchHref({ ...params, [param]: active ? undefined : facet.value, page: 1 })}
                aria-current={active ? "true" : undefined}
                scroll={false}
                className={cn(
                  "flex items-center gap-2.5 rounded-control px-2 py-1.5 text-sm transition-colors",
                  active ? "bg-brand-soft font-semibold text-brand" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-[4px] border",
                    active ? "border-brand bg-brand text-brand-ink" : "border-line-strong bg-surface",
                  )}
                  aria-hidden
                >
                  {active ? <Check className="size-3" strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0 flex-1 truncate">{facet.label}</span>
                <span className="num text-xs text-ink-3">{facet.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {!selected && facets.length > LIMIT ? (
        <p className="mt-1 px-2 text-xs text-ink-3">и ещё {facets.length - LIMIT}</p>
      ) : null}
    </fieldset>
  );
}

export function ModeSwitch({ params }: { params: SearchParams }) {
  const modes = [
    { value: "exact" as const, label: "По названию" },
    { value: "semantic" as const, label: "По симптомам" },
  ];
  return (
    <div role="radiogroup" aria-label="Тип поиска" className="inline-flex rounded-control border border-line bg-surface p-0.5">
      {modes.map((m) => {
        const active = params.mode === m.value;
        return (
          <Link
            key={m.value}
            role="radio"
            aria-checked={active}
            href={searchHref({ ...params, mode: m.value, page: 1, manufacturer: undefined, country: undefined })}
            className={cn(
              "rounded-[8px] px-3 py-1.5 text-sm font-semibold transition-colors",
              active ? "bg-ink text-bg" : "text-ink-2 hover:text-ink",
            )}
          >
            {m.label}
          </Link>
        );
      })}
    </div>
  );
}

export function Pagination({ params, total }: { params: SearchParams; total: number }) {
  const pages = Math.ceil(total / params.pageSize);
  if (pages <= 1) return null;
  const current = Math.min(params.page, pages);
  const numbers = [...new Set([1, current - 1, current, current + 1, pages])].filter((n) => n >= 1 && n <= pages);

  return (
    <nav aria-label="Страницы" className="mt-8 flex items-center justify-center gap-1">
      {numbers.map((n, i) => (
        <span key={n} className="flex items-center gap-1">
          {i > 0 && n - numbers[i - 1] > 1 ? <span className="px-1 text-ink-3">…</span> : null}
          <Link
            href={searchHref({ ...params, page: n })}
            aria-current={n === current ? "page" : undefined}
            className={cn(
              "num grid h-9 min-w-9 place-items-center rounded-control px-2 text-sm font-semibold",
              n === current ? "bg-ink text-bg" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
            )}
          >
            {n}
          </Link>
        </span>
      ))}
    </nav>
  );
}
