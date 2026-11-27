import "server-only";
import type { z } from "zod";
import {
  AnalogListSchema,
  CatalogStatsSchema,
  DrugDetailsSchema,
  DrugListSchema,
  PharmacyDetailsSchema,
  PharmacyListSchema,
  SearchResponseSchema,
  SuggestionListSchema,
  type PharmacyFilter,
  type SearchParams,
} from "@/lib/contracts";
import { DataSourceError } from "./errors";
import type { DataSource, HealthReport } from "./types";

const DEFAULT_TIMEOUT_MS = 8000;

interface RequestOptions {
  /** Сколько секунд Next.js может кешировать ответ. 0 — без кеша. */
  revalidate?: number;
  /** Вернуть null на 404 вместо ошибки. */
  nullOn404?: boolean;
  timeoutMs?: number;
}

/** Клиент REST API бэкенда DrugsEngine (контракт — docs/API.md). */
export class HttpDataSource implements DataSource {
  readonly kind = "api" as const;

  constructor(private readonly baseUrl: string) {}

  private async request<S extends z.ZodTypeAny>(
    path: string,
    schema: S,
    options: RequestOptions & { nullOn404: true },
  ): Promise<z.infer<S> | null>;
  private async request<S extends z.ZodTypeAny>(
    path: string,
    schema: S,
    options?: RequestOptions,
  ): Promise<z.infer<S>>;
  private async request<S extends z.ZodTypeAny>(
    path: string,
    schema: S,
    { revalidate = 60, nullOn404 = false, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {},
  ): Promise<z.infer<S> | null> {
    const url = new URL(path, this.baseUrl);
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
        ...(revalidate > 0 ? { next: { revalidate } } : { cache: "no-store" as const }),
      });
    } catch (error) {
      const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
      throw new DataSourceError(
        isTimeout ? "timeout" : "unavailable",
        `${isTimeout ? "Таймаут" : "Сбой соединения"} при запросе ${url.pathname}`,
      );
    }

    if (response.status === 404 && nullOn404) return null;
    if (!response.ok) {
      throw new DataSourceError("http", `${url.pathname} ответил ${response.status}`, response.status);
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new DataSourceError("bad_response", `${url.pathname} вернул не JSON`);
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      console.error(`[api] ${url.pathname}: ответ не соответствует контракту`, parsed.error.flatten());
      throw new DataSourceError("bad_response", `${url.pathname} вернул данные не по контракту`);
    }
    return parsed.data;
  }

  async searchDrugs(params: SearchParams) {
    const qs = new URLSearchParams({
      q: params.q,
      mode: params.mode,
      sort: params.sort,
      page: String(params.page),
      pageSize: String(params.pageSize),
    });
    if (params.manufacturer) qs.set("manufacturer", params.manufacturer);
    if (params.country) qs.set("country", params.country);
    return this.request(`/api/v1/drugs/search?${qs}`, SearchResponseSchema, { revalidate: 30 });
  }

  async suggest(q: string, limit: number) {
    const qs = new URLSearchParams({ q, limit: String(limit) });
    const res = await this.request(`/api/v1/drugs/suggest?${qs}`, SuggestionListSchema, {
      revalidate: 30,
      timeoutMs: 3000,
    });
    return res.items;
  }

  async getPopular(limit: number) {
    const res = await this.request(`/api/v1/drugs/popular?limit=${limit}`, DrugListSchema, {
      revalidate: 300,
    });
    return res.items;
  }

  async getDrug(id: string) {
    return this.request(`/api/v1/drugs/${encodeURIComponent(id)}`, DrugDetailsSchema, {
      nullOn404: true,
    });
  }

  async getAnalogs(id: string, limit: number) {
    const res = await this.request(
      `/api/v1/drugs/${encodeURIComponent(id)}/analogs?limit=${limit}`,
      AnalogListSchema,
      { revalidate: 300 },
    );
    return res.items;
  }

  async listPharmacies(filter: PharmacyFilter) {
    const qs = new URLSearchParams();
    if (filter.network) qs.set("network", filter.network);
    if (filter.city) qs.set("city", filter.city);
    if (filter.q) qs.set("q", filter.q);
    return this.request(`/api/v1/pharmacies?${qs}`, PharmacyListSchema, { revalidate: 300 });
  }

  async getPharmacy(id: string) {
    return this.request(`/api/v1/pharmacies/${encodeURIComponent(id)}`, PharmacyDetailsSchema, {
      nullOn404: true,
    });
  }

  async getStats() {
    return this.request(`/api/v1/stats`, CatalogStatsSchema, { revalidate: 300 });
  }

  async health(): Promise<HealthReport> {
    const started = performance.now();
    const target = new URL("/health", this.baseUrl).toString();
    const checkedAt = new Date().toISOString();
    try {
      const res = await fetch(target, { cache: "no-store", signal: AbortSignal.timeout(3000) });
      const latencyMs = Math.round(performance.now() - started);
      return {
        source: this.kind,
        ok: res.ok,
        latencyMs,
        target,
        message: res.ok ? "Бэкенд отвечает" : `Бэкенд ответил ${res.status}`,
        checkedAt,
      };
    } catch {
      return { source: this.kind, ok: false, latencyMs: null, target, message: "Бэкенд недоступен", checkedAt };
    }
  }
}
