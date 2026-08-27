import { NextRequest, NextResponse } from "next/server";
import { searchDrugsMock } from "@/lib/mockData";
import { SearchMode } from "@/contracts/contracts";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const rawMode = searchParams.get("mode");
  const validModes: SearchMode[] = ["exact", "semantic", "hybrid"];
  const mode: SearchMode = rawMode && validModes.includes(rawMode as SearchMode)
    ? (rawMode as SearchMode)
    : "hybrid";

  const category = searchParams.get("category") || undefined;
  const manufacturer = searchParams.get("manufacturer") || undefined;
  const inStockOnly = searchParams.get("inStockOnly") === "true";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const sortBy = searchParams.get("sortBy") || undefined;

  const result = searchDrugsMock(q, mode, {
    category,
    manufacturer,
    inStockOnly,
    page,
    limit,
    sortBy,
  });

  return NextResponse.json(result);
}
