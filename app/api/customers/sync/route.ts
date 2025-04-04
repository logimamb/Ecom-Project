import { NextResponse } from "next/server";
import { syncCustomerOrders } from "@/lib/utils/customer-sync";

export async function POST() {
  try {
    const result = await syncCustomerOrders();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in sync endpoint:", error);
    return NextResponse.json(
      { error: "Failed to sync customer orders" },
      { status: 500 }
    );
  }
}
