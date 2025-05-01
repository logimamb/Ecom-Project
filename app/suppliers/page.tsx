"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Supplier } from '@/lib/types';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { SupplierForm } from './supplier-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupplierAdded = (newSupplier: Supplier) => {
    setSuppliers(prev => [...prev, newSupplier]);
    setIsAddDialogOpen(false);
  };

  const handleSupplierUpdated = (updatedSupplier: Supplier) => {
    setSuppliers(prev =>
      prev.map(supplier =>
        supplier.id === updatedSupplier.id ? updatedSupplier : supplier
      )
    );
    setIsEditDialogOpen(false);
    setSelectedSupplier(null);
  };

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete supplier');

      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  return (
    <>
      <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <PageHeader 
          title="Suppliers" 
          description="Manage your suppliers and vendor relationships"
          exportOptions={{ current: 'suppliers' }}
        />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <SupplierForm onSuccess={handleSupplierAdded} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.platform}</TableCell>
                  <TableCell>
                    {supplier.website && (
                      <a
                        href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-700"
                      >
                        Visit <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(supplier)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {supplier.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Edit Supplier
              </DialogTitle>
            </DialogHeader>
            {selectedSupplier && (
              <SupplierForm
                mode="edit"
                initialData={selectedSupplier}
                onSuccess={handleSupplierUpdated}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}