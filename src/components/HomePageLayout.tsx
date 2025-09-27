"use client";

import Navbar from "@/components/Navbar";
import { NavbarMinimalColored } from "@/components/NavbarMinimalColored";
import ProjectIdeaForm from "@/components/ProjectIdeaForm";

export default function HomePageLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top navbar */}
      <Navbar />

      {/* Main content area: sidebar + form */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Side navbar */}
        <NavbarMinimalColored />
       
        {/* Form content */}
        <div style={{ flex: 1, padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
          <ProjectIdeaForm />
        </div>
      </div>
    </div>
  );
}
