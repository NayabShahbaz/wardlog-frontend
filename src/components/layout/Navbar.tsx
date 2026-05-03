import React, { useState } from "react";
import type { IconType } from "react-icons";
import { Link } from "react-router-dom";
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineBell,
} from "react-icons/hi2";
import Logo from "../ui/Logo";
import { useNotifications } from "../notifications/NotificationsContext";
import NotificationPanel from "../notifications/Notificationpanel";

export interface NavItem {
  label: string;
  icon: IconType;
  active?: boolean;
  onClick?: () => void;
}

interface NavbarProps {
  items: NavItem[];
  userName: string;
  userRole: string;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  items,
  userName,
  userRole,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const dashboardPath =
    userRole === "Nurse"
      ? "/nurse/dashboard"
      : userRole === "Administrator"
        ? "/admin/dashboard"
        : "/doctor/dashboard";

  return (
    <nav className="bg-white border-b border-gray-200 w-full overflow-visible">
      <div className="px-3 md:px-4 py-2.5 flex items-center justify-between">
        {" "}
        {/* Logo */}
        <div className="shrink-0">
          <Link
            to={dashboardPath}
            className="hover:opacity-80 transition-opacity block"
          >
            <Logo size="sm" />
          </Link>
        </div>
        {/* Desktop Nav - hidden on mobile */}
        <div className="hidden xl:flex flex-1 items-center justify-center gap-2.5 mx-2 min-w-0">
          {" "}
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap                ${
                item.active
                  ? "bg-[#1a5276] text-white"
                  : "text-gray-600 hover:bg-[#e8f0f6] hover:text-[#1a5276]"
              }`}
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
        {/* Desktop Right */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          {/* Bell */}
          <div className="relative">
            <button
              data-notification-bell
              onClick={(e) => {
                e.stopPropagation();
                setNotifOpen(!notifOpen);
              }}
              className="relative p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiOutlineBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-0.5">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-[#1a5276] leading-none">
              {userName}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mt-0.5">
              {userRole}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <HiOutlineArrowRightOnRectangle className="w-3.5 h-3.5 text-red-500" />
            Logout
          </button>
        </div>
        {/* Mobile: Bell + Hamburger */}
        <div className="flex xl:hidden items-center gap-1">
          <div className="relative">
            <button
              data-notification-bell
              onClick={(e) => {
                e.stopPropagation();
                setNotifOpen(!notifOpen);
              }}
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiOutlineBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-0.5">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileOpen ? (
              <HiOutlineXMark className="w-6 h-6" />
            ) : (
              <HiOutlineBars3 className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-gray-100 px-4 py-3 space-y-1 bg-gray-50 shadow-inner">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick?.();
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${item.active ? "bg-[#1a5276] text-white" : "text-gray-600 hover:bg-white"}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
          <div className="pt-3 mt-3 border-t border-gray-200 flex items-center justify-between px-2 pb-2">
            <div className="text-left">
              <p className="text-sm font-bold text-[#1a5276]">{userName}</p>
              <p className="text-[10px] text-gray-500 uppercase font-medium">
                {userRole}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white shadow-sm"
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4 text-red-500" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
