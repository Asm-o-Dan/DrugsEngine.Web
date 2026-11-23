"use client";

import * as React from "react";
import { Navigation } from "lucide-react";
import type { Pharmacy } from "@/lib/contracts";
import { distanceKm, formatDistance, routeHref, walkingLabel } from "@/lib/geo";
import { PharmacyMap } from "@/components/map/PharmacyMap";
import { useUserLocation } from "@/components/map/useUserLocation";

/** Мини-карта на странице аптеки с расстоянием от пользователя (если оно уже известно). */
export function PharmacyLocation({ pharmacy }: { pharmacy: Pharmacy }) {
  const { position: user } = useUserLocation();
  const loc = pharmacy.location;
  const points = React.useMemo(
    () =>
      loc
        ? [{ id: pharmacy.id, lat: loc.lat, lng: loc.lng, label: `№${pharmacy.number}`, title: pharmacy.address, tone: "nearest" as const }]
        : [],
    [loc, pharmacy.id, pharmacy.number, pharmacy.address],
  );
  if (!loc) return null;
  const km = user ? distanceKm(user, loc) : null;

  return (
    <div className="space-y-3">
      <PharmacyMap ariaLabel={`Аптека на карте: ${pharmacy.address}`} points={points} className="h-56" />
      <div className="flex items-center justify-between gap-3 text-sm">
        {km != null ? (
          <span className="text-ink-2">
            <span className="num font-bold text-ink">{formatDistance(km)}</span> от вас
            {walkingLabel(km) ? ` · ${walkingLabel(km)}` : ""}
          </span>
        ) : (
          <span className="text-ink-3">{pharmacy.city}</span>
        )}
        <a
          href={routeHref(loc, user)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
        >
          <Navigation className="size-4" aria-hidden /> Маршрут
        </a>
      </div>
    </div>
  );
}
