import { NextResponse } from "next/server";
import {
  getNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  clearAllNotifications,
} from "@/lib/db/notifications";
import { Notification } from "@/lib/types/notification";

export async function GET() {
  try {
    const notifications = await getNotifications();
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const notification = await addNotification(data);
    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { action, id } = await request.json();

    switch (action) {
      case "markAsRead":
        await markAsRead(id);
        break;
      case "markAllAsRead":
        await markAllAsRead();
        break;
      case "archive":
        await archiveNotification(id);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, clearAll } = await request.json();

    if (clearAll) {
      await clearAllNotifications();
    } else if (id) {
      await deleteNotification(id);
    } else {
      return NextResponse.json(
        { error: "Missing id or clearAll parameter" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
