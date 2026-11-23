import "server-only";
import { DemoDataSource } from "./demo";
import { HttpDataSource } from "./http";
import type { DataSource } from "./types";

export { DataSourceError } from "./errors";
export type { DataSource, DataSourceKind, HealthReport } from "./types";

let instance: DataSource | null = null;

/**
 * Источник данных выбирается явно, через переменные окружения:
 *   DRUGSENGINE_DATA_SOURCE=api  + DRUGSENGINE_API_URL=http://backend:8080 — реальный бэкенд;
 *   DRUGSENGINE_DATA_SOURCE=demo — демонстрационный каталог.
 * Если DRUGSENGINE_DATA_SOURCE не задан: api при наличии DRUGSENGINE_API_URL, иначе demo.
 *
 * Важно: при ошибке API мы НЕ подменяем ответ демо-данными — ошибка доходит до UI.
 */
export function getDataSource(): DataSource {
  if (instance) return instance;

  const apiUrl = process.env.DRUGSENGINE_API_URL?.trim();
  const mode = process.env.DRUGSENGINE_DATA_SOURCE?.trim() || (apiUrl ? "api" : "demo");

  if (mode === "api") {
    if (!apiUrl) {
      throw new Error("DRUGSENGINE_DATA_SOURCE=api, но DRUGSENGINE_API_URL не задан");
    }
    instance = new HttpDataSource(apiUrl);
  } else if (mode === "demo") {
    instance = new DemoDataSource();
  } else {
    throw new Error(`Неизвестный DRUGSENGINE_DATA_SOURCE: ${mode} (ожидается api или demo)`);
  }
  return instance;
}
