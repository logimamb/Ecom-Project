import * as z from "zod";

export const inventorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  reorderPoint: z.coerce.number().min(0, "Reorder point cannot be negative"),
  supplier: z.string().min(1, "Supplier is required"),
  lastRestocked: z.string().optional().default(() => new Date().toISOString()),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export type InventoryFormData = z.infer<typeof inventorySchema>;
