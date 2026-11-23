import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, PackageX, Sparkles } from "lucide-react";
import { OffersList } from "@/components/drug/OffersList";
import { AnalogList } from "@/components/drug/AnalogList";
import { MedicalNotice } from "@/components/drug/MedicalNotice";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state";
import { getDataSource } from "@/lib/server/source";
import { getDrug } from "@/lib/server/queries";
import { countLabel, formatPrice, formatPriceRange, formatUpdatedAt } from "@/lib/format";
import { searchHref } from "@/lib/search-params";
import type { DrugDetails } from "@/lib/contracts";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const drug = await getDrug((await params).id);
  if (!drug) return { title: "Препарат не найден" };
  const price = drug.minPrice != null ? ` от ${formatPrice(drug.minPrice)}` : "";
  return {
    title: drug.name,
    description: `${drug.name}${price} — цены в ${countLabel(drug.pharmacyCount, "аптеке", "аптеках", "аптеках")}.`,
  };
}

export default async function DrugPage({ params }: PageProps) {
  const drug = await getDrug((await params).id);
  if (!drug) notFound();

  return (
    <div className="container py-6 sm:py-8">
      <nav aria-label="Навигация" className="flex items-center gap-1 text-sm text-ink-3">
        <Link href="/search" className="hover:text-ink">Каталог</Link>
        <ChevronRight className="size-4" aria-hidden />
        <span className="truncate text-ink-2">{drug.name}</span>
      </nav>

      <div className="mt-4 grid gap-x-10 gap-y-8 lg:grid-cols-[1fr_340px]">
        <header className="lg:col-start-1">
          <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">{drug.name}</h1>
          <p className="mt-2 text-ink-2">
            {drug.manufacturer}
            {drug.country ? <span className="text-ink-3"> · {drug.country.name}</span> : null}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {drug.activeIngredient ? (
              <Link href={searchHref({ q: drug.activeIngredient })}>
                <Badge tone="brand" className="py-1 text-sm hover:underline">{drug.activeIngredient}</Badge>
              </Link>
            ) : null}
            {drug.form ? <Badge tone="outline" className="py-1 text-sm">{drug.form}</Badge> : null}
          </div>
        </header>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <PriceSummary drug={drug} />
          <AboutDrug drug={drug} className="hidden lg:block" />
        </aside>

        <div className="min-w-0 space-y-10 lg:col-start-1">
          <section id="offers" aria-labelledby="offers-title" className="scroll-mt-24">
            <div className="mb-4">
              <h2 id="offers-title" className="text-lg font-bold tracking-tight text-ink">Цены в аптеках</h2>
              <p className="mt-0.5 text-sm text-ink-2">Нажмите «Рядом со мной» — покажем ближайшую аптеку. Наличие лучше уточнить по телефону.</p>
            </div>
            {drug.offers.length > 0 ? (
              <OffersList offers={drug.offers} />
            ) : (
              <Card>
                <StateMessage icon={<PackageX />} title="Сейчас нет в аптеках">
                  Мы не нашли этот препарат в продаже. Посмотрите похожие препараты ниже.
                </StateMessage>
              </Card>
            )}
          </section>

          <section aria-labelledby="analogs-title">
            <div className="mb-4">
              <h2 id="analogs-title" className="text-lg font-bold tracking-tight text-ink">Похожие препараты</h2>
              <p className="mt-0.5 text-sm text-ink-2">Подобраны по сходству описаний и действующих веществ.</p>
            </div>
            <Suspense fallback={<AnalogsSkeleton />}>
              <Analogs drug={drug} />
            </Suspense>
            <MedicalNotice className="mt-3">
              Похожий препарат — не обязательно полноценная замена. Перед заменой посоветуйтесь с врачом или фармацевтом,
              особенно если препарат назначен по рецепту.
            </MedicalNotice>
          </section>

          <AboutDrug drug={drug} className="lg:hidden" />
        </div>
      </div>
    </div>
  );
}

