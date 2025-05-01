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
import { InventoryItem, Supplier, Product } from "@/lib/types";
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
import { PageHeader } from '@/components/page-header';

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof (Product & InventoryItem)>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const { format } = useCurrency();

  useEffect(() => {
    fetchInventory();
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/inventory');
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
      const response = await fetch('/api/suppliers');
      if (!response.ok) throw new Error("Failed to fetch suppliers");
      const data = await response.json();
      setSuppliers(Array.isArray(data.suppliers) ? data.suppliers : []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/inventory/${itemToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setItems(items.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item');
    }
  };

  const getProductDetails = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  const filteredItems = items
    .map(item => {
      const product = getProductDetails(item.productId);
      return product ? { ...item, ...product } : null;
    })
    .filter((item): item is (InventoryItem & Product) => {
      if (!item) return false;
      
      const matchesSearch = searchQuery === "" || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

      const matchesStock = stockFilter === "all" ||
        (stockFilter === "inStock" && item.quantity > 0) ||
        (stockFilter === "lowStock" && item.quantity <= item.reorderPoint && item.quantity > 0) ||
        (stockFilter === "outOfStock" && item.quantity <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });

  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));

  const toggleSort = (field: keyof (Product & InventoryItem)) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <>
      <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <PageHeader 
          title="Inventory" 
          description="Manage your inventory and stock levels"
          exportOptions={{ current: 'inventory' }}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">
              Manage your inventory items and stock levels
            </p>
          </div>
          <Button onClick={() => router.push('/inventory/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Stock status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="inStock">In Stock</SelectItem>
                  <SelectItem value="lowStock">Low Stock</SelectItem>
                  <SelectItem value="outOfStock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package2 className="h-8 w-8 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No items found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || categoryFilter !== "all" || stockFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Add some items to your inventory"}
                </p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => toggleSort('name')}
                          className="flex items-center space-x-1"
                        >
                          Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => toggleSort('quantity')}
                          className="flex items-center space-x-1"
                        >
                          Stock
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => toggleSort('lastOrderPrice')}
                          className="flex items-center space-x-1"
                        >
                          Price
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              item.quantity <= 0 ? "destructive" :
                              item.quantity <= item.reorderPoint ? "secondary" :
                              "default"
                            }>
                              {item.quantity <= 0 ? "Out of Stock" :
                               item.quantity <= item.reorderPoint ? "Low Stock" :
                               "In Stock"}
                            </Badge>
                            <span className="text-muted-foreground">
                              ({item.quantity})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(item.lastOrderPrice)}
                        </TableCell>
                        <TableCell>{item.location || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/inventory/edit/${item.id}`)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setItemToDelete(item)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the inventory item. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
