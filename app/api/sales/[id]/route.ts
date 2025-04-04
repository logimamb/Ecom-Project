import { NextResponse } from "next/server";
import * as salesDb from "@/lib/db/sales";
import { saleSchema } from "@/lib/validations/sale";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sale = await salesDb.getById(params.id);
    if (!sale) {
      return NextResponse.json(
        { error: "Sale not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ sale });
  } catch (error) {
    console.error("Error fetching sale:", error);
    return NextResponse.json(
      { error: "Failed to fetch sale" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const validationResult = saleSchema.safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid sale data", details: validationResult.error },
        { status: 400 }
      );
    }

    const sale = await salesDb.getById(params.id);
    if (!sale) {
      return NextResponse.json(
        { error: "Sale not found" },
        { status: 404 }
      );
    }

    const updatedSale = await salesDb.update(params.id, validationResult.data);
    return NextResponse.json({ sale: updatedSale });
  } catch (error) {
    console.error("Error updating sale:", error);
    return NextResponse.json(
      { error: "Failed to update sale" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sale = await salesDb.getById(params.id);
    if (!sale) {
      return NextResponse.json(
        { error: "Sale not found" },
        { status: 404 }
      );
    }

    await salesDb.remove(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    );
  }
}
