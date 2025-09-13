import { create } from "zustand";

interface Notification {
  id: string;
  message: string;
  type: "success" | "error";
  downloadUrl?: string;
  isRead: boolean;
  timestamp: Date;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "isRead">) => void;
  markAsRead: (id: string) => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        { ...notification, id: Date.now().toString(), timestamp: new Date(), isRead: false },
        ...state.notifications,
      ],
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    })),
  getUnreadCount: () => get().notifications.filter((n) => !n.isRead).length,
}));
