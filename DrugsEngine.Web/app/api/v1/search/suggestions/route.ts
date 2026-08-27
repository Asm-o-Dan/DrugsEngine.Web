import { NextRequest, NextResponse } from "next/server";
import { getSuggestionsMock } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "6", 10);

  const result = getSuggestionsMock(q, limit);
  return NextResponse.json(result);
}
