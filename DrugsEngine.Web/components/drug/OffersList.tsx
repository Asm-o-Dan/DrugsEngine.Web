"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Map as MapIcon, MapPin, Navigation, Phone } from "lucide-react";
import type { Offer } from "@/lib/contracts";
import { countLabel, formatPrice, formatPriceShort, formatUpdatedAt, mapHref, telHref } from "@/lib/format";
import { distanceKm, mapFocus, formatDistance, routeHref } from "@/lib/geo";
import { Badge } from "@/components/ui/badge";
import { PharmacyMap, type MapPoint } from "@/components/map/PharmacyMap";
import { LocateControl } from "@/components/map/LocateControl";
import { NearestSummary, type SummaryCard } from "@/components/map/NearestSummary";
import { rankOptimal, NOTICEABLE_PCT, NOTICEABLE_RUB } from "@/lib/ranking";
import { useUserLocation } from "@/components/map/useUserLocation";
import { cn } from "@/lib/utils";

const ALL = "__all__";
/** Сколько аптек показываем сразу: список уже отсортирован, дальше — по кнопке. */
const INITIAL_ROWS = 10;
type Sort = "best" | "distance" | "price";

const SORTS: { value: Sort; label: string }[] = [
  { value: "best", label: "Оптимально" },
  { value: "distance", label: "Ближе" },
  { value: "price", label: "Дешевле" },
];

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
  const [network, setNetwork] = React.useState<string>(ALL);
  const [sort, setSort] = React.useState<Sort>("price");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [reveal, setReveal] = React.useState<{ id: string } | null>(null);
  const [expanded, setExpanded] = React.useState(false);
  const pendingScrollRef = React.useRef<string | null>(null);
  const rowRefs = React.useRef(new Map<string, HTMLLIElement>());
  const mapBoxRef = React.useRef<HTMLDivElement>(null);

  // Когда пользователь указал местоположение — по умолчанию «Оптимально»: ближе, но без заметной переплаты.
  const userKey = user ? `${user.lat},${user.lng}` : null;
  React.useEffect(() => {
    if (userKey) setSort("best");
  }, [userKey]);

  const cities = React.useMemo(
    () => [...new Set(offers.map((o) => o.pharmacy.city))].sort((a, b) => a.localeCompare(b, "ru")),
    [offers],
  );
  const networks = React.useMemo(
    () => [...new Set(offers.map((o) => o.pharmacy.network))].sort((a, b) => a.localeCompare(b, "ru")),
    [offers],
  );

  const rows: Row[] = React.useMemo(() => {
    const withDistance = offers
      .filter((o) => (city === ALL || o.pharmacy.city === city) && (network === ALL || o.pharmacy.network === network))
      .map((o) => ({
        ...o,
        distanceKm: user && o.pharmacy.location ? distanceKm(user, o.pharmacy.location) : null,
      }));
    if (!user || sort === "price") return withDistance.sort((a, b) => a.price - b.price);
    if (sort === "best") return rankOptimal(withDistance);
    return withDistance.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) || a.price - b.price);
  }, [offers, city, network, sort, user]);

  const cheapest = rows.reduce<Row | null>((best, r) => (!best || r.price < best.price ? r : best), null);
  const nearest = user
    ? rows.reduce<Row | null>((n, r) => (r.distanceKm != null && (!n || r.distanceKm < n.distanceKm!) ? r : n), null)
    : null;

  // при одинаковой минимальной цене «Дешевле всего» — все такие аптеки
  const hasSpread = rows.some((r) => r.price !== cheapest?.price);
  const isCheapest = (r: Row) => hasSpread && cheapest != null && r.price === cheapest.price;

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
          tone: nearest?.pharmacy.id === r.pharmacy.id ? "nearest" : isCheapest(r) ? "best" : "default",
          price: r.price,
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, nearest?.pharmacy.id, cheapest?.price, hasSpread],
  );

  const focus = React.useMemo(
    () =>
      mapFocus(
        rows.filter((r) => r.pharmacy.location).map((r) => ({ ...r.pharmacy.location!, group: r.pharmacy.city })),
        user,
      ),
    [rows, user],
  );

  const visibleRows = expanded ? rows : rows.slice(0, INITIAL_ROWS);
  const hiddenCount = rows.length - visibleRows.length;

  const scrollToRow = (id: string) => rowRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  const selectFromMap = (id: string) => {
    setSelectedId(id);
    if (rowRefs.current.has(id)) scrollToRow(id);
    else {
      // строка скрыта за «Показать все» — раскрываем список и прокручиваем после отрисовки
      pendingScrollRef.current = id;
      setExpanded(true);
    }
  };
  React.useEffect(() => {
    const id = pendingScrollRef.current;
    if (expanded && id) {
      pendingScrollRef.current = null;
      scrollToRow(id);
    }
  }, [expanded]);
  const showOnMap = (id: string) => {
    setSelectedId(id);
    setReveal({ id });
    mapBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  // Рекомендация: «оптимальная» аптека среди тех, до которых известно расстояние
  const best = user ? rankOptimal(rows.filter((r) => r.distanceKm != null))[0] ?? null : null;

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
            reveal={reveal}
            clusterLabel={(group) => `от ${formatPriceShort(Math.min(...group.map((g) => g.price ?? Infinity)))}`}
            pickMode={pickMode}
            onPick={(p) => {
              location.setManual(p);
              setPickMode(false);
            }}
            className="h-72 sm:h-80"
          />
        </div>
      ) : null}

      {user && nearest?.distanceKm != null && best ? (
        <NearestSummary cards={summaryCards(nearest, best, cheapest).map((c) => ({ ...c, item: toSummary(c.row) }))} from={user} onSelect={showOnMap} />
      ) : null}

      {networks.length > 1 ? (
        <div role="group" aria-label="Сеть аптек" className={CHIP_ROW}>
          {[ALL, ...networks].map((n) => {
            const count = n === ALL ? offers.length : offers.filter((o) => o.pharmacy.network === n).length;
            return (
              <button
                key={n}
                type="button"
                aria-pressed={network === n}
                onClick={() => setNetwork(n)}
                className={cn(
                  CHIP,
                  network === n
                    ? "border-brand bg-brand text-brand-ink"
                    : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
                )}
              >
                {n === ALL ? "Все сети" : n}
                <span className={cn("num ml-1.5", network === n ? "text-brand-ink/90" : "text-ink-3")}>{count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        {cities.length > 1 ? (
          <div role="group" aria-label="Город" className={cn(CHIP_ROW, "w-full")}>
            {[ALL, ...cities].map((c) => {
              const count = c === ALL ? offers.length : offers.filter((o) => o.pharmacy.city === c).length;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={city === c}
                  onClick={() => setCity(c)}
                  className={cn(
                    CHIP,
                    city === c
                      ? "border-ink bg-ink text-bg"
                      : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
                  )}
                >
                  {c === ALL ? "Все города" : c}
                  <span className={cn("num ml-1.5", city === c ? "text-bg/80" : "text-ink-3")}>{count}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <span />
        )}
        {user ? (
          <div role="radiogroup" aria-label="Сортировка" className="inline-flex rounded-control border border-line bg-surface p-0.5">
            {SORTS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={sort === value}
                onClick={() => setSort(value)}
                className={cn(
                  "hit rounded-[8px] px-3 py-1 text-sm font-semibold transition-colors",
                  sort === value ? "bg-ink text-bg" : "text-ink-2 hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {user && sort === "best" ? (
        <p className="-mt-1 text-xs text-ink-2">
          Сначала ближайшие аптеки. Дальняя поднимается выше, только если она дешевле больше чем на{" "}
          {Math.round(NOTICEABLE_PCT * 100)}% или на {NOTICEABLE_RUB} руб.
        </p>
      ) : null}

      <ol className="divide-y divide-dashed divide-line rounded-card border border-line bg-surface shadow-card">
        {visibleRows.map((offer) => {
          const p = offer.pharmacy;
          const isBest = isCheapest(offer);
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
                <Link href={`/pharmacies/${p.id}`} className="hit min-w-0 shrink font-bold text-ink hover:text-brand">
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
                {offer.stockLevel === "low" ? (
                  <Badge tone="warn">Осталось мало</Badge>
                ) : offer.stockLevel === "high" ? (
                  <span className="text-ink-3">В наличии много</span>
                ) : null}
                {offer.distanceKm != null ? (
                  <span className="num font-semibold text-ink">{formatDistance(offer.distanceKm)}</span>
                ) : null}
                {p.hours ? <span className="text-ink-3">{p.hours}</span> : null}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-3 sm:gap-x-4">
                {p.phone ? (
                  <a href={telHref(p.phone)} className="hit inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-brand hover:underline">
                    <Phone className="size-4" aria-hidden /> {p.phone}
                  </a>
                ) : null}
                {p.location ? (
                  <>
                    <button
                      type="button"
                      onClick={() => showOnMap(p.id)}
                      className="hit inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-brand hover:underline"
                    >
                      <MapIcon className="size-4" aria-hidden /> На карте
                    </button>
                    <a
                      href={routeHref(p.location, user)}
                      target="_blank"
                      rel="noreferrer"
                      className="hit inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-brand hover:underline"
                    >
                      <Navigation className="size-4" aria-hidden /> Маршрут
                    </a>
                  </>
                ) : (
                  <a
                    href={mapHref(p.city, p.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="hit inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-brand hover:underline"
                  >
                    <MapPin className="size-4" aria-hidden /> На карте
                  </a>
                )}
                </div>
                <span className="w-full text-xs text-ink-3 sm:ml-auto sm:w-auto">Цена обновлена {formatUpdatedAt(offer.updatedAt)}</span>
              </div>
            </li>
          );
        })}
      </ol>
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-control border border-line-strong bg-surface text-sm font-semibold text-ink transition-colors hover:border-ink"
        >
          Показать ещё {countLabel(hiddenCount, "аптеку", "аптеки", "аптек")}
          <ChevronDown className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

/** Ряд фильтров: на телефоне — одна прокручиваемая строка, шире — с переносом. */
const CHIP_ROW =
  "-mx-4 flex gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0 [&::-webkit-scrollbar]:hidden";
const CHIP = "hit shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-sm font-semibold transition-colors";

/**
 * Карточки над списком. Если ближайшая аптека не заметно дороже самой выгодной — одна общая карточка,
 * иначе две: «Выгоднее» (дешевле заметно, но дальше) и «Ближайшая».
 */
function summaryCards(nearest: Row, best: Row, cheapest: Row | null): (Omit<SummaryCard, "item"> & { row: Row })[] {
  if (best.pharmacy.id === nearest.pharmacy.id) {
    const extra = cheapest ? nearest.price - cheapest.price : 0;
    return [
      {
        kind: "primary",
        label: "Ближе всех и по хорошей цене",
        note:
          extra > 0.005
            ? `Дороже самой низкой цены всего на ${formatPrice(extra)}`
            : "Здесь же самая низкая цена",
        row: nearest,
      },
    ];
  }
  const saving = nearest.price - best.price;
  const pct = Math.round((saving / nearest.price) * 100);
  const detour = best.distanceKm! - nearest.distanceKm!;
  return [
    {
      kind: "primary",
      label: "Выгоднее",
      note: `Дешевле ближайшей на ${formatPrice(saving)} (${pct}%), дальше на ${formatDistance(detour)}`,
      row: best,
    },
    { kind: "secondary", label: "Ближайшая к вам", row: nearest },
  ];
}