"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Pill,
  MapPin,
  Activity,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Server,
  Database,
  Radio,
  Building2,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Layers,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_DRUGS, MOCK_PHARMACIES } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [heroQuery, setHeroQuery] = React.useState("");
  const [heroMode, setHeroMode] = React.useState<"exact" | "semantic" | "hybrid">("hybrid");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(heroQuery.trim())}&mode=${heroMode}`);
    } else {
      router.push("/search");
    }
  };

  const POPULAR_TAGS = [
    "Ибупрофен",
    "Нурофен Экспресс",
    "МИГ 400",
    "Омез",
    "Амоксиклав",
    "Аторвастатин",
    "Головная боль",
    "Мигрень",
  ];

  return (
    <div className="space-y-16 py-6">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/15 via-sky-500/5 to-transparent p-8 sm:p-14 border border-emerald-500/20 shadow-sm">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span>AI Hybrid Engine: Trigram BM25 + Qdrant 768-dim Vector Embeddings</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Интеллектуальный поиск лекарств & Подбор{" "}
            <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/40 decoration-4">
              векторных аналогов
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Мгновенный фармацевтический поиск по МНН, симптомам и торговым маркам. Поиск биоэквивалентных дженериков с экономией до 70% и остатки в 52 аптеках Москвы.
          </p>

          {/* Hero Search Box */}
          <form onSubmit={handleHeroSearch} className="space-y-3 pt-2">
            {/* Mode switch */}
            <div className="inline-flex rounded-xl bg-white/80 p-1 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
              <button
                type="button"
                onClick={() => setHeroMode("hybrid")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  heroMode === "hybrid"
                    ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Гибридный AI поиск</span>
              </button>

              <button
                type="button"
                onClick={() => setHeroMode("exact")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  heroMode === "exact"
                    ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                )}
              >
                <Target className="h-3.5 w-3.5" />
                <span>Точный (Trigram)</span>
              </button>

              <button
                type="button"
                onClick={() => setHeroMode("semantic")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  heroMode === "semantic"
                    ? "bg-sky-600 text-white shadow-sm dark:bg-sky-500"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Qdrant Векторы</span>
              </button>
            </div>

            {/* Input field */}
            <div className="flex items-center rounded-2xl border border-slate-300 bg-white shadow-lg shadow-emerald-950/5 dark:border-slate-700 dark:bg-slate-900 p-1.5">
              <div className="flex h-12 w-12 items-center justify-center text-slate-400 pl-2">
                <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <input
                type="text"
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                placeholder="Поиск по названию (Нурофен), МНН (ибупрофен) или симптому..."
                className="w-full bg-transparent pr-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
              />
              <Button
                type="submit"
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 font-semibold shadow-md shadow-emerald-600/25 h-12 rounded-xl"
              >
                Найти
              </Button>
            </div>

            {/* Quick search tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-medium">Например:</span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}&mode=${heroMode}`)}
                  className="rounded-lg border border-slate-200/80 bg-white/70 px-2.5 py-1 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-emerald-950/30 transition-all font-medium"
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* 2. Live Telemetry Ticker Bar */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white block">
                &lt; 18.5 ms
              </span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                P95 Vector Latency
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white block">
                128,450
              </span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                Векторов в Qdrant
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white block">
                0 msgs lag
              </span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                Kafka Ingestion Lag
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white block">
                99.98%
              </span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                Cluster SLA Uptime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4 Core Feature Modules Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Архитектурные модули платформы
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Все компоненты интегрированы в единую реактивную систему
            </p>
          </div>
          <Badge variant="generic" className="self-start sm:self-auto">
            4 модуля в Production
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Module 1 */}
          <Card className="hover:shadow-lg hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
            <CardHeader className="pb-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Умный поиск препаратов</CardTitle>
              <CardDescription>Trigram BM25 + Qdrant 768-dim AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Дебаунс 300мс, автоподсказки, фильтрация по формам выпуска, рецептурности и производителям с задержкой &lt; 25 мс.
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs justify-between group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40" asChild>
                <Link href="/search">
                  <span>Открыть поиск</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Module 2 */}
          <Card className="hover:shadow-lg hover:border-sky-500/40 transition-all flex flex-col justify-between group">
            <CardHeader className="pb-3">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3 group-hover:scale-110 transition-transform">
                <Pill className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Векторные аналоги & Дженерики</CardTitle>
              <CardDescription>Qdrant Cosine Similarity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Интерактивный расчет сходства (до 99%), калькулятор выгоды и сравнительная таблица биоэквивалентности.
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs justify-between group-hover:bg-sky-50 dark:group-hover:bg-sky-950/40" asChild>
                <Link href="/drug/e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001">
                  <span>Пример: Нурофен</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Module 3 */}
          <Card className="hover:shadow-lg hover:border-amber-500/40 transition-all flex flex-col justify-between group">
            <CardHeader className="pb-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Аптеки & Онлайн-бронь</CardTitle>
              <CardDescription>Карта Москвы + Экспресс-резерв</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Интерактивная карта с геопозицией, проверка остатков в Ригле, Апреле, 36.6, Столичках и бронь на 24 часа.
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs justify-between group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40" asChild>
                <Link href="/pharmacies">
                  <span>Открыть карту аптек</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Module 4 */}
          <Card className="hover:shadow-lg hover:border-indigo-500/40 transition-all flex flex-col justify-between group">
            <CardHeader className="pb-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Телеметрия & SLA</CardTitle>
              <CardDescription>Live Metrics & Grafana-Ready</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time мониторинг .NET Kestrel HTTP throughput, Kafka lag, Qdrant vectors и PostgreSQL connection pool.
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs justify-between group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40" asChild>
                <Link href="/telemetry">
                  <span>Панель телеметрии</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Featured Vector Analogs Showcase */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Демонстрация векторного подбора аналогов
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Сравнение цен и сходства формул для оригинального «Нурофен Экспресс» (320 ₽)
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/drug/e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001" className="gap-1.5 text-xs">
              Все аналоги Нурофена <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Analog 1 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="generic" className="text-xs font-mono font-bold">
                98.5% Similarity
              </Badge>
              <Badge variant="inStock" className="text-[10px]">
                В 42 аптеках
              </Badge>
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">МИГ 400 400мг №20</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Berlin-Chemie (Германия) • Ибупрофен</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">240 ₽</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5" /> На 25% дешевле (80 ₽)
              </span>
            </div>
          </div>

          {/* Analog 2 */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-950/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="generic" className="text-xs font-mono font-bold">
                96.2% Similarity
              </Badge>
              <Badge variant="inStock" className="text-[10px]">
                В 50 аптеках
              </Badge>
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Ибупрофен-АКОС 400мг</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Синтез АКОС (Россия) • Ибупрофен</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
              <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">95 ₽</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5" /> Экономия 70% (225 ₽)
              </span>
            </div>
          </div>

          {/* Analog 3 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="analog" className="text-xs font-mono font-bold">
                91.5% Similarity
              </Badge>
              <Badge variant="inStock" className="text-[10px]">
                В 18 аптеках
              </Badge>
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Дексалгин 25мг №10</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Menarini (Италия) • Декскетопрофен</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">490 ₽</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Усиленное действие</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Quick Pharmacy Locator Preview */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-6 w-6 text-amber-500" />
              Сети аптек-партнеров в Москве
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Бронирование медикаментов с гарантией наличия на кассе
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/pharmacies" className="gap-1.5 text-xs">
              Открыть полную карту <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MOCK_PHARMACIES.map((p) => (
            <Link
              key={p.id}
              href={`/pharmacies?network=${encodeURIComponent(p.network)}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block">
                  {p.network}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                  {p.location.distanceKm} км от вас
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                  {p.workingHours.is24Hours ? "24/7 Круглосуточно" : "08:00 – 22:00"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Technical Architecture Callout */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Инженерное совершенство
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Clean Architecture .NET 8 + Python AI + Event Streaming
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Платформа построена по стандартам высоконагруженных медицинских систем: строгая изоляция слоев Domain / Application / Infrastructure, шина MediatR CQRS, потоковая обработка Apache Kafka и векторный индекс Qdrant.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">API Protocol</span>
            <span className="font-bold text-slate-900 dark:text-white">OpenAPI 3.1 & RFC 7807</span>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">AI Model</span>
            <span className="font-bold text-slate-900 dark:text-white">LaBSE 768 Dimensions</span>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Frontend</span>
            <span className="font-bold text-slate-900 dark:text-white">Next.js 15 App Router</span>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Type Safety</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">TypeScript Strict 100%</span>
          </div>
        </div>
      </section>
    </div>
  );
}
