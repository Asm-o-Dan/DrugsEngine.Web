import { NextResponse } from "next/server";
import { getSystemHealthMock } from "@/lib/mockData";

export async function GET() {
  const health = getSystemHealthMock();
  return NextResponse.json(health);
}
