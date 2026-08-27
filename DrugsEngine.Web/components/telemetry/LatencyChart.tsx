"use client";

import * as React from "react";
import { MetricDataPoint } from "@/contracts/contracts";
import { apiClient } from "@/lib/apiClient";
import {
  TrendingUp,
  Activity,
  Clock,
  Zap,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LatencyChartProps {
  initialRange?: "15m" | "1h" | "6h" | "24h";
}

export function LatencyChart({ initialRange = "1h" }: LatencyChartProps) {
  const [range, setRange] = React.useState<"15m" | "1h" | "6h" | "24h">(initialRange);
  const [points, setPoints] = React.useState<MetricDataPoint[]>([]);
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    apiClient
      .getMetricsHistory("latency", range)
      .then((res) => {
        setPoints(res.points || []);
      })
      .catch(() => {
        setPoints([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [range]);

  const maxVal = Math.max(35, ...points.map((p) => p.value));
  const minVal = Math.min(10, ...points.map((p) => p.value));
  const avgVal = points.length > 0
    ? (points.reduce((acc, p) => acc + p.value, 0) / points.length).toFixed(1)
    : "18.5";

  // Generate SVG path for the latency line
  const width = 760;
  const height = 200;
  const padding = 30;

  const getCoordinates = (index: number, val: number) => {
    if (points.length <= 1) return { x: padding, y: height - padding };
    const x = padding + (index / (points.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * padding);
    return { x, y };
  };

  const pathD = points.reduce((acc, p, idx) => {
    const { x, y } = getCoordinates(idx, p.value);
    if (idx === 0) return `M ${x} ${y}`;
    return `${acc} L ${x} ${y}`;
  }, "");

  const areaD = points.length > 0
    ? `${pathD} L ${getCoordinates(points.length - 1, minVal).x} ${height - padding} L ${padding} ${height - padding} Z`
    : "";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
      {/* Header & Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Временная шкала задержек отклика (Latency Timeline)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Сравнение времени ответа движка Qdrant (P95) и PostgreSQL BM25
          </p>
        </div>

        {/* Range Buttons */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          {(["15m", "1h", "6h", "24h"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                range === r
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Latency Stats summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-sans block">
            Средняя (Avg)
          </span>
          <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">
            {avgVal} ms
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-sans block">
            Мин (Best)
          </span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {minVal.toFixed(1)} ms
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-sans block">
            P95 SLA Target
          </span>
          <span className="text-base font-extrabold text-sky-600 dark:text-sky-400">
            18.5 ms
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-sans block">
            Пик (Max Spike)
          </span>
          <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
            {maxVal.toFixed(1)} ms
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 p-4 border border-slate-800">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="4 4" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />

          {/* Value Labels */}
          <text x={padding - 5} y={padding + 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
            {maxVal.toFixed(0)}ms
          </text>
          <text x={padding - 5} y={height / 2 + 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
            {((maxVal + minVal) / 2).toFixed(0)}ms
          </text>
          <text x={padding - 5} y={height - padding + 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
            {minVal.toFixed(0)}ms
          </text>

          {/* Gradient Area */}
          {areaD && <path d={areaD} fill="url(#latencyGradient)" />}

          {/* Line Chart */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Data Points */}
          {points.map((p, idx) => {
            const { x, y } = getCoordinates(idx, p.value);
            const isHovered = hoverIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3}
                  fill={isHovered ? "#38bdf8" : "#10b981"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900/95 border border-slate-700 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-md pointer-events-none flex items-center gap-2"
          >
            <span className="text-slate-400 font-mono text-[11px]">
              {new Date(points[hoverIndex].timestamp).toLocaleTimeString()}
            </span>
            <span className="font-bold text-emerald-400 font-mono">
              {points[hoverIndex].value} ms
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
