import { v4 as uuidv4 } from 'uuid';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { Notification, NotificationType } from '../types/notification';

const NOTIFICATIONS_PATH = path.join(process.cwd(), 'data', 'notifications.json');
const INVENTORY_PATH = path.join(process.cwd(), 'data', 'inventory.json');
const CUSTOMERS_PATH = path.join(process.cwd(), 'data', 'customers.json');
const SALES_PATH = path.join(process.cwd(), 'data', 'sales.json');

interface NotificationData {
  notifications: Notification[];
}

interface Product {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
}

interface Sale {
  id: string;
  total: number;
  customerId: string;
  date: string;
}

interface Customer {
  id: string;
  name: string;
  loyaltyPoints?: number;
}

function initializeNotificationsFile() {
  try {
    readFileSync(NOTIFICATIONS_PATH, 'utf-8');
  } catch (error) {
    writeFileSync(NOTIFICATIONS_PATH, JSON.stringify({ notifications: [] }, null, 2));
  }
}

function safeReadFile(filePath: string, defaultValue: any = { notifications: [] }) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}, using default value`);
    return defaultValue;
  }
}

export async function syncNotifications() {
  try {
    // Initialize notifications file if it doesn't exist
    initializeNotificationsFile();

    // Read current data with safe defaults
    const notificationsData: NotificationData = safeReadFile(NOTIFICATIONS_PATH);
    const inventoryData = safeReadFile(INVENTORY_PATH, { products: [] });
    const customersData = safeReadFile(CUSTOMERS_PATH, { customers: [] });
    const salesData = safeReadFile(SALES_PATH, { sales: [] });

    const newNotifications: Notification[] = [];

    // Check inventory levels
    const products = inventoryData.products || [];
    products.forEach((product: Product) => {
      if (product?.quantity <= (product?.minQuantity || 0)) {
        newNotifications.push({
          id: uuidv4(),
          type: 'inventory_low' as NotificationType,
          title: 'Low Stock Alert',
          message: `Product '${product.name}' is running low on stock. Current quantity: ${product.quantity} units`,
          priority: product.quantity === 0 ? 'urgent' : 'high',
          isRead: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
          metadata: {
            productId: product.id,
            currentStock: product.quantity,
            threshold: product.minQuantity
          }
        });
      }
    });

    // Check recent sales
    const sales = salesData.sales || [];
    const recentSales = sales.filter((sale: Sale) => {
      if (!sale?.date) return false;
      const saleDate = new Date(sale.date);
      const now = new Date();
      const hoursDiff = (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    });

    recentSales.forEach((sale: Sale) => {
      if (!sale?.id) return;
      newNotifications.push({
        id: uuidv4(),
        type: 'order_status',
        title: 'New Order Received',
        message: `Order #${sale.id} has been placed for $${sale.total || 0}`,
        priority: 'medium',
        isRead: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        actionUrl: `/orders/${sale.id}`,
        metadata: {
          orderId: sale.id,
          amount: sale.total,
          customerId: sale.customerId
        }
      });
    });

    // Check customer loyalty milestones
    const customers = customersData.customers || [];
    customers.forEach((customer: Customer) => {
      if (!customer?.id || !customer?.name) return;
      const loyaltyPoints = customer.loyaltyPoints || 0;
      const milestones = [1000, 5000, 10000];
      
      milestones.forEach(milestone => {
        if (loyaltyPoints >= milestone && !hasLoyaltyNotification(notificationsData.notifications || [], customer.id, milestone)) {
          newNotifications.push({
            id: uuidv4(),
            type: 'customer_loyalty',
            title: 'Customer Milestone',
            message: `Customer ${customer.name} has reached ${milestone} loyalty points!`,
            priority: 'low',
            isRead: false,
            isArchived: false,
            createdAt: new Date().toISOString(),
            actionUrl: `/customers/${customer.id}`,
            metadata: {
              customerId: customer.id,
              loyaltyPoints: milestone,
              milestone: getMilestoneLevel(milestone)
            }
          });
        }
      });
    });

    // Add new notifications
    if (newNotifications.length > 0) {
      notificationsData.notifications = [
        ...newNotifications,
        ...(notificationsData.notifications || [])
      ];

      // Save updated notifications
      writeFileSync(NOTIFICATIONS_PATH, JSON.stringify(notificationsData, null, 2));
    }

    return newNotifications;
  } catch (error) {
    console.error('Error syncing notifications:', error);
    throw error;
  }
}

function hasLoyaltyNotification(notifications: Notification[], customerId: string, milestone: number): boolean {
  return notifications.some(
    n => n.type === 'customer_loyalty' &&
    n.metadata?.customerId === customerId &&
    n.metadata?.loyaltyPoints === milestone
  );
}

function getMilestoneLevel(points: number): string {
  if (points >= 10000) return 'platinum';
  if (points >= 5000) return 'gold';
  if (points >= 1000) return 'silver';
  return 'bronze';
}
