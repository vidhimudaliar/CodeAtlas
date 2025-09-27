"use client";

import { NavbarMinimalColored } from "@/components/NavbarMinimalColored";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      {/* Side navbar - now fixed */}
      <NavbarMinimalColored />

      {/* Main content area with left margin for fixed sidebar */}
      <div style={{
        flex: 1,
        padding: "1.5rem",
        width: "calc(100% - 80px)",
        backgroundColor: "#F5F5F5",
        marginLeft: "80px", // Account for fixed sidebar width
        overflow: "auto",
        boxSizing: "border-box"
      }}>
        {children}
      </div>
    </div>
  );
}
