"use client";

import * as React from "react";
import { RotateCcw, Clock, Sparkles, Activity, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RefreshControlProps {
  intervalSec: number; // 0 for off, 5, 10, 30
  onIntervalChange: (sec: number) => void;
  onRefreshNow: () => void;
  isRefreshing: boolean;
  lastUpdated: Date;
  countdown: number;
}

export function RefreshControl({
  intervalSec,
  onIntervalChange,
  onRefreshNow,
  isRefreshing,
  lastUpdated,
  countdown,
}: RefreshControlProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Activity className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Кластерная телеметрия
            </span>
            <Badge variant="generic" className="text-[11px] gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Все 6 микросервисов в норме
            </Badge>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Посл. синхронизация: {lastUpdated.toLocaleTimeString()} (UTC+3)
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Interval dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400 font-medium">Авто-опрос:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {[
              { label: "Выкл", val: 0 },
              { label: "5 сек", val: 5 },
              { label: "10 сек", val: 10 },
              { label: "30 сек", val: 30 },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => onIntervalChange(opt.val)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                  intervalSec === opt.val
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {intervalSec > 0 && (
          <span className="font-mono text-xs text-slate-400 w-16 text-right">
            ({countdown} с)
          </span>
        )}

        {/* Manual Refresh Now button */}
        <Button
          size="sm"
          onClick={onRefreshNow}
          disabled={isRefreshing}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 px-3 text-xs shadow-sm"
        >
          <RotateCcw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          <span>{isRefreshing ? "Опрос..." : "Обновить"}</span>
        </Button>
      </div>
    </div>
  );
}
