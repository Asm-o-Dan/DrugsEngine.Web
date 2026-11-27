/**
 * «Оптимальный» порядок аптек: ближе, но не ценой заметной переплаты.
 *
 * Разница в цене считается заметной, если она больше 10% или больше 10 руб.
 * (что наступит раньше): для дешёвого препарата решают проценты, для дорогого — рубли.
 * Аптеки делятся на ценовые ступени: в ступень попадают цены, которые не заметно дороже
 * её самой низкой цены. Сначала идёт самая дешёвая ступень, внутри ступени — по расстоянию.
 */

export const NOTICEABLE_PCT = 0.1;
export const NOTICEABLE_RUB = 10;

/** Заметно ли `cheaper` дешевле, чем `pricier`. */
export function isNoticeablyCheaper(cheaper: number, pricier: number): boolean {
  const diff = pricier - cheaper;
  return diff > Math.min(NOTICEABLE_RUB, pricier * NOTICEABLE_PCT) + 1e-9;
}

/** Номер ценовой ступени для каждой цены (0 — самая дешёвая ступень). */
export function priceTiers(prices: number[]): Map<number, number> {
  const tiers = new Map<number, number>();
  let tier = -1;
  let tierStart = -Infinity;
  for (const price of [...new Set(prices)].sort((a, b) => a - b)) {
    if (tier < 0 || isNoticeablyCheaper(tierStart, price)) {
      tier++;
      tierStart = price;
    }
    tiers.set(price, tier);
  }
  return tiers;
}

/** Сортировка «Оптимально»: ступень цены, затем расстояние, затем цена. Аптеки без координат — в конце ступени. */
export function rankOptimal<T extends { price: number; distanceKm: number | null }>(rows: T[]): T[] {
  const tiers = priceTiers(rows.map((r) => r.price));
  return [...rows].sort(
    (a, b) =>
      tiers.get(a.price)! - tiers.get(b.price)! ||
      (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) ||
      a.price - b.price,
  );
}
