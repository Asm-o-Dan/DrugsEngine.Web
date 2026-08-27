"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { DrugDetailsDto, VectorAnalogCard as VectorAnalogCardType } from "@/contracts/contracts";
import { DrugHeader } from "@/components/drugs/DrugHeader";
import { PharmacologyTabs } from "@/components/drugs/PharmacologyTabs";
import { VectorAnalogsCard } from "@/components/drugs/VectorAnalogsCard";
import { AnalogsComparisonTable } from "@/components/drugs/AnalogsComparisonTable";
import {
  Sparkles,
  ArrowLeft,
  SlidersHorizontal,
  RotateCcw,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const THRESHOLDS = [
  { label: "Все (>70%)", value: 0.7 },
  { label: "Высокое (>80%)", value: 0.8 },
  { label: "Очень высокое (>90%)", value: 0.9 },
  { label: "Идентичные (>95%)", value: 0.95 },
];

export default function DrugDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const drugId = (params?.id as string) || "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001";

  const [drug, setDrug] = React.useState<DrugDetailsDto | null>(null);
  const [analogs, setAnalogs] = React.useState<VectorAnalogCardType[]>([]);
  const [threshold, setThreshold] = React.useState<number>(0.7);
  const [inStockOnly, setInStockOnly] = React.useState<boolean>(false);

  const [status, setStatus] = React.useState<"loading" | "error" | "success">("loading");
  const [analogsLoading, setAnalogsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  // Fetch Drug Details
  React.useEffect(() => {
    let isMounted = true;
    setStatus("loading");
    setErrorMessage(undefined);

    apiClient
      .getDrugDetails(drugId)
      .then((data) => {
        if (isMounted) {
          setDrug(data);
          setStatus("success");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(err.message || "Препарат не найден в базе данных");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [drugId]);

  // Fetch Analogs when drug / threshold / inStockOnly change
  React.useEffect(() => {
    if (!drugId) return;

    let isMounted = true;
    setAnalogsLoading(true);

    apiClient
      .getDrugAnalogs(drugId, threshold, inStockOnly)
      .then((res) => {
        if (isMounted) {
          setAnalogs(res.analogs || []);
        }
      })
      .catch(() => {
        if (isMounted) setAnalogs([]);
      })
      .finally(() => {
        if (isMounted) setAnalogsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [drugId, threshold, inStockOnly]);

  // 1. Loading State
  if (status === "loading") {
    return (
      <div className="space-y-8 py-6">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />

        {/* Hero Card skeleton */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-6 animate-pulse">
          <div className="flex justify-between">
            <div className="h-6 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-10 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
            ))}
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="h-64 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 animate-pulse" />

        {/* Analogs skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (status === "error" || !drug) {
    return (
      <div className="space-y-6 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Препарат не найден
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {errorMessage || "Запрошенный идентификатор препарата отсутствует в реестре Qdrant."}
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" asChild>
            <Link href="/search" className="gap-2">
              <Search className="h-4 w-4" /> Перейти к поиску
            </Link>
          </Button>
          <Button onClick={() => window.location.reload()} className="bg-emerald-600 text-white gap-2">
            <RotateCcw className="h-4 w-4" /> Повторить
          </Button>
        </div>
      </div>
    );
  }

  // 3. Success State
  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          Главная
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <Link href="/search" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          Каталог препаратов
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
          {drug.name}
        </span>
      </nav>

      {/* Drug Hero Header */}
      <DrugHeader drug={drug} />

      {/* Pharmacology & Clinical Tabs */}
      <PharmacologyTabs drug={drug} />

      {/* Vector Analogs Section */}
      <section className="space-y-6">
        {/* Section Title & Threshold Filter Bar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Векторные аналоги & Дженерики (Qdrant AI)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Подбор по косинусному сходству 768-мерных химических и фармакодинамических эмбеддингов
              </p>
            </div>

            {/* Threshold Pills & InStock Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {THRESHOLDS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setThreshold(t.value)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                      threshold === t.value
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setInStockOnly(!inStockOnly)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors",
                  inStockOnly
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    inStockOnly ? "bg-emerald-500" : "bg-slate-400"
                  )}
                />
                <span>Только в наличии</span>
              </button>
            </div>
          </div>

          {/* Analogs Grid or Empty State */}
          {analogsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse"
                />
              ))}
            </div>
          ) : analogs.length === 0 ? (
            /* Empty State for Analogs */
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-3 bg-slate-50/50 dark:bg-slate-800/20">
              <Sparkles className="h-8 w-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                Нет аналогов с порогом сходства &gt; {threshold * 100}%
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Попробуйте понизить порог сходства до 70% или 80%, чтобы увидеть более широкий спектр терапевтических замен.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setThreshold(0.7)}
                className="text-xs gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Сбросить порог до 70%
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {analogs.map((analog) => (
                <VectorAnalogsCard
                  key={analog.id}
                  analog={analog}
                  sourcePrice={drug.pricingSummary.minPrice}
                />
              ))}
            </div>
          )}
        </div>

        {/* Side-by-Side Comparison Table */}
        {analogs.length > 0 && (
          <AnalogsComparisonTable sourceDrug={drug} analogs={analogs} />
        )}
      </section>
    </div>
  );
}
