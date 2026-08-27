"use client";

import * as React from "react";
import { DrugDetailsDto } from "@/contracts/contracts";
import {
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PharmacologyTabsProps {
  drug: DrugDetailsDto;
}

type TabType = "overview" | "pharmacology" | "indications" | "dosage" | "side_effects";

export function PharmacologyTabs({ drug }: PharmacologyTabsProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>("overview");

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Общее описание", icon: FileText },
    { id: "pharmacology", label: "Фармакология & Механизм", icon: Activity },
    { id: "indications", label: "Показания & Противопоказания", icon: CheckCircle },
    { id: "dosage", label: "Способ применения & Дозы", icon: Clock },
    { id: "side_effects", label: "Побочные действия", icon: ShieldAlert },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
      {/* Tab Navigation Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap",
                isActive
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-emerald-500" : "text-slate-400")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="min-h-[220px]">
        {/* 1. Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Описание лекарственного препарата
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {drug.fullDescription || drug.pharmacologicalAction}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Фармакотерапевтическая группа
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {drug.category}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Форма выпуска и упаковка
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {drug.releaseForm}, {drug.packageSize}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Условия хранения
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {drug.storageConditions}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Срок годности
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {drug.shelfLifeMonths} месяцев с даты производства. Не применять по истечении срока.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Pharmacology Tab */}
        {activeTab === "pharmacology" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Фармакодинамика и механизм действия
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {drug.pharmacologicalAction}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 p-5 dark:border-emerald-500/10 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span>Биохимический профиль & Векторные характеристики</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Препарат оцифрован в векторном пространстве Qdrant (768 измерений). Модель вычисляет сходство по молекулярной структуре, активности связывания с белками плазмы и профилю терапевтического отклика.
              </p>
            </div>
          </div>
        )}

        {/* 3. Indications & Contraindications Tab */}
        {activeTab === "indications" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50 duration-200">
            {/* Indications */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Показания к применению</span>
              </div>
              <ul className="space-y-2">
                {drug.indications.map((ind, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-100 dark:border-slate-800"
                  >
                    <ChevronRight className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contraindications */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <XCircle className="h-4 w-4 text-rose-500" />
                <span>Противопоказания</span>
              </div>
              <ul className="space-y-2">
                {drug.contraindications.map((contra, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 p-3 border border-rose-100 dark:border-rose-900/30"
                  >
                    <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{contra}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 4. Dosage & Administration */}
        {activeTab === "dosage" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Режим дозирования и способ применения
            </h3>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <p>
                Препарат принимают внутрь, предпочтительно во время или после еды, запивая достаточным количеством воды (1 стакан).
              </p>
              <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">Рекомендуемая разовая доза:</span>
                <p>{drug.dosage} каждые 6-8 часов при необходимости. Максимальная суточная доза не должна превышать указанную в официальной инструкции.</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Длительность непрерывного курса без консультации врача — не более 3-5 дней.
              </p>
            </div>
          </div>
        )}

        {/* 5. Side Effects */}
        {activeTab === "side_effects" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Возможные побочные действия
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {drug.sideEffects.map((side, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/40 dark:border-amber-900/30 dark:bg-amber-950/20 p-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span>{side}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
              При возникновении нежелательных реакций прекратите прием и обратитесь к лечащему врачу или фармацевту.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
