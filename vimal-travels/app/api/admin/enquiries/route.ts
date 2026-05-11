// app/api/admin/enquiries/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Enquiry from "@/models/Enquiry";

// Simple token-based auth — set ADMIN_SECRET in your .env.local
function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  return token === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: enquiries });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch enquiries." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const { id, status } = await req.json();
    const updated = await Enquiry.findByIdAndUpdate(id, { status }, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status." }, { status: 500 });
  }
}
