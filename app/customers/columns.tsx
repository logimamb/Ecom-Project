"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/contexts/settings-context";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: string; 
  totalSpentRaw: number; 
  lastOrderDate: string;
  status: string;
  loyaltyPoints: number;
  segment: string;
}

interface Column {
  header: string;
  accessorKey: string;
  cell?: (row: Customer) => React.ReactNode;
}

export const columns: Column[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: (row) => (
      <div>
        <div className="font-medium">{row.name}</div>
        <div className="text-sm text-muted-foreground">{row.email}</div>
      </div>
    ),
  },
  {
    header: "Phone",
    accessorKey: "phone",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => {
      const getStatusColor = (status: string | undefined): string => {
        if (!status) return "secondary";
        
        switch (status.toLowerCase()) {
          case "active":
            return "success";
          case "inactive":
            return "warning";
          case "blocked":
            return "destructive";
          default:
            return "secondary";
        }
      };

      return (
        <Badge variant={getStatusColor(row.status) as any}>
          {row.status || "Unknown"}
        </Badge>
      );
    },
  },
  {
    header: "Total Orders",
    accessorKey: "totalOrders",
  },
  {
    header: "Total Spent",
    accessorKey: "totalSpent", 
  },
  {
    header: "Last Order",
    accessorKey: "lastOrderDate",
    cell: (row) => 
      row.lastOrderDate 
        ? new Date(row.lastOrderDate).toLocaleDateString()
        : "Never",
  },
  {
    header: "Loyalty Points",
    accessorKey: "loyaltyPoints",
  },
  {
    header: "Segment",
    accessorKey: "segment",
    cell: (row: Customer) => (
      <Badge
        className={`${getSegmentColor(row.segment)} text-white`}
      >
        {row.segment}
      </Badge>
    ),
  },
];

function getSegmentColor(segment: string): string {
  switch (segment?.toLowerCase()) {
    case 'vip':
      return 'bg-purple-500';
    case 'gold':
      return 'bg-yellow-500';
    case 'silver':
      return 'bg-gray-500';
    case 'bronze':
      return 'bg-orange-500';
    default:
      return 'bg-blue-500';
  }
}
