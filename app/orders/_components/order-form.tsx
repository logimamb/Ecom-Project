"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Order, Supplier, FreightForwarder, Product } from "@/lib/types";
import { orderSchema } from "@/lib/validations/order";
import { Card } from "@/components/ui/card";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  order?: Order;
  onSuccess: () => void;
}

export function OrderForm({ order, onSuccess }: OrderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [forwarders, setForwarders] = useState<FreightForwarder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
    fetchForwarders();
    fetchProducts();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (!response.ok) throw new Error("Failed to fetch suppliers");
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError("Failed to load suppliers");
    }
  };

  const fetchForwarders = async () => {
    try {
      const response = await fetch("/api/freight-forwarders");
      if (!response.ok) throw new Error("Failed to fetch forwarders");
      const data = await response.json();
      setForwarders(data);
    } catch (error) {
      console.error("Error fetching forwarders:", error);
      setError("Failed to load freight forwarders");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/data/products.json");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
    }
  };

  const generateSKU = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6)
      .padEnd(6, '0');
  };

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: order ? {
      supplierId: order.supplierId,
      forwarderId: order.forwarderId,
      products: order.products,
      status: order.status,
      costs: order.costs,
      payments: order.payments,
    } : {
      supplierId: "",
      forwarderId: "",
      products: [{ name: "", quantity: 1, unitPrice: 0 }],
      status: "pending",
      costs: {
        purchase: 0,
        shipping: 0,
        taxes: 0,
        bankCharges: 0,
        platformCommission: 0,
        deliveryToForwarder: 0,
      },
      payments: {
        supplier: 0,
        forwarder: 0,
      },
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // First, create or update products
      for (const orderProduct of data.products) {
        if (!orderProduct.productId) {
          // This is a new product, create it
          const newProduct = {
            id: crypto.randomUUID(),
            name: orderProduct.name,
            sku: generateSKU(orderProduct.name),
            category: "uncategorized", // Default category
            supplierId: data.supplierId,
            lastOrderPrice: orderProduct.unitPrice,
            createdFromOrderId: order?.id || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Add to products.json
          const productsResponse = await fetch("/data/products.json");
          const productsData = await productsResponse.json();
          productsData.products = [...(productsData.products || []), newProduct];
          
          await fetch("/data/products.json", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(productsData),
          });

          // Update the order product with the new product ID
          orderProduct.productId = newProduct.id;
        }
      }

      // Now save the order
      const url = order ? `/api/orders/${order.id}` : '/api/orders';
      const method = order ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving order:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = () => {
    const products = form.getValues("products");
    form.setValue("products", [
      ...products,
      { name: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeProduct = (index: number) => {
    const products = form.getValues("products");
    form.setValue(
      "products",
      products.filter((_, i) => i !== index)
    );
  };

  const calculateTotal = (formData: OrderFormData) => {
    const { costs } = formData;
    if (!costs) return 0;
    
    return Object.values(costs).reduce((sum, value) => {
      const numValue = Number(value) || 0;
      return sum + numValue;
    }, 0);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="forwarderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Freight Forwarder (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a forwarder" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {forwarders.map((forwarder) => (
                          <SelectItem key={forwarder.id} value={forwarder.id}>
                            {forwarder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Products</h3>
              <Button type="button" variant="outline" onClick={addProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            <div className="space-y-4">
              {form.watch("products").map((_, index) => (
                <Card key={index} className="p-4">
                  <div className="flex gap-4 items-start">
                    <FormField
                      control={form.control}
                      name={`products.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`products.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`products.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <FormLabel>Unit Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="mt-8"
                        onClick={() => removeProduct(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Costs</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(orderSchema.shape.costs.shape).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`costs.${key}` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <div className="mt-4 text-right">
              <p className="text-sm text-muted-foreground">
                Total Cost: ${calculateTotal(form.getValues()).toFixed(2)}
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Payments</h3>
            <div className="space-y-4">
              {Object.keys(orderSchema.shape.payments.shape).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`payments.${key}` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : order ? "Update Order" : "Create Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
