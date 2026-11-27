import { SearchModeSchema, SearchSortSchema, type SearchParams } from "@/lib/contracts";

export const PAGE_SIZE = 12;

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Разбирает query-параметры URL /search в типизированные параметры поиска. */
export function parseSearchParams(raw: RawParams): SearchParams {
  const q = (first(raw.q) ?? "").trim().slice(0, 200);
  const mode = SearchModeSchema.catch("exact").parse(first(raw.mode));
  const sort = SearchSortSchema.catch("relevance").parse(first(raw.sort));
  const pageNumber = Number.parseInt(first(raw.page) ?? "1", 10);

  return {
    q,
    mode,
    sort,
    manufacturer: first(raw.manufacturer) || undefined,
    country: first(raw.country) || undefined,
    page: Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1,
    pageSize: PAGE_SIZE,
  };
}

/** Собирает URL страницы поиска; значения по умолчанию в URL не попадают. */
export function searchHref(params: Partial<SearchParams>): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.mode && params.mode !== "exact") sp.set("mode", params.mode);
  if (params.sort && params.sort !== "relevance") sp.set("sort", params.sort);
  if (params.manufacturer) sp.set("manufacturer", params.manufacturer);
  if (params.country) sp.set("country", params.country);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `/search?${qs}` : "/search";
}
