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

export interface UserContextType {
  userName: string;
  userRole: string;
}

interface DoctorLayoutProps extends PropsWithChildren {
  userName?: string;
  userRole?: string;
}

const DoctorLayout = ({
  userName = "Dr. Sarah Johnson",
  userRole = "Doctor",
  children,
}: DoctorLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = location.pathname.startsWith("/nurse")
    ? "/nurse"
    : "/doctor";

  const defaultNavItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: HiOutlineClipboard,
      path: `${basePath}/dashboard`,
    },
    { label: "Patients", icon: HiOutlineUsers, path: `${basePath}/patients` },
    {
      label: "Clinical Docs",
      icon: HiOutlineDocumentText,
      path: `${basePath}/clinical-docs`,
    },
    {
      label: "Ward Coordination",
      icon: HiOutlineCalendarDays,
      path: `${basePath}/ward-dashboard`,
    },
    {
      label: "NoticeBoard",
      icon: HiOutlineBell,
      path: `${basePath}/noticeboard`,
    },
    { label: "Tasks", 
      icon: HiOutlineCheckCircle, 
      path: `${basePath}/tasks` 
    },
    {
      label: "Notifications",
      icon: HiOutlineBell, // You can keep Bell here or use HiOutlineChatBubbleLeft
      path: `${basePath}/notifications`,
    },
    {
      label: "Roster",
      icon: HiOutlineCalendarDays,
      path: `${basePath}/roster`,
    },
    {
      label: "Staff Directory",
      icon: HiOutlineUserGroup,
      path: `${basePath}/directory`,
    },
  ].map((item) => ({
    ...item,
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

      <main className="flex-1 w-full px-4 py-4 md:px-6 md:py-6 lg:px-8 xl:max-w-7xl xl:mx-auto">
        {children ?? (
          <Outlet context={{ userName, userRole } satisfies UserContextType} />
        )}
      </main>
    </div>
  );
};

export default DoctorLayout;
