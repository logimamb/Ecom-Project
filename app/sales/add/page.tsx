"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { SaleForm } from "../sale-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useCurrency } from "@/hooks/use-currency";

export default function AddSalePage() {
  const router = useRouter();
  const { format: formatCurrency } = useCurrency();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { label: "Sales", href: "/sales" },
            { label: "Add New Sale", href: "/sales/add" },
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
            <CardTitle className="text-2xl font-bold">Add New Sale</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <SaleForm
            formatCurrency={formatCurrency}
            onSuccess={() => {
              router.push("/sales");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
