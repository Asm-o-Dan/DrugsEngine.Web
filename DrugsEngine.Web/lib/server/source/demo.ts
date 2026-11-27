import "server-only";
import type {
  Analog,
  CatalogStats,
  DrugDetails,
  DrugSummary,
  Facet,
  Offer,
  PharmacyDetails,
  PharmacyFilter,
  PharmacyList,
  SearchParams,
  SearchResponse,
  SearchResultItem,
  Suggestion,
} from "@/lib/contracts";
import { DEMO_DRUGS, DEMO_PHARMACIES, type DemoDrug } from "../demo/fixtures";
import type { DataSource, HealthReport } from "./types";

/** Детерминированный хеш, чтобы демо-цены не менялись между запросами. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const normalize = (s: string) =>
  s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

const stem = (word: string) => word.slice(0, Math.max(4, Math.min(word.length, 6)));

const LOADED_AT = Date.now();

function buildOffers(drug: DemoDrug): Offer[] {
  return DEMO_PHARMACIES.flatMap((pharmacy) => {
    const h = hash(`${drug.id}:${pharmacy.id}`);
    if (h % 10 >= 7) return [];
    const factor = 0.9 + (h % 31) / 100;
    const price = Math.round(drug.basePrice * factor * 10) / 10;
    const hoursAgo = 1 + (h % 40);
    return [
      {
        pharmacy,
        price,
        quantity: null,
        updatedAt: new Date(LOADED_AT - hoursAgo * 3600_000).toISOString(),
      },
    ];
  }).sort((a, b) => a.price - b.price);
}

const OFFERS = new Map(DEMO_DRUGS.map((d) => [d.id, buildOffers(d)]));

function toSummary(drug: DemoDrug): DrugSummary {
  const offers = OFFERS.get(drug.id) ?? [];
  const prices = offers.map((o) => o.price);
  const latest = offers.reduce<string | null>(
    (acc, o) => (acc == null || o.updatedAt > acc ? o.updatedAt : acc),
    null,
  );
  return {
    id: drug.id,
    name: drug.name,
    manufacturer: drug.manufacturer,
    country: drug.country,
    form: drug.form,
    activeIngredient: drug.activeIngredient,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    pharmacyCount: offers.length,
    updatedAt: latest,
  };
}

function exactScore(drug: DemoDrug, q: string): number {
  const name = normalize(drug.name);
  if (name.startsWith(q)) return 1;
  if (name.includes(q)) return 0.9;
  if (normalize(drug.activeIngredient).includes(q)) return 0.8;
  if (normalize(drug.manufacturer).includes(q)) return 0.6;
  return 0;
}

/** Имитация семантического поиска: совпадение основ слов запроса с тегами и описанием. */
function semanticScore(drug: DemoDrug, q: string): number {
  const tokens = q.split(" ").filter((t) => t.length >= 3);
  if (!tokens.length) return exactScore(drug, q);
  const haystack = normalize([drug.name, drug.activeIngredient, drug.tags.join(" "), drug.description].join(" "));
  const words = new Set(haystack.split(" ").map(stem));
  const hits = tokens.filter((t) => words.has(stem(t)) || haystack.includes(t)).length;
  if (!hits) return 0;
  const tagBoost = drug.tags.some((tag) => tokens.some((t) => stem(tag) === stem(t))) ? 0.1 : 0;
  return Math.min(0.97, 0.55 + (hits / tokens.length) * 0.3 + tagBoost);
}

