"use client";

import Navbar from "@/components/Navbar";
import { NavbarMinimalColored } from "@/components/NavbarMinimalColored";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top navbar with logo */}
      <Navbar />
      
      {/* Main content area: sidebar + content */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Side navbar */}
        <NavbarMinimalColored />
        
        {/* Dashboard content */}
        <div style={{ flex: 1, padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
