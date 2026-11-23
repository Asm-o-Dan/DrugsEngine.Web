"use client";

import * as React from "react";
import type { PharmacyListItem } from "@/lib/contracts";
import { distanceKm, mapFocus } from "@/lib/geo";
import { PharmacyMap, type MapPoint } from "@/components/map/PharmacyMap";
import { LocateControl } from "@/components/map/LocateControl";
import { NearestSummary } from "@/components/map/NearestSummary";
import { useUserLocation } from "@/components/map/useUserLocation";
import { PharmacyCard } from "./PharmacyCard";

/** Карта и список аптек. Если известно местоположение — список по расстоянию, иначе по городам. */
export function PharmaciesExplorer({ items }: { items: PharmacyListItem[] }) {
  const location = useUserLocation();
  const user = location.position;
  const [pickMode, setPickMode] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const mapBoxRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef(new Map<string, HTMLLIElement>());

  const withDistance = React.useMemo(
    () =>
      items.map((p) => ({ pharmacy: p, distanceKm: user && p.location ? distanceKm(user, p.location) : null })),
    [items, user],
  );
  const nearest = user
    ? withDistance.reduce<(typeof withDistance)[number] | null>(
        (n, r) => (r.distanceKm != null && (!n || r.distanceKm < n.distanceKm!) ? r : n),
        null,
      )
    : null;

  const points: MapPoint[] = React.useMemo(
    () =>
      items
        .filter((p) => p.location)
        .map((p) => ({
          id: p.id,
          lat: p.location!.lat,
          lng: p.location!.lng,
          label: `№${p.number}`,
          title: `${p.network} №${p.number}, ${p.address}`,
          tone: p.id === nearest?.pharmacy.id ? "nearest" : "default",
        })),
    [items, nearest?.pharmacy.id],
  );

  const focus = React.useMemo(
    () => mapFocus(items.filter((p) => p.location).map((p) => ({ ...p.location!, group: p.city })), user, 4),
    [items, user],
  );

  const select = (id: string) => {
    setSelectedId(id);
    cardRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  const showOnMap = (id: string) => {
    setSelectedId(id);
    mapBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const card = (r: (typeof withDistance)[number]) => (
    <li
      key={r.pharmacy.id}
      ref={(el) => {
        if (el) cardRefs.current.set(r.pharmacy.id, el);
        else cardRefs.current.delete(r.pharmacy.id);
      }}
      className="scroll-mt-28"
    >
      <PharmacyCard
        pharmacy={r.pharmacy}
        distanceKm={r.distanceKm}
        from={user}
        selected={selectedId === r.pharmacy.id}
        onShowOnMap={() => showOnMap(r.pharmacy.id)}
      />
    </li>
  );

  let list: React.ReactNode;
  if (user) {
    const sorted = [...withDistance].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    list = <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sorted.map(card)}</ul>;
  } else {
    const byCity = new Map<string, typeof withDistance>();
    for (const r of withDistance) byCity.set(r.pharmacy.city, [...(byCity.get(r.pharmacy.city) ?? []), r]);
    const cities = [...byCity.keys()].sort(
      (a, b) => byCity.get(b)!.length - byCity.get(a)!.length || a.localeCompare(b, "ru"),
    );
    list = (
      <div className="space-y-10">
        {cities.map((city) => (
          <section key={city} aria-labelledby={`city-${city}`}>
            <h2 id={`city-${city}`} className="flex items-baseline gap-2 text-lg font-bold text-ink">
              {city}
              <span className="num text-sm font-semibold text-ink-3">{byCity.get(city)!.length}</span>
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{byCity.get(city)!.map(card)}</ul>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {points.length > 0 ? (
        <div className="space-y-3">
          <LocateControl location={location} pickMode={pickMode} onPickModeChange={setPickMode} />
          <div ref={mapBoxRef} className="scroll-mt-28">
            <PharmacyMap
              ariaLabel="Карта аптек"
              points={points}
              focus={focus}
              user={user}
              selectedId={selectedId}
              onSelect={select}
              pickMode={pickMode}
              onPick={(p) => {
                location.setManual(p);
                setPickMode(false);
              }}
              className="h-80 sm:h-[420px]"
            />
          </div>
          {user && nearest?.distanceKm != null && nearest.pharmacy.location ? (
            <NearestSummary
              nearest={{
                id: nearest.pharmacy.id,
                title: `${nearest.pharmacy.network} №${nearest.pharmacy.number}`,
                address: `${nearest.pharmacy.city}, ${nearest.pharmacy.address}`,
                location: nearest.pharmacy.location,
                distanceKm: nearest.distanceKm,
              }}
              from={user}
              onSelect={showOnMap}
            />
          ) : null}
        </div>
      ) : null}
      {list}
    </div>
  );
}
