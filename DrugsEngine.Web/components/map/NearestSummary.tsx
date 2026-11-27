import { Navigation } from "lucide-react";
import { formatDistance, routeHref, walkingLabel, type LatLng } from "@/lib/geo";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface SummaryItem {
  id: string;
  title: string;
  address: string;
  location: LatLng;
  distanceKm: number;
  price?: number;
}

export interface SummaryCard {
  /** primary — главная рекомендация (зелёная карточка). */
  kind: "primary" | "secondary";
  label: string;
  /** Короткое пояснение, почему эта аптека: «дешевле на 12 руб., но дальше на 1,4 км». */
  note?: string;
  item: SummaryItem;
}

/** Рекомендации после определения местоположения: одна объединённая карточка или «ближайшая» + «выгоднее». */
export function NearestSummary({
  cards,
  from,
  onSelect,
}: {
  cards: SummaryCard[];
  from: LatLng;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={cn("grid gap-2.5", cards.length > 1 && "sm:grid-cols-2")}>
      {cards.map(({ kind, label, note, item }) => {
        const walk = walkingLabel(item.distanceKm);
        return (
          <div
            key={`${kind}-${item.id}`}
            className={cn(
              "rounded-card border p-4",
              kind === "primary" ? "border-brand/40 bg-brand-soft/60" : "border-line bg-surface",
            )}
          >
            <p className={cn("text-xs font-bold uppercase tracking-[0.08em]", kind === "primary" ? "text-brand" : "text-ink-3")}>
              {label}
            </p>
            <button type="button" onClick={() => onSelect(item.id)} className="hit mt-1 text-left font-bold text-ink hover:text-brand">
              {item.title}
            </button>
            <p className="text-sm text-ink-2">{item.address}</p>
            {note ? <p className="mt-1.5 text-sm font-semibold text-ink">{note}</p> : null}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="num text-sm font-bold text-ink">{formatDistance(item.distanceKm)}</span>
              {walk ? <span className="text-sm text-ink-2">{walk}</span> : null}
              {item.price != null ? <span className="num text-sm font-bold text-ink">{formatPrice(item.price)}</span> : null}
              <a
                href={routeHref(item.location, from)}
                target="_blank"
                rel="noreferrer"
                className="hit ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
              >
                <Navigation className="size-4" aria-hidden /> Маршрут
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
