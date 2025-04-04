"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format, parseISO, subMonths } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BadgeDelta,
  Card as TremorCard,
  Grid,
  Metric,
  Text,
  Title,
  ProgressBar,
} from "@tremor/react";
import { useSettings } from "@/contexts/settings-context";

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

interface Customer {
  id: string;
  name: string;
  segment: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function AnalyticsDashboard() {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [timeframe, setTimeframe] = useState("daily");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const { formatCurrency } = useSettings();

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const [salesRes, customersRes, productsRes] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/customers"),
        fetch("/api/inventory")
      ]);

      const [salesJson, customersJson, productsJson] = await Promise.all([
        salesRes.json(),
        customersRes.json(),
        productsRes.json()
      ]);

      setSalesData(salesJson.sales || []);
      setCustomersData(customersJson.customers || []);
      setProductsData(productsJson.inventory || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Key Metrics Calculations
  const getKeyMetrics = () => {
    const filteredSales = salesData.filter(sale => 
      new Date(sale.createdAt) >= dateRange.from && new Date(sale.createdAt) <= dateRange.to
    );

    const previousPeriodStart = subMonths(dateRange.from, 1);
    const previousPeriodSales = salesData.filter(sale => 
      new Date(sale.createdAt) >= previousPeriodStart && new Date(sale.createdAt) < dateRange.from
    );

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const previousRevenue = previousPeriodSales.reduce((sum, sale) => sum + sale.total, 0);
    const revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100;

    const totalOrders = filteredSales.length;
    const previousOrders = previousPeriodSales.length;
    const ordersGrowth = ((totalOrders - previousOrders) / previousOrders) * 100;

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;
    const aovGrowth = ((averageOrderValue - previousAOV) / previousAOV) * 100;

    return {
      revenue: { total: totalRevenue, growth: revenueGrowth },
      orders: { total: totalOrders, growth: ordersGrowth },
      aov: { total: averageOrderValue, growth: aovGrowth }
    };
  };

  // Time Series Data
  const getTimeSeriesData = () => {
    const filteredSales = salesData.filter(
      sale => new Date(sale.createdAt) >= dateRange.from && new Date(sale.createdAt) <= dateRange.to
    );

    const groupedData = filteredSales.reduce((acc, sale) => {
      const date = new Date(sale.createdAt);
      const key = timeframe === "daily" 
        ? format(date, "yyyy-MM-dd")
        : timeframe === "weekly"
        ? format(date, "yyyy-'W'w")
        : format(date, "yyyy-MM");

      if (!acc[key]) {
        acc[key] = {
          date: key,
          revenue: 0,
          orders: 0,
          items: 0,
        };
      }

      acc[key].revenue += sale.total;
      acc[key].orders += 1;
      acc[key].items += sale.items.reduce((sum, item) => sum + item.quantity, 0);

      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData);
  };

  // Customer Analysis
  const getCustomerAnalysis = () => {
    const segmentData = customersData.reduce((acc, customer) => {
      if (!acc[customer.segment]) {
        acc[customer.segment] = {
          segment: customer.segment,
          count: 0,
          totalSpent: 0,
          averageSpent: 0,
        };
      }
      acc[customer.segment].count += 1;
      acc[customer.segment].totalSpent += customer.totalSpent;
      return acc;
    }, {} as Record<string, any>);

    Object.values(segmentData).forEach((segment: any) => {
      segment.averageSpent = segment.totalSpent / segment.count;
    });

    return Object.values(segmentData);
  };

  // Product Performance
  const getProductPerformance = () => {
    const productSales = salesData.reduce((acc, sale) => {
      sale.items.forEach((item) => {
        if (!acc[item.productId]) {
          const product = productsData.find(p => p.id === item.productId);
          acc[item.productId] = {
            id: item.productId,
            name: product?.name || "Unknown",
            revenue: 0,
            quantity: 0,
            category: product?.category || "Unknown",
          };
        }
        acc[item.productId].revenue += item.quantity * item.unitPrice;
        acc[item.productId].quantity += item.quantity;
      });
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  // Inventory Analysis
  const getInventoryAnalysis = () => {
    const categoryData = productsData.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          category: product.category,
          totalStock: 0,
          totalValue: 0,
          itemCount: 0,
        };
      }
      acc[product.category].totalStock += product.stock;
      acc[product.category].totalValue += product.stock * product.price;
      acc[product.category].itemCount += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categoryData);
  };

  const metrics = getKeyMetrics();
  const timeSeriesData = getTimeSeriesData();
  const customerData = getCustomerAnalysis();
  const productData = getProductPerformance();
  const inventoryData = getInventoryAnalysis();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Analytics</h2>
        <div className="flex gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
        <TremorCard>
          <Text>Revenue</Text>
          <Metric>{formatCurrency(metrics.revenue.total)}</Metric>
          <BadgeDelta deltaType={metrics.revenue.growth > 0 ? "increase" : "decrease"}>
            {metrics.revenue.growth.toFixed(1)}%
          </BadgeDelta>
        </TremorCard>
        <TremorCard>
          <Text>Orders</Text>
          <Metric>{metrics.orders.total}</Metric>
          <BadgeDelta deltaType={metrics.orders.growth > 0 ? "increase" : "decrease"}>
            {metrics.orders.growth.toFixed(1)}%
          </BadgeDelta>
        </TremorCard>
        <TremorCard>
          <Text>Average Order Value</Text>
          <Metric>{formatCurrency(metrics.aov.total)}</Metric>
          <BadgeDelta deltaType={metrics.aov.growth > 0 ? "increase" : "decrease"}>
            {metrics.aov.growth.toFixed(1)}%
          </BadgeDelta>
        </TremorCard>
      </Grid>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="items">Items Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerData}
                  dataKey="count"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {customerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="quantity" fill="#82ca9d" name="Quantity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory by Category */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryData.map((category: any, index) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-gray-500">
                      {formatCurrency(category.totalValue)} ({category.itemCount} items)
                    </span>
                  </div>
                  <ProgressBar
                    value={category.totalStock}
                    color={COLORS[index % COLORS.length].replace("#", "")}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
