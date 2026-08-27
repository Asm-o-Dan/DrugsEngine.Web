import { NextRequest, NextResponse } from "next/server";
import { getDirectionsMock } from "@/lib/mockData";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pharmacyId: string }> }
) {
  const { pharmacyId } = await params;
  const sp = request.nextUrl.searchParams;
  const fromLat = parseFloat(sp.get("fromLat") || "55.7558");
  const fromLng = parseFloat(sp.get("fromLng") || "37.6173");
  const mode = sp.get("mode") || "driving";

  const directions = getDirectionsMock(pharmacyId, fromLat, fromLng, mode);
  return NextResponse.json(directions);
}
