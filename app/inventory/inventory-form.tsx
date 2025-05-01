"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InventoryItem, Product } from "@/lib/types";
import { inventorySchema, type InventoryFormData } from "@/lib/validations/inventory";
import { useCurrency } from "@/hooks/use-currency";

interface InventoryFormProps {
  item?: InventoryItem;
  onSuccess: () => void;
}

export function InventoryForm({ item, onSuccess }: InventoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { format } = useCurrency();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
    }
  };

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: item || {
      productId: "",
      quantity: 0,
      reorderPoint: 10,
      location: "",
      notes: "",
      expiryDate: "",
    },
  });

  const onSubmit = async (data: InventoryFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        item ? `/api/inventory/${item.id}` : "/api/inventory",
        {
          method: item ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save inventory item");
      }

      const result = await response.json();
      console.log("Saved item:", result);
      
      form.reset();
      onSuccess();
    } catch (err) {
      console.error("Error saving item:", err);
      setError(err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === form.watch("productId"));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedProduct && (
          <div className="bg-muted p-4 rounded-md space-y-2">
            <p><strong>SKU:</strong> {selectedProduct.sku}</p>
            <p><strong>Category:</strong> {selectedProduct.category}</p>
            <p><strong>Last Order Price:</strong> {format(selectedProduct.lastOrderPrice, 'XAF')}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="0" 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorderPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Point</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="10" 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Storage location" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Additional notes" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : item ? "Update Item" : "Add Item"}
        </Button>
      </form>
    </Form>
  );
}
