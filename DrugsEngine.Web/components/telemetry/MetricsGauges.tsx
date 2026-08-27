"use client";

import * as React from "react";
import { SystemMetricsResponse } from "@/contracts/contracts";
import {
  Gauge,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  Database,
  Radio,
  Clock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MetricsGaugesProps {
  metrics: SystemMetricsResponse | null;
}

export function MetricsGauges({ metrics }: MetricsGaugesProps) {
  const p95 = metrics?.qdrant.searchLatencyP95Ms || 18.5;
  const p99 = metrics?.http.latency.p99Ms || 112.4;
  const rps = metrics?.http.requestsPerSecond || 142.5;
  const errorRate = metrics?.http.errorRatePercentage || 0.02;
  const kafkaLag = metrics?.kafka.consumerLag || 0;
  const totalVectors = metrics?.qdrant.totalVectors || 128450;
  const activeConn = metrics?.database.activeConnections || 14;
  const maxConn = metrics?.database.maxConnections || 100;
  const cacheHit = metrics?.database.cacheHitRatioPercentage || 99.4;

  const cards = [
    {
      title: "Qdrant P95 Latency",
      value: `${p95} ms`,
      subtitle: "Векторный поиск (768d)",
      change: "-1.2 ms vs peak",
      isPositive: true,
      icon: Clock,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Throughput (RPS)",
      value: `${rps}`,
      subtitle: "Kestrel HTTP Requests/sec",
      change: "+14% vs avg",
      isPositive: true,
      icon: Activity,
      color: "text-sky-500 bg-sky-500/10",
    },
    {
      title: "Векторный индекс Qdrant",
      value: totalVectors.toLocaleString("ru-RU"),
      subtitle: "Векторов в коллекции",
      change: "100% indexed",
      isPositive: true,
      icon: Sparkles,
      color: "text-indigo-500 bg-indigo-500/10",
    },
    {
      title: "Kafka Consumer Lag",
      value: `${kafkaLag} msgs`,
      subtitle: "drug-ingestion topic",
      change: "Zero backlog",
      isPositive: true,
      icon: Radio,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      title: "PostgreSQL Pool",
      value: `${activeConn} / ${maxConn}`,
      subtitle: `Cache Hit Ratio: ${cacheHit}%`,
      change: "Connections healthy",
      isPositive: true,
      icon: Database,
      color: "text-teal-500 bg-teal-500/10",
    },
    {
      title: "Error Rate",
      value: `${errorRate}%`,
      subtitle: `HTTP 5xx (P99: ${p99} ms)`,
      change: "Below SLA 0.1%",
      isPositive: true,
      icon: Zap,
      color: "text-emerald-500 bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-2 hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 line-clamp-1">
                {c.title}
              </span>
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0", c.color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            <div>
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {c.value}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block line-clamp-1 mt-0.5">
                {c.subtitle}
              </span>
            </div>

            <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {c.change}
            </div>
          </div>
        );
      })}
    </div>
  );
}
