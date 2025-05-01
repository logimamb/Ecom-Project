"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package2, DollarSign, Users, ArrowUpDown, Search, Loader2, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from "@/hooks/use-currency";
import { PageHeader } from '@/components/page-header';

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
  const [saleToDelete, setSaleToDelete] = useState<AnySale | null>(null);
  const { toast } = useToast();
  const { format } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, customersRes, productsRes] = await Promise.all([
          fetch("/api/sales"),
          fetch("/api/customers"),
          fetch("/api/products")
        ]);

        const salesData = await salesRes.json();
        const customersData = await customersRes.json();
        const productsData = await productsRes.json();

        if (Array.isArray(salesData.sales)) {
          setSales(salesData.sales);
        }

        if (customersData.customers) {
          const customersMap: { [key: string]: Customer } = {};
          customersData.customers.forEach((customer: Customer) => {
            customersMap[customer.id] = customer;
          });
          setCustomers(customersMap);
        }

        if (Array.isArray(productsData)) {
          const productsMap: { [key: string]: Product } = {};
          productsData.forEach((product: Product) => {
            productsMap[product.id] = product;
          });
          setProducts(productsMap);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load sales data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const isLegacySale = (sale: AnySale): sale is LegacySale => {
    return "platform" in sale;
  };

  const getCustomerName = (customerId: string) => {
    return customers[customerId]?.name || "Unknown Customer";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary";
      case "paid":
      case "delivered":
        return "default";
      case "shipped":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const toggleSort = (field: SortableFields) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async () => {
    if (!saleToDelete) return;

    try {
      const response = await fetch(`/api/sales/${saleToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete sale");
      }

      setSales(sales.filter(sale => sale.id !== saleToDelete.id));
      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive",
      });
    } finally {
      setSaleToDelete(null);
    }
  };

  const filteredSales = sales
    .filter((sale) => {
      const matchesSearch =
        searchQuery === "" ||
        getCustomerName(sale.customerId)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || sale.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
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
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <PageHeader 
        title="Sales" 
        description="View and manage your sales"
        exportOptions={{ current: 'sales' }}
      />
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

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(totalRevenue)}</div>
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("id")}
                    className="flex items-center space-x-1"
                  >
                    Order ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("customerId")}
                    className="flex items-center space-x-1"
                  >
                    Customer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("total")}
                    className="flex items-center space-x-1"
                  >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("status")}
                    className="flex items-center space-x-1"
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("createdAt")}
                    className="flex items-center space-x-1"
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Package2 className="h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No sales found</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery || statusFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Add some sales to get started"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.id}</TableCell>
                    <TableCell>{getCustomerName(sale.customerId)}</TableCell>
                    <TableCell>
                      {format(isLegacySale(sale) ? parseFloat(sale.amount) : sale.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(sale.status)}>
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/sales/${sale.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSaleToDelete(sale)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!saleToDelete} onOpenChange={() => setSaleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the sale. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
