// app/api/admin/enquiries/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Admin panel not available." }, { status: 503 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Admin panel not available." }, { status: 503 });
}
