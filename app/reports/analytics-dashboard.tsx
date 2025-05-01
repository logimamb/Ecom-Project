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

interface Report {
  id: string;
  title: string;
  type: string;
  data: {
    revenue?: number;
    expenses?: number;
    profit?: number;
    totalSales?: number;
    averageOrderValue?: number;
    totalInventoryValue?: number;
    totalItems?: number;
    lowStockItems?: number;
    totalCustomers?: number;
    activeCustomers?: number;
    newCustomers?: number;
  };
  createdAt: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function AnalyticsDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
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
      const reportsRes = await fetch("/api/reports");
      const reportsJson = await reportsRes.json();
      setReports(reportsJson.reports || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Get the latest financial report
  const latestFinancialReport = reports
    .filter(r => r.type === 'financial')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  // Get the latest inventory report
  const latestInventoryReport = reports
    .filter(r => r.type === 'inventory')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  // Get the latest customers report
  const latestCustomersReport = reports
    .filter(r => r.type === 'customers')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(latestFinancialReport?.data?.revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(latestFinancialReport?.data?.expenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              -4% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(latestFinancialReport?.data?.profit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(latestFinancialReport?.data?.averageOrderValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={reports
                  .filter(r => r.type === 'financial')
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="createdAt"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="data.revenue"
                  stroke="#0088FE"
                  fill="#0088FE"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Text>Total Items</Text>
                <Metric>{latestInventoryReport?.data?.totalItems || 0}</Metric>
              </div>
              <div>
                <Text>Total Value</Text>
                <Metric>{formatCurrency(latestInventoryReport?.data?.totalInventoryValue || 0)}</Metric>
              </div>
              <div>
                <Text>Low Stock Items</Text>
                <Metric>{latestInventoryReport?.data?.lowStockItems || 0}</Metric>
                <ProgressBar
                  value={(latestInventoryReport?.data?.lowStockItems || 0) / (latestInventoryReport?.data?.totalItems || 1) * 100}
                  color="yellow"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Customer Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Text>Total Customers</Text>
                <Metric>{latestCustomersReport?.data?.totalCustomers || 0}</Metric>
              </div>
              <div>
                <Text>Active Customers</Text>
                <Metric>{latestCustomersReport?.data?.activeCustomers || 0}</Metric>
                <ProgressBar
                  value={(latestCustomersReport?.data?.activeCustomers || 0) / (latestCustomersReport?.data?.totalCustomers || 1) * 100}
                  color="blue"
                  className="mt-2"
                />
              </div>
              <div>
                <Text>New Customers (30 days)</Text>
                <Metric>{latestCustomersReport?.data?.newCustomers || 0}</Metric>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Profit & Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={reports
                  .filter(r => r.type === 'financial')
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="createdAt"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value)]}
                  labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                />
                <Legend />
                <Bar dataKey="data.revenue" name="Revenue" fill="#0088FE" />
                <Bar dataKey="data.expenses" name="Expenses" fill="#FF8042" />
                <Bar dataKey="data.profit" name="Profit" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
