"use client";

import * as React from "react";
import { Search, Sparkles, Target, X, Loader2 } from "lucide-react";
import { SearchMode, SearchSuggestionItem } from "@/contracts/contracts";
import { SearchSuggestions } from "./SearchSuggestions";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  suggestions?: SearchSuggestionItem[];
  isLoadingSuggestions?: boolean;
  onSearchSubmit?: (query: string) => void;
  recentSearches?: string[];
  onRemoveRecentSearch?: (query: string) => void;
  onClearRecentSearches?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  query,
  onQueryChange,
  mode,
  onModeChange,
  suggestions = [],
  isLoadingSuggestions = false,
  onSearchSubmit,
  recentSearches = [],
  onRemoveRecentSearch,
  onClearRecentSearches,
  placeholder = "Поиск по торговому названию, МНН (ибупрофен), симптому (головная боль)...",
  autoFocus = false,
  className,
}: SearchBarProps) {
  const [inputValue, setInputValue] = React.useState(query);
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync external query changes
  React.useEffect(() => {
    setInputValue(query);
  }, [query]);

  // 300ms debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== query) {
        onQueryChange(inputValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, query, onQueryChange]);

  // Keyboard shortcut '/' to focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement !== inputRef.current &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener for suggestions popup
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setInputValue("");
    onQueryChange("");
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (text: string) => {
    setInputValue(text);
    onQueryChange(text);
    setIsFocused(false);
    if (onSearchSubmit) {
      onSearchSubmit(text);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFocused(false);
    if (onSearchSubmit) {
      onSearchSubmit(inputValue);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full space-y-3", className)}>
      {/* Mode Switcher Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => onModeChange("exact")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              mode === "exact"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <Target className={cn("h-3.5 w-3.5", mode === "exact" ? "text-emerald-500" : "text-slate-400")} />
            <span>Точный поиск (Trigram BM25)</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange("semantic")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              mode === "semantic"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <Sparkles className={cn("h-3.5 w-3.5", mode === "semantic" ? "text-sky-500" : "text-slate-400")} />
            <span>Семантический Qdrant AI</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange("hybrid")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              mode === "hybrid"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Гибридный режим</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <span>Нажмите</span>
          <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            /
          </kbd>
          <span>для фокуса</span>
        </div>
      </div>

      {/* Main Input Box */}
      <form onSubmit={handleFormSubmit} className="relative">
        <div
          className={cn(
            "relative flex items-center rounded-2xl border bg-white shadow-sm transition-all dark:bg-slate-900",
            isFocused
              ? "border-emerald-500 ring-4 ring-emerald-500/10 shadow-md dark:border-emerald-400 dark:ring-emerald-400/10"
              : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
          )}
        >
          <div className="flex h-14 w-12 items-center justify-center pl-2 text-slate-400">
            {isLoadingSuggestions ? (
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            ) : mode === "semantic" ? (
              <Sparkles className="h-5 w-5 text-sky-500 animate-pulse" />
            ) : (
              <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="h-14 w-full bg-transparent pr-24 text-base font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Очистить запрос"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="submit"
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-all shadow-sm"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Найти</span>
            </button>
          </div>
        </div>

        {/* Suggestions Popover */}
        <SearchSuggestions
          suggestions={suggestions}
          recentSearches={recentSearches}
          isOpen={isFocused}
          onSelectSuggestion={handleSelectSuggestion}
          onRemoveRecentSearch={onRemoveRecentSearch}
          onClearRecentSearches={onClearRecentSearches}
          activeQuery={inputValue}
        />
      </form>
    </div>
  );
}
