import Link from "next/link";
import { Clock, Map as MapIcon, MapPin, Navigation, Phone } from "lucide-react";
import type { PharmacyListItem } from "@/lib/contracts";
import { countLabel, mapHref, telHref } from "@/lib/format";
import { formatDistance, routeHref, type LatLng } from "@/lib/geo";
import { cn } from "@/lib/utils";

export function PharmacyCard({
  pharmacy,
  distanceKm,
  from,
  selected,
  onShowOnMap,
}: {
  pharmacy: PharmacyListItem;
  distanceKm?: number | null;
  from?: LatLng | null;
  selected?: boolean;
  onShowOnMap?: () => void;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-card border bg-surface p-5 shadow-card transition-colors",
        selected ? "border-brand ring-2 ring-brand/20" : "border-line",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-ink">
          <Link href={`/pharmacies/${pharmacy.id}`} className="hit hover:text-brand">
            {pharmacy.network} №{pharmacy.number}
          </Link>
        </h3>
        {distanceKm != null ? (
          <span className="num shrink-0 text-sm font-bold text-ink">{formatDistance(distanceKm)}</span>
        ) : (
          <span className="num shrink-0 text-xs font-semibold text-ink-3">
            {countLabel(pharmacy.assortmentCount, "препарат", "препарата", "препаратов")}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-2">
        {distanceKm != null ? `${pharmacy.city}, ` : ""}
        {pharmacy.address}
      </p>
      {pharmacy.hours ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-3">
          <Clock className="size-3.5" aria-hidden /> {pharmacy.hours}
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-4 text-sm">
        {pharmacy.phone ? (
          <a href={telHref(pharmacy.phone)} className="hit inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
            <Phone className="size-4" aria-hidden /> {pharmacy.phone}
          </a>
        ) : null}
        {pharmacy.location && onShowOnMap ? (
          <button type="button" onClick={onShowOnMap} className="hit inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
            <MapIcon className="size-4" aria-hidden /> На карте
          </button>
        ) : null}
        {pharmacy.location ? (
          <a
            href={routeHref(pharmacy.location, from)}
            target="_blank"
            rel="noreferrer"
            className="hit inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
          >
            <Navigation className="size-4" aria-hidden /> Маршрут
          </a>
        ) : (
          <a
            href={mapHref(pharmacy.city, pharmacy.address)}
            target="_blank"
            rel="noreferrer"
            className="hit inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
          >
            <MapPin className="size-4" aria-hidden /> На карте
          </a>
        )}
      </div>
    </article>
  );
}
