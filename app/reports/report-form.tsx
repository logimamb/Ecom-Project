"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Report } from "@/lib/types"
import { useReports } from "@/hooks/use-reports"
import { useSettings } from "@/contexts/settings-context"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["sales", "inventory", "customers", "financial"]),
  status: z.enum(["draft", "in-progress", "completed"]),
  period: z.string().min(1, "Period is required"),
  author: z.string().min(1, "Author is required"),
  metrics: z.record(z.string(), z.number()).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ReportFormProps {
  report?: Report
  onSuccess: () => void
  onCancel: () => void
}

export function ReportForm({ report, onSuccess, onCancel }: ReportFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { createReport, updateReport } = useReports()
  const { formatCurrency } = useSettings()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: report || {
      title: "",
      description: "",
      type: "sales",
      status: "draft",
      period: "",
      author: "",
      metrics: {},
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true)
      if (report) {
        await updateReport(report.id, data)
        toast({
          title: "Success",
          description: "Report updated successfully",
        })
      } else {
        await createReport(data)
        toast({
          title: "Success",
          description: "Report created successfully",
        })
      }
      onSuccess()
    } catch (error) {
      console.error("Error saving report:", error)
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Period</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("type") === "financial" && (
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="metrics.revenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revenue</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(field.value || 0)}
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metrics.expenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expenses</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(field.value || 0)}
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metrics.profit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profit</FormLabel>
                  <FormControl>
                    <Input type="number" value={field.value || ""} disabled />
                  </FormControl>
                  <FormMessage />
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(field.value || 0)}
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : report ? "Update Report" : "Create Report"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
