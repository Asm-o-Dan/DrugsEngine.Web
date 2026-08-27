import { NextRequest, NextResponse } from "next/server";
import { createReservationMock } from "@/lib/mockData";
import { CreateReservationRequest, ApiErrorResponse } from "@/contracts/contracts";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pharmacyId: string }> }
) {
  const { pharmacyId } = await params;
  let body: CreateReservationRequest;

  try {
    body = await request.json();
  } catch {
    const errorResponse: ApiErrorResponse = {
      type: "https://drugsengine.internal/errors/bad-request",
      title: "Invalid Request Payload",
      status: 400,
      detail: "Failed to parse JSON body for drug reservation.",
      instance: `/api/v1/pharmacies/${pharmacyId}/reserve`,
      code: "BAD_REQUEST",
      timestamp: new Date().toISOString(),
      traceId: crypto.randomUUID(),
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  if (!body.drugId || !body.customerPhone || !body.customerName) {
    const errorResponse: ApiErrorResponse = {
      type: "https://drugsengine.internal/errors/validation-failed",
      title: "Validation Error",
      status: 422,
      detail: "drugId, customerPhone and customerName are required.",
      instance: `/api/v1/pharmacies/${pharmacyId}/reserve`,
      code: "VALIDATION_FAILED",
      timestamp: new Date().toISOString(),
      traceId: crypto.randomUUID(),
      validationErrors: [
        ...(!body.drugId ? [{ field: "drugId", message: "Drug ID is required" }] : []),
        ...(!body.customerPhone ? [{ field: "customerPhone", message: "Customer phone is required" }] : []),
        ...(!body.customerName ? [{ field: "customerName", message: "Customer name is required" }] : []),
      ],
    };
    return NextResponse.json(errorResponse, { status: 422 });
  }

  const reservation = createReservationMock(pharmacyId, body);
  return NextResponse.json(reservation, { status: 201 });
}
