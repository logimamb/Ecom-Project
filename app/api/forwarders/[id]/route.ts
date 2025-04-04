import { db } from "@/lib/db";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const forwarder = await db.forwarders.findById(params.id);
    return NextResponse.json(forwarder);
  } catch (error) {
    console.error("Error fetching forwarder:", error);
    return NextResponse.json(
      { error: "Failed to fetch forwarder" },
      { status: 404 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const data = await request.json();
    const forwarder = await db.forwarders.update(params.id, data);
    return NextResponse.json(forwarder);
  } catch (error) {
    console.error("Error updating forwarder:", error);
    return NextResponse.json(
      { error: "Failed to update forwarder" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await db.forwarders.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting forwarder:", error);
    return NextResponse.json(
      { error: "Failed to delete forwarder" },
      { status: 500 }
    );
  }
}
