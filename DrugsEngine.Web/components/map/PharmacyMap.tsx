"use client";

import * as React from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import type { LatLng } from "@/lib/geo";
import { cn } from "@/lib/utils";

export interface MapPoint extends LatLng {
  id: string;
  /** Текст на маркере (цена или номер аптеки). */
  label: string;
  /** Подсказка при наведении. */
  title: string;
  tone?: "default" | "best" | "nearest";
  /** Цена: для подписи группы «от …». */
  price?: number;
}

interface PharmacyMapProps {
  points: MapPoint[];
  user?: LatLng | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Режим «укажите на карте, где вы»: клик по карте вызывает onPick. */
  pickMode?: boolean;
  onPick?: (p: LatLng) => void;
  className?: string;
  /** Точки, под которые подгоняется масштаб. По умолчанию — все точки и пользователь. */
  focus?: LatLng[];
  /** Заголовок карты для скринридеров. */
  ariaLabel: string;
  /** Явный запрос «покажи на карте»: раскрывает группу маркеров с этой аптекой. Новый объект — новый запрос. */
  reveal?: { id: string } | null;
  /** Подпись группы близко стоящих маркеров. По умолчанию — их количество. */
  clusterLabel?: (points: MapPoint[]) => string;
}

const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Карта аптек на Leaflet + OpenStreetMap. Leaflet работает только в браузере,
 * поэтому библиотека загружается динамически после монтирования.
 */
const TONE_ORDER: NonNullable<MapPoint["tone"]>[] = ["nearest", "best", "default"];

