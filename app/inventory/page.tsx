"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package2, AlertTriangle, ArrowUpDown, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryItem, Supplier } from "@/lib/types";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrency } from "@/hooks/use-currency";

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof InventoryItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const { format: formatCurrency } = useCurrency();

  useEffect(() => {
    fetchInventory();
    fetchSuppliers();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/data/inventory.json');
      if (!response.ok) throw new Error("Failed to fetch inventory");
      const data = await response.json();
      setItems(Array.isArray(data.inventory) ? data.inventory : []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/data/suppliers.json');
      if (!response.ok) throw new Error("Failed to fetch suppliers");
      const data = await response.json();
      setSuppliers(Array.isArray(data.suppliers) ? data.suppliers : []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // For local JSON storage, we'll just update the state
      setItems((prev) => prev.filter((item) => item.id !== id));
      setItemToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) {
      return { label: "Out of Stock", color: "destructive" };
    }
    if (item.quantity <= item.reorderPoint) {
      return { label: "Low Stock", color: "warning" };
    }
    return { label: "In Stock", color: "success" };
  };

  const handleSort = (field: keyof InventoryItem) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSupplierName = (supplierId: string) => {
    return suppliers.find(s => s.id === supplierId)?.name || "Unknown Supplier";
  };

  const filteredAndSortedItems = Array.isArray(items) ? items
    .filter(item => {
      if (!item) return false;
      
      const matchesSearch = 
        (item.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.sku?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (getSupplierName(item.supplierId)?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      
      const stockStatus = getStockStatus(item);
      const matchesStock = stockFilter === "all" || 
        (stockFilter === "out" && stockStatus.label === "Out of Stock") ||
        (stockFilter === "low" && stockStatus.label === "Low Stock") ||
        (stockFilter === "in" && stockStatus.label === "In Stock");
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === "asc" ? 1 : -1;
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction * aValue.localeCompare(bValue);
      }
      
      return direction * ((aValue as number) - (bValue as number));
    }) : [];

  const totalItems = Array.isArray(items) ? items.length : 0;
  const lowStockItems = Array.isArray(items) ? items.filter(item => 
    item && item.quantity !== undefined && 
    item.reorderPoint !== undefined && 
    item.quantity <= item.reorderPoint && 
    item.quantity > 0
  ).length : 0;
  const outOfStockItems = Array.isArray(items) ? items.filter(item => 
    item && item.quantity !== undefined && 
    item.quantity <= 0
  ).length : 0;
  const totalValue = Array.isArray(items) ? items.reduce((sum, item) => {
    if (!item || typeof item.quantity !== 'number' || typeof item.price !== 'number') return sum;
    return sum + (item.quantity * item.price);
  }, 0) : 0;

  const categories = Array.isArray(items) ? Array.from(new Set(items.filter(item => item && item.category).map(item => item.category))) : [];

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
          <h2 className="text-2xl font-semibold tracking-tight">Inventory Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage your inventory items, track stock levels, and monitor reorder points.
          </p>
        </div>
        <Button onClick={() => router.push("/inventory/add")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex flex-1 gap-4 md:max-w-[600px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in">In Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select
          value={sortField}
          onValueChange={(value) => setSortField(value as keyof InventoryItem)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="sku">SKU</SelectItem>
            <SelectItem value="quantity">Quantity</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortDirection}
          onValueChange={(value) => setSortDirection(value as "asc" | "desc")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("name")}
                  className="flex items-center"
                >
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("quantity")}
                  className="flex items-center"
                >
                  Quantity
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("category")}
                  className="flex items-center"
                >
                  Category
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("lastRestocked")}
                  className="flex items-center"
                >
                  Last Restocked
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <TableRow key={item.id} className="group">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.quantity}
                        {item.quantity <= item.reorderPoint && (
                          <div 
                            className="tooltip" 
                            data-tip={`Low stock alert: Below reorder point (${item.reorderPoint})`}
                          >
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.color as any}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{getSupplierName(item.supplierId)}</TableCell>
                    <TableCell>{item.location || "—"}</TableCell>
                    <TableCell>
                      {item.lastRestocked 
                        ? new Date(item.lastRestocked).toLocaleDateString()
                        : "—"
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => router.push(`/inventory/${item.id}`)}
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
                          className="h-8 w-8 p-0 hover:text-red-600"
                          onClick={() => handleDelete(item.id)}
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
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {itemToDelete?.name} from your inventory.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(itemToDelete?.id || '')}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex flex-col gap-4 mt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Inventory Summary</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium mb-2">Total Items</h4>
            <p className="text-lg font-bold">{totalItems}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium mb-2">Low Stock Items</h4>
            <p className="text-lg font-bold">{lowStockItems}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium mb-2">Out of Stock Items</h4>
            <p className="text-lg font-bold">{outOfStockItems}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm col-span-3">
            <h4 className="text-sm font-medium mb-2">Total Value</h4>
            <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
