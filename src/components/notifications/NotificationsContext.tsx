import React, { createContext, useContext, useState, useCallback } from "react";

export type NotificationType =
  | "task_completed"
  | "lab_order"
  | "patient_update"
  | "document_update"
  | "notice"
  | "roster"
  | "swap_request"
  | "patient_assigned";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "read" | "time">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const typeIcon: Record<NotificationType, string> = {
  task_completed: "Task Completed",
  lab_order: "Lab Order",
  patient_update: "Patient Update",
  document_update: "Document Updated",
  notice: "New Notice",
  roster: "Roster Update",
  swap_request: "Swap Request",
  patient_assigned: "Patient Assigned",
};

// Initial mock notifications
const initialNotifications: Notification[] = [
  {
    id: "n1",
    type: "task_completed",
    title: "Task Completed",
    message: "Emily Chen completed 'Administer morning medications'",
    time: "2 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "lab_order",
    title: "Lab Results Ready",
    message: "CBC results for John Doe (MRN001234) are now available",
    time: "15 min ago",
    read: false,
  },
  {
    id: "n3",
    type: "notice",
    title: "New Notice Posted",
    message: "System Maintenance Scheduled for tonight at 2:00 AM",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "n4",
    type: "swap_request",
    title: "Swap Request Approved",
    message: "Your shift swap for Friday Mar 13 has been approved",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "n5",
    type: "patient_assigned",
    title: "New Patient Assigned",
    message: "Alice Cooper (MRN001238) has been assigned to you by Admin",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "n6",
    type: "document_update",
    title: "Clinical Note Updated",
    message: "Progress Note for Mary Smith updated by Dr. Sarah Johnson",
    time: "5 hours ago",
    read: true,
  },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "read" | "time">) => {
      const newNotif: Notification = {
        ...n,
        id: `n-${Date.now()}`,
        read: false,
        time: "Just now",
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
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

// eslint-disable-next-line react-refresh/only-export-components
export { typeIcon };
