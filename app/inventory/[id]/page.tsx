"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { InventoryForm } from "../inventory-form";
import { InventoryItem } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useCurrency } from "@/hooks/use-currency";
import { HelpButton } from "@/components/help-button";

interface EditInventoryPageProps {
  params: {
    id: string;
  };
}

export default function EditInventoryPage({ params }: EditInventoryPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const { format: formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/inventory/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch item");
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error("Error fetching item:", error);
        toast({
          title: "Error",
          description: "Failed to load item",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [params.id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Item not found</h2>
          <p className="text-muted-foreground mt-2">
            The requested inventory item could not be found.
          </p>
          <Link href="/inventory">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative container mx-auto py-4">
      <HelpButton
        title="Inventory Item Management"
        description={`This page allows you to manage individual inventory items. You can:
• View and edit item details including name, description, and price
• Update stock levels and set minimum stock thresholds
• Track purchase costs and selling prices
• Set product categories and tags
• View movement history
• Set up alerts for low stock levels`}
      />
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Inventory", href: "/inventory" },
            { label: item.name, href: `/inventory/${item.id}` },
          ]}
        />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <Link href="/inventory">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit {item.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit {item.name}</CardTitle>
          <CardDescription>
            Update the product details and inventory information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryForm
            item={item}
            formatCurrency={formatCurrency}
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
