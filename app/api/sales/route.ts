import { NextResponse } from "next/server";
import * as salesDb from "@/lib/db/sales";
import { saleSchema } from "@/lib/validations/sale";

export async function GET() {
  try {
    const sales = await salesDb.getAll();
    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validationResult = saleSchema.safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid sale data", details: validationResult.error },
        { status: 400 }
      );
    }

    const sale = await salesDb.create(validationResult.data);
    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { sales } = await request.json();
    
    if (!Array.isArray(sales)) {
      return NextResponse.json(
        { error: "Invalid data: sales must be an array" },
        { status: 400 }
      );
    }

    // Update all sales with converted currency values
    await salesDb.updateMany(sales);

    return NextResponse.json({ message: "Sales updated successfully" });
  } catch (error) {
    console.error("Error updating sales:", error);
    return NextResponse.json(
      { error: "Failed to update sales" },
      { status: 500 }
    );
  }
}
