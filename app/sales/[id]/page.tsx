"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { SaleForm } from "../sale-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import type { SaleFormData } from "@/lib/validations/sale";

interface EditSalePageProps {
  params: {
    id: string;
  };
}

export default function EditSalePage({ params }: EditSalePageProps) {
  const router = useRouter();
  const [sale, setSale] = useState<(SaleFormData & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await fetch(`/api/sales/${params.id}`);
        if (!response.ok) {
          throw new Error("Sale not found");
        }
        const data = await response.json();
        setSale(data.sale);
      } catch (error) {
        console.error("Error fetching sale:", error);
        toast({
          title: "Error",
          description: "Failed to load sale",
          variant: "destructive",
        });
        router.push("/sales");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSale();
  }, [params.id, router, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!sale) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { label: "Sales", href: "/sales" },
            { label: "Edit Sale", href: `/sales/${params.id}` },
          ]}
        />
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Go back</span>
            </Button>
            <CardTitle className="text-2xl font-bold">Edit Sale</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <SaleForm
            sale={sale}
            onSuccess={() => {
              router.push("/sales");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
