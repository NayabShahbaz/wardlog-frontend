// NotificationsPage.tsx
import { useState } from "react";
import { HiOutlineBell } from "react-icons/hi2";
import { NotificationCard, type Notification } from "./NotificationCard";

const INITIAL_DATA: Notification[] = [
  { id: "1", title: "Urgent Lab Result", message: "Critical Potassium level for John Doe (MRN001234).", type: "urgent", timestamp: "10m ago", isRead: false },
  { id: "2", title: "New Task Assigned", message: "Dr. Sarah Johnson assigned: 'Update discharge summary'.", type: "task", timestamp: "1h ago", isRead: true },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_DATA);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button 
          onClick={() => setNotifications(n => n.map(x => ({ ...x, isRead: true })))}
          className="text-sm font-semibold text-[#1a5276] hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map(n => <NotificationCard key={n.id} notification={n} />)
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <HiOutlineBell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}