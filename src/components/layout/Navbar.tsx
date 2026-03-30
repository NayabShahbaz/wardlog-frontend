import React, { useState } from "react";
import type { IconType } from "react-icons";
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
      {/* Desktop & Tablet Navbar */}
      <div className="px-4 md:px-6 py-3 flex items-center">
        {/* Logo */}
        <div className="shrink-0">
          <Logo size="md" />
        </div>

        {/* Nav Items - desktop only, evenly spaced */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-1.5">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  item.active
                    ? "bg-[#1a5276] text-white"
                    : "text-gray-600 hover:bg-[#e8f0f6] hover:text-[#1a5276]"
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* User Info - desktop */}
        <div className="hidden md:flex items-center gap-4 shrink-0 ml-auto lg:ml-0">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Hamburger - mobile & tablet */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden ml-auto p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {mobileOpen ? (
            <HiOutlineXMark className="w-6 h-6" />
          ) : (
            <HiOutlineBars3 className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 px-4 py-3 space-y-1">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick?.();
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  item.active
                    ? "bg-[#1a5276] text-white"
                    : "text-gray-600 hover:bg-[#e8f0f6] hover:text-[#1a5276]"
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}

          {/* User Info - mobile */}
          <div className="md:hidden pt-3 mt-3 border-t border-gray-100">
            <div className="flex items-center justify-between px-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {userName}
                </p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
