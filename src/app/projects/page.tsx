"use client";

import Link from "next/link";

export default function Projects() {
    const projects = [
        {
            name: 'Shellhacks',
            visibility: 'Public',
            lastUpdated: '9/27/2025 10:33 AM'
        },
        {
            name: 'desi-discipline',
            visibility: 'Public',
            lastUpdated: '4/13/2025 11:49 AM'
        },
        {
            name: 'DeepVisor',
            visibility: 'Public',
            lastUpdated: '3/5/2025 9:24 PM'
        },
        {
            name: 'portfolio-website',
            visibility: 'Private',
            lastUpdated: '1/20/2025 5:30 PM'
        },
        {
            name: 'good-project',
            visibility: 'Public',
            lastUpdated: '12/9/2024 6:40 PM'
        },
        {
            name: 'top-secret',
            visibility: 'Private',
            lastUpdated: '11/3/2024 12:19 AM'
        },
        {
            name: 'fun-project',
            visibility: 'Public',
            lastUpdated: '3/5/2025 9:24 PM'
        }
    ];

    return (
        <div style={{
            padding: '2rem',
            width: '100%',
            backgroundColor: 'white',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h1 style={{
                    color: '#495B69',
                    margin: '0',
                    fontSize: '2rem',
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
                        fontSize: '1rem'
                    }}>
                        Create a Project
                    </button>
                </Link>
            </div>

            {/* Projects List */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {projects.map((project, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 0',
                        borderBottom: '1px solid #e9ecef',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => window.location.href = `/projects/${project.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                    >
                        {/* Left side - Icon and project name */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            flex: 1
                        }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5C2.5 3.67157 3.17157 3 4 3H7.5L9 4.5H12C12.8284 4.5 13.5 5.17157 13.5 6V12.5C13.5 13.3284 12.8284 14 12 14H4C3.17157 14 2.5 13.3284 2.5 12.5V4.5Z" stroke="#495B69" strokeWidth="1.5" fill="none" />
                                </svg>
                            </div>
                            <span style={{
                                color: '#495B69',
                                fontSize: '1rem',
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
                                backgroundColor: '#AAD9DF',
                                color: '#495B69',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }}>
                                {project.visibility}
                            </span>

                            {/* Last Updated */}
                            <span style={{
                                color: '#6c757d',
                                fontSize: '0.875rem'
                            }}>
                                Last updated on {project.lastUpdated}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
