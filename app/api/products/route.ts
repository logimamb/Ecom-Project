import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const productsPath = path.join(process.cwd(), "data", "products.json");
    
    // Create products.json if it doesn't exist
    try {
      await fs.access(productsPath);
    } catch {
      await fs.writeFile(productsPath, JSON.stringify({ products: [] }));
    }
    
    const productsData = await fs.readFile(productsPath, "utf8");
    const data = JSON.parse(productsData);

    // Return the products array directly
    return NextResponse.json(data.products);
  } catch (error) {
    console.error("Error reading products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const productsPath = path.join(process.cwd(), "data", "products.json");
    const data = await request.json();

    await fs.writeFile(productsPath, JSON.stringify({ products: data }, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating products:", error);
    return NextResponse.json(
      { error: "Failed to update products" },
      { status: 500 }
    );
  }
}
