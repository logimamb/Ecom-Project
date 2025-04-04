"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Download, MoreHorizontal, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportForm } from "./report-form";
import { AnalyticsDashboard } from "./analytics-dashboard";
import { ExportButton } from "@/components/export-button";
import { useSettings } from "@/contexts/settings-context";

interface Report {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  author: string;
  period: string;
  createdAt: string;
  updatedAt: string;
  data: {
    revenue?: number;
    expenses?: number;
    profit?: number;
    [key: string]: any;
  };
}

export default function ReportsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Report>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();
  const { formatCurrency } = useSettings();

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/reports");
        if (!response.ok) throw new Error("Failed to fetch reports");
        const data = await response.json();
        setReports(Array.isArray(data.reports) ? data.reports : []);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
        toast({
          title: "Error",
          description: "Failed to load reports",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [toast]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete report");
      setReports(reports.filter((report) => report.id !== id));
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: keyof Report) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatReportValue = (value: number | undefined) => {
    if (typeof value !== 'number' || isNaN(value)) return formatCurrency(0);
    return formatCurrency(value);
  };

  // Apply filters and sorting
  const filteredAndSortedReports = Array.isArray(reports) ? reports
    .filter((report) => {
      if (typeFilter !== "all" && report.type !== typeFilter) return false;
      if (statusFilter !== "all" && report.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          report.title.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query) ||
          report.author.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    }) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-lg text-red-500 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Tabs defaultValue="analytics" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.location.href = '/api/export/all'}>
                  Export All Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/export/reports'}>
                  Export Reports
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/export/customers'}>
                  Export Customer Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/export/sales'}>
                  Export Sales Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/export/inventory'}>
                  Export Inventory Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => {
              setEditingReport(null);
              setIsFormOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </div>
        </div>

        <TabsContent value="analytics" className="mt-0">
          <div className="flex justify-end mb-4">
            <ExportButton 
              url="/api/export/reports" 
              label="Export Analytics"
            />
          </div>
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="reports" className="mt-0 space-y-6">
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredAndSortedReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-lg mb-4">No reports found</div>
              <div className="text-sm text-gray-500 mb-4">
                {reports.length === 0
                  ? "Create your first report to get started"
                  : "Try adjusting your filters"}
              </div>
              {reports.length === 0 && (
                <Button onClick={() => {
                  setEditingReport(null);
                  setIsFormOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Report
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("title")}
                    >
                      Title
                      {sortField === "title" && (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("type")}
                    >
                      Type
                      {sortField === "type" && (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      {sortField === "status" && (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("period")}
                    >
                      Period
                      {sortField === "period" && (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("author")}
                    >
                      Author
                      {sortField === "author" && (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      Created
                      {sortField === "createdAt" && (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : report.status === "in-progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </TableCell>
                      <TableCell>{report.period}</TableCell>
                      <TableCell>{report.author}</TableCell>
                      <TableCell>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingReport(report);
                            setIsFormOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(report.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReport ? "Edit Report" : "Create Report"}
            </DialogTitle>
          </DialogHeader>
          <ReportForm
            report={editingReport}
            onSuccess={(savedReport: Report) => {
              setIsFormOpen(false);
              setEditingReport(null);
              setReports(prevReports => [...prevReports, savedReport]);
              toast({
                title: "Success",
                description: "Report saved successfully",
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
