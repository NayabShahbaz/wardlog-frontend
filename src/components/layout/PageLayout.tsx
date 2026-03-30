import React from "react";
import Navbar, { type NavItem } from "./Navbar";

interface PageLayoutProps {
  navItems: NavItem[];
  userName: string;
  userRole: string;
  onLogout?: () => void;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  navItems,
  userName,
  userRole,
  onLogout,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar
        items={navItems}
        userName={userName}
        userRole={userRole}
        onLogout={onLogout}
      />
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
};

export default PageLayout;
