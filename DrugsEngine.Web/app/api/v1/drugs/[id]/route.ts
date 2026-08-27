import { NextRequest, NextResponse } from "next/server";
import { getDrugDetailsMock } from "@/lib/mockData";
import { ApiErrorResponse } from "@/contracts/contracts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const drug = getDrugDetailsMock(id);

  if (!drug) {
    const errorResponse: ApiErrorResponse = {
      type: "https://drugsengine.internal/errors/not-found",
      title: "Drug Not Found",
      status: 404,
      detail: `Drug with identifier '${id}' was not found in catalog.`,
      instance: `/api/v1/drugs/${id}`,
      code: "DRUG_NOT_FOUND",
      timestamp: new Date().toISOString(),
      traceId: crypto.randomUUID(),
    };
    return NextResponse.json(errorResponse, { status: 404 });
  }

  return NextResponse.json(drug);
}
