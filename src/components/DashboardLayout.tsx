"use client";

import { NavbarMinimalColored } from "@/components/NavbarMinimalColored";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Side navbar - now fixed */}
      <NavbarMinimalColored />

      {/* Main content area with left margin for fixed sidebar */}
      <div style={{ 
        flex: 1, 
        padding: "2rem", 
        maxWidth: "800px", 
        margin: "0 auto",
        marginLeft: "80px" // Account for fixed sidebar width
      }}>
        {children}
      </div>
    </div>
  );
}
