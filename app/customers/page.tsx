"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CustomerForm } from "./customer-form";
import { LoyaltyPointsDialog } from "./loyalty-points-dialog";
import { useToast } from "@/components/ui/use-toast";
import { PageHeader } from '@/components/page-header';
import { useCustomers } from '@/hooks/use-customers';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { useSettings } from "@/contexts/settings-context";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  segment: "new" | "regular" | "vip";
  createdAt: string;
  totalSpentRaw: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { formatCurrency } = useSettings();

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      const formattedCustomers = (data.customers || []).map((customer: Customer) => ({
        ...customer,
        totalSpentRaw: customer.totalSpent,
        totalSpent: formatCurrency(customer.totalSpent),
      }));
      setCustomers(formattedCustomers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, formatCurrency]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedCustomer(undefined);
    fetchCustomers();
    toast({
      title: "Success",
      description: "Customer saved successfully",
    });
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/customers/sync", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to sync customers");
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: result.message,
      });
      fetchCustomers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync customer orders",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "vip":
        return "bg-purple-500";
      case "regular":
        return "bg-blue-500";
      case "new":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-lg text-red-500 mb-4">Failed to load customers</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Customers" 
        description="Manage your customers and their information"
        exportOptions={{ current: 'customers' }}
      />

      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={() => {
            setSelectedCustomer(undefined);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
        <Button
          variant="outline"
          onClick={handleSync}
          disabled={isSyncing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync Orders
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setSelectedCustomer(undefined);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={selectedCustomer}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-lg mb-4">No customers found</div>
          <div className="text-sm text-gray-500 mb-4">
            Add your first customer to get started
          </div>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={customers} 
          isLoading={isLoading}
          actions={(customer: Customer) => (
            <div className="text-right space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(customer)}
              >
                Edit
              </Button>
              <LoyaltyPointsDialog
                customerId={customer.id}
                customerName={customer.name}
                currentPoints={customer.loyaltyPoints}
                onSuccess={fetchCustomers}
              />
            </div>
          )}
        />
      )}
    </div>
  );
}
