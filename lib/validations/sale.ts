import * as z from "zod";

export const saleItemSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
});

export const saleSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  items: z.array(saleItemSchema).min(1, "Add at least one item"),
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "mobile_money"]),
  notes: z.string().optional(),
});

export type SaleFormData = z.infer<typeof saleSchema>;
export type SaleItemFormData = z.infer<typeof saleItemSchema>;
