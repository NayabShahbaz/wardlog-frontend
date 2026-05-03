import { useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar, { type NavItem } from "./Navbar";
import {
  HiOutlineUsers,
  HiOutlineCog6Tooth,
  HiOutlineClipboard,
  HiOutlineCalendarDays,
  HiOutlineUserGroup,
  HiOutlineBell,
} from "react-icons/hi2";
import { isTokenExpired, logout } from "../../utils/api";
import { type UserContextType } from "./DoctorLayout";

interface StoredUser {
  id: string;
  name: string;
  role: string;
}

const readStoredUser = (): StoredUser | null => {
  const token = localStorage.getItem("token");
  const stored = localStorage.getItem("user");
  if (!token || !stored || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
  try {
    const user = JSON.parse(stored);
    // Explicit check for Admin role to prevent unauthorized access
    if (user.role !== "Admin") return null;
    return user as StoredUser;
  } catch {
    return null;
  }
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState<StoredUser | null>(readStoredUser);

  // If no user or session expired, redirect immediately[cite: 15, 18]
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: HiOutlineClipboard,
      active: location.pathname === "/admin/dashboard",
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
      // FIX: Matches 'staff-directory' in App_3.tsx
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

  const contextValue: UserContextType = {
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      <Navbar
        items={navItems}
        userName={user.name}
        userRole={user.role}
        onLogout={() => logout()}
      />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        {/* FIX: Removed children check to force Outlet rendering for nested routes */}
        <Outlet context={contextValue} />
      </main>
    </div>
  );
};

export default AdminLayout;