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
import { Order, Supplier, FreightForwarder } from "@/lib/types";
import { orderSchema } from "@/lib/validations/order";

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  order?: Order;
  onSuccess: () => void;
}

export function OrderForm({ order, onSuccess }: OrderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [forwarders, setForwarders] = useState<FreightForwarder[]>([]);

  useEffect(() => {
    fetchSuppliers();
    fetchForwarders();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (!response.ok) throw new Error("Failed to fetch suppliers");
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
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
    }
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
    try {
      const response = await fetch(
        order ? `/api/orders/${order.id}` : "/api/orders",
        {
          method: order ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save order");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving order:", error);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Products</h3>
            <Button type="button" variant="outline" onClick={addProduct}>
              Add Product
            </Button>
          </div>

          {form.watch("products").map((_, index) => (
            <div key={index} className="flex gap-4 items-start">
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
                  <FormItem>
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
                  <FormItem>
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
                  size="sm"
                  className="mt-8"
                  onClick={() => removeProduct(index)}
                >
                  Remove
                </Button>
              )}
            </div>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Costs</h3>
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

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payments</h3>
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
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : order ? "Update Order" : "Create Order"}
        </Button>
      </form>
    </Form>
  );
}
