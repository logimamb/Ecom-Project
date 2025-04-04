import * as customersDb from "@/lib/db/customers";
import { readJSON } from "@/lib/db/json";

interface Sale {
  id: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
}

interface SalesData {
  sales: Sale[];
}

export async function syncCustomerOrders() {
  try {
    // Get all customers and sales
    const customers = await customersDb.getAll();
    const salesData = await readJSON("data/sales.json") as SalesData;
    const sales = salesData.sales || [];

    // Calculate totals for each customer
    const customerTotals = new Map<string, { orders: number; spent: number }>();

    // Initialize with zeros
    customers.forEach(customer => {
      customerTotals.set(customer.id, { orders: 0, spent: 0 });
    });

    // Count orders and sum totals
    sales.forEach(sale => {
      const customerTotal = customerTotals.get(sale.customerId);
      if (customerTotal) {
        customerTotal.orders += 1;
        customerTotal.spent += sale.total;
      }
    });

    // Update each customer
    for (const customer of customers) {
      const totals = customerTotals.get(customer.id);
      if (totals && (totals.orders !== customer.totalOrders || totals.spent !== customer.totalSpent)) {
        await customersDb.update(customer.id, {
          totalOrders: totals.orders,
          totalSpent: totals.spent,
          // Update segment based on order count
          segment: determineCustomerSegment(totals.orders)
        });
      }
    }

    return {
      success: true,
      message: "Customer orders synchronized successfully",
      customersUpdated: customers.length
    };
  } catch (error) {
    console.error("Error synchronizing customer orders:", error);
    return {
      success: false,
      message: "Failed to synchronize customer orders",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function determineCustomerSegment(totalOrders: number): "new" | "regular" | "vip" {
  if (totalOrders >= 10) {
    return "vip";
  } else if (totalOrders >= 3) {
    return "regular";
  }
  return "new";
}
