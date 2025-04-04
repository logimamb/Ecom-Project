"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { InventoryForm } from "../inventory-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function AddInventoryPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Inventory", href: "/inventory" },
            { label: "Add New Item", href: "/inventory/add" },
          ]}
        />
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Add New Inventory Item</CardTitle>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inventory
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to add a new item to your inventory.
          </p>
        </CardHeader>
        <CardContent>
          <InventoryForm
            onSuccess={() => {
              router.push("/inventory");
              router.refresh();
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
