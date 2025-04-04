"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

interface Sale {
  id: string;
  customer: {
    name: string;
    email: string;
  };
  amount: number;
  status: string;
  date: string;
}

interface RecentSalesProps {
  sales?: Sale[];
  formatCurrency: (amount: number) => string;
  isLoading?: boolean;
}

export function RecentSalesDisplay({ sales = [], formatCurrency, isLoading = false }: RecentSalesProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No recent sales
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {sale.customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.customer.name}</p>
            <p className="text-sm text-muted-foreground">{sale.customer.email}</p>
          </div>
          <div className="ml-auto font-medium">
            {formatCurrency(sale.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentSales({ formatCurrency }: { formatCurrency: (amount: number) => string }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch("/api/sales/recent");
        if (!response.ok) throw new Error("Failed to fetch recent sales");
        const data = await response.json();
        setSales(data.sales || []);
      } catch (error) {
        console.error("Error fetching recent sales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSales();
  }, []);

  return (
    <RecentSalesDisplay 
      sales={sales} 
      formatCurrency={formatCurrency} 
      isLoading={isLoading} 
    />
  );
}