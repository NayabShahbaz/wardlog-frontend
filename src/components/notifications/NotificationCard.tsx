import React from "react";
import { Badge } from "../ui";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "urgent" | "info" | "task" | "lab";
  timestamp: string;
  isRead: boolean;
}

const typeMap = {
  urgent: "red",
  info: "blue",
  task: "dark",
  lab: "orange",
} as const;

export const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => (
  <div className={`p-4 rounded-2xl border transition-all ${
    notification.isRead ? "bg-white border-gray-100" : "bg-blue-50 border-blue-100 shadow-sm"
  }`}>
    <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`text-sm font-bold truncate ${notification.isRead ? "text-gray-700" : "text-blue-900"}`}>
            {notification.title}
          </h3>
          {!notification.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-2">
          {notification.message}
        </p>
        <span className="text-[11px] text-gray-400 font-medium">
          {notification.timestamp}
        </span>
      </div>
      <Badge text={notification.type} variant={typeMap[notification.type]} />
    </div>
  </div>
);