import React, { useRef, useEffect, useCallback } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineBeaker,
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineBell,
  HiOutlineCalendarDays,
  HiOutlineArrowsRightLeft,
  HiOutlineUserPlus,
  HiOutlineTrash,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import {
  useNotifications,
  type NotificationType,
} from "./NotificationsContext";

import type { IconType } from "react-icons";

// Use IconType instead of React.ElementType
const typeConfig: Record<
  NotificationType,
  { icon: IconType; color: string; bg: string }
> = {
  task_completed: {
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  task_assigned: {
    icon: HiOutlineCheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  lab_order: {
    icon: HiOutlineBeaker,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  patient_update: {
    icon: HiOutlineUser,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  patient_discharged: {
    icon: HiOutlineArrowRightOnRectangle,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  document_update: {
    icon: HiOutlineDocumentText,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  notice: { icon: HiOutlineBell, color: "text-red-600", bg: "bg-red-50" },
  roster: {
    icon: HiOutlineCalendarDays,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  swap_request: {
    icon: HiOutlineArrowsRightLeft,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  patient_assigned: {
    icon: HiOutlineUserPlus,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
};

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);
  const ignoreNextClose = useRef(false);

  const handleOutsideClick = useCallback(
    (e: MouseEvent) => {
      if (ignoreNextClose.current) {
        ignoreNextClose.current = false;
        return;
      }

      const target = e.target as HTMLElement;

      if (target.closest("[data-notification-bell]")) {
        return;
      }

      if (panelRef.current && !panelRef.current.contains(target)) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handleOutsideClick);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, handleOutsideClick]);

  if (!isOpen) return null;

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    ignoreNextClose.current = true;
    action();
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg z-50 overflow-hidden"
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "#e5e7eb",
        }}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onMouseDown={(e) =>
                handleAction(e as unknown as React.MouseEvent, markAllAsRead)
              }
              className="text-xs text-[#1a5276] font-semibold hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onMouseDown={(e) =>
                handleAction(e as unknown as React.MouseEvent, clearAll)
              }
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Clear all"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const config = typeConfig[notif.type];
            const Icon = config?.icon ?? HiOutlineBell;
            const bg = config?.bg ?? "bg-gray-50";
            const color = config?.color ?? "text-gray-600";
            return (
              <div
                key={notif.id}
                onMouseDown={(e) =>
                  handleAction(e as unknown as React.MouseEvent, () =>
                    markAsRead(notif.id),
                  )
                }
                role="button"
                tabIndex={0}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer hover:bg-gray-50 ${!notif.read ? "bg-blue-50/40" : ""}`}
                style={{
                  borderBottomWidth: "1px",
                  borderBottomStyle: "solid",
                  borderBottomColor: "#f3f4f6",
                }}
              >
                <div className={`${bg} p-2 rounded-lg shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-xs font-semibold ${!notif.read ? "text-gray-900" : "text-gray-500"}`}
                    >
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-[#1a5276] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center">
            <HiOutlineBell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
