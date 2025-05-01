"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product, InventoryItem } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventorySchema } from "@/lib/validations/inventory";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EditInventoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  const form = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      quantity: 0,
      reorderPoint: 0,
      location: "",
      notes: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch inventory item
        const invResponse = await fetch(`/api/inventory/${params.id}`);
        if (!invResponse.ok) throw new Error("Failed to fetch inventory item");
        const invData = await invResponse.json();
        
        // Fetch product details
        const prodResponse = await fetch(`/api/products/${invData.productId}`);
        if (!prodResponse.ok) throw new Error("Failed to fetch product details");
        const prodData = await prodResponse.json();
        
        setProduct(prodData);
        form.reset({
          quantity: invData.quantity,
          reorderPoint: invData.reorderPoint,
          location: invData.location || "",
          notes: invData.notes || "",
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, form]);

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/inventory/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update inventory item");
      }

      router.push("/inventory");
      router.refresh();
    } catch (err) {
      console.error("Error updating inventory:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>Product not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Inventory Item</h1>
        <p className="text-muted-foreground">
          Update inventory details for {product.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-medium">Product Details</h3>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="text-sm">{product.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">SKU</dt>
              <dd className="text-sm">{product.sku}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Category</dt>
              <dd className="text-sm">{product.category}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Description</dt>
              <dd className="text-sm">{product.description}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
