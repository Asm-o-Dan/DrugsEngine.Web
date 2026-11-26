import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";
import { PharmaciesExplorer } from "@/components/pharmacy/PharmaciesExplorer";
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
    <div
      role="group"
      aria-label={label}
      className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0 [&::-webkit-scrollbar]:hidden"
    >
      <span className="mr-1 shrink-0 text-sm text-ink-3">{label}:</span>
      {[undefined, ...values].map((v) => {
        const isActive = v === active;
        return (
          <Link
            key={v ?? "all"}
            href={make(v)}
            scroll={false}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "hit shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-sm font-semibold transition-colors",
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

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Аптеки</h1>
      <p className="mt-1 text-sm text-ink-2">
        {countLabel(list.items.length, "аптека", "аптеки", "аптек")}, цены которых мы отслеживаем.
      </p>

      <div className="mt-6 space-y-1 sm:space-y-3">
        <Chips label="Сеть" values={list.networks} active={filter.network} make={(v) => hrefWith(filter, { network: v })} />
        <Chips label="Город" values={list.cities} active={filter.city} make={(v) => hrefWith(filter, { city: v })} />
      </div>

      {list.items.length === 0 ? (
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
        <div className="mt-6">
          <PharmaciesExplorer items={list.items} />
        </div>
      )}
    </div>
  );
}
