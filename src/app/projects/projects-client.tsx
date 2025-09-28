"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { DatabaseRepository } from "@/lib/user.actions";

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
        <Link href="/">
          <button style={{
            backgroundColor: '#495B69',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '1rem',
            transition: 'all 0.2s ease'
          }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a4a5c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#495B69'}>
            Create a Project
          </button>
        </Link>
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
            // Map project names to URL-friendly IDs
            const getProjectId = (name: string) => {
              return name.toLowerCase().replace(/[^a-z0-9]/g, '');
            };

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
                onClick={() => router.push(`/projects/${getProjectId(project.name)}`)}
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
    </div>
  );
}
