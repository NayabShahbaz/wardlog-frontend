import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { apiFetch } from "../../utils/api";

export type NotificationType =
  | "task_completed"
  | "task_assigned"
  | "lab_order"
  | "patient_update"
  | "patient_discharged"
  | "document_update"
  | "notice"
  | "roster"
  | "swap_request"
  | "patient_assigned";

export interface Notification {
  _id: string;
  id: string; // alias for _id, used by panel
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  relatedPatient?: string;
  createdAt?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    n: Omit<Notification, "id" | "_id" | "read" | "time">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// ── Time formatting ─────────────────────────────────────────────
const formatTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
};

// ── Transform backend notification to frontend shape ────────────
interface BackendNotification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedPatient?: string;
}

const transformNotification = (n: BackendNotification): Notification => ({
  ...n,
  id: n._id,
  time: formatTimeAgo(n.createdAt),
});

// ── Polling interval (30 seconds) ───────────────────────────────
const POLL_INTERVAL = 30000;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Fetch notifications from backend ──────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await apiFetch("/api/notifications");
      const data = await res.json();

      if (data.success) {
        const transformed = data.data.map(transformNotification);
        setNotifications(transformed);
        setUnreadCount(transformed.filter((n: Notification) => !n.read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  // ── Poll for new notifications ────────────────────────────────
  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await apiFetch("/api/notifications");
        const data = await res.json();

        if (active && data.success) {
          const transformed = data.data.map(transformNotification);
          setNotifications(transformed);
          setUnreadCount(
            transformed.filter((n: Notification) => !n.read).length,
          );
        }
      } catch (err) {
        console.log("Error polling notifications:", err);
        console.error("Failed to fetch notifications:", err);
      }
    };

    // Initial fetch after a microtask delay (avoids the lint rule)
    const timeout = setTimeout(poll, 0);
    const interval = setInterval(poll, POLL_INTERVAL);

    return () => {
      active = false;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────────
  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "_id" | "read" | "time">) => {
      // Local optimistic add (for events triggered by current user's actions)
      const newNotif: Notification = {
        ...n,
        _id: `local-${Date.now()}`,
        id: `local-${Date.now()}`,
        read: false,
        time: "Just now",
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
    [],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      } catch (err) {
        console.error("Failed to mark as read:", err);
        fetchNotifications(); // Revert on failure
      }
    },
    [fetchNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const clearAll = useCallback(async () => {
    // Optimistic update
    setNotifications([]);
    setUnreadCount(0);

    try {
      await apiFetch("/api/notifications", { method: "DELETE" });
    } catch (err) {
      console.error("Failed to clear notifications:", err);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  return ctx;
};
