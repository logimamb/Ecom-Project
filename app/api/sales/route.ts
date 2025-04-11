import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const salesPath = path.join(process.cwd(), "data", "sales.json");
    const salesData = await fs.readFile(salesPath, "utf8");
    const { sales } = JSON.parse(salesData);

    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Error reading sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const salesPath = path.join(process.cwd(), "data", "sales.json");
    const salesData = await fs.readFile(salesPath, "utf8");
    const { sales } = JSON.parse(salesData);
    const data = await request.json();

    const newSale = {
      ...data,
      id: crypto.randomUUID(),
      total: data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(
      salesPath,
      JSON.stringify({ sales: [...sales, newSale] }, null, 2)
    );

    return NextResponse.json({ sale: newSale }, { status: 201 });
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
    const salesPath = path.join(process.cwd(), "data", "sales.json");
    await fs.writeFile(
      salesPath,
      JSON.stringify({ sales }, null, 2)
    );

    return NextResponse.json({ message: "Sales updated successfully" });
  } catch (error) {
    console.error("Error updating sales:", error);
    return NextResponse.json(
      { error: "Failed to update sales" },
      { status: 500 }
    );
  }
}
