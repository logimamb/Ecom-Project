import { db } from "@/lib/db";
import { NextResponse } from "next/server";

interface Sale {
  id: string;
  customerId: string;
  total: number;
  createdAt: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface DashboardData {
  metrics: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    activeCustomers: number;
    inventoryItems: number;
  };
  overview: Array<{
    name: string;
    total: number;
  }>;
  recentSales: Array<{
    id: string;
    total: number;
    customer: {
      name: string;
      email: string;
    } | null;
    date: string;
  }>;
}

export async function GET(): Promise<NextResponse> {
  try {
    // Get all required data
    const [orders, rawSales, rawCustomers, inventory] = await Promise.all([
      db.orders.findAll().catch(() => []),
      db.sales.findAll().catch(() => []),
      db.customers.findAll().catch(() => []),
      db.inventory.findAll().catch(() => []),
    ]);

    // Type cast the data
    const sales = rawSales as Sale[];
    const customers = rawCustomers as Customer[];

    // Calculate total revenue from sales
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    
    // Calculate last month's revenue
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthRevenue = sales
      .filter(sale => {
        const saleDate = new Date(sale.createdAt || '');
        return saleDate >= lastMonth && saleDate < now;
      })
      .reduce((sum, sale) => sum + (sale.total || 0), 0);

    // Calculate revenue growth (handle division by zero)
    const revenueGrowth = lastMonthRevenue === 0 
      ? 0 
      : ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    // Group sales by month for the overview chart
    const salesByMonth = sales.reduce((acc, sale) => {
      const month = new Date(sale.createdAt || '').toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + (sale.total || 0);
      return acc;
    }, {} as Record<string, number>);

    // Get active customers (made a purchase in last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const activeCustomers = new Set(
      sales
        .filter(sale => new Date(sale.createdAt || '') >= thirtyDaysAgo)
        .map(sale => sale.customerId)
    ).size;

    // Get recent sales with customer details
    const recentSales = await Promise.all(
      sales
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 5)
        .map(async (sale) => {
          const customer = await db.customers.findById(sale.customerId).catch(() => null) as Customer | null;
          return {
            id: sale.id,
            total: sale.total || 0,
            customer: customer ? {
              name: customer.name || 'Unknown Customer',
              email: customer.email || 'No email'
            } : null,
            date: sale.createdAt
          };
        })
    );

    // Format overview data for the chart
    const overviewData = Object.entries(salesByMonth)
      .map(([month, total]) => ({
        name: month,
        total: parseFloat(total.toFixed(2))
      }))
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.name) - months.indexOf(b.name);
      });

    const dashboardData: DashboardData = {
      metrics: {
        totalRevenue,
        revenueGrowth,
        totalOrders: orders.length,
        activeCustomers,
        inventoryItems: inventory.length
      },
      overview: overviewData,
      recentSales
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
