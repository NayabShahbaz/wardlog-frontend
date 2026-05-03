import { useState, type PropsWithChildren } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
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
import { isTokenExpired, logout } from "../../utils/api";

export interface UserContextType {
  userId: string;
  userName: string;
  userRole: string;
}

interface StoredUser {
  id: string;
  name: string;
  role: string;
  email?: string;
}

interface DoctorLayoutProps extends PropsWithChildren {
  userName?: string; // Prop to support direct passing from App.tsx[cite: 30]
  userRole?: string; // Prop to support direct passing from App.tsx[cite: 30]
}

// Read once, synchronously, outside React's render cycle
const readStoredUser = (): StoredUser | null => {
  const token = localStorage.getItem("token");
  const stored = localStorage.getItem("user");
  if (!token || !stored || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }

  try {
    return JSON.parse(stored) as StoredUser;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
};

const DoctorLayout = ({ children, userName: propName, userRole: propRole }: DoctorLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lazy initializer — runs once on mount
  const [user] = useState<StoredUser | null>(readStoredUser);

  // No user? Redirect declaratively[cite: 30]
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const basePath = location.pathname.startsWith("/nurse")
    ? "/nurse"
    : "/doctor";

  // Navigation items synced with Member 2's Ward Coordination module[cite: 11, 15]
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
    { label: "Tasks", icon: HiOutlineCheckCircle, path: `${basePath}/tasks` },
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

  // Prioritize props passed from App.tsx (for Nurse Jane Doe) or fallback to stored user[cite: 30]
  const contextValue: UserContextType = {
    userId: user.id,
    userName: propName || user.name,
    userRole: propRole || user.role,
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      <Navbar
        items={defaultNavItems}
        userName={contextValue.userName}
        userRole={contextValue.userRole}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full px-4 py-4 md:px-6 md:py-6 lg:px-8 xl:max-w-7xl xl:mx-auto">
        {children ?? <Outlet context={contextValue} />}
      </main>
    </div>
  );
};

export default DoctorLayout;