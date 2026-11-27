import type { Metadata } from "next";
import { CheckCircle2, FlaskConical, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getDataSource } from "@/lib/server/source";
import { formatUpdatedAt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Состояние сервиса" };
export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const source = getDataSource();
  const health = await source.health();
  const stats = health.ok ? await source.getStats().catch(() => null) : null;
  const demo = health.source === "demo";

  const Icon = demo ? FlaskConical : health.ok ? CheckCircle2 : XCircle;

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Состояние сервиса</h1>

      <Card className="mt-6 p-6">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-full",
              demo ? "bg-warn-soft text-warn" : health.ok ? "bg-brand-soft text-brand" : "bg-danger-soft text-danger",
            )}
          >
            <Icon className="size-6" aria-hidden />
          </span>
          <div>
            <p className="text-lg font-bold text-ink">{health.message}</p>
            <p className="mt-1 text-sm text-ink-2">
              {demo
                ? "Сайт показывает встроенный демонстрационный каталог. Чтобы подключить реальные данные, задайте DRUGSENGINE_API_URL."
                : health.ok
                  ? "Данные загружаются из бэкенда DrugsEngine."
                  : "Страницы каталога сейчас могут не открываться. Мы не подменяем данные демо-версией, чтобы не показывать неверные цены."}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-x-6 gap-y-3 border-t border-line pt-5 text-sm sm:grid-cols-2">
          <Row k="Источник данных" v={demo ? "Демо" : "API"} />
          <Row k="Адрес" v={health.target} mono />
          <Row k="Время ответа" v={health.latencyMs != null ? `${health.latencyMs} мс` : "—"} />
          <Row k="Проверено" v={formatUpdatedAt(health.checkedAt) ?? "—"} />
          {stats ? (
            <>
              <Row k="Препаратов" v={stats.drugs.toLocaleString("ru-RU")} />
              <Row k="Аптек" v={stats.pharmacies.toLocaleString("ru-RU")} />
              <Row k="Цен в базе" v={stats.offers.toLocaleString("ru-RU")} />
              <Row k="Последний сбор цен" v={formatUpdatedAt(stats.updatedAt) ?? "—"} />
            </>
          ) : null}
        </dl>
      </Card>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 sm:block">
      <dt className="text-ink-3">{k}</dt>
      <dd className={cn("num font-semibold text-ink sm:mt-0.5", mono && "break-all font-mono text-xs")}>{v}</dd>
    </div>
  );
}
