const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY_LABEL || "руб.";

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 1234.5 → «1 234,50 руб.» (неразрывные пробелы, чтобы цена не переносилась). */
export function formatPrice(value: number): string {
  return `${priceFormatter.format(value)} ${CURRENCY}`;
}

export function formatPriceRange(min: number | null, max: number | null): string | null {
  if (min == null) return null;
  if (max == null || Math.abs(max - min) < 0.005) return formatPrice(min);
  return `${priceFormatter.format(min)}–${formatPrice(max)}`;
}

export function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function countLabel(n: number, one: string, few: string, many: string): string {
  return `${n.toLocaleString("ru-RU")} ${pluralize(n, one, few, many)}`;
}

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Chisinau",
});

/** «обновлено 3 часа назад» для недавних дат, иначе абсолютная дата. */
export function formatUpdatedAt(iso: string | null, now: Date = new Date()): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const minutes = Math.round((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${countLabel(minutes, "минуту", "минуты", "минут")} назад`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${countLabel(hours, "час", "часа", "часов")} назад`;
  return dateFormatter.format(date);
}

/** Ссылка tel: из номера в произвольном формате. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Внешняя ссылка на карту по адресу (точные координаты бэкенд пока не отдаёт). */
export function mapHref(city: string, address: string): string {
  return `https://yandex.ru/maps/?text=${encodeURIComponent(`${city}, ${address}`)}`;
}

/** Компактная цена для маркера на карте: «23,50». */
export function formatPriceShort(value: number): string {
  return priceFormatter.format(value);
}
