import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = "RUB"): string {
  if (currency === "RUB") {
    return `${amount.toFixed(0)} ?`;
  }
  if (currency === "USD") {
    return `$${amount.toFixed(2)}`;
  }
  if (currency === "EUR") {
    return `?${amount.toFixed(2)}`;
  }
  return `${amount} ${currency}`;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} ?`;
  }
  return `${distanceKm.toFixed(1)} ??`;
}
