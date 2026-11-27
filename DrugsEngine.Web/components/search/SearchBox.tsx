"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import type { SearchMode, Suggestion } from "@/lib/contracts";
import { searchHref } from "@/lib/search-params";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 180;

interface SearchBoxProps {
  defaultValue?: string;
  mode?: SearchMode;
  size?: "md" | "lg";
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
}

type SuggestState =
  | { status: "idle" }
  | { status: "loading"; items: Suggestion[] }
  | { status: "ready"; items: Suggestion[] }
  | { status: "error" };

/**
 * Поле поиска с подсказками (WAI-ARIA combobox).
 * Enter — поиск по введённому тексту; стрелки + Enter — переход к препарату.
 */
export function SearchBox({
  defaultValue = "",
  mode = "exact",
  size = "md",
  autoFocus,
  className,
  placeholder: placeholderProp,
}: SearchBoxProps) {
  const placeholder = useDefaultPlaceholder(placeholderProp);
  const router = useRouter();
  const listId = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const [state, setState] = React.useState<SuggestState>({ status: "idle" });
  const [navigating, startTransition] = React.useTransition();

  React.useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setState({ status: "idle" });
      return;
    }
    const controller = new AbortController();
    setState((s) => ({ status: "loading", items: s.status === "ready" || s.status === "loading" ? s.items : [] }));
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { items: Suggestion[] };
        setState({ status: "ready", items: body.items });
        setActive(-1);
      } catch (error) {
        if (!controller.signal.aborted) setState({ status: "error" });
      }
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value]);

  const items = state.status === "ready" || state.status === "loading" ? state.items : [];
  const showList = open && value.trim().length >= 2 && (items.length > 0 || state.status === "ready" || state.status === "error");

  const go = (href: string) => {
    setOpen(false);
    inputRef.current?.blur();
    startTransition(() => router.push(href));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (active >= 0 && items[active]) {
      go(`/drugs/${items[active].id}`);
      return;
    }
    go(searchHref({ q: value.trim(), mode }));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (items.length ? (i + 1) % items.length : -1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (items.length ? (i <= 0 ? items.length - 1 : i - 1) : -1));
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setActive(-1);
      }
    }
  };

  const busy = state.status === "loading" || navigating;
  const lg = size === "lg";

  return (
    <form role="search" onSubmit={submit} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex items-center rounded-control border border-line-strong bg-surface transition-shadow",
          "focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15",
          lg ? "h-14 pl-4 pr-1.5 shadow-card" : "h-10 pl-3 pr-1",
        )}
      >
        {busy ? (
          <Loader2 className={cn("shrink-0 animate-spin text-ink-3", lg ? "size-5" : "size-4")} aria-hidden />
        ) : (
          <Search className={cn("shrink-0 text-ink-3", lg ? "size-5" : "size-4")} aria-hidden />
        )}
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder={placeholder}
          aria-label="Поиск лекарств"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-3 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden",
            lg ? "px-3 text-base sm:text-lg" : "px-2 text-sm",
          )}
        />
        {value ? (
          <button
            type="button"
            aria-label="Очистить"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            className="hit grid size-8 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        ) : null}
        {lg ? (
          <button
            type="submit"
            className="ml-1 h-11 shrink-0 rounded-[8px] bg-brand px-5 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-hover"
          >
            Найти
          </button>
        ) : null}
      </div>

      {showList ? (
        <div className="absolute inset-x-0 top-full z-40 mt-1.5 overflow-hidden rounded-control border border-line bg-surface shadow-pop animate-fade-up">
          <ul id={listId} role="listbox" aria-label="Подсказки" className="max-h-80 overflow-y-auto py-1">
            {items.map((item, index) => (
              <li
                key={item.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(`/drugs/${item.id}`)}
                onMouseEnter={() => setActive(index)}
                className={cn(
                  "flex cursor-pointer items-baseline gap-3 px-4 py-2.5",
                  index === active ? "bg-surface-2" : "",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{item.name}</span>
                  <span className="block truncate text-xs text-ink-3">{item.manufacturer}</span>
                </span>
                {item.minPrice != null ? (
                  <span className="num shrink-0 text-sm text-ink-2">от {formatPrice(item.minPrice)}</span>
                ) : null}
              </li>
            ))}
          </ul>
          {state.status === "ready" && items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-2">Подсказок нет — нажмите Enter, чтобы искать по всему каталогу.</p>
          ) : null}
          {state.status === "error" ? (
            <p className="px-4 py-3 text-sm text-ink-2">Подсказки временно недоступны. Поиск по Enter работает.</p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

const LONG_PLACEHOLDER = "Название лекарства или действующее вещество";
const SHORT_PLACEHOLDER = "Лекарство или вещество";

/** На узком экране длинная подсказка обрезается посередине слова — там показываем короткую. */
function useDefaultPlaceholder(explicit?: string) {
  const [wide, setWide] = React.useState(false);
  React.useEffect(() => {
    if (explicit) return;
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [explicit]);
  return explicit ?? (wide ? LONG_PLACEHOLDER : SHORT_PLACEHOLDER);
}
