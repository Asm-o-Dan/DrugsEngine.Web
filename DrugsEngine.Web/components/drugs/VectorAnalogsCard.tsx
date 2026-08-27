"use client";

import * as React from "react";
import Link from "next/link";
import { VectorAnalogCard as VectorAnalogCardType } from "@/contracts/contracts";
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Building2,
  Globe,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Percent,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VectorAnalogsCardProps {
  analog: VectorAnalogCardType;
  sourcePrice?: number;
}

export function VectorAnalogsCard({ analog, sourcePrice }: VectorAnalogsCardProps) {
  const sim = analog.similarity;
  const isDirectGeneric = sim.matchCategory === "DIRECT_GENERIC";
  const isCheaper = analog.pricing.priceDelta.isCheaper;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all">
      <div className="space-y-4">
        {/* Top bar: Similarity score & Category badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold font-mono tracking-tight shadow-sm",
                sim.similarityPercentage >= 95
                  ? "bg-emerald-500 text-white dark:bg-emerald-500"
                  : sim.similarityPercentage >= 85
                  ? "bg-sky-500 text-white dark:bg-sky-500"
                  : "bg-amber-500 text-white dark:bg-amber-500"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {sim.similarityPercentage}% Similarity
            </span>

            <Badge
              variant={isDirectGeneric ? "generic" : "analog"}
              className="text-[11px]"
            >
              {isDirectGeneric ? "Прямой дженерик" : "Терапевтический аналог"}
            </Badge>
          </div>

          {/* Cosine indicator */}
          <span className="text-[11px] font-mono text-slate-400">
            cos: {sim.cosineScore.toFixed(3)}
          </span>
        </div>

        {/* Drug Name & Active Ingredient */}
        <div>
          <Link
            href={`/drug/${analog.id}`}
            className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug"
          >
            {analog.name}
          </Link>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-slate-400" />
              {analog.manufacturer}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-slate-400" />
              {analog.country.code}
            </span>
          </div>
        </div>

        {/* Equivalence reason card */}
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-white">Обоснование подобия:</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {sim.matchReason}
          </p>
          <div className="text-[11px] text-slate-400 pt-0.5">
            Вещество: <strong className="text-slate-700 dark:text-slate-300">{analog.activeIngredient}</strong> ({analog.dosage})
          </div>
        </div>

        {/* Price Delta Badge */}
        <div
          className={cn(
            "flex items-center justify-between rounded-xl p-3 text-xs font-semibold border",
            isCheaper
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
          )}
        >
          <div className="flex items-center gap-1.5">
            {isCheaper ? (
              <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingUp className="h-4 w-4 text-slate-500" />
            )}
            <span>{analog.pricing.priceDelta.formattedLabel}</span>
          </div>

          <span className="font-bold text-sm font-mono">
            {analog.pricing.minPrice} ₽
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-emerald-500" />
          В {analog.stockSummary.pharmacyCount} аптеках
        </span>

        <div className="flex items-center gap-2">
          <Link
            href={`/pharmacies?drugId=${analog.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 text-amber-500" />
            <span>Аптеки</span>
          </Link>

          <Link
            href={`/drug/${analog.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <span>Подробнее</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
