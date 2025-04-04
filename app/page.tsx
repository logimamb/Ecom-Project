"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { useCurrency } from "@/hooks/use-currency"
import { Package2, Users, ShoppingCart, TrendingUp } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  sku: string
  description: string
  category: string
  price: number
  quantity: number
  reorderPoint: number
  supplier: string
  location: string
  notes?: string
  lastRestocked?: string
  cost: number
}

interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  activeCustomers: number;
  inventoryItems: number;
  averageOrderValue: number;
  lowStockItems: number;
  pendingOrders: number;
  monthlyGrowth: number;
  topSellingProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  customerRetentionRate: number;
}

export default function Home() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    activeCustomers: 0,
    inventoryItems: 0,
    averageOrderValue: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    monthlyGrowth: 0,
    topSellingProducts: [],
    customerRetentionRate: 0
  });
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { format: formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch inventory data
        const inventoryResponse = await fetch('/api/inventory');
        if (!inventoryResponse.ok) {
          throw new Error('Failed to fetch inventory data');
        }
        const inventoryData = await inventoryResponse.json();
        setInventory(Array.isArray(inventoryData.inventory) ? inventoryData.inventory : []);

        // Calculate metrics
        const lowStockCount = inventoryData.inventory?.filter(
          (item: InventoryItem) => item.quantity <= item.reorderPoint && item.quantity > 0
        ).length || 0;

        const totalValue = inventoryData.inventory?.reduce(
          (sum: number, item: InventoryItem) => sum + (item.quantity * item.price), 
          0
        ) || 0;

        // Update metrics with real inventory data
        setMetrics(prev => ({
          ...prev,
          inventoryItems: inventoryData.inventory?.length || 0,
          lowStockItems: lowStockCount,
          totalRevenue: totalValue,
          // Keep other metrics as is for now
          monthlyGrowth: 15, // Example value
          customerRetentionRate: 85 // Example value
        }));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-lg text-red-500 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-4">
          <select className="rounded-md border p-2">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center space-x-2">
                <span>Total Revenue</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={metrics.revenueGrowth > 0 ? "text-green-500" : "text-red-500"}>
                {metrics.revenueGrowth > 0 ? "+" : ""}{metrics.revenueGrowth}%
              </span>
              {" "}vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center space-x-2">
                <span>Orders</span>
                <ShoppingCart className="h-4 w-4 text-blue-500" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Active orders</p>
              <span className="text-xs font-medium text-amber-500">{metrics.pendingOrders} pending</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center space-x-2">
                <span>Customers</span>
                <Users className="h-4 w-4 text-purple-500" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCustomers}</div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Active customers</p>
              <span className="text-xs font-medium text-green-500">{metrics.customerRetentionRate}% retention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center space-x-2">
                <span>Inventory</span>
                <Package2 className="h-4 w-4 text-orange-500" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.inventoryItems}</div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Products in stock</p>
              <span className="text-xs font-medium text-red-500">{metrics.lowStockItems} low stock</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSales formatCurrency={formatCurrency} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topSellingProducts && metrics.topSellingProducts.length > 0 ? (
                metrics.topSellingProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} units sold</p>
                    </div>
                    <div className="text-sm font-medium">{formatCurrency(product.revenue)}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No product data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Average Order Value</p>
                <span className="text-sm font-bold">{formatCurrency(metrics.averageOrderValue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Monthly Growth Rate</p>
                <span className={`text-sm font-bold ${metrics.monthlyGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {metrics.monthlyGrowth > 0 ? "+" : ""}{metrics.monthlyGrowth}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Customer Retention</p>
                <span className="text-sm font-bold">{metrics.customerRetentionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}