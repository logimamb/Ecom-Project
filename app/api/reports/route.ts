import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Report, CreateReportInput, Sale, Product, Customer, InventoryItem } from "@/lib/types"

export async function GET() {
  try {
    // Fetch all required data
    const [reports, sales, inventory, customers] = await Promise.all([
      db.reports.findAll(),
      db.sales.findAll(),
      db.inventory.findAll(),
      db.customers.findAll(),
    ]) as [Report[], Sale[], InventoryItem[], Customer[]];

    // Calculate metrics
    const totalSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.lastOrderPrice * item.quantity || 0), 0);
    const totalCustomers = customers.length;
    const averageOrderValue = sales.length > 0 ? totalSales / sales.length : 0;

    // Add financial metrics to each report
    const enrichedReports = reports.map(report => {
      if (report.type === 'financial' || report.type === 'sales') {
        return {
          ...report,
          data: {
            ...report.data,
            totalSales,
            averageOrderValue,
            revenue: totalSales,
            expenses: totalInventoryValue * 0.4, // Estimated expenses as 40% of inventory value
            profit: totalSales - (totalInventoryValue * 0.4),
          }
        };
      }
      if (report.type === 'inventory') {
        return {
          ...report,
          data: {
            ...report.data,
            totalInventoryValue,
            totalItems: inventory.length,
            lowStockItems: inventory.filter(item => item.quantity < 10).length,
          }
        };
      }
      if (report.type === 'customers') {
        return {
          ...report,
          data: {
            ...report.data,
            totalCustomers,
            activeCustomers: customers.filter(c => c.status === 'active').length,
            newCustomers: customers.filter(c => {
              const createdAt = new Date(c.createdAt || new Date());
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return createdAt >= thirtyDaysAgo;
            }).length,
          }
        };
      }
      return report;
    });

    return NextResponse.json({ reports: enrichedReports })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports", reports: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const timestamp = new Date().toISOString()
    
    const newReport: CreateReportInput = {
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      metrics: data.metrics || {},
      period: data.period,
      author: data.author,
      createdAt: timestamp,
      updatedAt: timestamp,
      data: {},
    }
    
    const report = await db.reports.create(newReport)
    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json(
      { error: "Failed to create report", report: null },
      { status: 500 }
    )
  }
}
