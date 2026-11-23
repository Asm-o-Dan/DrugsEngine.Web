import Link from "next/link";
import { ArrowRight, Phone, Search, Store } from "lucide-react";
import { SearchBox } from "@/components/search/SearchBox";
import { DrugTile } from "@/components/drug/DrugCard";
import { SectionTitle } from "@/components/ui/card";
import { getDataSource } from "@/lib/server/source";
import { countLabel, formatPrice, formatUpdatedAt } from "@/lib/format";
import { searchHref } from "@/lib/search-params";
import type { DrugDetails } from "@/lib/contracts";

export const dynamic = "force-dynamic";

const QUICK_QUERIES = [
  { label: "Ибупрофен", q: "ибупрофен", mode: "exact" as const },
  { label: "Омепразол", q: "омепразол", mode: "exact" as const },
  { label: "Но-шпа", q: "но-шпа", mode: "exact" as const },
  { label: "от аллергии", q: "аллергия", mode: "semantic" as const },
  { label: "от изжоги", q: "изжога", mode: "semantic" as const },
  { label: "при температуре", q: "температура", mode: "semantic" as const },
];

function ReceiptPreview({ drug }: { drug: DrugDetails }) {
  const offers = drug.offers.slice(0, 4);
  const max = drug.maxPrice ?? 0;
  const min = drug.minPrice ?? 0;
  const spread = min > 0 ? Math.round(((max - min) / min) * 100) : 0;

  return (
    <Link
      href={`/drugs/${drug.id}`}
      className="group relative block rotate-[0.6deg] rounded-[6px] border border-line bg-surface px-6 pb-6 pt-5 shadow-pop transition-transform hover:rotate-0"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">Пример сравнения</p>
      <p className="mt-2 text-lg font-extrabold leading-snug text-ink group-hover:text-brand">{drug.name}</p>
      <p className="text-sm text-ink-2">{drug.manufacturer}</p>
      <ol className="mt-4 space-y-2.5 border-t border-dashed border-line-strong pt-4">
        {offers.map((o, i) => (
          <li key={o.pharmacy.id} className="flex items-baseline gap-2 text-sm">
            <span className="truncate text-ink-2">
              {o.pharmacy.network} №{o.pharmacy.number}
            </span>
            <span className="leader" aria-hidden />
            <span className={i === 0 ? "num rounded bg-deal px-1.5 font-extrabold text-deal-ink" : "num font-semibold text-ink"}>
              {formatPrice(o.price)}
            </span>
          </li>
        ))}
      </ol>
      {spread > 0 ? (
        <p className="mt-4 border-t border-dashed border-line-strong pt-3 text-sm text-ink-2">
          Разница между аптеками — <span className="font-extrabold text-ink">{spread}%</span>
        </p>
      ) : null}
      {/* зубчатый край чека */}
      <span
        aria-hidden
        className="absolute inset-x-0 -bottom-[7px] h-2 bg-[radial-gradient(circle_at_6px_0,transparent_5px,rgb(var(--surface))_5.5px)] bg-[length:12px_8px]"
      />
    </Link>
  );
}

export default async function HomePage() {
  const source = getDataSource();
  const [stats, popular] = await Promise.all([source.getStats(), source.getPopular(8)]);
  const showcase = popular.find((d) => d.pharmacyCount >= 3) ?? popular[0];
  const showcaseDetails = showcase ? await source.getDrug(showcase.id) : null;
  const updated = formatUpdatedAt(stats.updatedAt);

  return (
    <>
      <section className="border-b border-line">
        <div className="container grid items-center gap-12 py-12 md:py-20 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Найдите лекарство <span className="text-brand">дешевле</span>
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-ink-2">
              Сравниваем цены в {countLabel(stats.pharmacies, "аптеке", "аптеках", "аптеках")}{" "}
              {countLabel(stats.networks, "сети", "сетей", "сетей")} и показываем, где препарат есть прямо сейчас.
            </p>
            <SearchBox size="lg" className="mt-8 max-w-2xl" />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-ink-3">Например:</span>
              {QUICK_QUERIES.map((item) => (
                <Link
                  key={item.label}
                  href={searchHref({ q: item.q, mode: item.mode })}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-ink-3">Препаратов в каталоге</dt>
                <dd className="num mt-0.5 text-xl font-extrabold text-ink">{stats.drugs.toLocaleString("ru-RU")}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Цен из аптек</dt>
                <dd className="num mt-0.5 text-xl font-extrabold text-ink">{stats.offers.toLocaleString("ru-RU")}</dd>
              </div>
              {updated ? (
                <div>
                  <dt className="text-ink-3">Последнее обновление</dt>
                  <dd className="mt-0.5 text-xl font-extrabold text-ink">{updated}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          {showcaseDetails && showcaseDetails.offers.length > 0 ? (
            <div className="mx-auto w-full max-w-sm lg:mr-0">
              <ReceiptPreview drug={showcaseDetails} />
            </div>
          ) : null}
        </div>
      </section>

      {popular.length > 0 ? (
        <section className="container py-14">
          <SectionTitle
            title="Часто ищут"
            action={
              <Link href="/search" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                Весь каталог <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          />
          <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {popular.map((drug) => (
              <li key={drug.id}>
                <DrugTile drug={drug} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="container pb-4">
        <ol className="grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
          {[
            { icon: Search, title: "Найдите препарат", text: "По названию, действующему веществу — или опишите, от чего нужно лекарство." },
            { icon: Store, title: "Сравните аптеки", text: "Цены отсортированы от дешёвых к дорогим, с адресами и часами работы." },
            { icon: Phone, title: "Уточните и купите", text: "Позвоните в аптеку прямо со страницы, чтобы проверить наличие." },
          ].map((step, i) => (
            <li key={step.title} className="bg-surface p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-brand-soft text-brand">
                  <step.icon className="size-[18px]" aria-hidden />
                </span>
                <span className="num text-sm font-bold text-ink-3">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
