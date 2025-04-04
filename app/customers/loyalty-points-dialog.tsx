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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const loyaltyPointsSchema = z.object({
  points: z.coerce
    .number()
    .min(-1000, "Cannot deduct more than 1000 points")
    .max(1000, "Cannot add more than 1000 points"),
  reason: z.string().min(1, "Please provide a reason for the adjustment"),
});

type LoyaltyPointsFormData = z.infer<typeof loyaltyPointsSchema>;

interface LoyaltyPointsDialogProps {
  customerId: string;
  customerName: string;
  currentPoints: number;
  onSuccess: () => void;
}

export function LoyaltyPointsDialog({
  customerId,
  customerName,
  currentPoints,
  onSuccess,
}: LoyaltyPointsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoyaltyPointsFormData>({
    resolver: zodResolver(loyaltyPointsSchema),
    defaultValues: {
      points: 0,
      reason: "",
    },
  });

  const onSubmit = async (data: LoyaltyPointsFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/loyalty-points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to adjust loyalty points");
      }

      toast({
        title: "Success",
        description: "Loyalty points adjusted successfully",
      });
      onSuccess();
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust loyalty points",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Adjust Points
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Loyalty Points</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm">
            <p>Customer: <span className="font-medium">{customerName}</span></p>
            <p>Current Points: <span className="font-medium">{currentPoints}</span></p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points Adjustment</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter points (positive to add, negative to deduct)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Why are you adjusting the points?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
