import { NextResponse } from "next/server";
import { syncNotifications } from "@/lib/utils/notification-sync";

export async function POST() {
  try {
    const newNotifications = await syncNotifications();
    
    return NextResponse.json({
      success: true,
      count: newNotifications.length,
      notifications: newNotifications
    });
  } catch (error) {
    console.error("Error in notifications sync route:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to sync notifications" 
      },
      { status: 500 }
    );
  }
}
