import { readJSON, writeJSON } from "@/lib/utils/json";
import { Notification } from "@/lib/types/notification";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const NOTIFICATIONS_FILE = path.join(process.cwd(), "data", "notifications.json");

interface NotificationsData {
  notifications: Notification[];
}

export async function getNotifications(): Promise<Notification[]> {
  const data = await readJSON<NotificationsData>(NOTIFICATIONS_FILE);
  return data.notifications || [];
}

export async function addNotification(notification: Omit<Notification, "id" | "createdAt">): Promise<Notification> {
  const notifications = await getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  await writeJSON(NOTIFICATIONS_FILE, {
    notifications: [...notifications, newNotification],
  });

  return newNotification;
}

export async function markAsRead(id: string): Promise<void> {
  const notifications = await getNotifications();
  const updatedNotifications = notifications.map((notification) =>
    notification.id === id ? { ...notification, isRead: true } : notification
  );

  await writeJSON(NOTIFICATIONS_FILE, { notifications: updatedNotifications });
}

export async function markAllAsRead(): Promise<void> {
  const notifications = await getNotifications();
  const updatedNotifications = notifications.map((notification) => ({
    ...notification,
    isRead: true,
  }));

  await writeJSON(NOTIFICATIONS_FILE, { notifications: updatedNotifications });
}

export async function archiveNotification(id: string): Promise<void> {
  const notifications = await getNotifications();
  const updatedNotifications = notifications.map((notification) =>
    notification.id === id ? { ...notification, isArchived: true } : notification
  );

  await writeJSON(NOTIFICATIONS_FILE, { notifications: updatedNotifications });
}

export async function deleteNotification(id: string): Promise<void> {
  const notifications = await getNotifications();
  const updatedNotifications = notifications.filter(
    (notification) => notification.id !== id
  );

  await writeJSON(NOTIFICATIONS_FILE, { notifications: updatedNotifications });
}

export async function clearAllNotifications(): Promise<void> {
  await writeJSON(NOTIFICATIONS_FILE, { notifications: [] });
}

export async function getUnreadCount(): Promise<number> {
  const notifications = await getNotifications();
  return notifications.filter((n) => !n.isRead && !n.isArchived).length;
}

export async function createSystemNotification(
  title: string,
  message: string,
  priority: Notification["priority"] = "medium",
  metadata?: Notification["metadata"]
): Promise<Notification> {
  return addNotification({
    type: "system_alert",
    title,
    message,
    priority,
    isRead: false,
    isArchived: false,
    metadata,
  });
}
