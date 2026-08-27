"use client";

import * as React from "react";
import { Filter, RotateCcw, Check, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { SearchFacetItem } from "@/contracts/contracts";

export interface FilterState {
  category?: string;
  manufacturer?: string;
  dosageForm?: string;
  prescriptionStatus?: "all" | "otc" | "rx";
  inStockOnly: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy: "relevance" | "price_asc" | "price_desc" | "name_asc" | "similarity_desc";
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  facets?: {
    categories?: SearchFacetItem[];
    manufacturers?: SearchFacetItem[];
  };
  totalResults?: number;
  className?: string;
}

const DOSAGE_FORMS = [
  "Все формы",
  "Таблетки",
  "Капсулы",
  "Гранулы",
  "Раствор",
];

export function FilterPanel({
  filters,
  onFilterChange,
  onResetFilters,
  facets,
  totalResults,
  className,
}: FilterPanelProps) {
  const [isOpenMobile, setIsOpenMobile] = React.useState(false);
  const [showAllManufacturers, setShowAllManufacturers] = React.useState(false);

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.manufacturer ? 1 : 0) +
    (filters.dosageForm && filters.dosageForm !== "Все формы" ? 1 : 0) +
    (filters.prescriptionStatus && filters.prescriptionStatus !== "all" ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.sortBy !== "relevance" ? 1 : 0);

  const manufacturers = facets?.manufacturers || [
    { name: "Reckitt Benckiser", count: 1 },
    { name: "Berlin-Chemie / Menarini", count: 1 },
    { name: "Синтез АКОС", count: 1 },
    { name: "Menarini", count: 1 },
    { name: "Фармстандарт", count: 1 },
    { name: "Sandoz", count: 1 },
    { name: "Dr. Reddy's", count: 1 },
    { name: "KRKA", count: 1 },
    { name: "Teva", count: 1 },
  ];

  const visibleManufacturers = showAllManufacturers
    ? manufacturers
    : manufacturers.slice(0, 5);

  const categories = facets?.categories || [
    { name: "Нестероидные противовоспалительные препараты (НПВП)", count: 4 },
    { name: "Анальгетики и антипиретики", count: 1 },
    { name: "Антибактериальные препараты", count: 1 },
    { name: "Ингибиторы протонной помпы", count: 1 },
    { name: "Гиполипидемические средства", count: 1 },
    { name: "Гипогликемические средства", count: 1 },
  ];

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm", className)}>
      {/* Mobile Toggle Button */}
      <div className="flex lg:hidden items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"
        >
          <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Параметры фильтрации</span>
          {activeFilterCount > 0 && (
            <Badge variant="generic" className="h-5 px-1.5 text-[11px]">
              {activeFilterCount}
            </Badge>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-rose-500 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Сбросить
          </button>
        )}
      </div>

      {/* Filter Body (Always visible on Desktop, collapsible on Mobile) */}
      <div className={cn("space-y-6 pt-2 lg:pt-0 lg:block", isOpenMobile ? "block" : "hidden lg:block")}>
        {/* Header (Desktop) */}
        <div className="hidden lg:flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Фильтры каталога</h3>
            {activeFilterCount > 0 && (
              <Badge variant="generic" className="h-5 px-1.5 text-[11px]">
                {activeFilterCount}
              </Badge>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Сбросить
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Сортировка
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                sortBy: e.target.value as FilterState["sortBy"],
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
          >
            <option value="relevance">По релевантности / AI скору</option>
            <option value="price_asc">Сначала дешевле</option>
            <option value="price_desc">Сначала дороже</option>
            <option value="name_asc">По названию (А-Я)</option>
            <option value="similarity_desc">По сходству векторов (Qdrant)</option>
          </select>
        </div>

        {/* In Stock Only Switch */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">Только в наличии</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">С остатком в аптеках Москвы</span>
          </div>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly })}
            className={cn(
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              filters.inStockOnly ? "bg-emerald-600 dark:bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                filters.inStockOnly ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Prescription Status */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Условия отпуска
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "all", label: "Все" },
              { id: "otc", label: "Без рецепта" },
              { id: "rx", label: "По рецепту" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    prescriptionStatus: p.id as FilterState["prescriptionStatus"],
                  })
                }
                className={cn(
                  "rounded-lg border px-2 py-1.5 text-xs font-medium text-center transition-all",
                  (filters.prescriptionStatus || "all") === p.id
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dosage Form Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Форма выпуска
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DOSAGE_FORMS.map((form) => {
              const isSelected =
                (filters.dosageForm === form) ||
                (!filters.dosageForm && form === "Все формы");
              return (
                <button
                  key={form}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      dosageForm: form === "Все формы" ? undefined : form,
                    })
                  }
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  )}
                >
                  {form}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Диапазон цен (₽)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="От 50"
              value={filters.minPrice !== undefined ? filters.minPrice : ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  minPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
            />
            <span className="text-xs text-slate-400">—</span>
            <input
              type="number"
              placeholder="До 1000"
              value={filters.maxPrice !== undefined ? filters.maxPrice : ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  maxPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
            />
          </div>
        </div>

        {/* Manufacturer Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Производитель
          </label>
          <div className="space-y-1">
            {visibleManufacturers.map((m, idx) => {
              const name = m.name || m.code || "Неизвестно";
              const isSelected = filters.manufacturer === name;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      manufacturer: isSelected ? undefined : name,
                    })
                  }
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors text-left",
                    isSelected
                      ? "bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                  )}
                >
                  <span className="truncate">{name}</span>
                  <span className="ml-1 text-[11px] text-slate-400">({m.count})</span>
                </button>
              );
            })}
          </div>
          {manufacturers.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllManufacturers(!showAllManufacturers)}
              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
            >
              {showAllManufacturers ? (
                <>
                  Свернуть <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Показать еще {manufacturers.length - 5} <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Фармакологическая группа
          </label>
          <div className="space-y-1">
            {categories.map((c, idx) => {
              const name = c.name || "Прочие";
              const isSelected = filters.category === name;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      category: isSelected ? undefined : name,
                    })
                  }
                  className={cn(
                    "flex w-full items-start justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors text-left",
                    isSelected
                      ? "bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                  )}
                >
                  <span className="line-clamp-2 leading-tight">{name}</span>
                  <span className="ml-1 flex-shrink-0 text-[11px] text-slate-400">({c.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
