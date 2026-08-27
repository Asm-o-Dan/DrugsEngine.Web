import { NextResponse } from "next/server";
import { getSystemMetricsMock } from "@/lib/mockData";

export async function GET() {
  const metrics = getSystemMetricsMock();
  return NextResponse.json(metrics);
}
