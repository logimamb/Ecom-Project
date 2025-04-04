"use client";

import { useState } from "react";
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

const costingSchema = z.object({
  productName: z.string().min(2, "Product name must be at least 2 characters"),
  purchasePrice: z.string().transform((val) => parseFloat(val)),
  shippingCost: z.string().transform((val) => parseFloat(val)),
  customsDuty: z.string().transform((val) => parseFloat(val)),
  taxes: z.string().transform((val) => parseFloat(val)),
  otherCosts: z.string().transform((val) => parseFloat(val)),
  profitMargin: z.string().transform((val) => parseFloat(val)),
});

type CostingFormData = z.infer<typeof costingSchema>;

interface Costing extends Omit<CostingFormData, 'purchasePrice' | 'shippingCost' | 'customsDuty' | 'taxes' | 'otherCosts' | 'profitMargin'> {
  id: string;
  purchasePrice: number;
  shippingCost: number;
  customsDuty: number;
  taxes: number;
  otherCosts: number;
  totalCost: number;
  suggestedPrice: number;
  profitMargin: number;
  createdAt: string;
}

interface CostingFormProps {
  costing?: Costing | null;
  onSuccess: () => void;
}

export function CostingForm({ costing, onSuccess }: CostingFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CostingFormData>({
    resolver: zodResolver(costingSchema),
    defaultValues: costing
      ? {
          productName: costing.productName,
          purchasePrice: costing.purchasePrice.toString(),
          shippingCost: costing.shippingCost.toString(),
          customsDuty: costing.customsDuty.toString(),
          taxes: costing.taxes.toString(),
          otherCosts: costing.otherCosts.toString(),
          profitMargin: costing.profitMargin.toString(),
        }
      : {
          productName: "",
          purchasePrice: "0",
          shippingCost: "0",
          customsDuty: "0",
          taxes: "0",
          otherCosts: "0",
          profitMargin: "30",
        },
  });

  const onSubmit = async (data: CostingFormData) => {
    setIsLoading(true);
    try {
      const totalCost =
        data.purchasePrice +
        data.shippingCost +
        data.customsDuty +
        data.taxes +
        data.otherCosts;
      
      const suggestedPrice = totalCost * (1 + data.profitMargin / 100);

      const response = await fetch(
        costing ? `/api/costings/${costing.id}` : "/api/costings",
        {
          method: costing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            totalCost,
            suggestedPrice,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save costing");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving costing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shippingCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Cost ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customsDuty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customs Duty ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxes ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otherCosts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Costs ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profitMargin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profit Margin (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : costing ? "Update Costing" : "Add Costing"}
        </Button>
      </form>
    </Form>
  );
}
