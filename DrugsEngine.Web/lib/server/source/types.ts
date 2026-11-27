import type {
  Analog,
  CatalogStats,
  DrugDetails,
  DrugSummary,
  PharmacyDetails,
  PharmacyFilter,
  PharmacyList,
  SearchParams,
  SearchResponse,
  Suggestion,
} from "@/lib/contracts";

export type DataSourceKind = "api" | "demo";

export interface HealthReport {
  source: DataSourceKind;
  ok: boolean;
  latencyMs: number | null;
  target: string;
  message: string;
  checkedAt: string;
}

/**
 * Всё, что UI получает о данных, проходит через этот интерфейс.
 * Реализации: HttpDataSource (бэкенд DrugsEngine) и DemoDataSource (локальные фикстуры).
 * Методы get* возвращают null, если сущность не найдена; прочие сбои — DataSourceError.
 */
export interface DataSource {
  readonly kind: DataSourceKind;
  searchDrugs(params: SearchParams): Promise<SearchResponse>;
  suggest(q: string, limit: number): Promise<Suggestion[]>;
  getPopular(limit: number): Promise<DrugSummary[]>;
  getDrug(id: string): Promise<DrugDetails | null>;
  getAnalogs(id: string, limit: number): Promise<Analog[]>;
  listPharmacies(filter: PharmacyFilter): Promise<PharmacyList>;
  getPharmacy(id: string): Promise<PharmacyDetails | null>;
  getStats(): Promise<CatalogStats>;
  health(): Promise<HealthReport>;
}
