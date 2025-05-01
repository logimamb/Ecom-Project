"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order, Supplier } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useSettings } from "@/contexts/settings-context";
import { PageHeader } from '@/components/page-header';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Order>("status");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const { formatCurrency } = useSettings();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/suppliers");
        if (!response.ok) throw new Error("Failed to fetch suppliers");
        const data = await response.json();
        setSuppliers(data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };

    fetchOrders();
    fetchSuppliers();
  }, []);

  const handleDelete = async () => {
    if (!orderToDelete) return;

    try {
      const response = await fetch(`/api/orders/${orderToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      setOrders(orders.filter((o) => o.id !== orderToDelete.id));
      setOrderToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete order");
    }
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier ? supplier.name : "Unknown Supplier";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "paid":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const calculateTotal = (order: Order) => {
    const { costs } = order;
    if (!costs) return 0;

    return Object.values(costs).reduce((sum, value) => {
      const numValue = Number(value) || 0;
      return sum + numValue;
    }, 0);
  };

  const handleSort = (field: keyof Order) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedOrders = orders
    .filter((order) => statusFilter === "all" || order.status === statusFilter)
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction * aValue.localeCompare(bValue);
      }

      return direction * ((aValue as any) - (bValue as any));
    });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(calculateTotal(order)), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8">
      <PageHeader 
        title="Orders" 
        description="Track and manage your purchase orders"
        exportOptions={{ current: 'orders' }}
      />
      <div className="mb-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveredOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
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
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => router.push("/orders/create")}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("status")}
                  className="flex items-center"
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("costs")}
                  className="flex items-center"
                >
                  Total Cost
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{getSupplierName(order.supplierId)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {order.products.map((product, index) => (
                      <div key={index} className="text-sm">
                        {product.name} ({product.quantity} x {formatCurrency(product.unitPrice)})
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(calculateTotal(order))}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={order.payments.supplier > 0 ? "default" : "destructive"}>
                      Supplier: {order.payments.supplier > 0 ? "Paid" : "Pending"}
                    </Badge>
                    {order.forwarderId && (
                      <Badge variant={order.payments.forwarder > 0 ? "default" : "destructive"}>
                        Forwarder: {order.payments.forwarder > 0 ? "Paid" : "Pending"}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setOrderToDelete(order)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
