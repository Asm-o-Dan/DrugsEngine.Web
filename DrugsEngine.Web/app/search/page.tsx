"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel, FilterState } from "@/components/search/FilterPanel";
import { SearchResults } from "@/components/search/SearchResults";
import { apiClient } from "@/lib/apiClient";
import {
  SearchDrugItem,
  SearchMode,
  SearchSuggestionItem,
  SearchFacetItem,
} from "@/contracts/contracts";
import { Sparkles, Shield, Database } from "lucide-react";

function SearchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL query params
  const initialQ = searchParams.get("q") || "";
  const initialMode = (searchParams.get("mode") as SearchMode) || "hybrid";
  const initialCategory = searchParams.get("category") || undefined;
  const initialManufacturer = searchParams.get("manufacturer") || undefined;
  const initialInStock = searchParams.get("inStockOnly") === "true";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialSortBy = (searchParams.get("sortBy") as FilterState["sortBy"]) || "relevance";

  const [query, setQuery] = React.useState(initialQ);
  const [mode, setMode] = React.useState<SearchMode>(initialMode);
  const [filters, setFilters] = React.useState<FilterState>({
    category: initialCategory,
    manufacturer: initialManufacturer,
    dosageForm: undefined,
    prescriptionStatus: "all",
    inStockOnly: initialInStock,
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: initialSortBy,
  });

  const [status, setStatus] = React.useState<
    "idle" | "loading" | "error" | "empty" | "success"
  >(initialQ ? "loading" : "idle");
  const [items, setItems] = React.useState<SearchDrugItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(initialPage);
  const [totalPages, setTotalPages] = React.useState(1);
  const [executionTimeMs, setExecutionTimeMs] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();
  const [facets, setFacets] = React.useState<{
    categories: SearchFacetItem[];
    manufacturers: SearchFacetItem[];
  }>({
    categories: [],
    manufacturers: [],
  });

  const [suggestions, setSuggestions] = React.useState<SearchSuggestionItem[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

  // Load recent searches from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("drugsengine_recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 8);
      try {
        localStorage.setItem("drugsengine_recent_searches", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleRemoveRecentSearch = (q: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== q);
      try {
        localStorage.setItem("drugsengine_recent_searches", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("drugsengine_recent_searches");
    } catch {
      // ignore
    }
  };

  // Synchronize URL with search state
  const syncUrlParams = React.useCallback(
    (newQuery: string, newMode: SearchMode, newFilters: FilterState, newPage: number) => {
      const params = new URLSearchParams();
      if (newQuery) params.set("q", newQuery);
      if (newMode && newMode !== "hybrid") params.set("mode", newMode);
      if (newFilters.category) params.set("category", newFilters.category);
      if (newFilters.manufacturer) params.set("manufacturer", newFilters.manufacturer);
      if (newFilters.inStockOnly) params.set("inStockOnly", "true");
      if (newFilters.sortBy && newFilters.sortBy !== "relevance") params.set("sortBy", newFilters.sortBy);
      if (newPage > 1) params.set("page", String(newPage));

      const searchStr = params.toString();
      const newUrl = searchStr ? `${pathname}?${searchStr}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  // Perform search query
  const performSearch = React.useCallback(
    async (q: string, searchMode: SearchMode, filterState: FilterState, targetPage: number = 1) => {
      if (!q.trim()) {
        setStatus("idle");
        setItems([]);
        setTotal(0);
        return;
      }

      setStatus("loading");
      setErrorMessage(undefined);

      try {
        const res = await apiClient.searchDrugs(q, searchMode, {
          category: filterState.category,
          manufacturer: filterState.manufacturer,
          inStockOnly: filterState.inStockOnly,
          page: targetPage,
          limit: 10,
          sortBy: filterState.sortBy,
        });

        // Client-side additional filters if necessary
        let resultItems = res.items;
        if (filterState.prescriptionStatus && filterState.prescriptionStatus !== "all") {
          const isRx = filterState.prescriptionStatus === "rx";
          // If needed filter
        }
        if (filterState.dosageForm) {
          resultItems = resultItems.filter((d) =>
            d.releaseForm.toLowerCase().includes(filterState.dosageForm!.toLowerCase())
          );
        }
        if (filterState.minPrice !== undefined) {
          resultItems = resultItems.filter((d) => d.pricing.minPrice >= filterState.minPrice!);
        }
        if (filterState.maxPrice !== undefined) {
          resultItems = resultItems.filter((d) => d.pricing.minPrice <= filterState.maxPrice!);
        }

        setItems(resultItems);
        setTotal(res.total);
        setPage(res.page);
        setTotalPages(res.totalPages);
        setExecutionTimeMs(res.executionTimeMs);
        setFacets({
          categories: res.facets.categories,
          manufacturers: res.facets.manufacturers,
        });

        if (resultItems.length === 0) {
          setStatus("empty");
        } else {
          setStatus("success");
        }
        saveRecentSearch(q);
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Ошибка подключения к DrugsEngine API");
      }
    },
    []
  );

  // Suggestions fetcher
  React.useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    let isMounted = true;
    setIsLoadingSuggestions(true);

    apiClient
      .getSuggestions(query, 6)
      .then((res) => {
        if (isMounted) {
          setSuggestions(res.suggestions || []);
        }
      })
      .catch(() => {
        if (isMounted) setSuggestions([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSuggestions(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  // Trigger search on query / mode / filters / page changes
  React.useEffect(() => {
    performSearch(query, mode, filters, page);
    syncUrlParams(query, mode, filters, page);
  }, [query, mode, filters, page, performSearch, syncUrlParams]);

  const handleQueryChange = (newQ: string) => {
    setQuery(newQ);
    setPage(1);
  };

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    setPage(1);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: undefined,
      manufacturer: undefined,
      dosageForm: undefined,
      prescriptionStatus: "all",
      inStockOnly: false,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: "relevance",
    });
    setPage(1);
  };

  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          <span>Гибридный поисковый движок DrugsEngine 1.4</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Умный поиск медикаментов & Векторные аналоги
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Точный триграммный поиск по каталогу аптек в сочетании с 768-мерными векторными эмбеддингами Qdrant для мгновенного подбора аналогов.
        </p>
      </div>

      {/* Main Search Bar */}
      <SearchBar
        query={query}
        onQueryChange={handleQueryChange}
        mode={mode}
        onModeChange={handleModeChange}
        suggestions={suggestions}
        isLoadingSuggestions={isLoadingSuggestions}
        recentSearches={recentSearches}
        onRemoveRecentSearch={handleRemoveRecentSearch}
        onClearRecentSearches={handleClearRecentSearches}
        autoFocus={!initialQ}
      />

      {/* Grid: Filters on Left, Search Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <aside className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            facets={facets}
            totalResults={total}
          />
        </aside>

        <main className="lg:col-span-3">
          <SearchResults
            status={status}
            items={items}
            total={total}
            page={page}
            totalPages={totalPages}
            executionTimeMs={executionTimeMs}
            query={query}
            mode={mode}
            errorMessage={errorMessage}
            onRetry={() => performSearch(query, mode, filters, page)}
            onPageChange={(p) => setPage(p)}
            onSelectQuery={(q) => {
              setQuery(q);
              setPage(1);
            }}
            onSwitchToSemantic={() => {
              setMode("semantic");
              setPage(1);
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 py-8">
          <div className="h-8 w-64 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-14 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="lg:col-span-3 h-96 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
