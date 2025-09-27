"use client";

import { NavbarMinimalColored } from "@/components/NavbarMinimalColored";
import ProjectIdeaForm from "@/components/ProjectIdeaForm";

export default function HomePageLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Side navbar - now fixed */}
      <NavbarMinimalColored />
       
      {/* Form content with left margin for fixed sidebar */}
      <div style={{ 
        flex: 1, 
        padding: "2rem", 
        maxWidth: "800px", 
        margin: "0 auto",
        marginLeft: "80px" // Account for fixed sidebar width
      }}>
        <ProjectIdeaForm />
      </div>
    </div>
  );
}
