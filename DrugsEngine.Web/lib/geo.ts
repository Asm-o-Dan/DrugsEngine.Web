export interface LatLng {
  lat: number;
  lng: number;
}

const R = 6371; // км

/** Расстояние по прямой (формула гаверсинусов), км. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} м`;
  return `${km.toLocaleString("ru-RU", { maximumFractionDigits: km < 10 ? 1 : 0 })} км`;
}

/** Грубая оценка пешком (~4,5 км/ч с поправкой на непрямой путь); для дальних точек не показываем. */
export function walkingLabel(km: number): string | null {
  if (km > 3) return null;
  const minutes = Math.max(1, Math.round(((km * 1.3) / 4.5) * 60));
  return `≈ ${minutes} мин пешком`;
}

/** Маршрут в Яндекс Картах. Без точки старта карта предложит указать её сама. */
export function routeHref(to: LatLng, from?: LatLng | null): string {
  const start = from ? `${from.lat},${from.lng}` : "";
  const mode = from && distanceKm(from, to) < 2 ? "pd" : "auto";
  return `https://yandex.ru/maps/?rtext=${start}~${to.lat},${to.lng}&rtt=${mode}`;
}

/**
 * Что показать на карте при открытии, чтобы маркеры не слипались:
 * если известен пользователь — он и несколько ближайших точек,
 * иначе — точки самого «плотного» города.
 */
export function mapFocus<T extends LatLng & { group: string }>(points: T[], user?: LatLng | null, nearestCount = 3): LatLng[] {
  if (points.length === 0) return user ? [user] : [];
  if (user) {
    const nearest = [...points].sort((a, b) => distanceKm(user, a) - distanceKm(user, b)).slice(0, nearestCount);
    return [user, ...nearest];
  }
  const counts = new Map<string, number>();
  for (const p of points) counts.set(p.group, (counts.get(p.group) ?? 0) + 1);
  const main = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  return points.filter((p) => p.group === main);
}
