"use client";

import * as React from "react";
import { PharmacyDto } from "@/contracts/contracts";
import {
  MapPin,
  Clock,
  Phone,
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Navigation,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PharmacyCardProps {
  pharmacy: PharmacyDto;
  isSelected?: boolean;
  onSelect?: () => void;
  onReserve?: () => void;
  onGetDirections?: () => void;
}

export function PharmacyCard({
  pharmacy,
  isSelected = false,
  onSelect,
  onReserve,
  onGetDirections,
}: PharmacyCardProps) {
  const inv = pharmacy.inventory;
  const stockLevel = inv?.stockLevel || "IN_STOCK";

  const stockBadgeConfig = {
    IN_STOCK: {
      label: inv ? `В наличии: ${inv.quantity} уп.` : "В наличии",
      variant: "inStock" as const,
      icon: CheckCircle2,
      textColor: "text-emerald-700 dark:text-emerald-300",
    },
    LOW_STOCK: {
      label: inv ? `Мало: ${inv.quantity} уп.` : "Осталось мало",
      variant: "lowStock" as const,
      icon: AlertTriangle,
      textColor: "text-amber-700 dark:text-amber-300",
    },
    OUT_OF_STOCK: {
      label: "Нет в наличии",
      variant: "outOfStock" as const,
      icon: XCircle,
      textColor: "text-rose-700 dark:text-rose-300",
    },
    ON_DEMAND: {
      label: "Под заказ (1 день)",
      variant: "onDemand" as const,
      icon: Sparkles,
      textColor: "text-sky-700 dark:text-sky-300",
    },
  }[stockLevel];

  const StockIcon = stockBadgeConfig.icon;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all cursor-pointer dark:bg-slate-900",
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md dark:border-emerald-400 dark:ring-emerald-400/20"
          : "border-slate-200 hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700"
      )}
    >
      <div className="space-y-3">
        {/* Top bar: Network & Distance */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {pharmacy.displayName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {pharmacy.address.formatted}
            </p>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
              <MapPin className="h-3 w-3 text-amber-500" />
              {pharmacy.location.distanceKm} км
            </span>
          </div>
        </div>

        {/* Working hours & Contact */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className={pharmacy.workingHours.isOpenNow ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>
              {pharmacy.workingHours.schedule}
            </span>
          </span>
          <span>•</span>
          <a
            href={`tel:${pharmacy.phoneNumber}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 font-mono transition-colors"
          >
            <Phone className="h-3 w-3 text-slate-400" />
            {pharmacy.phoneNumber}
          </a>
        </div>

        {/* Inventory and Stock Status Card */}
        {inv && (
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 flex items-center justify-between border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Badge variant={stockBadgeConfig.variant} className="gap-1 text-xs">
                <StockIcon className="h-3.5 w-3.5" />
                <span>{stockBadgeConfig.label}</span>
              </Badge>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                {inv.price} ₽
              </span>
              <span className="text-[10px] text-slate-400">/ уп.</span>
            </div>
          </div>
        )}

        {/* Features pills */}
        {pharmacy.features && (
          <div className="flex flex-wrap gap-1 pt-1">
            {pharmacy.features.slice(0, 3).map((feat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              >
                {feat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onGetDirections?.();
          }}
          className="text-xs gap-1.5 h-8"
        >
          <Navigation className="h-3.5 w-3.5 text-sky-500" />
          Маршрут
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={stockLevel === "OUT_OF_STOCK"}
          onClick={(e) => {
            e.stopPropagation();
            onReserve?.();
          }}
          className={cn(
            "text-xs gap-1.5 h-8",
            stockLevel === "OUT_OF_STOCK"
              ? "opacity-50 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Забронировать
        </Button>
      </div>
    </div>
  );
}