function facetsOf(items: SearchResultItem[], key: "manufacturer" | "country"): Facet[] {
  const counts = new Map<string, Facet>();
  for (const item of items) {
    const value = key === "manufacturer" ? item.manufacturer : item.country?.code;
    const label = key === "manufacturer" ? item.manufacturer : item.country?.name;
    if (!value || !label) continue;
    const facet = counts.get(value) ?? { value, label, count: 0 };
    facet.count += 1;
    counts.set(value, facet);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ru"));
}

export class DemoDataSource implements DataSource {
  readonly kind = "demo" as const;

  async searchDrugs(params: SearchParams): Promise<SearchResponse> {
    const q = normalize(params.q);
    const scorer = params.mode === "semantic" ? semanticScore : exactScore;

    const matched: SearchResultItem[] = DEMO_DRUGS.map((drug) => ({
      drug,
      score: q ? scorer(drug, q) : 1,
    }))
      .filter((r) => r.score > 0)
      .map((r) => ({ ...toSummary(r.drug), score: q ? Math.round(r.score * 100) / 100 : null }));

    const filtered = matched.filter(
      (item) =>
        (!params.manufacturer || item.manufacturer === params.manufacturer) &&
        (!params.country || item.country?.code === params.country),
    );

    const byPrice = (dir: 1 | -1) => (a: SearchResultItem, b: SearchResultItem) =>
      (a.minPrice ?? Infinity) * dir - (b.minPrice ?? Infinity) * dir;
    const sorters: Record<SearchParams["sort"], (a: SearchResultItem, b: SearchResultItem) => number> = {
      relevance: (a, b) => (b.score ?? 0) - (a.score ?? 0) || a.name.localeCompare(b.name, "ru"),
      price_asc: byPrice(1),
      price_desc: (a, b) => (b.minPrice ?? -1) - (a.minPrice ?? -1),
      name: (a, b) => a.name.localeCompare(b.name, "ru"),
    };
    filtered.sort(sorters[params.sort]);

    const start = (params.page - 1) * params.pageSize;
    return {
      query: params.q,
      mode: params.mode,
      total: filtered.length,
      page: params.page,
      pageSize: params.pageSize,
      items: filtered.slice(start, start + params.pageSize),
      facets: {
        manufacturers: facetsOf(matched, "manufacturer"),
        countries: facetsOf(matched, "country"),
      },
    };
  }

  async suggest(q: string, limit: number): Promise<Suggestion[]> {
    const nq = normalize(q);
    if (nq.length < 2) return [];
    return DEMO_DRUGS.map((drug) => ({ drug, score: exactScore(drug, nq) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.drug.name.localeCompare(b.drug.name, "ru"))
      .slice(0, limit)
      .map(({ drug }) => ({
        id: drug.id,
        name: drug.name,
        manufacturer: drug.manufacturer,
        minPrice: toSummary(drug).minPrice,
      }));
  }

  async getPopular(limit: number): Promise<DrugSummary[]> {
    const popular = [1, 4, 7, 9, 11, 16, 21, 23].map((n) => DEMO_DRUGS[n - 1]);
    return popular.slice(0, limit).map(toSummary);
  }

  async getDrug(id: string): Promise<DrugDetails | null> {
    const drug = DEMO_DRUGS.find((d) => d.id === id);
    if (!drug) return null;
    return {
      ...toSummary(drug),
      description: drug.description,
      descriptionSource: drug.descriptionSource,
      offers: OFFERS.get(drug.id) ?? [],
    };
  }

  async getAnalogs(id: string, limit: number): Promise<Analog[]> {
    const source = DEMO_DRUGS.find((d) => d.id === id);
    if (!source) return [];
    const sourceTags = new Set(source.tags);
    return DEMO_DRUGS.filter((d) => d.id !== id)
      .map((d) => {
        const shared = d.tags.filter((t) => sourceTags.has(t)).length;
        const jaccard = shared / (new Set([...d.tags, ...source.tags]).size || 1);
        const sameIngredient = d.activeIngredient === source.activeIngredient;
        const similarity = sameIngredient ? 0.9 + jaccard * 0.08 : 0.5 + jaccard * 0.4;
        return { d, similarity: Math.round(similarity * 1000) / 1000 };
      })
      .filter((r) => r.similarity >= 0.62)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ d, similarity }) => ({ ...toSummary(d), similarity }));
  }

  async listPharmacies(filter: PharmacyFilter): Promise<PharmacyList> {
    const q = filter.q ? normalize(filter.q) : "";
    const items = DEMO_PHARMACIES.filter(
      (p) =>
        (!filter.network || p.network === filter.network) &&
        (!filter.city || p.city === filter.city) &&
        (!q || normalize(`${p.network} ${p.number} ${p.city} ${p.address}`).includes(q)),
    ).map((p) => ({
      ...p,
      assortmentCount: DEMO_DRUGS.filter((d) => OFFERS.get(d.id)?.some((o) => o.pharmacy.id === p.id)).length,
    }));
    return {
      items,
      networks: [...new Set(DEMO_PHARMACIES.map((p) => p.network))].sort((a, b) => a.localeCompare(b, "ru")),
      cities: [...new Set(DEMO_PHARMACIES.map((p) => p.city))].sort((a, b) => a.localeCompare(b, "ru")),
    };
  }

  async getPharmacy(id: string): Promise<PharmacyDetails | null> {
    const pharmacy = DEMO_PHARMACIES.find((p) => p.id === id);
    if (!pharmacy) return null;
    const offers = DEMO_DRUGS.flatMap((drug) => {
      const offer = OFFERS.get(drug.id)?.find((o) => o.pharmacy.id === id);
      return offer
        ? [{ drug: { id: drug.id, name: drug.name, manufacturer: drug.manufacturer, form: drug.form }, price: offer.price, updatedAt: offer.updatedAt }]
        : [];
    }).sort((a, b) => a.drug.name.localeCompare(b.drug.name, "ru"));
    return { ...pharmacy, offers };
  }

  async getStats(): Promise<CatalogStats> {
    const all = [...OFFERS.values()].flat();
    return {
      drugs: DEMO_DRUGS.length,
      pharmacies: DEMO_PHARMACIES.length,
      networks: new Set(DEMO_PHARMACIES.map((p) => p.network)).size,
      offers: all.length,
      updatedAt: all.reduce<string | null>((acc, o) => (acc == null || o.updatedAt > acc ? o.updatedAt : acc), null),
    };
  }

  async health(): Promise<HealthReport> {
    return {
      source: this.kind,
      ok: true,
      latencyMs: 0,
      target: "Локальные демонстрационные данные",
      message: "Демо-режим: бэкенд не подключён",
      checkedAt: new Date().toISOString(),
    };
  }
}
