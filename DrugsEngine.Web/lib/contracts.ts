/**
 * Контракт данных между веб-клиентом и бэкендом DrugsEngine.
 *
 * Схемы zod — единственный источник правды: из них выводятся TypeScript-типы,
 * и ими же валидируется каждый ответ API на границе (lib/server/source/http.ts).
 * Описание эндпоинтов для бэкенда — docs/API.md.
 */
import { z } from "zod";

export const CountrySchema = z.object({
  code: z.string(),
  name: z.string(),
});

export const GeoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const PharmacySchema = z.object({
  id: z.string(),
  network: z.string(),
  number: z.number().int(),
  city: z.string(),
  address: z.string(),
  phone: z.string().nullable(),
  hours: z.string().nullable(),
  location: GeoPointSchema.nullable(),
});

export const DrugSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  manufacturer: z.string(),
  country: CountrySchema.nullable(),
  form: z.string().nullable(),
  activeIngredient: z.string().nullable(),
  minPrice: z.number().nullable(),
  maxPrice: z.number().nullable(),
  pharmacyCount: z.number().int().nonnegative(),
  updatedAt: z.string().nullable(),
});

export const StockLevelSchema = z.enum(["low", "medium", "high"]);

export const OfferSchema = z.object({
  pharmacy: PharmacySchema,
  price: z.number(),
  quantity: z.number().nullable(),
  /** Уровень остатка, если сеть его сообщает («Столетник» — да, «Доктор» — нет). */
  stockLevel: StockLevelSchema.nullable().optional(),
  updatedAt: z.string(),
});

export const DrugDetailsSchema = DrugSummarySchema.extend({
  description: z.string().nullable(),
  /** official — из инструкции/реестра, generated — сгенерировано автоматически (LLM). */
  descriptionSource: z.enum(["official", "generated"]).nullable(),
  offers: z.array(OfferSchema),
});

export const AnalogSchema = DrugSummarySchema.extend({
  /** Косинусная близость описаний, 0..1. */
  similarity: z.number().min(0).max(1),
});
export const AnalogListSchema = z.object({ items: z.array(AnalogSchema) });

export const SearchModeSchema = z.enum(["exact", "semantic"]);
export const SearchSortSchema = z.enum(["relevance", "price_asc", "price_desc", "name"]);

export const FacetSchema = z.object({
  value: z.string(),
  label: z.string(),
  count: z.number().int().nonnegative(),
});

export const SearchResultItemSchema = DrugSummarySchema.extend({
  score: z.number().nullable(),
});

export const SearchResponseSchema = z.object({
  query: z.string(),
  mode: SearchModeSchema,
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  items: z.array(SearchResultItemSchema),
  facets: z.object({
    manufacturers: z.array(FacetSchema),
    countries: z.array(FacetSchema),
  }),
});

export const SuggestionSchema = z.object({
  id: z.string(),
  name: z.string(),
  manufacturer: z.string(),
  minPrice: z.number().nullable(),
});
export const SuggestionListSchema = z.object({ items: z.array(SuggestionSchema) });

export const DrugListSchema = z.object({ items: z.array(DrugSummarySchema) });

export const PharmacyListItemSchema = PharmacySchema.extend({
  assortmentCount: z.number().int().nonnegative(),
});

export const PharmacyListSchema = z.object({
  items: z.array(PharmacyListItemSchema),
  networks: z.array(z.string()),
  cities: z.array(z.string()),
});

export const PharmacyOfferSchema = z.object({
  drug: DrugSummarySchema.pick({ id: true, name: true, manufacturer: true, form: true }),
  price: z.number(),
  updatedAt: z.string(),
});

export const PharmacyDetailsSchema = PharmacySchema.extend({
  offers: z.array(PharmacyOfferSchema),
});

export const CatalogStatsSchema = z.object({
  drugs: z.number().int().nonnegative(),
  pharmacies: z.number().int().nonnegative(),
  networks: z.number().int().nonnegative(),
  offers: z.number().int().nonnegative(),
  updatedAt: z.string().nullable(),
});

export type Country = z.infer<typeof CountrySchema>;
export type Pharmacy = z.infer<typeof PharmacySchema>;
export type DrugSummary = z.infer<typeof DrugSummarySchema>;
export type Offer = z.infer<typeof OfferSchema>;
export type StockLevel = z.infer<typeof StockLevelSchema>;
export type DrugDetails = z.infer<typeof DrugDetailsSchema>;
export type Analog = z.infer<typeof AnalogSchema>;
export type SearchMode = z.infer<typeof SearchModeSchema>;
export type SearchSort = z.infer<typeof SearchSortSchema>;
export type Facet = z.infer<typeof FacetSchema>;
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type Suggestion = z.infer<typeof SuggestionSchema>;
export type PharmacyListItem = z.infer<typeof PharmacyListItemSchema>;
export type PharmacyList = z.infer<typeof PharmacyListSchema>;
export type PharmacyOffer = z.infer<typeof PharmacyOfferSchema>;
export type PharmacyDetails = z.infer<typeof PharmacyDetailsSchema>;
export type CatalogStats = z.infer<typeof CatalogStatsSchema>;

export interface SearchParams {
  q: string;
  mode: SearchMode;
  sort: SearchSort;
  manufacturer?: string;
  country?: string;
  page: number;
  pageSize: number;
}

export interface PharmacyFilter {
  network?: string;
  city?: string;
  q?: string;
}
