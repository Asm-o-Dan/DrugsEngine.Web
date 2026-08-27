"use client";

import * as React from "react";
import { SearchSuggestionItem } from "@/contracts/contracts";
import { Pill, Sparkles, History, Search, ArrowUpRight, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchSuggestionsProps {
  suggestions: SearchSuggestionItem[];
  recentSearches: string[];
  isOpen: boolean;
  onSelectSuggestion: (text: string, id?: string | null) => void;
  onRemoveRecentSearch?: (query: string) => void;
  onClearRecentSearches?: () => void;
  activeQuery: string;
}

export function SearchSuggestions({
  suggestions,
  recentSearches,
  isOpen,
  onSelectSuggestion,
  onRemoveRecentSearch,
  onClearRecentSearches,
  activeQuery,
}: SearchSuggestionsProps) {
  if (!isOpen) return null;

  const showRecent = !activeQuery.trim() && recentSearches.length > 0;
  const showSuggestions = activeQuery.trim().length >= 2 && suggestions.length > 0;

  if (!showRecent && !showSuggestions) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 animate-in fade-in-0 zoom-in-95 duration-150">
      {showRecent && (
        <div className="p-3">
          <div className="flex items-center justify-between px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-slate-400" />
              Недавние поисковые запросы
            </span>
            {onClearRecentSearches && (
              <button
                type="button"
                onClick={onClearRecentSearches}
                className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
              >
                Очистить
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 px-1 pt-1">
            {recentSearches.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40 transition-all cursor-pointer group"
                onClick={() => onSelectSuggestion(item)}
              >
                <Clock className="h-3 w-3 text-slate-400 group-hover:text-emerald-500" />
                <span>{item}</span>
                {onRemoveRecentSearch && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveRecentSearch(item);
                    }}
                    className="ml-0.5 text-slate-400 hover:text-rose-500 p-0.5 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {showSuggestions && (
        <div className="py-2">
          <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Подходящие подсказки и вещества
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {suggestions.map((item, idx) => {
              const isSymptom = item.type === "SYMPTOM_QUERY";
              const isIngredient = item.type === "ACTIVE_INGREDIENT";
              return (
                <li
                  key={idx}
                  onClick={() => onSelectSuggestion(item.text, item.id)}
                  className="flex items-center justify-between px-3.5 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs",
                        isSymptom
                          ? "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
                          : isIngredient
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                      )}
                    >
                      {isSymptom ? (
                        <Sparkles className="h-3.5 w-3.5" />
                      ) : isIngredient ? (
                        <Pill className="h-3.5 w-3.5" />
                      ) : (
                        <Search className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {item.text}
                      </span>
                      {item.category && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {item.minPrice !== undefined && item.minPrice !== null && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        от {item.minPrice} ₽
                      </span>
                    )}
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
