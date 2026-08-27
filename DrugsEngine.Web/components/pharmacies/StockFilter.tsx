"use client";

import * as React from "react";
import { Search, MapPin, SlidersHorizontal, RotateCcw, Building2, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MOCK_DRUGS } from "@/lib/mockData";

export interface PharmacyFilterState {
  drugId?: string;
  network?: string;
  radiusKm: number;
  inStockOnly: boolean;
  isOpenNow: boolean;
  searchQuery: string;
}

interface StockFilterProps {
  filters: PharmacyFilterState;
  onFilterChange: (filters: PharmacyFilterState) => void;
  onResetFilters: () => void;
  className?: string;
}

const RADIUS_OPTIONS = [1, 2, 5, 10, 25];
const NETWORKS = [
  "Все сети",
  "Ригла",
  "Апрель",
  "Планета Здоровья",
  "36.6",
  "Столички",
  "Доктор Столетов",
];

export function StockFilter({
  filters,
  onFilterChange,
  onResetFilters,
  className,
}: StockFilterProps) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
            Фильтр аптек & Наличия
          </h3>
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Сбросить
        </button>
      </div>

      {/* Drug Selector Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Pill className="h-3.5 w-3.5 text-emerald-500" />
          Проверяемый препарат
        </label>
        <select
          value={filters.drugId || ""}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              drugId: e.target.value || undefined,
            })
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
        >
          <option value="">Все препараты (Общий каталог)</option>
          {MOCK_DRUGS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} (от {d.pricingSummary.minPrice} ₽)
            </option>
          ))}
        </select>
      </div>

      {/* Search within pharmacies */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Поиск по названию или улице..."
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
        />
      </div>

      {/* Pharmacy Network selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-sky-500" />
          Аптечная сеть
        </label>
        <select
          value={filters.network || "Все сети"}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              network: e.target.value === "Все сети" ? undefined : e.target.value,
            })
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
        >
          {NETWORKS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Radius selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-amber-500" />
            Радиус поиска
          </label>
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {filters.radiusKm} км
          </span>
        </div>

        <div className="flex gap-1.5">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onFilterChange({ ...filters, radiusKm: r })}
              className={cn(
                "flex-1 rounded-lg border py-1 text-xs font-semibold transition-all",
                filters.radiusKm === r
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              )}
            >
              {r} км
            </button>
          ))}
        </div>
      </div>

      {/* Toggle switches */}
      <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        {/* In Stock Only */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Только в наличии
          </span>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly })}
            className={cn(
              "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              filters.inStockOnly ? "bg-emerald-600 dark:bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                filters.inStockOnly ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Open 24/7 / Open Now */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Открыто сейчас
          </span>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, isOpenNow: !filters.isOpenNow })}
            className={cn(
              "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              filters.isOpenNow ? "bg-emerald-600 dark:bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                filters.isOpenNow ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
