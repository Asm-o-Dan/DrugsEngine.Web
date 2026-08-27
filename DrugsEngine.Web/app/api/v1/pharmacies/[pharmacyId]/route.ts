import { NextRequest, NextResponse } from "next/server";
import { getPharmacyDetailsMock } from "@/lib/mockData";
import { ApiErrorResponse } from "@/contracts/contracts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pharmacyId: string }> }
) {
  const { pharmacyId } = await params;
  const pharmacy = getPharmacyDetailsMock(pharmacyId);

  if (!pharmacy) {
    const errorResponse: ApiErrorResponse = {
      type: "https://drugsengine.internal/errors/not-found",
      title: "Pharmacy Not Found",
      status: 404,
      detail: `Pharmacy with identifier '${pharmacyId}' was not found.`,
      instance: `/api/v1/pharmacies/${pharmacyId}`,
      code: "PHARMACY_NOT_FOUND",
      timestamp: new Date().toISOString(),
      traceId: crypto.randomUUID(),
    };
    return NextResponse.json(errorResponse, { status: 404 });
  }

  return NextResponse.json(pharmacy);
}
