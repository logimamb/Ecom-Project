import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type;
    let data: any[] = [];
    let filename = "";

    switch (type) {
      case "customers":
        data = await db.customers.findAll();
        filename = "customers.xlsx";
        break;
      case "inventory":
        data = await db.inventory.findAll();
        filename = "inventory.xlsx";
        break;
      case "sales":
        data = await db.sales.findAll();
        filename = "sales.xlsx";
        break;
      case "suppliers":
        data = await db.suppliers.findAll();
        filename = "suppliers.xlsx";
        break;
      case "orders":
        data = await db.orders.findAll();
        filename = "orders.xlsx";
        break;
      case "all":
        const [customers, inventory, sales, suppliers, orders] = await Promise.all([
          db.customers.findAll(),
          db.inventory.findAll(),
          db.sales.findAll(),
          db.suppliers.findAll(),
          db.orders.findAll(),
        ]);

        const workbook = XLSX.utils.book_new();

        if (customers.length > 0) {
          const customersSheet = XLSX.utils.json_to_sheet(customers);
          XLSX.utils.book_append_sheet(workbook, customersSheet, "Customers");
        }

        if (inventory.length > 0) {
          const inventorySheet = XLSX.utils.json_to_sheet(inventory);
          XLSX.utils.book_append_sheet(workbook, inventorySheet, "Inventory");
        }

        if (sales.length > 0) {
          const salesSheet = XLSX.utils.json_to_sheet(sales);
          XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales");
        }

        if (suppliers.length > 0) {
          const suppliersSheet = XLSX.utils.json_to_sheet(suppliers);
          XLSX.utils.book_append_sheet(workbook, suppliersSheet, "Suppliers");
        }

        if (orders.length > 0) {
          const ordersSheet = XLSX.utils.json_to_sheet(orders);
          XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");
        }

        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buffer, {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="all_data.xlsx"`,
          },
        });

      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "No data to export" }, { status: 404 });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1));

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error(`Error exporting ${params.type}:`, error);
    return NextResponse.json(
      { error: `Failed to export ${params.type}` },
      { status: 500 }
    );
  }
}
