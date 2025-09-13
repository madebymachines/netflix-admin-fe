"use client";

import { useNotificationStore } from "@/stores/notification.store";
import { Bell, Download, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const { notifications, markAsRead, getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

  const handleItemClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.downloadUrl) {
      window.open(notification.downloadUrl, "_blank");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="text-muted-foreground p-2 text-sm">No new notifications.</p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`flex cursor-pointer items-start gap-2 ${!n.isRead ? "font-bold" : ""}`}
              onClick={() => handleItemClick(n)}
            >
              {n.type === "success" ? (
                <Download className="mt-1 h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="mt-1 h-4 w-4 text-red-500" />
              )}
              <div className="flex-1">
                <p className="text-sm">{n.message}</p>
                <p className="text-muted-foreground text-xs">{formatDistanceToNow(n.timestamp, { addSuffix: true })}</p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
