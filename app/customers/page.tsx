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
import { createColumns } from './columns';
import { useSettings } from "@/contexts/settings-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
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

  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      const response = await fetch(`/api/customers/${customerToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      setCustomers(customers.filter(c => c.id !== customerToDelete.id));
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    } finally {
      setCustomerToDelete(null);
    }
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

      await fetchCustomers();
      toast({
        title: "Success",
        description: "Customers synced successfully",
      });
    } catch (error) {
      console.error("Error syncing customers:", error);
      toast({
        title: "Error",
        description: "Failed to sync customers",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const columns = createColumns(
    handleEdit,
    (customer) => setCustomerToDelete(customer)
  );

  return (
    <>
      <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <PageHeader 
          title="Customers" 
          description="Manage your customers and their information"
          exportOptions={{ current: 'customers' }}
        />
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync
                </>
              )}
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={customers}
          isLoading={isLoading}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={selectedCustomer}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer &quot;{customerToDelete?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
