import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const inventoryPath = path.join(process.cwd(), "data", "inventory.json");
    const inventoryData = await fs.readFile(inventoryPath, "utf8");
    const { inventory } = JSON.parse(inventoryData);

    return NextResponse.json({ products: inventory });
  } catch (error) {
    console.error("Error reading inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
