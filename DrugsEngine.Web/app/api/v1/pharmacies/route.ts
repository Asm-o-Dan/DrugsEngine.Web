import { NextRequest, NextResponse } from "next/server";
import { getPharmaciesMock } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const drugId = sp.get("drugId") || undefined;
  const lat = sp.has("lat") && !isNaN(Number(sp.get("lat"))) ? parseFloat(sp.get("lat")!) : undefined;
  const lng = sp.has("lng") && !isNaN(Number(sp.get("lng"))) ? parseFloat(sp.get("lng")!) : undefined;
  const radiusKm = sp.has("radiusKm") && !isNaN(Number(sp.get("radiusKm"))) ? parseFloat(sp.get("radiusKm")!) : undefined;
  const network = sp.get("network") || undefined;
  const inStockOnly = sp.get("inStockOnly") === "true";
  const isOpenNow = sp.get("isOpenNow") === "true";

  const result = getPharmaciesMock({
    drugId,
    lat,
    lng,
    radiusKm,
    network,
    inStockOnly,
    isOpenNow,
  });

  return NextResponse.json(result);
}
