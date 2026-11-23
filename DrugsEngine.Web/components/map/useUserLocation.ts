"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { LatLng } from "@/lib/geo";

export type LocationStatus = "idle" | "locating" | "ready" | "denied" | "unavailable" | "unsupported";

export interface UserLocationState {
  status: LocationStatus;
  position: (LatLng & { source: "gps" | "manual"; accuracyM?: number }) | null;
}

const STORAGE_KEY = "de:user-location";
let state: UserLocationState = { status: "idle", position: null };
let hydrated = false;
const listeners = new Set<() => void>();

function emit(next: UserLocationState) {
  state = next;
  try {
    if (next.position) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next.position));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // хранилище недоступно (приватный режим) — просто не запоминаем
  }
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const position = JSON.parse(raw);
      if (typeof position?.lat === "number" && typeof position?.lng === "number") {
        state = { status: "ready", position };
      }
    }
  } catch {
    // игнорируем повреждённое значение
  }
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const SERVER_STATE: UserLocationState = { status: "idle", position: null };

/**
 * Местоположение пользователя, общее для всех страниц в рамках вкладки.
 * Хранится только в браузере (sessionStorage) и никуда не отправляется.
 */
export function useUserLocation() {
  const current = useSyncExternalStore(subscribe, () => (hydrate(), state), () => SERVER_STATE);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      emit({ status: "unsupported", position: state.position });
      return;
    }
    emit({ status: "locating", position: state.position });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        emit({
          status: "ready",
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude, source: "gps", accuracyM: pos.coords.accuracy },
        }),
      (err) =>
        emit({ status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable", position: state.position }),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const setManual = useCallback((p: LatLng) => emit({ status: "ready", position: { ...p, source: "manual" } }), []);
  const clear = useCallback(() => emit({ status: "idle", position: null }), []);

  return { ...current, locate, setManual, clear };
}
