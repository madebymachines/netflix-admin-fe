import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth/authStore";
import { useNotificationStore } from "@/stores/notification.store";
import { toast } from "sonner";

let socket: Socket | null = null;

export const useSocket = () => {
  const { admin, isAuthenticated } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    if (isAuthenticated && admin && !socket) {
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      socket = io(socketUrl, {
        query: { adminId: admin.id },
        withCredentials: true,
      });

      socket.on("connect", () => {
        console.log("Socket connected:", socket?.id);
      });

      socket.on("export:completed", (data: { jobId: string; downloadUrl: string }) => {
        const message = `Export job ${data.jobId} is complete.`;
        toast.success(message, {
          action: {
            label: "Download",
            onClick: () => window.open(data.downloadUrl, "_blank"),
          },
        });
        addNotification({ message, type: "success", downloadUrl: data.downloadUrl });
      });

      socket.on("export:failed", (data: { jobId: string; error: string }) => {
        const message = `Export job ${data.jobId} failed: ${data.error}`;
        toast.error(message);
        addNotification({ message, type: "error" });
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    }

    return () => {
      if (socket && socket.connected) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [isAuthenticated, admin, addNotification]);
};
