import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";
import { PharmacyCard } from "@/components/pharmacy/PharmacyCard";
import { StateMessage } from "@/components/ui/state";
import { getDataSource } from "@/lib/server/source";
import { countLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Аптеки" };

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

function hrefWith(current: { network?: string; city?: string }, patch: { network?: string; city?: string }) {
  const next = { ...current, ...patch };
  const sp = new URLSearchParams();
  if (next.network) sp.set("network", next.network);
  if (next.city) sp.set("city", next.city);
  const qs = sp.toString();
  return qs ? `/pharmacies?${qs}` : "/pharmacies";
}

function Chips({ label, values, active, make }: { label: string; values: string[]; active?: string; make: (v?: string) => string }) {
  if (values.length < 2) return null;
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-sm text-ink-3">{label}:</span>
      {[undefined, ...values].map((v) => {
        const isActive = v === active;
        return (
          <Link
            key={v ?? "all"}
            href={make(v)}
            scroll={false}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-semibold transition-colors",
              isActive ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
            )}
          >
            {v ?? "Все"}
          </Link>
        );
      })}
    </div>
  );
}

export default async function PharmaciesPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filter = { network: one(raw.network), city: one(raw.city) };
  const list = await getDataSource().listPharmacies(filter);

  const byCity = new Map<string, typeof list.items>();
  for (const p of list.items) byCity.set(p.city, [...(byCity.get(p.city) ?? []), p]);
  const cities = [...byCity.keys()].sort(
    (a, b) => byCity.get(b)!.length - byCity.get(a)!.length || a.localeCompare(b, "ru"),
  );

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Аптеки</h1>
      <p className="mt-1 text-sm text-ink-2">
        {countLabel(list.items.length, "аптека", "аптеки", "аптек")}, цены которых мы отслеживаем.
      </p>

      <div className="mt-6 space-y-3">
        <Chips label="Сеть" values={list.networks} active={filter.network} make={(v) => hrefWith(filter, { network: v })} />
        <Chips label="Город" values={list.cities} active={filter.city} make={(v) => hrefWith(filter, { city: v })} />
      </div>

      {cities.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-line-strong">
          <StateMessage
            icon={<Store />}
            title="Аптек не найдено"
            action={<Link href="/pharmacies" className="font-semibold text-brand hover:underline">Показать все</Link>}
          >
            Попробуйте выбрать другую сеть или город.
          </StateMessage>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {cities.map((city) => (
            <section key={city} aria-labelledby={`city-${city}`}>
              <h2 id={`city-${city}`} className="flex items-baseline gap-2 text-lg font-bold text-ink">
                {city}
                <span className="num text-sm font-semibold text-ink-3">{byCity.get(city)!.length}</span>
              </h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {byCity.get(city)!.map((p) => (
                  <li key={p.id}>
                    <PharmacyCard pharmacy={p} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
