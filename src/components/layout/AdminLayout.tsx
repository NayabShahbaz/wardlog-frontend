import type { PropsWithChildren } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar, { type NavItem } from "./Navbar";
import {
  HiOutlineUsers,
  HiOutlineCog6Tooth,
  HiOutlineClipboard,
  HiOutlineCalendarDays,
  HiOutlineUserGroup,
  HiOutlineBell,
} from "react-icons/hi2";

const AdminLayout = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: HiOutlineClipboard,
      active:
        location.pathname === "/admin/dashboard" ||
        location.pathname === "/admin",
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      label: "Patients",
      icon: HiOutlineUsers,
      active: location.pathname.startsWith("/admin/patients"),
      onClick: () => navigate("/admin/patients"),
    },
    {
      label: "Roster",
      icon: HiOutlineCalendarDays,
      active: location.pathname.startsWith("/admin/roster"),
      onClick: () => navigate("/admin/roster"),
    },
    {
      label: "Staff Directory",
      icon: HiOutlineUserGroup,
      active: location.pathname.startsWith("/admin/staff-directory"),
      onClick: () => navigate("/admin/staff-directory"),
    },
    {
      label: "Noticeboard",
      icon: HiOutlineBell,
      active: location.pathname.startsWith("/admin/noticeboard"),
      onClick: () => navigate("/admin/noticeboard"),
    },
    {
      label: "Settings",
      icon: HiOutlineCog6Tooth,
      active: location.pathname.startsWith("/admin/settings"),
      onClick: () => navigate("/admin/settings"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      <Navbar
        items={navItems}
        userName="Admin"
        userRole="Administrator"
        onLogout={() => navigate("/login")}
      />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        {children ?? <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
