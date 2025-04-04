export type NotificationType = 
  | "inventory_low"
  | "order_status"
  | "payment_due"
  | "customer_loyalty"
  | "delivery_update"
  | "system_alert"
  | "price_change"
  | "task_reminder";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
  metadata?: {
    orderId?: string;
    customerId?: string;
    productId?: string;
    amount?: number;
    status?: string;
    [key: string]: any;
  };
}
