import * as React from "react";
import Link from "next/link";
import { Pill, ShieldCheck, Database, Server } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 py-12 transition-colors">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white dark:bg-emerald-500">
                <Pill className="h-4 w-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                Drugs<span className="text-emerald-600 dark:text-emerald-400">Engine</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Высоконагруженная фармацевтическая поисковая система на основе триграммного поиска Trigram BM25 + Qdrant 768-dim Vector Search.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Навигация</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/search" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Умный поиск препаратов</Link></li>
              <li><Link href="/drug/e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Векторные аналоги и дженерики</Link></li>
              <li><Link href="/pharmacies" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Аптеки & Онлайн-бронирование</Link></li>
              <li><Link href="/telemetry" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Телеметрия & SLA сервисов</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Инженерный стек</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5"><Server className="h-3.5 w-3.5 text-emerald-500" /> .NET 8 Kestrel WebAPI & MediatR CQRS</li>
              <li className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-sky-500" /> PostgreSQL 16 + Qdrant Vector DB</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> Apache Kafka Event Streaming</li>
              <li className="flex items-center gap-1.5"><Pill className="h-3.5 w-3.5 text-teal-500" /> Next.js 15 App Router & Tailwind CSS</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Статус кластера</h4>
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">API Gateway:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Healthy (99.98%)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Qdrant Vectors:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">128,450 векторов</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Latency P95:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">18.5 ms</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 DrugsEngine Inc. Все права защищены.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">OpenAPI 3.1 & TypeScript Strict Mode Compliant</p>
        </div>
      </div>
    </footer>
  );
}
