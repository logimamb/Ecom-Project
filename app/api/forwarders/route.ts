import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const forwarders = await db.forwarders.findAll();
    return NextResponse.json(forwarders);
  } catch (error) {
    console.error("Error fetching forwarders:", error);
    return NextResponse.json(
      { error: "Failed to fetch forwarders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const forwarder = await db.forwarders.create(data);
    return NextResponse.json(forwarder);
  } catch (error) {
    console.error("Error creating forwarder:", error);
    return NextResponse.json(
      { error: "Failed to create forwarder" },
      { status: 500 }
    );
  }
}
