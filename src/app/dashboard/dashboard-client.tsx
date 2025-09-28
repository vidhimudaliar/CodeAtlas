"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectIdeaForm from "@/components/ProjectIdeaForm";
import { connectGitHub } from "@/components/connect-github-button";

interface DashboardUser {
  id: string;
  name: string | null;
  email: string;
  isConnectedToGithub: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardRepository {
  id: string;
  owner: string;
  repo: string;
  title: string;
  created_at: string;
  owner_user_id: string;
  installation_id: number | null;
  default_branch: string | null;
  private: boolean | null;
  last_synced_at: string | null;
}

interface ProjectListItem {
  id: string;
  name: string;
  visibility: "Public" | "Private";
  lastUpdated: string;
  sortTimestamp: number;
}

export interface DashboardClientProps {
  user: DashboardUser;
  user_repository: DashboardRepository[];
}

function formatRepositoryDate(dateInput: string | null): string {
  if (!dateInput) {
    return "Not synced";
  }
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "Not synced";
  }
  return date.toLocaleString();
}

export function DashboardClient({ user, user_repository }: DashboardClientProps) {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const router = useRouter();

  const projects = useMemo<ProjectListItem[]>(() => {
    return user_repository.map((repo) => {
      const sourceDate = repo.last_synced_at ?? repo.created_at;
      const parsed = sourceDate ? new Date(sourceDate).getTime() : 0;
      return {
        id: repo.id,
        name: repo.title || repo.repo,
        visibility: repo.private ? "Private" : "Public",
        lastUpdated: formatRepositoryDate(sourceDate),
        sortTimestamp: Number.isNaN(parsed) ? 0 : parsed,
      };
    });
  }, [user_repository]);

  const loading = false;
  const error: string | null = null;

  const handleConnectGithub = () => {
    if (!user.isConnectedToGithub) {
      connectGitHub();
    }
  };

  const handleCreateProjectClick = () => {
    if (!user.isConnectedToGithub) {
      handleConnectGithub();
      return;
    }
    setShowProjectForm(true);
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const connectButtonLabel = user.isConnectedToGithub ? "GitHub Connected" : "Connect GitHub";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          color: "#495B69",
          marginBottom: "1rem",
          fontSize: "2.25rem",
          fontWeight: "600",
          flexShrink: 0,
        }}
      >
        Dashboard
      </h1>

      {/* Main Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Your Projects Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "1.25rem",
            borderRadius: "16px",
            border: "1px solid #e9ecef",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <h2
              style={{
                color: "#495B69",
                margin: "0 0 0.75rem 0",
                fontSize: "1.75rem",
                fontWeight: "600",
              }}
            >
              Your Projects
            </h2>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button
                type="button"
                onClick={handleConnectGithub}
                disabled={user.isConnectedToGithub}
                style={{
                  backgroundColor: user.isConnectedToGithub ? "#F5F5F5" : "#FFFFFF",
                  color: user.isConnectedToGithub ? "#6c757d" : "#495B69",
                  border: "1px solid #495B69",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: user.isConnectedToGithub ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: user.isConnectedToGithub ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (user.isConnectedToGithub) return;
                  e.currentTarget.style.backgroundColor = "#495B69";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  if (user.isConnectedToGithub) return;
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.color = "#495B69";
                }}
              >
                {connectButtonLabel}
              </button>
              {projects.length > 0 && (
                <button
                  onClick={handleCreateProjectClick}
                  disabled={!user.isConnectedToGithub}
                  style={{
                    backgroundColor: user.isConnectedToGithub ? "#495B69" : "#E0E0E0",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: user.isConnectedToGithub ? "pointer" : "not-allowed",
                    transition: "all 0.2s ease",
                    opacity: user.isConnectedToGithub ? 1 : 0.7,
                  }}
                >
                  Create a Project
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <p style={{ color: "#6c757d" }}>Loading projects...</p>
            </div>
          ) : error ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <p style={{ color: "#dc3545" }}>Error: {error}</p>
            </div>
          ) : projects.length > 0 ? (
            // Projects List View
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  overflowY: "auto",
                  paddingRight: "0.5rem",
                  minHeight: 0,
                }}
              >
                {projects
                  .sort((a, b) => b.sortTimestamp - a.sortTimestamp)
                  .slice(0, 5)
                  .map((project, index) => (
                    <div
                      key={project.id || index}
                      onClick={() => handleProjectClick(project.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "1rem 0.75rem",
                        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F5F5F5",
                        gap: "0.75rem",
                        minHeight: "50px",
                        borderRadius: "4px",
                        marginBottom: "2px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#F0F8FF";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#FFFFFF" : "#F5F5F5";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      {/* Folder Icon */}
                      <div
                        style={{
                          width: "36px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Image src="/folder-icon.svg" alt="Folder" width={36} height={32} />
                      </div>

                      {/* Project Name */}
                      <div
                        style={{
                          color: "#495B69",
                          fontSize: "1.3rem",
                          fontWeight: "500",
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {project.name}
                      </div>

                      {/* Visibility Tag */}
                      <div
                        style={{
                          backgroundColor: "#AAD9DF",
                          color: "#FFFFFF",
                          padding: "0.3rem 0.9rem",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          fontWeight: "500",
                          flexShrink: 0,
                          marginLeft: "1.25rem",
                        }}
                      >
                        {project.visibility}
                      </div>

                      {/* Spacer */}
                      <div style={{ flex: 1 }}></div>

                      {/* Last Updated */}
                      <div
                        style={{
                          color: "#6c757d",
                          fontSize: "1rem",
                          minWidth: "160px",
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        Last updated on {project.lastUpdated}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            // Empty State View
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Image src="/project-large-icon.svg" alt="Projects" width={60} height={60} />
              <p
                style={{
                  color: "#495B69",
                  margin: "0",
                  fontSize: "0.9rem",
                  textAlign: "center",
                }}
              >
                Create your first project
              </p>
              <button
                onClick={handleCreateProjectClick}
                style={{
                  backgroundColor: "#495B69",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Create a Project
              </button>
            </div>
          )}
        </div>

        {/* Your Contributions Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "1.25rem",
            borderRadius: "16px",
            border: "1px solid #e9ecef",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            height: "100%",
          }}
        >
          <h2
            style={{
              color: "#495B69",
              margin: "0 0 0.75rem 0",
              fontSize: "1.75rem",
              fontWeight: "600",
            }}
          >
            Your Contributions
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <Image src="/contribution-large-icon.svg" alt="Contributions" width={100} height={100} />
            <p
              style={{
                color: "#495B69",
                margin: "0",
                fontSize: "1.1rem",
                textAlign: "center",
              }}
            >
              Find your first contribution
            </p>
            <button
              style={{
                backgroundColor: "#495B69",
                color: "#FFFFFF",
                border: "none",
                padding: "0.8rem 1.5rem",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Find a Contribution
            </button>
          </div>
        </div>
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#AAD9DF",
              borderRadius: "16px",
              padding: "1.5rem",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              position: "relative",
            }}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: "transparent",
                padding: "0 0 1rem 0",
                position: "relative",
              }}
            >
              <h2
                style={{
                  color: "#495B69",
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                Enter your Project Idea
              </h2>
              <button
                onClick={() => setShowProjectForm(false)}
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#495B69",
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div
              style={{
                backgroundColor: "transparent",
                padding: "0",
              }}
            >
              <ProjectIdeaForm user={user} repositories={user_repository} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
