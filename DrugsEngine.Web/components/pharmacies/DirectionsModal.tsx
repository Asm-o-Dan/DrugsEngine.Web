"use client";

import * as React from "react";
import { PharmacyDto, DirectionsResponse } from "@/contracts/contracts";
import { apiClient } from "@/lib/apiClient";
import {
  X,
  Car,
  Footprints,
  Bus,
  Navigation,
  MapPin,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: PharmacyDto | null;
  userLocation?: { lat: number; lng: number };
}

export function DirectionsModal({
  isOpen,
  onClose,
  pharmacy,
  userLocation = { lat: 55.7558, lng: 37.6173 },
}: DirectionsModalProps) {
  const [travelMode, setTravelMode] = React.useState<"driving" | "transit" | "walking">("driving");
  const [directions, setDirections] = React.useState<DirectionsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && pharmacy) {
      setIsLoading(true);
      apiClient
        .getDirections(pharmacy.id, userLocation.lat, userLocation.lng, travelMode)
        .then((res) => setDirections(res))
        .catch(() => setDirections(null))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, pharmacy, userLocation, travelMode]);

  if (!isOpen || !pharmacy) return null;

  const yandexMapsUrl = `https://yandex.ru/maps/?rtext=${userLocation.lat},${userLocation.lng}~${pharmacy.location.lat},${pharmacy.location.lng}&rtt=${
    travelMode === "walking" ? "pd" : travelMode === "transit" ? "mt" : "auto"
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-200 space-y-6">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Маршрут до аптеки
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {pharmacy.displayName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {pharmacy.address.formatted}
          </p>
        </div>

        {/* Travel Mode Switcher */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "driving", label: "На авто", icon: Car },
            { id: "transit", label: "Транспорт", icon: Bus },
            { id: "walking", label: "Пешком", icon: Footprints },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = travelMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setTravelMode(mode.id as any)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
                )}
              >
                <Icon className={cn("h-4 w-4", isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Route Stats Box */}
        {isLoading ? (
          <div className="flex h-32 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : directions ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                    ~{directions.durationMinutes} мин
                  </span>
                  <span className="text-xs text-slate-400 block font-mono">
                    {directions.distanceKm} км от вас
                  </span>
                </div>
              </div>

              <Badge
                variant={
                  directions.trafficLevel === "LOW"
                    ? "generic"
                    : directions.trafficLevel === "MODERATE"
                    ? "prescription"
                    : "destructive"
                }
                className="text-[11px]"
              >
                {directions.trafficLevel === "LOW"
                  ? "Свободно"
                  : directions.trafficLevel === "MODERATE"
                  ? "Умеренный трафик"
                  : "Пробки"}
              </Badge>
            </div>

            {/* Navigation Steps */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Пошаговые указания
              </span>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {directions.navigationSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Action button: Open in Yandex Maps */}
        <div className="pt-2">
          <Button
            asChild
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md shadow-emerald-600/20"
          >
            <a href={yandexMapsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-4 w-4" />
              Открыть в Яндекс.Картах
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
