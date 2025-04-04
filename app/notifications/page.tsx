"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell, Archive, Trash2, Check, CheckCheck, AlertTriangle, Info, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationType, NotificationPriority } from "@/lib/types/notification";
import { toast } from "sonner";

export default function NotificationsPage() {
  const {
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
    mutate,
  } = useNotifications();

  const [selectedTab, setSelectedTab] = useState<"unread" | "all" | "archived">("unread");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncNotifications = useCallback(async () => {
    try {
      setIsSyncing(true);
      const response = await fetch("/api/notifications/sync", {
        method: "POST",
      });
      
      if (!response.ok) throw new Error("Failed to sync notifications");
      
      const data = await response.json();
      if (data.count > 0) {
        toast.success(`${data.count} new notification${data.count === 1 ? '' : 's'}`);
        mutate();
      }
    } catch (error) {
      toast.error("Failed to sync notifications");
      console.error("Error syncing notifications:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [mutate]);

  // Auto-sync on mount and every 5 minutes
  useEffect(() => {
    syncNotifications();
    const interval = setInterval(syncNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [syncNotifications]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "inventory_low":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "order_status":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "payment_due":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "customer_loyalty":
        return <Bell className="h-5 w-5 text-purple-500" />;
      case "delivery_update":
        return <Info className="h-5 w-5 text-green-500" />;
      case "system_alert":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "price_change":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "task_reminder":
        return <Bell className="h-5 w-5 text-indigo-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case "urgent":
        return "text-red-500 bg-red-50 border-red-200";
      case "high":
        return "text-orange-500 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-500 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-500 bg-green-50 border-green-200";
    }
  };

  const filterNotifications = (tab: typeof selectedTab) => {
    return notifications.filter((n) => {
      switch (tab) {
        case "unread":
          return !n.isRead && !n.isArchived;
        case "archived":
          return n.isArchived;
        default:
          return !n.isArchived;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-lg text-red-500 mb-4">Failed to load notifications</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and stay updated with important events
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={syncNotifications} 
            variant="outline"
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          {unreadCount > 0 && (
            <Button onClick={() => markAllAsRead()} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          )}
          <Button
            onClick={() => setShowClearConfirm(true)}
            variant="destructive"
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as typeof selectedTab)}>
        <TabsList>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="archived">
            Archived
            {archivedCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {archivedCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="mt-6">
          <NotificationsList
            notifications={filterNotifications("unread")}
            onMarkAsRead={markAsRead}
            onArchive={archiveNotification}
            onDelete={deleteNotification}
            emptyMessage="No unread notifications"
          />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <NotificationsList
            notifications={filterNotifications("all")}
            onMarkAsRead={markAsRead}
            onArchive={archiveNotification}
            onDelete={deleteNotification}
            emptyMessage="No notifications"
          />
        </TabsContent>

        <TabsContent value="archived" className="mt-6">
          <NotificationsList
            notifications={filterNotifications("archived")}
            onMarkAsRead={markAsRead}
            onArchive={archiveNotification}
            onDelete={deleteNotification}
            emptyMessage="No archived notifications"
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All notifications will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearAllNotifications();
                setShowClearConfirm(false);
              }}
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NotificationsList({
  notifications,
  onMarkAsRead,
  onArchive,
  onDelete,
  emptyMessage,
}: {
  notifications: any[];
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Bell className="h-12 w-12 text-gray-300 mb-4" />
        <div className="text-lg text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] rounded-md border p-4">
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={notification.isRead ? "opacity-75" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getNotificationIcon(notification.type)}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {notification.title}
                      <Badge
                        className={`${getPriorityColor(
                          notification.priority
                        )} border`}
                      >
                        {notification.priority}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {new Date(notification.createdAt).toLocaleString()}
                      {notification.expiresAt && (
                        <span className="ml-2">
                          · Expires {new Date(notification.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Mark as Read
                    </Button>
                  )}
                  {!notification.isArchived ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onArchive(notification.id)}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(notification.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{notification.message}</p>
              {notification.actionUrl && (
                <Button
                  variant="link"
                  className="mt-2 h-auto p-0"
                  asChild
                >
                  <a href={notification.actionUrl} target="_blank" rel="noopener noreferrer">
                    View Details
                  </a>
                </Button>
              )}
              {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                  {Object.entries(notification.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="font-medium">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
