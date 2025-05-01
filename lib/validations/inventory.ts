import * as z from "zod";

export const inventorySchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  reorderPoint: z.coerce.number().min(0, "Reorder point cannot be negative"),
  location: z.string().optional(),
  notes: z.string().optional(),
  expiryDate: z.string().optional(),
});

export type InventoryFormData = z.infer<typeof inventorySchema>;
