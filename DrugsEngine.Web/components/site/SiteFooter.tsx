import Link from "next/link";
import { LogoMark } from "./Logo";

export function SiteFooter({ demo }: { demo: boolean }) {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="container grid gap-8 py-10 text-sm text-ink-2 md:grid-cols-[1fr_auto]">
        <div className="max-w-xl space-y-3">
          <div className="flex items-center gap-2 font-bold text-ink">
            <LogoMark className="size-6" /> DrugsEngine
          </div>
          <p>
            Сравнение цен на лекарства в аптеках. Цены и наличие собираются с сайтов аптечных сетей и могут
            отличаться от фактических — уточняйте по телефону аптеки.
          </p>
          <p className="text-ink-3">
            Информация о препаратах не заменяет консультацию врача или фармацевта.
            {demo ? " Сейчас показаны демонстрационные данные." : ""}
          </p>
        </div>
        <nav aria-label="Ссылки в подвале" className="flex flex-wrap gap-x-6 gap-y-4 md:flex-col md:items-end">
          <Link className="hit hover:text-ink" href="/search">Каталог</Link>
          <Link className="hit hover:text-ink" href="/pharmacies">Аптеки</Link>
          <Link className="hit hover:text-ink" href="/status">Состояние сервиса</Link>
        </nav>
      </div>
    </footer>
  );
}
