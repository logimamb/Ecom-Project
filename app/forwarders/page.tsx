"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Truck, Mail, Phone, MapPin } from "lucide-react";
import { FreightForwarderForm } from "./freight-forwarder-form";
import { useToast } from "@/components/ui/use-toast";
import { FreightForwarder } from "@/lib/types";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FreightForwardersPage() {
  const [forwarders, setForwarders] = useState<FreightForwarder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForwarder, setSelectedForwarder] = useState<FreightForwarder | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchForwarders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/freight-forwarders");
      if (!response.ok) throw new Error("Failed to fetch freight forwarders");
      const data = await response.json();
      setForwarders(data);
    } catch (error) {
      console.error("Error fetching forwarders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch freight forwarders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchForwarders();
  }, [fetchForwarders]);

  const handleForwarderAdded = (newForwarder: FreightForwarder) => {
    setForwarders(prev => [...prev, newForwarder]);
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Freight forwarder added successfully",
    });
  };

  const handleForwarderUpdated = (updatedForwarder: FreightForwarder) => {
    setForwarders(prev =>
      prev.map(forwarder =>
        forwarder.id === updatedForwarder.id ? updatedForwarder : forwarder
      )
    );
    setIsEditDialogOpen(false);
    setSelectedForwarder(null);
    toast({
      title: "Success",
      description: "Freight forwarder updated successfully",
    });
  };

  const handleEditClick = (forwarder: FreightForwarder) => {
    setSelectedForwarder(forwarder);
    setIsEditDialogOpen(true);
  };

  const handleDeleteForwarder = async (id: string) => {
    try {
      const response = await fetch(`/api/freight-forwarders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete freight forwarder");

      setForwarders(prev => prev.filter(forwarder => forwarder.id !== id));
      toast({
        title: "Success",
        description: "Freight forwarder deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting forwarder:", error);
      toast({
        title: "Error",
        description: "Failed to delete freight forwarder",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Freight Forwarders</h1>
          <p className="text-muted-foreground mt-2">
            Manage your freight forwarders and their shipping capabilities.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Forwarder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Freight Forwarder</DialogTitle>
            </DialogHeader>
            <FreightForwarderForm onSuccess={handleForwarderAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {forwarders.map((forwarder) => (
          <Card key={forwarder.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {forwarder.name}
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Contact:</span>
                  {forwarder.contactPerson}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-1" />
                  <span>{forwarder.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-1" />
                  <span>{forwarder.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1" />
                  <span>{forwarder.depotAddress}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {forwarder.transportModes.map((mode) => (
                    <Badge key={mode} variant="secondary">
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick(forwarder)}
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
                      <AlertDialogTitle>Delete Freight Forwarder</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {forwarder.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteForwarder(forwarder.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Freight Forwarder</DialogTitle>
          </DialogHeader>
          {selectedForwarder && (
            <FreightForwarderForm
              forwarder={selectedForwarder}
              onSuccess={handleForwarderUpdated}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