export function PharmacyMap({
  points,
  user,
  selectedId,
  onSelect,
  pickMode,
  onPick,
  className,
  focus,
  ariaLabel,
  reveal,
  clusterLabel,
}: PharmacyMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<Leaflet.Map | null>(null);
  const LRef = React.useRef<typeof Leaflet | null>(null);
  const markersRef = React.useRef(new Map<string, Leaflet.Marker>());
  const pointOf = React.useRef(new WeakMap<Leaflet.Marker, MapPoint>());
  const layerRef = React.useRef<Leaflet.MarkerClusterGroup | null>(null);
  const userLayerRef = React.useRef<Leaflet.LayerGroup | null>(null);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const clusterLabelRef = React.useRef(clusterLabel);
  clusterLabelRef.current = clusterLabel;
  const onSelectRef = React.useRef(onSelect);
  const onPickRef = React.useRef(onPick);
  const pickModeRef = React.useRef(pickMode);
  onSelectRef.current = onSelect;
  onPickRef.current = onPick;
  pickModeRef.current = pickMode;

  // Инициализация карты
  React.useEffect(() => {
    let cancelled = false;
    import("leaflet")
      .then((mod) => {
        if (cancelled || !containerRef.current) return;
        const L = (mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet);
        // плагин группировки расширяет глобальный L
        (window as unknown as { L: typeof Leaflet }).L = L;
        return import("leaflet.markercluster").then(() => L);
      })
      .then((L) => {
        if (cancelled || !L || !containerRef.current) return;
        // Маркеры не попадают в порядок Tab: у каждой строки списка есть кнопка «На карте»,
        // а 90 остановок на карте отрезали бы список от клавиатуры. Распространяется и на группы.
        L.Marker.mergeOptions({ keyboard: false });
        LRef.current = L;
        const map = L.map(containerRef.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false });
        L.control.zoom({ position: "topright", zoomInTitle: "Приблизить", zoomOutTitle: "Отдалить" }).addTo(map);
        map.attributionControl.setPrefix(false);
        L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
        map.setView([46.84, 29.63], 12);
        map.on("click", (e: Leaflet.LeafletMouseEvent) => {
          if (pickModeRef.current) onPickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
        // колесо мыши включаем только после клика по карте, чтобы не мешать прокрутке страницы
        map.on("focus click", () => map.scrollWheelZoom.enable());
        map.on("blur mouseout", () => map.scrollWheelZoom.disable());
        layerRef.current = L.markerClusterGroup({
          maxClusterRadius: 64,
          disableClusteringAtZoom: 16,
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          iconCreateFunction: (cluster) => {
            const children = cluster.getAllChildMarkers().map((m) => pointOf.current.get(m)).filter((p): p is MapPoint => !!p);
            const tone = TONE_ORDER.find((t) => children.some((c) => (c.tone ?? "default") === t)) ?? "default";
            const label = clusterLabelRef.current?.(children) ?? String(children.length);
            return L.divIcon({
              className: "",
              html: `<span class="map-pin map-pin--cluster map-pin--${tone}" title="${children.length} — приблизить">${escapeHtml(label)}<span class="map-pin__count">${children.length}</span></span>`,
              iconSize: undefined,
              iconAnchor: [0, 0],
            });
          },
        }).addTo(map);
        userLayerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        setReady(true);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Маркеры аптек. Выделение зашито в иконку: маркер внутри группы не имеет DOM-элемента,
  // и класс, добавленный напрямую, потерялся бы при раскрытии группы.
  const iconFor = (L: typeof Leaflet, p: MapPoint, selected: boolean) =>
    L.divIcon({
      className: "",
      html: `<span class="map-pin map-pin--${p.tone ?? "default"}${selected ? " map-pin--selected" : ""}" title="${escapeHtml(p.title)}">${escapeHtml(p.label)}</span>`,
      iconSize: undefined,
      iconAnchor: [0, 0],
    });
  const selectedIdRef = React.useRef(selectedId);
  selectedIdRef.current = selectedId;
  const shownSelectedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const L = LRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !layer) return;
    layer.clearLayers();
    markersRef.current.clear();
    const selected = selectedIdRef.current ?? null;
    for (const p of points) {
      const isSelected = p.id === selected;
      const marker = L.marker([p.lat, p.lng], {
        icon: iconFor(L, p, isSelected),
        keyboard: false,
        title: p.title,
        riseOnHover: true,
        zIndexOffset: isSelected ? 900 : 0,
      }).on("click", () => onSelectRef.current?.(p.id));
      pointOf.current.set(marker, p);
      markersRef.current.set(p.id, marker);
    }
    shownSelectedRef.current = selected;
    layer.addLayers([...markersRef.current.values()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, ready]);

  // Подгоняем масштаб под точки фокуса, когда меняется набор
  const focusPoints: LatLng[] = focus ?? [...points, ...(user ? [user] : [])];
  const fitKey = focusPoints.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join("|");
  React.useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map || focusPoints.length === 0) return;
    const latlngs = focusPoints.map((p) => L.latLng(p.lat, p.lng));
    if (latlngs.length === 1) map.setView(latlngs[0], 15);
    else map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, ready]);

  // Пользователь
  React.useEffect(() => {
    const L = LRef.current;
    const layer = userLayerRef.current;
    if (!ready || !L || !layer) return;
    layer.clearLayers();
    if (!user) return;
    L.marker([user.lat, user.lng], {
      icon: L.divIcon({ className: "", html: '<span class="map-user" title="Вы здесь"></span>', iconAnchor: [0, 0] }),
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(layer);
  }, [user, ready]);

  // Выделение выбранной аптеки: перерисовываем только прежний и новый маркер
  React.useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;
    const next = selectedId ?? null;
    const prev = shownSelectedRef.current;
    if (prev !== next) {
      for (const [id, on] of [[prev, false], [next, true]] as const) {
        const marker = id ? markersRef.current.get(id) : null;
        const point = marker ? pointOf.current.get(marker) : null;
        if (!marker || !point) continue;
        marker.setIcon(iconFor(L, point, on));
        marker.setZIndexOffset(on ? 900 : 0);
      }
      shownSelectedRef.current = next;
    }
    const selected = next ? markersRef.current.get(next) : null;
    if (selected && !map.getBounds().pad(-0.1).contains(selected.getLatLng())) {
      map.panTo(selected.getLatLng(), { animate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, ready, points]);

  // «На карте»: раскрываем группу, в которой спрятана аптека
  React.useEffect(() => {
    const layer = layerRef.current;
    const marker = reveal ? markersRef.current.get(reveal.id) : null;
    if (!ready || !layer || !marker) return;
    layer.zoomToShowLayer(marker);
  }, [reveal, ready]);

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-card border border-line bg-surface-2",
        pickMode && "map-picking",
        className,
      )}
    >
      {/* className контейнера не должен меняться после монтирования: Leaflet добавляет туда свои классы */}
      <div ref={containerRef} role="region" aria-label={ariaLabel} className="h-full w-full" />
      {!ready && !failed ? <div className="absolute inset-0 animate-pulse bg-surface-2" aria-hidden /> : null}
      {failed ? (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-ink-2">Карта не загрузилась.</div>
      ) : null}
      {pickMode ? (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-[500] flex justify-center">
          <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-bg shadow-pop">Нажмите на карту там, где вы находитесь</span>
        </div>
      ) : null}
    </div>
  );
}
