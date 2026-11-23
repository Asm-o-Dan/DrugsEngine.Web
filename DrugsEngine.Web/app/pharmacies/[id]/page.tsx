import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, MapPin, Phone } from "lucide-react";
import { Assortment } from "@/components/pharmacy/Assortment";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPharmacy } from "@/lib/server/queries";
import { countLabel, mapHref, telHref } from "@/lib/format";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await getPharmacy((await params).id);
  return { title: p ? `${p.network} №${p.number}, ${p.address}` : "Аптека не найдена" };
}

export default async function PharmacyPage({ params }: PageProps) {
  const pharmacy = await getPharmacy((await params).id);
  if (!pharmacy) notFound();

  return (
    <div className="container py-6 sm:py-8">
      <nav aria-label="Навигация" className="flex items-center gap-1 text-sm text-ink-3">
        <Link href="/pharmacies" className="hover:text-ink">Аптеки</Link>
        <ChevronRight className="size-4" aria-hidden />
        <span className="truncate text-ink-2">{pharmacy.network} №{pharmacy.number}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {pharmacy.network} №{pharmacy.number}
          </h1>
          <p className="mt-2 text-ink-2">
            {pharmacy.city}, {pharmacy.address}
          </p>

          <section className="mt-8" aria-labelledby="assortment-title">
            <h2 id="assortment-title" className="mb-1 text-lg font-bold text-ink">Цены в этой аптеке</h2>
            <p className="mb-4 text-sm text-ink-2">
              {countLabel(pharmacy.offers.length, "препарат", "препарата", "препаратов")} из нашего каталога.
            </p>
            <Assortment offers={pharmacy.offers} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="space-y-4 p-5 text-sm">
            {pharmacy.hours ? (
              <p className="flex items-start gap-2.5 text-ink">
                <Clock className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden /> {pharmacy.hours}
              </p>
            ) : null}
            <p className="flex items-start gap-2.5 text-ink">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden /> {pharmacy.city}, {pharmacy.address}
            </p>
            <div className="flex flex-col gap-2 pt-1">
              {pharmacy.phone ? (
                <a href={telHref(pharmacy.phone)} className={buttonStyles({ size: "lg", className: "w-full" })}>
                  <Phone /> Позвонить: {pharmacy.phone}
                </a>
              ) : null}
              <a
                href={mapHref(pharmacy.city, pharmacy.address)}
                target="_blank"
                rel="noreferrer"
                className={buttonStyles({ variant: "secondary", size: "lg", className: "w-full" })}
              >
                <MapPin /> Открыть на карте
              </a>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
