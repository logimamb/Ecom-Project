import * as z from "zod";

export const orderSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier"),
  forwarderId: z.string().optional(),
  products: z.array(z.object({
    name: z.string().min(1, "Product name is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0, "Unit price must be non-negative"),
  })).min(1, "At least one product is required"),
  status: z.enum(["pending", "paid", "shipped", "delivered"]),
  costs: z.object({
    purchase: z.coerce.number().min(0),
    shipping: z.coerce.number().min(0),
    taxes: z.coerce.number().min(0),
    bankCharges: z.coerce.number().min(0),
    platformCommission: z.coerce.number().min(0),
    deliveryToForwarder: z.coerce.number().min(0),
  }),
  payments: z.object({
    supplier: z.coerce.number().min(0),
    forwarder: z.coerce.number().min(0),
  }),
});
