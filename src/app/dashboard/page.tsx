'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import ProjectIdeaForm from '@/components/ProjectIdeaForm';
import { ConnectGitHubButton } from '@/components/connect-github-button';

interface Project {
    id: number;
    name: string;
    visibility: 'Public' | 'Private';
    lastUpdated: string;
}

export default function Dashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showGitHubConnect, setShowGitHubConnect] = useState(true); // show button initially

    // Fetch projects only after GitHub is connected
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/projects');
            const data = await response.json();

            if (data.success) {
                setProjects(data.projects);
                setError(null);
            } else {
                setError(data.error || 'Failed to fetch projects');
            }
        } catch (err) {
            setError('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    const handleGitHubConnected = () => {
        setShowGitHubConnect(false); // hide button
        fetchProjects(); // now fetch projects
    };

    
    if (showGitHubConnect) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60vh',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <h1 style={{ color: '#495B69', marginBottom: '1rem', fontSize: '2rem', fontWeight: 600 }}>
                    Welcome to CodeAtlas
                </h1>
                <ConnectGitHubButton />
                <p style={{ color: '#6c757d', marginBottom: '2rem', fontSize: '1.1rem', maxWidth: '500px', lineHeight: 1.6 }}>
                    Connect your GitHub account to start managing your projects and contributions.
                </p>
                   
               
        </div>
        );
    }

    // Show loading state if projects are being fetched
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50vh'
            }}>
                <p style={{ color: '#6c757d' }}>Loading projects...</p>
            </div>
        );
    }

    // Show dashboard once projects are loaded
    return (
        <>
            <h1 style={{ color: '#495B69', marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 600 }}>
                Dashboard
            </h1>

            {/* Main Cards */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                width: '100%',
                maxWidth: '100%',
                height: 'calc(100vh - 120px)'
            }}>
                {/* Your Projects Card */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '0.75rem',
                    borderRadius: '16px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem'
                    }}>
                        <h2 style={{
                            color: '#495B69',
                            margin: 10,
                            fontSize: '1.5rem',
                            fontWeight: '600'
                        }}>
                            Your Projects
                        </h2>
                        {projects.length > 0 && (
                            <button
                                onClick={() => setShowProjectForm(true)}
                                style={{
                                    backgroundColor: '#495B69',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}>
                                Create a Project
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1
                        }}>
                            <p style={{ color: '#6c757d' }}>Loading projects...</p>
                        </div>
                    ) : error ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1
                        }}>
                            <p style={{ color: '#dc3545' }}>Error: {error}</p>
                        </div>
                    ) : projects.length > 0 ? (
                        // Projects List View
                        <>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                overflowY: 'auto',
                                paddingRight: '0.5rem',
                                minHeight: 0
                            }}>
                                {projects
                                    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                                    .slice(0, 4)
                                    .map((project, index) => (
                                        <div key={project.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.8rem 0.5rem',
                                            backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F5F5F5',
                                            gap: '0.5rem',
                                            minHeight: '40px',
                                            borderRadius: '4px',
                                            marginBottom: '2px'
                                        }}>
                                            {/* Folder Icon */}
                                            <div style={{
                                                width: '32px',
                                                height: '28px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <Image
                                                    src="/folder-icon.svg"
                                                    alt="Folder"
                                                    width={32}
                                                    height={28}
                                                />
                                            </div>

                                            {/* Project Name */}
                                            <div style={{
                                                color: '#495B69',
                                                fontSize: '1.1rem',
                                                fontWeight: '500',
                                                minWidth: 0,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {project.name}
                                            </div>

                                            {/* Visibility Tag */}
                                            <div style={{
                                                backgroundColor: '#AAD9DF',
                                                color: '#FFFFFF',
                                                padding: '0.2rem 0.8rem',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                flexShrink: 0,
                                                marginLeft: '1.25rem'
                                            }}>
                                                {project.visibility}
                                            </div>

                                            {/* Spacer */}
                                            <div style={{ flex: 1 }}></div>

                                            {/* Last Updated */}
                                            <div style={{
                                                color: '#6c757d',
                                                fontSize: '0.9rem',
                                                minWidth: '140px',
                                                textAlign: 'right',
                                                flexShrink: 0
                                            }}>
                                                Last updated on {project.lastUpdated}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </>
                    ) : (
                        // Empty State View
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            flex: 1,
                            justifyContent: 'center'
                        }}>
                            <Image
                                src="/project-large-icon.svg"
                                alt="Projects"
                                width={60}
                                height={60}
                            />
                            <p style={{
                                color: '#495B69',
                                margin: '0',
                                fontSize: '0.9rem',
                                textAlign: 'center'
                            }}>
                                Create your first project
                            </p>
                            <button
                                onClick={() => setShowProjectForm(true)}
                                style={{
                                    backgroundColor: '#495B69',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}>
                                Create a Project
                            </button>
                        </div>
                    )}
                </div>

                {/* Your Contributions Card */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                }}>
                    <h2 style={{
                        color: '#495B69',
                        marginBottom: '1rem',
                        fontSize: '1.25rem',
                        fontWeight: '600'
                    }}>
                        Your Contributions
                    </h2>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        flex: 1,
                        justifyContent: 'center'
                    }}>
                        <Image
                            src="/contribution-large-icon.svg"
                            alt="Contributions"
                            width={60}
                            height={60}
                        />
                        <p style={{
                            color: '#495B69',
                            margin: '0',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            Find your first contribution
                        </p>
                        <button style={{
                            backgroundColor: '#495B69',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}>
                            Find a Contribution
                        </button>
                    </div>
                </div>
            </div>

            {/* Project Form Modal */}
            {showProjectForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#AAD9DF',
                        borderRadius: '16px',
                        padding: '0',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        position: 'relative'
                    }}>
                        {/* Header */}
                        <div style={{
                            backgroundColor: '#AAD9DF',
                            padding: '1.5rem 2rem 1rem 2rem',
                            borderTopLeftRadius: '16px',
                            borderTopRightRadius: '16px',
                            position: 'relative'
                        }}>
                            <h2 style={{
                                color: '#495B69',
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                margin: 0,
                                textAlign: 'center'
                            }}>
                                Enter your Project Idea
                            </h2>
                            <button
                                onClick={() => setShowProjectForm(false)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#495B69'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            padding: '2rem',
                            borderBottomLeftRadius: '16px',
                            borderBottomRightRadius: '16px'
                        }}>
                            <ProjectIdeaForm />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}