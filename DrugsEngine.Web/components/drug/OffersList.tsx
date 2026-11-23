"use client";

import * as React from "react";
import Link from "next/link";
import { Map as MapIcon, MapPin, Navigation, Phone } from "lucide-react";
import type { Offer } from "@/lib/contracts";
import { formatPrice, formatPriceShort, formatUpdatedAt, mapHref, telHref } from "@/lib/format";
import { distanceKm, mapFocus, formatDistance, routeHref } from "@/lib/geo";
import { Badge } from "@/components/ui/badge";
import { PharmacyMap, type MapPoint } from "@/components/map/PharmacyMap";
import { LocateControl } from "@/components/map/LocateControl";
import { NearestSummary } from "@/components/map/NearestSummary";
import { useUserLocation } from "@/components/map/useUserLocation";
import { cn } from "@/lib/utils";

const ALL = "__all__";
type Sort = "price" | "distance";

interface Row extends Offer {
  distanceKm: number | null;
}

/**
 * Предложения аптек: карта с ценниками + список в виде «чека».
 * Выбор синхронизирован: клик по маркеру подсвечивает строку и наоборот.
 */
export function OffersList({ offers }: { offers: Offer[] }) {
  const location = useUserLocation();
  const user = location.position;
  const [pickMode, setPickMode] = React.useState(false);
  const [city, setCity] = React.useState<string>(ALL);
  const [sort, setSort] = React.useState<Sort>("price");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const rowRefs = React.useRef(new Map<string, HTMLLIElement>());
  const mapBoxRef = React.useRef<HTMLDivElement>(null);

  // Когда пользователь указал местоположение — по умолчанию сортируем по расстоянию.
  const userKey = user ? `${user.lat},${user.lng}` : null;
  React.useEffect(() => {
    if (userKey) setSort("distance");
  }, [userKey]);

  const cities = React.useMemo(
    () => [...new Set(offers.map((o) => o.pharmacy.city))].sort((a, b) => a.localeCompare(b, "ru")),
    [offers],
  );

  const rows: Row[] = React.useMemo(() => {
    const withDistance = offers
      .filter((o) => city === ALL || o.pharmacy.city === city)
      .map((o) => ({
        ...o,
        distanceKm: user && o.pharmacy.location ? distanceKm(user, o.pharmacy.location) : null,
      }));
    return withDistance.sort((a, b) =>
      sort === "distance" && user
        ? (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) || a.price - b.price
        : a.price - b.price,
    );
  }, [offers, city, sort, user]);

  const cheapest = rows.reduce<Row | null>((best, r) => (!best || r.price < best.price ? r : best), null);
  const nearest = user
    ? rows.reduce<Row | null>((n, r) => (r.distanceKm != null && (!n || r.distanceKm < n.distanceKm!) ? r : n), null)
    : null;

  const points: MapPoint[] = React.useMemo(
    () =>
      rows
        .filter((r) => r.pharmacy.location)
        .map((r) => ({
          id: r.pharmacy.id,
          lat: r.pharmacy.location!.lat,
          lng: r.pharmacy.location!.lng,
          label: formatPriceShort(r.price),
          title: `${r.pharmacy.network} №${r.pharmacy.number}, ${r.pharmacy.address} — ${formatPrice(r.price)}`,
          tone: nearest?.pharmacy.id === r.pharmacy.id ? "nearest" : cheapest?.pharmacy.id === r.pharmacy.id && rows.length > 1 ? "best" : "default",
        })),
    [rows, nearest?.pharmacy.id, cheapest?.pharmacy.id],
  );

  const focus = React.useMemo(
    () =>
      mapFocus(
        rows.filter((r) => r.pharmacy.location).map((r) => ({ ...r.pharmacy.location!, group: r.pharmacy.city })),
        user,
      ),
    [rows, user],
  );

  const selectFromMap = (id: string) => {
    setSelectedId(id);
    rowRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  const showOnMap = (id: string) => {
    setSelectedId(id);
    mapBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const hasMap = points.length > 0;
  const toSummary = (r: Row) => ({
    id: r.pharmacy.id,
    title: `${r.pharmacy.network} №${r.pharmacy.number}`,
    address: `${r.pharmacy.city}, ${r.pharmacy.address}`,
    location: r.pharmacy.location!,
    distanceKm: r.distanceKm!,
    price: r.price,
  });

  return (
    <div className="space-y-3">
      {hasMap ? (
        <LocateControl
          location={location}
          pickMode={pickMode}
          onPickModeChange={setPickMode}
        />
      ) : null}

      {hasMap ? (
        <div ref={mapBoxRef} className="scroll-mt-28">
          <PharmacyMap
            ariaLabel="Карта аптек, где продаётся препарат"
            points={points}
            focus={focus}
            user={user}
            selectedId={selectedId}
            onSelect={selectFromMap}
            pickMode={pickMode}
            onPick={(p) => {
              location.setManual(p);
              setPickMode(false);
            }}
            className="h-72 sm:h-80"
          />
        </div>
      ) : null}

      {user && nearest?.distanceKm != null ? (
        <NearestSummary
          nearest={toSummary(nearest)}
          cheapest={cheapest && cheapest.distanceKm != null ? toSummary(cheapest) : null}
          from={user}
          onSelect={showOnMap}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {cities.length > 1 ? (
          <div role="group" aria-label="Город" className="flex flex-wrap gap-1.5">
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
        ) : (
          <span />
        )}
        {user ? (
          <div role="radiogroup" aria-label="Сортировка" className="inline-flex rounded-control border border-line bg-surface p-0.5">
            {(
              [
                ["price", "Дешевле"],
                ["distance", "Ближе"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={sort === value}
                onClick={() => setSort(value)}
                className={cn(
                  "rounded-[8px] px-3 py-1 text-sm font-semibold transition-colors",
                  sort === value ? "bg-ink text-bg" : "text-ink-2 hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <ol className="divide-y divide-dashed divide-line rounded-card border border-line bg-surface shadow-card">
        {rows.map((offer) => {
          const p = offer.pharmacy;
          const isBest = offer.pharmacy.id === cheapest?.pharmacy.id && rows.length > 1;
          const isNearest = offer.pharmacy.id === nearest?.pharmacy.id;
          const selected = selectedId === p.id;
          return (
            <li
              key={p.id}
              ref={(el) => {
                if (el) rowRefs.current.set(p.id, el);
                else rowRefs.current.delete(p.id);
              }}
              onMouseEnter={() => p.location && setSelectedId(p.id)}
              className={cn(
                "scroll-mt-28 px-4 py-4 transition-colors first:rounded-t-card last:rounded-b-card sm:px-5",
                selected && "bg-brand-soft/40",
              )}
            >
              <div className="flex items-baseline gap-3">
                <Link href={`/pharmacies/${p.id}`} className="min-w-0 shrink font-bold text-ink hover:text-brand">
                  {p.network} №{p.number}
                </Link>
                <span className="leader" aria-hidden />
                <span className="flex shrink-0 items-baseline gap-2">
                  {isNearest ? <Badge tone="brand" className="hidden sm:inline-flex">Ближе всего</Badge> : null}
                  {isBest ? <Badge tone="deal" className="hidden sm:inline-flex">Дешевле всего</Badge> : null}
                  <span className="num text-lg font-extrabold text-ink">{formatPrice(offer.price)}</span>
                </span>
              </div>
              {isBest || isNearest ? (
                <div className="mt-1 flex gap-1.5 sm:hidden">
                  {isNearest ? <Badge tone="brand">Ближе всего</Badge> : null}
                  {isBest ? <Badge tone="deal">Дешевле всего</Badge> : null}
                </div>
              ) : null}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-2">
                <span>
                  {p.city}, {p.address}
                </span>
                {offer.distanceKm != null ? (
                  <span className="num font-semibold text-ink">{formatDistance(offer.distanceKm)}</span>
                ) : null}
                {p.hours ? <span className="text-ink-3">{p.hours}</span> : null}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {p.phone ? (
                  <a href={telHref(p.phone)} className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
                    <Phone className="size-4" aria-hidden /> {p.phone}
                  </a>
                ) : null}
                {p.location ? (
                  <>
                    <button
                      type="button"
                      onClick={() => showOnMap(p.id)}
                      className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
                    >
                      <MapIcon className="size-4" aria-hidden /> На карте
                    </button>
                    <a
                      href={routeHref(p.location, user)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
                    >
                      <Navigation className="size-4" aria-hidden /> Маршрут
                    </a>
                  </>
                ) : (
                  <a
                    href={mapHref(p.city, p.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
                  >
                    <MapPin className="size-4" aria-hidden /> На карте
                  </a>
                )}
                <span className="ml-auto text-xs text-ink-3">Цена обновлена {formatUpdatedAt(offer.updatedAt)}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
