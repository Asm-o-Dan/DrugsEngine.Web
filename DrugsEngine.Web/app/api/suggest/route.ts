import { NextResponse, type NextRequest } from "next/server";
import { getDataSource, DataSourceError } from "@/lib/server/source";

/** Подсказки для поля поиска. Браузер ходит сюда, а не напрямую в бэкенд. */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 2) return NextResponse.json({ items: [] });

  try {
    const items = await getDataSource().suggest(q, 7);
    return NextResponse.json({ items }, { headers: { "Cache-Control": "public, max-age=30" } });
  } catch (error) {
    const status = error instanceof DataSourceError && error.kind === "timeout" ? 504 : 502;
    console.error("[suggest]", error);
    return NextResponse.json(
      { type: "about:blank", title: "Подсказки недоступны", status },
      { status, headers: { "Content-Type": "application/problem+json" } },
    );
  }
}
