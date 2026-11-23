import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import type { PharmacyListItem } from "@/lib/contracts";
import { countLabel, mapHref, telHref } from "@/lib/format";

export function PharmacyCard({ pharmacy }: { pharmacy: PharmacyListItem }) {
  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-ink">
          <Link href={`/pharmacies/${pharmacy.id}`} className="hover:text-brand">
            {pharmacy.network} №{pharmacy.number}
          </Link>
        </h3>
        <span className="num shrink-0 text-xs font-semibold text-ink-3">
          {countLabel(pharmacy.assortmentCount, "препарат", "препарата", "препаратов")}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-2">{pharmacy.address}</p>
      {pharmacy.hours ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-3">
          <Clock className="size-3.5" aria-hidden /> {pharmacy.hours}
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-4 text-sm">
        {pharmacy.phone ? (
          <a href={telHref(pharmacy.phone)} className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
            <Phone className="size-4" aria-hidden /> {pharmacy.phone}
          </a>
        ) : null}
        <a
          href={mapHref(pharmacy.city, pharmacy.address)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
        >
          <MapPin className="size-4" aria-hidden /> На карте
        </a>
      </div>
    </article>
  );
}
