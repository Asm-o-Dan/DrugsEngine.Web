"use client";

import * as React from "react";
import {
  Radio,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Database,
  Server,
  Zap,
  Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SystemEvent {
  id: string;
  timestamp: string;
  severity: "info" | "warning" | "error";
  service: ".NET API" | "Qdrant" | "Kafka" | "PostgreSQL" | "Python AI";
  message: string;
  statusCode?: string;
  durationMs?: number;
}

const INITIAL_EVENTS: SystemEvent[] = [
  {
    id: "evt-101",
    timestamp: "22:58:40.112",
    severity: "info",
    service: "Qdrant",
    message: "Vector similarity search executed (top_k: 10, collection: drug_collection, threshold: 0.70)",
    statusCode: "200 OK",
    durationMs: 16.4,
  },
  {
    id: "evt-102",
    timestamp: "22:58:39.840",
    severity: "info",
    service: ".NET API",
    message: "MediatR Query SearchDrugsQuery handled in Clean Architecture pipeline",
    statusCode: "200 OK",
    durationMs: 18.2,
  },
  {
    id: "evt-103",
    timestamp: "22:58:38.205",
    severity: "info",
    service: "Kafka",
    message: "Committed offset 124852 for group 'drug-vectorization-group' on topic 'drug-ingestion-events'",
    statusCode: "OFFSET_ACK",
    durationMs: 4.1,
  },
  {
    id: "evt-104",
    timestamp: "22:58:35.912",
    severity: "info",
    service: "Python AI",
    message: "LaBSE 768-dim tensor batch inference executed on CUDA worker (batch_size: 1)",
    statusCode: "INFER_OK",
    durationMs: 12.8,
  },
  {
    id: "evt-105",
    timestamp: "22:58:31.420",
    severity: "warning",
    service: "PostgreSQL",
    message: "Connection pool active connections spiked to 28/100 during burst search query",
    statusCode: "WARN_BURST",
    durationMs: 22.5,
  },
  {
    id: "evt-106",
    timestamp: "22:58:24.110",
    severity: "info",
    service: ".NET API",
    message: "Pharmacy inventory real-time snapshot calculated for 6 Moscow chains",
    statusCode: "200 OK",
    durationMs: 9.8,
  },
  {
    id: "evt-107",
    timestamp: "22:58:18.902",
    severity: "info",
    service: "Qdrant",
    message: "HNSW index compaction completed. Total indexed vectors: 128,450",
    statusCode: "INDEX_SYNC",
    durationMs: 38.0,
  },
];

export function EventsStream() {
  const [severityFilter, setSeverityFilter] = React.useState<"all" | "info" | "warning" | "error">("all");
  const [events, setEvents] = React.useState<SystemEvent[]>(INITIAL_EVENTS);

  // Add random live events periodically
  React.useEffect(() => {
    const timer = setInterval(() => {
      const services: SystemEvent["service"][] = [".NET API", "Qdrant", "Kafka", "Python AI", "PostgreSQL"];
      const chosenService = services[Math.floor(Math.random() * services.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;

      const newEvt: SystemEvent = {
        id: `evt-${Date.now()}`,
        timestamp: timeStr,
        severity: "info",
        service: chosenService,
        message:
          chosenService === "Qdrant"
            ? "Cosine distance query calculated for 768-dim embedding space"
            : chosenService === "Kafka"
            ? "Heartbeat acknowledged for partition 0, consumer lag: 0 msgs"
            : chosenService === "Python AI"
            ? "Tokenized chemical IUPAC input tensor through transformer head"
            : chosenService === "PostgreSQL"
            ? "Trigram index scan on drugs_fts_idx completed in 3.4 ms"
            : "HTTP GET /api/v1/search/drugs 200 OK via Kestrel server",
        statusCode: "200 OK",
        durationMs: Number((6 + Math.random() * 18).toFixed(1)),
      };

      setEvents((prev) => [newEvt, ...prev.slice(0, 19)]);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const filteredEvents = events.filter((e) => {
    if (severityFilter === "all") return true;
    return e.severity === severityFilter;
  });

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-500 animate-pulse" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Поток событий движка (Live Event Stream)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Аудит операций в реальном времени: CQRS запросы, Qdrant поиск, Kafka коммиты
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          {[
            { id: "all", label: "Все" },
            { id: "info", label: "Info" },
            { id: "warning", label: "Warning" },
            { id: "error", label: "Error" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSeverityFilter(tab.id as any)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                severityFilter === tab.id
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table / Stream */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3 rounded-l-lg">Время</th>
              <th className="py-2.5 px-2">Сервис</th>
              <th className="py-2.5 px-3">Событие / Лог</th>
              <th className="py-2.5 px-2">Статус</th>
              <th className="py-2.5 px-3 rounded-r-lg text-right">Время (ms)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredEvents.map((evt) => {
              const isWarn = evt.severity === "warning";
              const isErr = evt.severity === "error";

              return (
                <tr
                  key={evt.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {evt.timestamp}
                  </td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-sans",
                        evt.service === ".NET API"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-500/20"
                          : evt.service === "Qdrant"
                          ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-500/20"
                          : evt.service === "Kafka"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-500/20"
                          : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-500/20"
                      )}
                    >
                      {evt.service}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-sans text-xs">
                    {evt.message}
                  </td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <span
                      className={cn(
                        "text-[11px] font-semibold px-1.5 py-0.5 rounded",
                        isWarn
                          ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                          : isErr
                          ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                          : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                      )}
                    >
                      {evt.statusCode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {evt.durationMs ? `${evt.durationMs} ms` : "—"}
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
