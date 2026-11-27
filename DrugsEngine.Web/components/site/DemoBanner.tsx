import Link from "next/link";
import { FlaskConical } from "lucide-react";

/** Явная пометка демо-режима: пользователь не должен принять демо-цены за настоящие. */
export function DemoBanner() {
  return (
    <div className="border-b border-warn/20 bg-warn-soft text-warn">
      <div className="container flex items-center gap-2 py-2 text-xs font-semibold sm:text-sm">
        <FlaskConical className="size-4 shrink-0" aria-hidden />
        <span>
          Демо-режим: цены и аптеки вымышленные.{" "}
          <Link href="/status" className="underline underline-offset-2">Подробнее</Link>
        </span>
      </div>
    </div>
  );
}
