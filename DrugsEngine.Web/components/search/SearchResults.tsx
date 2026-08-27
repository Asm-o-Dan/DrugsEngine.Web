"use client";

import * as React from "react";
import Link from "next/link";
import {
  SearchDrugItem,
  SearchMode,
} from "@/contracts/contracts";
import {
  Pill,
  MapPin,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  SearchX,
  Building2,
  Globe,
  RotateCcw,
  Zap,
  TrendingUp,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchResultsProps {
  status: "idle" | "loading" | "error" | "empty" | "success";
  items: SearchDrugItem[];
  total: number;
  page: number;
  totalPages: number;
  executionTimeMs: number;
  query: string;
  mode: SearchMode;
  errorMessage?: string;
  onRetry?: () => void;
  onPageChange?: (newPage: number) => void;
  onSelectQuery?: (query: string) => void;
  onSwitchToSemantic?: () => void;
}

const POPULAR_QUERIES = [
  "Ибупрофен",
  "Нурофен",
  "МИГ 400",
  "Омез",
  "Амоксиклав",
  "Аторвастатин",
  "Парацетамол",
  "Метформин",
  "Дексалгин",
];

export function SearchResults({
  status,
  items,
  total,
  page,
  totalPages,
  executionTimeMs,
  query,
  mode,
  errorMessage,
  onRetry,
  onPageChange,
  onSelectQuery,
  onSwitchToSemantic,
}: SearchResultsProps) {
  // 1. Idle State
  if (status === "idle") {
    return (
      <div className="space-y-8 py-6">
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center bg-slate-50/50 dark:bg-slate-900/30">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Интеллектуальный поиск медикаментов и дженериков
          </h3>
          <p className="mt-2 max-w-lg mx-auto text-sm text-slate-500 dark:text-slate-400">
            Введите название препарата, действующее вещество (МНН) или симптом. Наша модель векторизации найдет точные совпадения и биоэквивалентные аналоги.
          </p>

          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Популярные поисковые запросы:
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_QUERIES.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectQuery?.(tag)}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <Zap className="h-4 w-4" />
              <span>Супербыстрый поиск</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Триграммный индекс PostgreSQL BM25 обеспечивает отклик менее 20 мс при миллионах записей.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Qdrant 768-dim Vectors</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Понимание симптомов, опечаток, латинских названий и синонимов на уровне врача.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Экономия на аналогах</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Автоматический подбор проверенных дженериков с экономией до 70% от стоимости оригинала.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (status === "loading") {
    return (
      <div className="space-y-4 py-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm animate-pulse"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800/60" />
                </div>
                <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="space-y-2">
                <div className="h-3.5 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-3.5 w-5/6 rounded bg-slate-100 dark:bg-slate-800/60" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-8 w-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Error State
  if (status === "error") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 dark:border-rose-900/50 dark:bg-rose-950/20 text-center space-y-4 my-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Ошибка при выполнении поиска
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {errorMessage || "Не удалось связаться с поисковым сервисом Qdrant / MediatR API."}
          </p>
        </div>
        {onRetry && (
          <Button
            type="button"
            onClick={onRetry}
            className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            Повторить запрос
          </Button>
        )}
      </div>
    );
  }

  // 4. Empty State
  if (status === "empty" || items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 dark:border-slate-800 dark:bg-slate-900 text-center space-y-5 my-6 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <SearchX className="h-7 w-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            По запросу «{query}» ничего не найдено
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Проверьте правильность написания или попробуйте изменить параметры фильтрации.
          </p>
        </div>

        {mode !== "semantic" && onSwitchToSemantic && (
          <div className="pt-2">
            <Button
              type="button"
              onClick={onSwitchToSemantic}
              className="bg-sky-600 hover:bg-sky-700 text-white gap-2 shadow-md shadow-sky-600/20"
            >
              <Sparkles className="h-4 w-4" />
              Включить семантический поиск Qdrant AI
            </Button>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Попробуйте найти:
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_QUERIES.slice(0, 6).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectQuery?.(tag)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. Success State
  return (
    <div className="space-y-6">
      {/* Results Header Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-slate-900 dark:text-white">
            Найдено: {total} {total === 1 ? "препарат" : total < 5 ? "препарата" : "препаратов"}
          </span>
          <Badge
            variant={mode === "semantic" ? "analog" : "generic"}
            className="text-[11px]"
          >
            {mode === "exact"
              ? "Trigram BM25"
              : mode === "semantic"
              ? "Qdrant AI Vectors"
              : "Гибридный поиск"}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono">Время отклика: {executionTimeMs} мс</span>
          {totalPages > 1 && (
            <span>
              Страница {page} из {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* Drug Result Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((drug) => {
          const similarityScore = Math.round(drug.score * 100);
          const isHighMatch = similarityScore >= 90;

          return (
            <div
              key={drug.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all"
            >
              <div className="space-y-3">
                {/* Header: Title & AI Score Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/drug/${drug.id}`}
                      className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug"
                    >
                      {drug.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        {drug.manufacturer}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-slate-400" />
                        {drug.country.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <Badge
                      variant={isHighMatch ? "generic" : "analog"}
                      className="font-mono text-xs flex items-center gap-1 px-2.5 py-0.5 shadow-sm"
                    >
                      <Sparkles className="h-3 w-3" />
                      {similarityScore}% Match
                    </Badge>
                  </div>
                </div>

                {/* Active Substance & Details */}
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                    <Pill className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400">МНН:</span>
                    <span className="font-semibold">{drug.activeIngredient}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
                    <span>Дозировка: <strong className="text-slate-700 dark:text-slate-300">{drug.dosage}</strong></span>
                    <span>•</span>
                    <span>Форма: <strong className="text-slate-700 dark:text-slate-300">{drug.releaseForm}</strong></span>
                  </div>
                </div>

                {/* Short Description */}
                {drug.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {drug.description}
                  </p>
                )}
              </div>

              {/* Footer: Price, Stock & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400 font-mono">
                    {drug.pricing.minPrice} ₽
                  </span>
                  {drug.pricing.maxPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      до {drug.pricing.maxPrice} ₽
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    ({drug.stockSummary.inStock ? `в ${drug.stockSummary.totalPharmacies} аптеках` : "под заказ"})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/pharmacies?drugId=${drug.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                    title="Найти в аптеках Москвы"
                  >
                    <MapPin className="h-3.5 w-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Аптеки</span>
                  </Link>

                  <Link
                    href={`/drug/${drug.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors shadow-sm"
                  >
                    <span>Аналоги & Описание</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="gap-1 text-xs"
          >
            <ChevronLeft className="h-4 w-4" /> Назад
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  "h-8 w-8 rounded-lg text-xs font-semibold transition-all",
                  p === page
                    ? "bg-emerald-600 text-white dark:bg-emerald-500 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="gap-1 text-xs"
          >
            Вперед <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