function PriceSummary({ drug }: { drug: DrugDetails }) {
  const range = formatPriceRange(drug.minPrice, drug.maxPrice);
  const spread =
    drug.minPrice && drug.maxPrice && drug.maxPrice > drug.minPrice
      ? Math.round(((drug.maxPrice - drug.minPrice) / drug.minPrice) * 100)
      : null;
  const updated = formatUpdatedAt(drug.updatedAt);

  return (
    <Card className="p-5">
      {drug.minPrice != null ? (
        <>
          <p className="text-sm font-semibold text-ink-3">Цена</p>
          <p className="num mt-1 text-3xl font-extrabold tracking-tight text-ink">
            <span className="mr-1.5 text-lg font-semibold text-ink-3">от</span>
            {formatPrice(drug.minPrice)}
          </p>
          {range && drug.maxPrice !== drug.minPrice ? <p className="num mt-1 text-sm text-ink-2">{range}</p> : null}
          <dl className="mt-4 space-y-2 border-t border-dashed border-line-strong pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">Продаётся</dt>
              <dd className="font-semibold text-ink">в {countLabel(drug.pharmacyCount, "аптеке", "аптеках", "аптеках")}</dd>
            </div>
            {spread ? (
              <div className="flex justify-between gap-3">
                <dt className="text-ink-2">Разница в цене</dt>
                <dd className="font-semibold text-ink">до {spread}%</dd>
              </div>
            ) : null}
            {updated ? (
              <div className="flex justify-between gap-3">
                <dt className="text-ink-2">Обновлено</dt>
                <dd className="text-ink">{updated}</dd>
              </div>
            ) : null}
          </dl>
          <a
            href="#offers"
            className="mt-5 flex h-11 w-full items-center justify-center rounded-control bg-brand text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-hover lg:hidden"
          >
            Смотреть аптеки
          </a>
        </>
      ) : (
        <>
          <p className="text-lg font-bold text-ink">Нет в продаже</p>
          <p className="mt-1 text-sm text-ink-2">Ни одна из отслеживаемых аптек сейчас не продаёт этот препарат.</p>
        </>
      )}
    </Card>
  );
}

function AboutDrug({ drug, className }: { drug: DrugDetails; className?: string }) {
  return (
    <Card className={cn("p-5", className)}>
      <SectionTitle title="О препарате" as="h2" />
      {drug.description ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">{drug.description}</p>
          {drug.descriptionSource === "generated" ? (
            <p className="mt-3 flex items-start gap-1.5 text-xs text-warn">
              <Sparkles className="mt-px size-3.5 shrink-0" aria-hidden />
              Описание составлено автоматически и может содержать неточности. Сверяйтесь с инструкцией.
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm text-ink-3">Описание пока не добавлено. Сверяйтесь с инструкцией к препарату.</p>
      )}
      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        {[
          ["Действующее вещество", drug.activeIngredient],
          ["Форма выпуска", drug.form],
          ["Производитель", drug.manufacturer],
          ["Страна", drug.country?.name],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="grid grid-cols-[120px_1fr] gap-3">
              <dt className="text-ink-3">{k}</dt>
              <dd className="text-ink">{v}</dd>
            </div>
          ))}
      </dl>
    </Card>
  );
}

async function Analogs({ drug }: { drug: DrugDetails }) {
  let analogs;
  try {
    analogs = await getDataSource().getAnalogs(drug.id, 6);
  } catch (error) {
    console.error("[drug] не удалось загрузить похожие препараты", error);
    return <p className="rounded-card border border-dashed border-line-strong p-5 text-sm text-ink-2">Подбор похожих препаратов временно недоступен.</p>;
  }
  if (analogs.length === 0) {
    return <p className="rounded-card border border-dashed border-line-strong p-5 text-sm text-ink-2">Похожих препаратов не нашлось.</p>;
  }
  return <AnalogList analogs={analogs} basePrice={drug.minPrice} baseIngredient={drug.activeIngredient} />;
}

function AnalogsSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-[84px] rounded-card" />
      ))}
    </div>
  );
}
