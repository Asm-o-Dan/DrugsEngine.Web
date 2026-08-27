"use client";

import * as React from "react";
import Link from "next/link";
import { DrugDetailsDto, VectorAnalogCard } from "@/contracts/contracts";
import { Sparkles, MapPin, ArrowRight, Check, CheckCircle2, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnalogsComparisonTableProps {
  sourceDrug: DrugDetailsDto;
  analogs: VectorAnalogCard[];
}

export function AnalogsComparisonTable({ sourceDrug, analogs }: AnalogsComparisonTableProps) {
  if (!analogs || analogs.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            Сравнительная таблица аналогов и биоэквивалентности
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Сравнение ключевых клинических параметров, цен и доступности в аптеках
          </p>
        </div>
        <Badge variant="generic" className="self-start sm:self-auto">
          {analogs.length} аналогов в выборке
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px]">
              <th className="py-3 px-4 rounded-l-xl">Препарат</th>
              <th className="py-3 px-3">МНН (Вещество)</th>
              <th className="py-3 px-3">Производитель</th>
              <th className="py-3 px-3 text-center">AI Match</th>
              <th className="py-3 px-3">Цена</th>
              <th className="py-3 px-3">Экономия</th>
              <th className="py-3 px-3">Наличие</th>
              <th className="py-3 px-4 rounded-r-xl text-right">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Source Drug Row */}
            <tr className="bg-emerald-50/40 dark:bg-emerald-950/20 font-medium">
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span>{sourceDrug.name}</span>
                <Badge variant="otc" className="text-[10px] px-1.5 py-0 h-4">
                  Оригинал
                </Badge>
              </td>
              <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-semibold">
                {sourceDrug.activeIngredient}
              </td>
              <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                {sourceDrug.manufacturer} ({sourceDrug.country.code})
              </td>
              <td className="py-3.5 px-3 text-center">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  100% (База)
                </span>
              </td>
              <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                {sourceDrug.pricingSummary.minPrice} ₽
              </td>
              <td className="py-3.5 px-3 text-slate-400">—</td>
              <td className="py-3.5 px-3">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {sourceDrug.stockSummary.pharmaciesWithStock} аптек
                </span>
              </td>
              <td className="py-3.5 px-4 text-right">
                <Button size="sm" variant="outline" className="text-xs h-7 px-2.5" asChild>
                  <Link href={`/pharmacies?drugId=${sourceDrug.id}`}>
                    <MapPin className="h-3 w-3 mr-1 text-amber-500" /> В аптеках
                  </Link>
                </Button>
              </td>
            </tr>

            {/* Analogs Rows */}
            {analogs.map((item) => {
              const simPct = item.similarity.similarityPercentage;
              const isCheaper = item.pricing.priceDelta.isCheaper;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    <Link
                      href={`/drug/${item.id}`}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                    {item.activeIngredient}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                    {item.manufacturer} ({item.country.code})
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-full",
                        simPct >= 95
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : simPct >= 85
                          ? "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      )}
                    >
                      <Sparkles className="h-3 w-3" />
                      {simPct}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {item.pricing.minPrice} ₽
                  </td>
                  <td className="py-3.5 px-3">
                    {isCheaper ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <TrendingDown className="h-3.5 w-3.5" />
                        -{Math.abs(item.pricing.priceDelta.percentageDifference)}% (
                        {Math.abs(item.pricing.priceDelta.amountDifference)} ₽)
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">
                        +{item.pricing.priceDelta.amountDifference} ₽
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 text-xs">
                    в {item.stockSummary.pharmacyCount} аптеках
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="ghost" className="text-xs h-7 px-2" asChild>
                        <Link href={`/pharmacies?drugId=${item.id}`}>
                          <MapPin className="h-3 w-3 text-amber-500" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="emerald" className="text-xs h-7 px-2.5" asChild>
                        <Link href={`/drug/${item.id}`}>
                          Обзор <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
