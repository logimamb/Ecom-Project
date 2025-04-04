import { NextResponse } from "next/server";
import * as inventoryDb from "@/lib/db/inventory";
import { inventorySchema } from "@/lib/validations/inventory";

export async function GET() {
  try {
    const inventory = await inventoryDb.getAll();
    return NextResponse.json({ inventory });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = inventorySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid inventory data",
          details: validationResult.error,
        },
        { status: 400 }
      );
    }

    const item = await inventoryDb.create(validationResult.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { inventory } = await request.json();
    
    if (!Array.isArray(inventory)) {
      return NextResponse.json(
        { error: "Invalid data: inventory must be an array" },
        { status: 400 }
      );
    }

    // Update all inventory items with converted currency values
    await inventoryDb.updateMany(inventory);

    return NextResponse.json({ message: "Inventory updated successfully" });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}
