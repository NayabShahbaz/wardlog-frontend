import React, { useState } from "react";
import type { IconType } from "react-icons";
import { Link } from "react-router-dom";
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
} from "react-icons/hi2";
import Logo from "../ui/Logo";

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

  return (
    <nav className="bg-white border-b border-gray-200">
      {/* Main Bar */}
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        {/* 1. Leftmost Logo (Navigation to Dashboard) */}
        <div className="shrink-0">
          <Link
            to={userRole === "Nurse" ? "/nurse/dashboard" : "/doctor/dashboard"}
            className="hover:opacity-80 transition-opacity block"
          >
            <Logo size="md" />
          </Link>
        </div>

        {/* 2. Desktop Navigation (Center - One Liner) */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-1 mx-4">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${
                  item.active
                    ? "bg-[#1a5276] text-white"
                    : "text-gray-600 hover:bg-[#e8f0f6] hover:text-[#1a5276]"
                }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </div>

        {/* 3. Desktop User Info (Right) */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-[#1a5276] leading-none">
              {userName}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mt-1">
              {userRole}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <HiOutlineArrowRightOnRectangle className="w-4 h-4 text-red-500" />
            Logout
          </button>
        </div>

        {/* 4. Hamburger Button (Mobile/Tablet) */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {mobileOpen ? (
            <HiOutlineXMark className="w-6 h-6" />
          ) : (
            <HiOutlineBars3 className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* 5. Dropdown Menu (Mobile/Tablet) */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 px-4 py-3 space-y-1 bg-gray-50 shadow-inner">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick?.();
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${
                  item.active
                    ? "bg-[#1a5276] text-white"
                    : "text-gray-600 hover:bg-white"
                }`}
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
