"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "../_components/order-form";
import { ArrowLeft } from "lucide-react";

export default function CreateOrderPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/orders");
    router.refresh();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <h1 className="text-3xl font-bold">Create New Order</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
