import type { PropsWithChildren } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar, { type NavItem } from "./Navbar";
import {
  HiOutlineBell,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineClipboard,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineUsers,
} from "react-icons/hi2";

interface PageLayoutProps extends PropsWithChildren {
  userName?: string;
  userRole?: string;
}

const PageLayout = ({
  userName = "Dr. Sarah Johnson",
  userRole = "Doctor",
  children,
}: PageLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // UNIVERSAL NAVIGATION CONFIG
  const defaultNavItems: NavItem[] = [
    { label: "Dashboard", icon: HiOutlineClipboard, path: "/doctor/dashboard" },
    { label: "Patients", icon: HiOutlineUsers, path: "/doctor/patients" },
    {
      label: "Clinical Docs",
      icon: HiOutlineDocumentText,
      path: "/doctor/clinical-docs",
    },
    {
      label: "Ward Coordination",
      icon: HiOutlineCalendarDays,
      path: "/doctor/ward-dashboard",
    },
    { label: "NoticeBoard", icon: HiOutlineBell, path: "/doctor/noticeboard" },
    { label: "Tasks", icon: HiOutlineCheckCircle, path: "/doctor/tasks" },
    { label: "Roster", icon: HiOutlineCalendarDays, path: "/doctor/roster" },
    {
      label: "Staff Directory",
      icon: HiOutlineUserGroup,
      path: "/doctor/directory",
    },
  ].map((item) => ({
    ...item,
    // Active if current path starts with item path
    active: location.pathname.startsWith(item.path),
    onClick: () => navigate(item.path),
  }));

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      <Navbar
        items={defaultNavItems}
        userName={userName}
        userRole={userRole}
        onLogout={() => navigate("/login")}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        {/* If children exist (wrapping style), use them. Otherwise use Outlet (routing style) */}
        {children ?? <Outlet />}
      </main>
    </div>
  );
};

export default PageLayout;
