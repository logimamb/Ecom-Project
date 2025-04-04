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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";

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
  description: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function Dashboard() {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [timeframe, setTimeframe] = useState("daily");

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      // Fetch sales data
      const salesResponse = await fetch("/api/sales");
      const salesJson = await salesResponse.json();
      setSalesData(salesJson.sales || []);

      // Fetch customers data
      const customersResponse = await fetch("/api/customers");
      const customersJson = await customersResponse.json();
      setCustomersData(customersJson.customers || []);

      // Fetch products data
      const productsResponse = await fetch("/api/inventory");
      const productsJson = await productsResponse.json();
      setProductsData(productsJson.inventory || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const processTimeSeriesData = () => {
    const filteredSales = salesData.filter(
      (sale) => {
        const date = new Date(sale.createdAt);
        return date >= dateRange.from && date <= dateRange.to;
      }
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
          sales: 0,
          revenue: 0,
          orders: 0,
        };
      }

      acc[key].sales += sale.total;
      acc[key].revenue += sale.total;
      acc[key].orders += 1;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData);
  };

  const getCustomerSegmentData = () => {
    const segmentData = customersData.reduce((acc, customer) => {
      if (!acc[customer.segment]) {
        acc[customer.segment] = {
          name: customer.segment,
          value: 0,
          spent: 0,
        };
      }
      acc[customer.segment].value += 1;
      acc[customer.segment].spent += customer.totalSpent;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(segmentData);
  };

  const getTopProducts = () => {
    const productSales = salesData.reduce((acc, sale) => {
      sale.items.forEach((item) => {
        if (!acc[item.productId]) {
          acc[item.productId] = {
            productId: item.productId,
            quantity: 0,
            revenue: 0,
          };
        }
        acc[item.productId].quantity += item.quantity;
        acc[item.productId].revenue += item.quantity * item.unitPrice;
      });
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productSales)
      .map((sale: any) => ({
        ...sale,
        name: productsData.find(p => p.id === sale.productId)?.name || "Unknown Product",
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const timeSeriesData = processTimeSeriesData();
  const customerSegmentData = getCustomerSegmentData();
  const topProductsData = getTopProducts();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
              </LineChart>
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
                  data={customerSegmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {customerSegmentData.map((entry, index) => (
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
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="quantity" fill="#82ca9d" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
