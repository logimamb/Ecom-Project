"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
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

export const createColumns = (
  onEdit: (customer: Customer) => void,
  onDelete: (customer: Customer) => void
) => {
  const columns: Column[] = [
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
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row: Customer) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return columns;
};

function getSegmentColor(segment: string): string {
  switch (segment.toLowerCase()) {
    case "vip":
      return "bg-purple-500";
    case "regular":
      return "bg-blue-500";
    case "new":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}
