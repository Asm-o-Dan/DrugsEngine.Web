"use client";

import * as React from "react";
import Link from "next/link";
import { DrugDetailsDto } from "@/contracts/contracts";
import {
  Pill,
  Building2,
  Globe,
  FileText,
  ShieldCheck,
  Clock,
  Sparkles,
  MapPin,
  Share2,
  CheckCircle2,
  Calendar,
  Layers,
  Thermometer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DrugHeaderProps {
  drug: DrugDetailsDto;
  onFindInPharmacies?: () => void;
}

export function DrugHeader({ drug, onFindInPharmacies }: DrugHeaderProps) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
      {/* Top badges bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {drug.isPrescriptionRequired ? (
            <Badge variant="prescription">По рецепту (Rx)</Badge>
          ) : (
            <Badge variant="otc">Без рецепта (OTC)</Badge>
          )}

          {drug.atcCode && (
            <Badge variant="outline" className="font-mono text-[11px] bg-slate-50 dark:bg-slate-800">
              АТХ: {drug.atcCode}
            </Badge>
          )}

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 text-xs font-medium">
            <Sparkles className="h-3 w-3 text-sky-500" />
            <span>Qdrant 768-dim Index: Active</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          title="Скопировать ссылку на препарат"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ссылка скопирована!</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" />
              <span>Поделиться</span>
            </>
          )}
        </button>
      </div>

      {/* Main info header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {drug.name}
            </h1>
            {drug.latinName && (
              <p className="text-sm italic text-slate-500 dark:text-slate-400 mt-1 font-mono">
                {drug.latinName}
              </p>
            )}
          </div>

          {/* Key metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Pill className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Действующее вещество (МНН)
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {drug.activeIngredient}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex-shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Производитель & Страна
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {drug.manufacturer} ({drug.country.name})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Дозировка & Упаковка
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {drug.dosage} • {drug.packageSize}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                <Thermometer className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Хранение & Срок
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">
                  Срок: {drug.shelfLifeMonths} мес. • до 25°C
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock Card on the Right */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/40 p-6 dark:border-emerald-500/20 dark:bg-emerald-950/20 space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Средняя цена в аптеках Москвы
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {drug.pricingSummary.minPrice} ₽
              </span>
              {drug.pricingSummary.maxPrice && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  — {drug.pricingSummary.maxPrice} ₽
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white p-3 dark:bg-slate-900 border border-emerald-500/20 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Наличие в аптеках:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {drug.stockSummary.pharmaciesWithStock} из {drug.stockSummary.totalPharmacies} аптек
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Остаток на складах:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {drug.stockSummary.totalUnits} уп.
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md shadow-emerald-600/20"
              asChild
            >
              <Link href={`/pharmacies?drugId=${drug.id}`}>
                <MapPin className="h-4 w-4" />
                Найти в аптеках & Забронировать
              </Link>
            </Button>

            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
              Бронирование бесплатно. Оплата при получении.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
