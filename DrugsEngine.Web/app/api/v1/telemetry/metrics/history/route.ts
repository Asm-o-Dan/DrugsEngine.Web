import { NextRequest, NextResponse } from "next/server";
import { getMetricsHistoryMock } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const metric = request.nextUrl.searchParams.get("metric") || "latency";
  const range = request.nextUrl.searchParams.get("range") || "1h";

  const history = getMetricsHistoryMock(metric, range);
  return NextResponse.json(history);
}
