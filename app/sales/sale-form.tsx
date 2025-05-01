"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { saleSchema, type SaleFormData } from "@/lib/validations/sale";
import { formatCurrency } from "@/lib/format-currency";

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  lastOrderPrice: number;
  quantity: number;
}

interface SaleFormProps {
  sale?: SaleFormData & { id: string };
  onSuccess: () => void;
}

export function SaleForm({ sale, onSuccess }: SaleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: sale || {
      customerId: "",
      items: [],
      status: "pending",
      paymentMethod: "cash",
      notes: "",
    },
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers");
        const data = await response.json();
        if (data.customers) {
          setCustomers(data.customers);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error",
          description: "Failed to load customers",
          variant: "destructive",
        });
      }
    };

    const fetchProducts = async () => {
      try {
        // Fetch products
        const prodResponse = await fetch("/api/products");
        const prodData = await prodResponse.json();
        
        // Fetch inventory
        const invResponse = await fetch("/api/inventory");
        const invData = await invResponse.json();
        
        if (Array.isArray(prodData)) {
          // Merge product and inventory data
          const productsWithInventory = prodData.map(product => {
            const inventoryItem = invData.inventory.find((item: any) => item.productId === product.id);
            return {
              ...product,
              quantity: inventoryItem?.quantity || 0
            };
          });
          setProducts(productsWithInventory);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      }
    };

    fetchCustomers();
    fetchProducts();
  }, [toast]);

  useEffect(() => {
    if (!form.getValues("items")) {
      form.setValue("items", []);
    }
  }, [form]);

  const onSubmit = async (data: SaleFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        sale ? `/api/sales/${sale.id}` : "/api/sales",
        {
          method: sale ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save sale");
      }

      toast({
        title: "Success",
        description: sale ? "Sale updated successfully" : "Sale created successfully",
      });
      onSuccess();
    } catch (error) {
      console.error("Error saving sale:", error);
      toast({
        title: "Error",
        description: "Failed to save sale",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    const items = form.getValues("items") || [];
    form.setValue("items", [
      ...items,
      { productId: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    const items = form.getValues("items") || [];
    form.setValue(
      "items",
      items.filter((_, i) => i !== index)
    );
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {form.watch("items").map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            const product = getProductById(value);
                            if (product) {
                              form.setValue(
                                `items.${index}.unitPrice`,
                                product.lastOrderPrice
                              );
                            }
                          }}
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
                                {product.name} ({product.sku}) - {formatCurrency(product.lastOrderPrice)}
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
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>

                {item.productId && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <Package2 className="inline-block h-4 w-4 mr-1" />
                    Available:{" "}
                    {getProductById(item.productId)?.quantity || 0} units
                  </div>
                )}
                <div className="mt-2 text-sm text-muted-foreground">
                  Subtotal: {formatCurrency(item.unitPrice * item.quantity)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
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
                <Textarea
                  placeholder="Add any additional notes here..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : sale ? (
              "Update Sale"
            ) : (
              "Create Sale"
            )}
          </Button>
        </div>
        <div className="flex justify-end gap-4">
          <div className="text-lg font-bold">
            Total: {formatCurrency(form.watch("items").reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}
          </div>
        </div>
      </form>
    </Form>
  );
}
