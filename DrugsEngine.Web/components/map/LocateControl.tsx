"use client";

import { Crosshair, Loader2, LocateFixed, MapPinned, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { useUserLocation } from "./useUserLocation";

type Location = ReturnType<typeof useUserLocation>;

/**
 * Кнопка «Рядом со мной» и строка состояния геолокации.
 * Если браузер не отдал координаты, предлагаем указать точку на карте.
 */
export function LocateControl({
  location,
  pickMode,
  onPickModeChange,
  className,
}: {
  location: Location;
  pickMode: boolean;
  onPickModeChange: (v: boolean) => void;
  className?: string;
}) {
  const { status, position, locate, clear } = location;

  if (position && !pickMode) {
    return (
      <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm", className)}>
        <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
          <LocateFixed className="size-4 text-[#2563eb]" aria-hidden />
          {position.source === "gps" ? "Расстояние от вас" : "Расстояние от выбранной точки"}
        </span>
        <button type="button" onClick={() => onPickModeChange(true)} className="font-semibold text-brand hover:underline">
          Изменить
        </button>
        <button
          type="button"
          onClick={clear}
          aria-label="Сбросить местоположение"
          className="grid size-7 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  if (pickMode) {
    return (
      <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm", className)}>
        <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
          <MapPinned className="size-4 text-brand" aria-hidden /> Укажите точку на карте
        </span>
        <button type="button" onClick={() => onPickModeChange(false)} className="font-semibold text-ink-2 hover:text-ink">
          Отмена
        </button>
      </div>
    );
  }

  const hint =
    status === "denied"
      ? "Доступ к геолокации запрещён в браузере."
      : status === "unavailable"
        ? "Не удалось определить местоположение."
        : status === "unsupported"
          ? "Браузер не поддерживает геолокацию."
          : null;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-sm", className)}>
      <button
        type="button"
        onClick={locate}
        disabled={status === "locating"}
        className="inline-flex h-9 items-center gap-2 rounded-control bg-brand px-3.5 font-semibold text-brand-ink transition-colors hover:bg-brand-hover disabled:opacity-70"
      >
        {status === "locating" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Crosshair className="size-4" aria-hidden />}
        {status === "locating" ? "Определяем…" : "Рядом со мной"}
      </button>
      {hint ? <span className="text-ink-2">{hint}</span> : null}
      <button type="button" onClick={() => onPickModeChange(true)} className="font-semibold text-brand hover:underline">
        Указать на карте
      </button>
    </div>
  );
}
