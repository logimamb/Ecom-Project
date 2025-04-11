"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package2, DollarSign, Users, ArrowUpDown, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from "@/hooks/use-currency";

interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface LegacySale {
  id: string;
  customerId: string;
  amount: string;
  platform: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Sale {
  id: string;
  customerId: string;
  items: SaleItem[];
  total: number;
  status: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

type AnySale = Sale | LegacySale;

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

type SortableFields = keyof (Omit<Sale, "items"> & LegacySale) | "total";

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<AnySale[]>([]);
  const [customers, setCustomers] = useState<{ [key: string]: Customer }>({});
  const [products, setProducts] = useState<{ [key: string]: Product }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortableFields>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();
  const { format } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, customersRes, inventoryRes] = await Promise.all([
          fetch("/api/sales"),
          fetch("/api/customers"),
          fetch("/api/inventory")
        ]);

        const salesData = await salesRes.json();
        const customersData = await customersRes.json();
        const inventoryData = await inventoryRes.json();

        if (salesData.sales) {
          setSales(salesData.sales);
        }

        if (customersData.customers) {
          const customerMap = customersData.customers.reduce((acc: { [key: string]: Customer }, customer: Customer) => {
            acc[customer.id] = customer;
            return acc;
          }, {});
          setCustomers(customerMap);
        }

        if (inventoryData.inventory) {
          const productMap = inventoryData.inventory.reduce((acc: { [key: string]: Product }, product: Product) => {
            acc[product.id] = product;
            return acc;
          }, {});
          setProducts(productMap);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      pending: "yellow",
      paid: "blue",
      shipped: "purple",
      delivered: "green",
      cancelled: "red",
    };
    return colors[status] || "gray";
  };

  const handleSort = (field: SortableFields) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const isLegacySale = (sale: AnySale): sale is LegacySale => {
    return "amount" in sale && "platform" in sale;
  };

  const formatAmount = (sale: AnySale) => {
    if ('total' in sale) {
      // New sale format
      return format(sale.total, 'XAF'); // Assuming old values were in XAF
    } else {
      // Legacy sale format
      return format(parseFloat(sale.amount), 'XAF'); // Assuming old values were in XAF
    }
  };

  const getItemsDisplay = (sale: AnySale): string => {
    if (isLegacySale(sale)) {
      return "1 item";
    }
    return `${sale.items.length} items`;
  };

  const getProductsDisplay = (sale: AnySale): string => {
    if (isLegacySale(sale)) {
      return "N/A";
    }
    return sale.items
      .map(item => products[item.productId]?.name || "Unknown")
      .join(", ");
  };

  const filteredAndSortedSales = sales
    .filter((sale) => {
      const matchesSearch =
        customers[sale.customerId]?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortField === "total") {
        const aTotal = isLegacySale(a) ? parseFloat(a.amount) : a.total;
        const bTotal = isLegacySale(b) ? parseFloat(b.amount) : b.total;
        return sortDirection === "asc" ? aTotal - bTotal : bTotal - aTotal;
      }

      const aValue = (a as any)[sortField];
      const bValue = (b as any)[sortField];
      const direction = sortDirection === "asc" ? 1 : -1;
      return direction * ((aValue ?? "") > (bValue ?? "") ? 1 : -1);
    });

  const totalRevenue = sales.reduce((sum, sale) => sum + (isLegacySale(sale) ? parseFloat(sale.amount) : sale.total), 0);
  const totalOrders = sales.length;
  const pendingOrders = sales.filter((sale) => sale.status === "pending").length;
  const uniqueCustomers = new Set(sales.map((sale) => sale.customerId)).size;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Sales Management</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage sales orders, track payments, and monitor delivery status.
          </p>
        </div>
        <Button onClick={() => router.push("/sales/add")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Sale
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(totalRevenue, 'XAF')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package2 className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCustomers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex flex-1 gap-4 md:max-w-[600px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("total")}
                  className="flex items-center"
                >
                  Total
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No sales found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedSales.map((sale) => (
                <TableRow key={sale.id} className="group">
                  <TableCell>
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getProductsDisplay(sale)}</TableCell>
                  <TableCell>{customers[sale.customerId]?.name || "Unknown"}</TableCell>
                  <TableCell>{getItemsDisplay(sale)}</TableCell>
                  <TableCell className="text-right">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      formatAmount(sale)
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(sale.status) as any}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {isLegacySale(sale) ? sale.platform : sale.paymentMethod.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => router.push(`/sales/${sale.id}`)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => window.print()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <polyline points="6 9 6 2 18 2 18 9" />
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <rect width="12" height="8" x="6" y="14" />
                        </svg>
                        <span className="sr-only">Print</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
