import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronDown, CloudOff, SearchX, Sparkles } from "lucide-react";
import { DrugRow } from "@/components/drug/DrugCard";
import { FacetGroup, ModeSwitch, Pagination } from "@/components/search/Facets";
import { SortSelect } from "@/components/search/SortSelect";
import { StateMessage } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonStyles } from "@/components/ui/button";
import { DataSourceError, getDataSource } from "@/lib/server/source";
import { parseSearchParams, searchHref } from "@/lib/search-params";
import { countLabel } from "@/lib/format";
import type { SearchParams, SearchResponse } from "@/lib/contracts";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = parseSearchParams(await searchParams);
  return { title: q ? `«${q}» — поиск` : "Каталог лекарств" };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = parseSearchParams(await searchParams);
  return (
    <div className="container py-8">
      <Suspense key={JSON.stringify(params)} fallback={<ResultsSkeleton params={params} />}>
        <Results params={params} />
      </Suspense>
    </div>
  );
}

function Heading({ params, total }: { params: SearchParams; total?: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {params.q ? <>«{params.q}»</> : "Каталог лекарств"}
        </h1>
        <p className="mt-1 text-sm text-ink-2">
          {total === undefined ? "Ищем…" : total === 0 ? "Ничего не найдено" : `Найдено ${countLabel(total, "препарат", "препарата", "препаратов")}`}
        </p>
      </div>
      <ModeSwitch params={params} />
    </div>
  );
}

async function Results({ params }: { params: SearchParams }) {
  let result;
  try {
    result = await getDataSource().searchDrugs(params);
  } catch (error) {
    // Поиск по смыслу зависит от отдельного сервиса: если он недоступен, предлагаем обычный поиск,
    // а не показываем общий экран ошибки.
    if (params.mode === "semantic" && error instanceof DataSourceError && error.status === 503) {
      return <SemanticUnavailable params={params} />;
    }
    throw error;
  }
  const hasFilters = Boolean(params.manufacturer || params.country);

  return (
    <>
      <Heading params={params} total={result.total} />
      {params.mode === "semantic" ? (
        <p className="mt-3 flex items-start gap-2 text-sm text-ink-2">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          Ищем по смыслу описаний — подойдут запросы вроде «от изжоги» или «при температуре». Выбор препарата
          согласуйте с врачом или фармацевтом.
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr] lg:gap-8">
        <aside className="hidden space-y-6 lg:sticky lg:top-24 lg:block lg:self-start" aria-label="Фильтры">
          <Filters params={params} result={result} hasFilters={hasFilters} />
        </aside>
        <details className="group rounded-card border border-line bg-surface lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span>
              Фильтры
              {hasFilters ? <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs text-brand-ink">{[params.manufacturer, params.country].filter(Boolean).length}</span> : null}
            </span>
            <ChevronDown className="size-4 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <div className="space-y-6 border-t border-line px-2 py-4">
            <Filters params={params} result={result} hasFilters={hasFilters} />
          </div>
        </details>

        <section aria-label="Результаты" className="min-w-0">
          {result.items.length > 0 ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-ink-3 lg:invisible">{result.total > result.pageSize ? `Страница ${result.page}` : ""}</p>
                <SortSelect params={params} />
              </div>
              <ul className="space-y-2.5">
                {result.items.map((item) => (
                  <li key={item.id}>
                    <DrugRow drug={item} />
                  </li>
                ))}
              </ul>
              <Pagination params={params} total={result.total} />
            </>
          ) : (
            <div className="rounded-card border border-dashed border-line-strong">
              <StateMessage
                icon={<SearchX />}
                title={hasFilters ? "С такими фильтрами ничего нет" : "Ничего не нашлось"}
                action={
                  hasFilters ? (
                    <Link className={buttonStyles({ variant: "secondary" })} href={searchHref({ q: params.q, mode: params.mode })}>
                      Сбросить фильтры
                    </Link>
                  ) : params.mode === "exact" && params.q ? (
                    <Link className={buttonStyles({ variant: "secondary" })} href={searchHref({ q: params.q, mode: "semantic" })}>
                      <Sparkles /> Искать по симптомам
                    </Link>
                  ) : null
                }
              >
                {hasFilters
                  ? "Попробуйте убрать часть фильтров."
                  : "Проверьте написание или поищите по действующему веществу. Если вы описываете симптом — переключитесь на поиск по симптомам."}
              </StateMessage>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function SemanticUnavailable({ params }: { params: SearchParams }) {
  return (
    <>
      <Heading params={params} total={0} />
      <div className="mt-6 rounded-card border border-dashed border-line-strong">
        <StateMessage
          icon={<CloudOff />}
          title="Поиск по симптомам временно недоступен"
          action={
            <Link className={buttonStyles()} href={searchHref({ q: params.q, mode: "exact" })}>
              Искать по названию
            </Link>
          }
        >
          Сервис, который подбирает препараты по описанию, сейчас не отвечает. Поиск по названию и действующему веществу
          работает.
        </StateMessage>
      </div>
    </>
  );
}

function Filters({ params, result, hasFilters }: { params: SearchParams; result: SearchResponse; hasFilters: boolean }) {
  return (
    <>
      <FacetGroup title="Производитель" facets={result.facets.manufacturers} param="manufacturer" params={params} />
      <FacetGroup title="Страна" facets={result.facets.countries} param="country" params={params} />
      {hasFilters ? (
        <Link
          href={searchHref({ q: params.q, mode: params.mode, sort: params.sort })}
          className="inline-block px-2 text-sm font-semibold text-brand hover:underline"
        >
          Сбросить фильтры
        </Link>
      ) : null}
    </>
  );
}

function ResultsSkeleton({ params }: { params: SearchParams }) {
  return (
    <div aria-busy="true">
      <Heading params={params} />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-2 lg:block">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-7" />
          ))}
        </div>
        <div className="space-y-2.5 pt-12">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-[98px] rounded-card" />
          ))}
        </div>
      </div>
    </div>
  );
}
