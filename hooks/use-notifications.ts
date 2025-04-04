import useSWR from "swr";
import { Notification } from "@/lib/types/notification";

export function useNotifications() {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<{ notifications: Notification[] }>("/api/notifications");

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead", id }),
      });
      mutate();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllAsRead" }),
      });
      mutate();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const archiveNotification = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive", id }),
      });
      mutate();
    } catch (error) {
      console.error("Error archiving notification:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      mutate();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
      });
      mutate();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;
  const archivedCount = notifications.filter(n => n.isArchived).length;

  return {
    notifications,
    unreadCount,
    archivedCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAllNotifications,
  };
}
