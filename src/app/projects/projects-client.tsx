"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { DatabaseRepository } from "@/lib/user.actions";
import ProjectIdeaForm from "@/components/ProjectIdeaForm";
import { connectGitHub } from "@/components/connect-github-button";

interface ProjectsUser {
  id: string;
  name: string | null;
  email: string;
  isConnectedToGithub: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProjectsRepository = DatabaseRepository;

interface ProjectListItem {
  id: string;
  name: string;
  visibility: "Public" | "Private";
  lastUpdated: string;
  sortTimestamp: number;
}

export interface ProjectsClientProps {
  user: ProjectsUser;
  user_repository: ProjectsRepository[];
}

function formatRepositoryDate(dateInput: string | null): string {
  if (!dateInput) {
    return "Not synced";
  }
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "Not synced";
  }
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function ProjectsClient({ user, user_repository }: ProjectsClientProps) {
  const router = useRouter();
  const [showProjectForm, setShowProjectForm] = useState(false);

  const projects: ProjectListItem[] = useMemo(() => {
    return user_repository.map((repo) => {
      const lastUpdated = formatRepositoryDate(repo.last_synced_at);
      const sortTimestamp = repo.last_synced_at
        ? new Date(repo.last_synced_at).getTime()
        : new Date(repo.created_at).getTime();

      return {
        id: repo.id,
        name: repo.title || repo.repo,
        visibility: (repo.private ? "Private" : "Public") as "Public" | "Private",
        lastUpdated,
        sortTimestamp,
      };
    }).sort((a, b) => b.sortTimestamp - a.sortTimestamp);
  }, [user_repository]);

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

  const connectButtonLabel = user.isConnectedToGithub ? "GitHub Connected" : "Connect GitHub";

  return (
    <div style={{
      padding: '2rem',
      width: '100%',
      backgroundColor: '#F5F5F5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{
          color: '#495B69',
          margin: '0',
          fontSize: '2.25rem',
          fontWeight: '600'
        }}>
          Your Projects
        </h1>
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
          <button
            onClick={handleCreateProjectClick}
            disabled={!user.isConnectedToGithub}
            style={{
              backgroundColor: user.isConnectedToGithub ? "#495B69" : "#E0E0E0",
              color: "#FFFFFF",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: user.isConnectedToGithub ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              opacity: user.isConnectedToGithub ? 1 : 0.7,
            }}
            onMouseEnter={(e) => {
              if (!user.isConnectedToGithub) return;
              e.currentTarget.style.backgroundColor = "#3a4a5c";
            }}
            onMouseLeave={(e) => {
              if (!user.isConnectedToGithub) return;
              e.currentTarget.style.backgroundColor = "#495B69";
            }}
          >
            Create a Project
          </button>
        </div>
      </div>

      {/* Projects List Container */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxHeight: '70vh',
        overflowY: 'auto'
      }}>
        {projects.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            color: '#6c757d'
          }}>
            No projects found
          </div>
        ) : (
          projects.map((project, index) => {
            return (
              <div key={`${project.id}-${index}`} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8F9FA',
                borderBottom: index < projects.length - 1 ? '1px solid #e9ecef' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0F8FF';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#F8F9FA';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                onClick={() => router.push(`/projects/${project.name}`)}
              >
                {/* Left side - Icon and project name */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flex: 1
                }}>
                  <div style={{
                    width: '32px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F5F5F5',
                    borderRadius: '6px',
                    padding: '4px'
                  }}>
                    <Image
                      src="/folder-icon.svg"
                      alt="Folder"
                      width={32}
                      height={28}
                    />
                  </div>
                  <span style={{
                    color: '#495B69',
                    fontSize: '1.25rem',
                    fontWeight: '500'
                  }}>
                    {project.name}
                  </span>
                </div>

                {/* Right side - Visibility and last updated */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem'
                }}>
                  {/* Visibility Badge */}
                  <span style={{
                    backgroundColor: project.visibility === 'Public' ? '#AAD9DF' : '#6c757d',
                    color: '#FFFFFF',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '16px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {project.visibility}
                  </span>

                  {/* Last Updated */}
                  <span style={{
                    color: '#6c757d',
                    fontSize: '1rem',
                    fontWeight: '400',
                    minWidth: '180px',
                    textAlign: 'right'
                  }}>
                    Last updated on {project.lastUpdated}
                  </span>
                </div>
              </div>
            );
          })
        )}
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
