"use client";

import * as React from "react";
import { PharmacyDto } from "@/contracts/contracts";
import {
  MapPin,
  Plus,
  Minus,
  Crosshair,
  Navigation,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PharmacyMapProps {
  pharmacies: PharmacyDto[];
  selectedPharmacyId?: string;
  onSelectPharmacy: (id: string) => void;
  onReservePharmacy?: (pharmacy: PharmacyDto) => void;
  onGetDirections?: (pharmacy: PharmacyDto) => void;
  center?: { lat: number; lng: number };
  className?: string;
}

export function PharmacyMap({
  pharmacies,
  selectedPharmacyId,
  onSelectPharmacy,
  onReservePharmacy,
  onGetDirections,
  center = { lat: 55.7558, lng: 37.6173 },
  className,
}: PharmacyMapProps) {
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [showLegend, setShowLegend] = React.useState(true);

  // Convert lat/lng to SVG canvas percentage coordinates (around Moscow center 55.74 to 55.80, 37.54 to 37.66)
  const minLat = 55.735;
  const maxLat = 55.805;
  const minLng = 37.545;
  const maxLng = 37.665;

  const projectCoord = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  const userPos = projectCoord(center.lat, center.lng);
  const selectedPharmacy = pharmacies.find((p) => p.id === selectedPharmacyId);

  const getPinColor = (stockLevel?: string) => {
    switch (stockLevel) {
      case "LOW_STOCK":
        return "#F59E0B"; // Amber
      case "OUT_OF_STOCK":
        return "#EF4444"; // Rose
      case "ON_DEMAND":
        return "#0284C7"; // Sky
      case "IN_STOCK":
      default:
        return "#10B981"; // Emerald
    }
  };

  return (
    <div
      className={cn(
        "relative h-full min-h-[460px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-sm dark:border-slate-800",
        className
      )}
    >
      {/* Interactive SVG Canvas */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg
          viewBox="0 0 800 600"
          className="h-full w-full object-cover select-none pointer-events-auto"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Background Grid & City Background */}
          <rect width="800" height="600" fill="#0b1329" />

          {/* District Zones */}
          <circle cx="400" cy="300" r="260" fill="#0f1f3d" fillOpacity="0.4" />
          <circle cx="400" cy="300" r="160" fill="#13274f" fillOpacity="0.4" />
          <circle cx="400" cy="300" r="80" fill="#173163" fillOpacity="0.5" />

          {/* Moskva River Stylized Curve */}
          <path
            d="M 50 480 Q 200 450, 320 380 T 420 280 T 600 240 T 780 180"
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="32"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />
          <path
            d="M 50 480 Q 200 450, 320 380 T 420 280 T 600 240 T 780 180"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="12"
            strokeLinecap="round"
            strokeOpacity="0.25"
          />

          {/* Garden Ring Road */}
          <ellipse
            cx="400"
            cy="300"
            rx="220"
            ry="170"
            fill="none"
            stroke="#334155"
            strokeWidth="3.5"
            strokeDasharray="8 4"
          />
          <text x="400" y="125" fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
            Садовое кольцо
          </text>

          {/* Boulevard Ring */}
          <ellipse
            cx="400"
            cy="300"
            rx="130"
            ry="100"
            fill="none"
            stroke="#475569"
            strokeWidth="2.5"
          />
          <text x="400" y="195" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
            Бульварное кольцо
          </text>

          {/* Main Radial Avenues */}
          <line x1="400" y1="300" x2="400" y2="40" stroke="#334155" strokeWidth="2.5" />
          <text x="415" y="70" fill="#64748b" fontSize="9" fontFamily="sans-serif">Тверская ул.</text>

          <line x1="400" y1="300" x2="160" y2="220" stroke="#334155" strokeWidth="2.5" />
          <text x="180" y="240" fill="#64748b" fontSize="9" fontFamily="sans-serif">Новый Арбат</text>

          <line x1="400" y1="300" x2="620" y2="280" stroke="#334155" strokeWidth="2.5" />
          <text x="560" y="270" fill="#64748b" fontSize="9" fontFamily="sans-serif">Маросейка</text>

          <line x1="400" y1="300" x2="520" y2="80" stroke="#334155" strokeWidth="2.5" />
          <text x="500" y="110" fill="#64748b" fontSize="9" fontFamily="sans-serif">Пр-т Мира</text>

          <line x1="400" y1="300" x2="220" y2="80" stroke="#334155" strokeWidth="2.5" />
          <text x="240" y="100" fill="#64748b" fontSize="9" fontFamily="sans-serif">Ленинградский пр-т</text>

          {/* Metro Landmarks */}
          <circle cx="400" cy="300" r="4" fill="#ef4444" />
          <text x="400" y="316" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            Охотный Ряд
          </text>

          {/* User Location Radar Wave */}
          <g transform={`translate(${(userPos.x / 100) * 800}, ${(userPos.y / 100) * 600})`}>
            <circle cx="0" cy="0" r="28" fill="#0284c7" fillOpacity="0.2" className="animate-ping" />
            <circle cx="0" cy="0" r="14" fill="#0284c7" fillOpacity="0.4" />
            <circle cx="0" cy="0" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="-12" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              Вы здесь
            </text>
          </g>

          {/* Pharmacy Pins */}
          {pharmacies.map((pharmacy) => {
            const pos = projectCoord(pharmacy.location.lat, pharmacy.location.lng);
            const svgX = (pos.x / 100) * 800;
            const svgY = (pos.y / 100) * 600;
            const isSelected = pharmacy.id === selectedPharmacyId;
            const pinColor = getPinColor(pharmacy.inventory?.stockLevel);

            return (
              <g
                key={pharmacy.id}
                transform={`translate(${svgX}, ${svgY})`}
                onClick={() => onSelectPharmacy(pharmacy.id)}
                className="cursor-pointer transition-transform hover:scale-125 duration-150"
                style={{ transformOrigin: `${svgX}px ${svgY}px` }}
              >
                {/* Pulse ring if selected */}
                {isSelected && (
                  <circle
                    cx="0"
                    cy="-14"
                    r="24"
                    fill={pinColor}
                    fillOpacity="0.3"
                    className="animate-ping"
                  />
                )}

                {/* Pin shadow */}
                <ellipse cx="0" cy="0" rx="7" ry="3" fill="#000000" fillOpacity="0.5" />

                {/* Pin body */}
                <path
                  d="M 0 0 C -8 -14, -14 -20, -14 -30 C -14 -39, -7 -46, 0 -46 C 7 -46, 14 -39, 14 -30 C 14 -20, 8 -14, 0 0 Z"
                  fill={pinColor}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                />

                {/* Inner white circle with cross */}
                <circle cx="0" cy="-30" r="6" fill="#ffffff" />
                <path
                  d="M -3 -30 L 3 -30 M 0 -33 L 0 -27"
                  stroke={pinColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Pharmacy Name Tag */}
                <rect
                  x="-45"
                  y="-62"
                  width="90"
                  height="14"
                  rx="4"
                  fill="#0f172a"
                  fillOpacity="0.85"
                  stroke={isSelected ? pinColor : "#334155"}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-52"
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {pharmacy.displayName.replace("Аптека ", "")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Pharmacy Callout Card Popup (Bottom Left) */}
      {selectedPharmacy && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-30 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge
                  variant={
                    selectedPharmacy.inventory?.stockLevel === "LOW_STOCK"
                      ? "lowStock"
                      : selectedPharmacy.inventory?.stockLevel === "OUT_OF_STOCK"
                      ? "outOfStock"
                      : "inStock"
                  }
                  className="mb-1 text-[10px]"
                >
                  {selectedPharmacy.inventory
                    ? `${selectedPharmacy.inventory.quantity} уп. в наличии`
                    : "В наличии"}
                </Badge>
                <h4 className="font-bold text-sm leading-tight text-white">
                  {selectedPharmacy.displayName}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {selectedPharmacy.address.formatted}
                </p>
              </div>

              {selectedPharmacy.inventory && (
                <div className="text-right flex-shrink-0">
                  <span className="font-mono text-base font-extrabold text-emerald-400">
                    {selectedPharmacy.inventory.price} ₽
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span className="flex items-center gap-1 font-mono">
                <MapPin className="h-3 w-3 text-amber-400" />
                {selectedPharmacy.location.distanceKm} км от вас
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                {selectedPharmacy.workingHours.isOpenNow ? "Открыто сейчас" : "Закрыто"}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGetDirections?.(selectedPharmacy)}
                className="flex-1 text-xs h-7 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                <Navigation className="h-3 w-3 mr-1 text-sky-400" /> Маршрут
              </Button>

              <Button
                size="sm"
                onClick={() => onReservePharmacy?.(selectedPharmacy)}
                className="flex-1 text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <ShieldCheck className="h-3 w-3 mr-1" /> Забронировать
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 p-1 backdrop-blur-md shadow-lg">
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.2))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Приблизить"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Отдалить"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel(1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border-t border-slate-800"
          title="Сбросить масштаб"
        >
          <Crosshair className="h-4 w-4 text-emerald-400" />
        </button>
      </div>

      {/* Map Legend (Top Left) */}
      {showLegend && (
        <div className="absolute top-4 left-4 z-20 hidden sm:block rounded-xl border border-slate-700 bg-slate-900/85 p-2.5 text-white backdrop-blur-md shadow-lg text-[11px] space-y-1.5">
          <span className="font-semibold text-slate-300 block text-[10px] uppercase tracking-wider">
            Статус наличия
          </span>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">В наличии (&gt;5 уп.)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Мало (1-4 уп.)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300">Нет в наличии</span>
          </div>
        </div>
      )}
    </div>
  );
}
