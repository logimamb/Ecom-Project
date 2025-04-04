import { NextResponse } from "next/server";
import * as z from "zod";
import * as customersDb from "@/lib/db/customers";

const loyaltyPointsSchema = z.object({
  points: z.number()
    .min(-1000, "Cannot deduct more than 1000 points")
    .max(1000, "Cannot add more than 1000 points"),
  reason: z.string().min(1, "Please provide a reason for the adjustment"),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validationResult = loyaltyPointsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error },
        { status: 400 }
      );
    }

    const { points, reason } = validationResult.data;

    // Get current customer
    const customer = await customersDb.getById(params.id);
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Calculate new points total
    const newTotal = customer.loyaltyPoints + points;
    if (newTotal < 0) {
      return NextResponse.json(
        { error: "Cannot reduce points below zero" },
        { status: 400 }
      );
    }

    // Update customer with new points
    const updatedCustomer = await customersDb.update(params.id, {
      loyaltyPoints: newTotal,
    });

    // Create loyalty points history entry
    await customersDb.addLoyaltyPointsHistory(params.id, {
      points,
      reason,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ customer: updatedCustomer });
  } catch (error) {
    console.error("Error adjusting loyalty points:", error);
    return NextResponse.json(
      { error: "Failed to adjust loyalty points" },
      { status: 500 }
    );
  }
}
