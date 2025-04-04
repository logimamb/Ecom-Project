"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { CostingForm } from "./costing-form";
import { useToast } from "@/components/ui/use-toast";

interface Costing {
  id: string;
  productName: string;
  purchasePrice: number;
  shippingCost: number;
  customsDuty: number;
  taxes: number;
  otherCosts: number;
  totalCost: number;
  suggestedPrice: number;
  profitMargin: number;
  createdAt: string;
}

export default function CostingsPage() {
  const [costings, setCostings] = useState<Costing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCosting, setSelectedCosting] = useState<Costing | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCostings();
  }, []);

  const fetchCostings = async () => {
    try {
      const response = await fetch("/api/costings");
      if (!response.ok) throw new Error("Failed to fetch costings");
      const data = await response.json();
      setCostings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch costings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedCosting(null);
    fetchCostings();
    toast({
      title: "Success",
      description: "Costing saved successfully",
    });
  };

  const handleEdit = (costing: Costing) => {
    setSelectedCosting(costing);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this costing?")) return;

    try {
      const response = await fetch(`/api/costings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete costing");

      toast({
        title: "Success",
        description: "Costing deleted successfully",
      });
      fetchCostings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete costing",
        variant: "destructive",
      });
    }
  };

  if (showForm) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {selectedCosting ? "Edit Costing" : "New Costing"}
          </h1>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
        <CostingForm costing={selectedCosting} onSuccess={handleSuccess} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Product Costings</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Costing
        </Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-right">Purchase Price</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead className="text-right">Suggested Price</TableHead>
                <TableHead className="text-right">Profit Margin</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costings.map((costing) => (
                <TableRow key={costing.id}>
                  <TableCell>{costing.productName}</TableCell>
                  <TableCell className="text-right">
                    ${costing.purchasePrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${costing.totalCost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${costing.suggestedPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {costing.profitMargin}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(costing)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(costing.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {costings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No costings found. Add your first costing to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
