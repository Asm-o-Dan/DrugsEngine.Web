"use client";

import * as React from "react";
import { apiClient } from "@/lib/apiClient";
import { SystemHealthResponse, SystemMetricsResponse } from "@/contracts/contracts";
import { RefreshControl } from "@/components/telemetry/RefreshControl";
import { ServiceHealthGrid } from "@/components/telemetry/ServiceHealthGrid";
import { MetricsGauges } from "@/components/telemetry/MetricsGauges";
import { LatencyChart } from "@/components/telemetry/LatencyChart";
import { EventsStream } from "@/components/telemetry/EventsStream";
import {
  Activity,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Server,
  Database,
  Cpu,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TelemetryPage() {
  const [health, setHealth] = React.useState<SystemHealthResponse | null>(null);
  const [metrics, setMetrics] = React.useState<SystemMetricsResponse | null>(null);
  const [status, setStatus] = React.useState<"loading" | "error" | "success">("loading");
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());
  const [intervalSec, setIntervalSec] = React.useState<number>(10);
  const [countdown, setCountdown] = React.useState<number>(10);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

  // Fetch telemetry
  const fetchTelemetry = React.useCallback(async (showLoadingSpinner: boolean = false) => {
    if (showLoadingSpinner) setIsRefreshing(true);
    setErrorMessage(undefined);

    try {
      const [healthData, metricsData] = await Promise.all([
        apiClient.getSystemHealth(),
        apiClient.getSystemMetrics(),
      ]);

      setHealth(healthData);
      setMetrics(metricsData);
      setLastUpdated(new Date());
      setStatus("success");
    } catch (err: any) {
      if (!health) {
        setStatus("error");
        setErrorMessage(err.message || "Ошибка подключения к телеметрическому сервису");
      }
    } finally {
      setIsRefreshing(false);
      setCountdown(intervalSec);
    }
  }, [health, intervalSec]);

  // Initial load
  React.useEffect(() => {
    fetchTelemetry(false);
  }, [fetchTelemetry]);

  // Auto-refresh timer
  React.useEffect(() => {
    if (intervalSec <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchTelemetry(false);
          return intervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intervalSec, fetchTelemetry]);

  const handleIntervalChange = (newSec: number) => {
    setIntervalSec(newSec);
    setCountdown(newSec);
  };

  const handleRefreshNow = () => {
    fetchTelemetry(true);
  };

  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
          <span>Real-Time Engine Observability & SLA Monitoring</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Системная телеметрия & Состояние сервисов
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Мониторинг задержек поиска Qdrant, очереди сообщений Kafka, состояния пула подключений PostgreSQL и пропускной способности .NET Kestrel.
        </p>
      </div>

      {/* 1. Loading State (Initial) */}
      {status === "loading" && (
        <div className="space-y-6">
          <div className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          <div className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      )}

      {/* 2. Error State */}
      {status === "error" && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-8 dark:border-rose-900/50 dark:bg-rose-950/20 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Не удалось загрузить данные телеметрии
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {errorMessage || "Сервис сбора метрик временно недоступен или кластер перезагружается."}
            </p>
          </div>
          <Button onClick={handleRefreshNow} className="bg-rose-600 hover:bg-rose-700 text-white gap-2">
            <RotateCcw className="h-4 w-4" /> Повторить подключение
          </Button>
        </div>
      )}

      {/* 3. Success State */}
      {status === "success" && (
        <div className="space-y-8">
          {/* Refresh & Sync Controls Header */}
          <RefreshControl
            intervalSec={intervalSec}
            onIntervalChange={handleIntervalChange}
            onRefreshNow={handleRefreshNow}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
            countdown={countdown}
          />

          {/* Quick Metrics KPI Gauges */}
          <MetricsGauges metrics={metrics} />

          {/* 6 Microservices Health Grid */}
          <ServiceHealthGrid health={health} />

          {/* Latency History Chart */}
          <LatencyChart initialRange="1h" />

          {/* Live Engine Event Stream Audit Log */}
          <EventsStream />
        </div>
      )}
    </div>
  );
}
