"use client";

import * as React from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/lib/geo";
import { cn } from "@/lib/utils";

export interface MapPoint extends LatLng {
  id: string;
  /** Текст на маркере (цена или номер аптеки). */
  label: string;
  /** Подсказка при наведении. */
  title: string;
  tone?: "default" | "best" | "nearest";
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
export function PharmacyMap({ points, user, selectedId, onSelect, pickMode, onPick, className, focus, ariaLabel }: PharmacyMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<Leaflet.Map | null>(null);
  const LRef = React.useRef<typeof Leaflet | null>(null);
  const markersRef = React.useRef(new Map<string, Leaflet.Marker>());
  const layerRef = React.useRef<Leaflet.LayerGroup | null>(null);
  const userLayerRef = React.useRef<Leaflet.LayerGroup | null>(null);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

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
        layerRef.current = L.layerGroup().addTo(map);
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

  // Маркеры аптек
  React.useEffect(() => {
    const L = LRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !layer) return;
    layer.clearLayers();
    markersRef.current.clear();
    for (const p of points) {
      const icon = L.divIcon({
        className: "",
        html: `<span class="map-pin map-pin--${p.tone ?? "default"}" title="${escapeHtml(p.title)}">${escapeHtml(p.label)}</span>`,
        iconSize: undefined,
        iconAnchor: [0, 0],
      });
      const marker = L.marker([p.lat, p.lng], { icon, keyboard: true, title: p.title, riseOnHover: true })
        .on("click", () => onSelectRef.current?.(p.id))
        .addTo(layer);
      markersRef.current.set(p.id, marker);
    }
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

  // Выделение выбранной аптеки
  React.useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement()?.querySelector(".map-pin");
      el?.classList.toggle("map-pin--selected", id === selectedId);
      marker.setZIndexOffset(id === selectedId ? 900 : 0);
    });
    const selected = selectedId ? markersRef.current.get(selectedId) : null;
    if (selected && !map.getBounds().pad(-0.1).contains(selected.getLatLng())) {
      map.panTo(selected.getLatLng(), { animate: true });
    }
  }, [selectedId, ready, points]);

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
