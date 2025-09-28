"use client";
import { StatsGroup } from "@/components/StatsGroup";

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function DynamicProjectPage() {
    const params = useParams();
    const projectName = params.projectName as string;
    const [activeTab, setActiveTab] = useState('board');
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [selectedSubtask, setSelectedSubtask] = useState<any>(null);

    const tabs = [
        { id: 'summary', label: 'Summary', icon: 'summary-icon.svg', iconBold: 'summary-icon-bold.svg' },
        { id: 'board', label: 'Board', icon: 'board-icon.svg', iconBold: 'board-icon-bold.svg' },
        { id: 'overview', label: 'Overview', icon: 'overview-icon.svg', iconBold: 'overview-icon-bold.svg' },
        { id: 'code', label: 'Code', icon: 'code-icon.svg', iconBold: 'code-icon-bold.svg' }
    ];

    const kanbanData = {
        todo: [
            {
                id: 1,
                title: 'Setup Development Environment',
                labels: ['DEVELOPMENT'],
                description: 'Set up the complete development environment with all necessary tools and configurations.',
                subtasks: {
                    todo: [
                        {
                            id: 1,
                            title: 'Install Node.js',
                            labels: ['SETUP'],
                            description: 'Install Node.js version 18+ and npm package manager.',
                            githubUrl: 'https://github.com/example/node-setup'
                        },
                        {
                            id: 2,
                            title: 'Configure VS Code',
                            labels: ['SETUP'],
                            description: 'Install necessary VS Code extensions and configure settings.',
                            githubUrl: 'https://github.com/example/vscode-config'
                        }
                    ],
                    inProgress: [
                        {
                            id: 3,
                            title: 'Database Setup',
                            labels: ['DATABASE'],
                            description: 'Configure PostgreSQL database and create initial schema.',
                            githubUrl: 'https://github.com/example/database-setup'
                        }
                    ],
                    testing: [],
                    done: []
                }
            },
            {
                id: 2,
                title: 'Design User Interface',
                labels: ['DESIGN', 'FRONTEND'],
                description: 'Create a modern and responsive user interface design.',
                subtasks: {
                    todo: [
                        {
                            id: 4,
                            title: 'Wireframes',
                            labels: ['DESIGN'],
                            description: 'Create wireframes for all major pages and components.',
                            githubUrl: 'https://github.com/example/wireframes'
                        }
                    ],
                    inProgress: [],
                    testing: [],
                    done: []
                }
            },
            {
                id: 3,
                title: 'Implement Authentication',
                labels: ['BACKEND', 'SECURITY'],
                description: 'Implement secure user authentication and authorization system.',
                subtasks: {
                    todo: [
                        {
                            id: 5,
                            title: 'JWT Implementation',
                            labels: ['SECURITY'],
                            description: 'Implement JWT token-based authentication.',
                            githubUrl: 'https://github.com/example/jwt-auth'
                        },
                        {
                            id: 6,
                            title: 'Password Hashing',
                            labels: ['SECURITY'],
                            description: 'Implement secure password hashing with bcrypt.',
                            githubUrl: 'https://github.com/example/password-hashing'
                        }
                    ],
                    inProgress: [],
                    testing: [],
                    done: []
                }
            }
        ],
        inProgress: [
            {
                id: 4,
                title: 'Create Database Schema',
                labels: ['DATABASE'],
                description: 'Design and implement the database schema for the application.',
                subtasks: {
                    todo: [],
                    inProgress: [
                        {
                            id: 7,
                            title: 'User Tables',
                            labels: ['DATABASE'],
                            description: 'Create user and profile tables with proper relationships.',
                            githubUrl: 'https://github.com/example/user-tables'
                        }
                    ],
                    testing: [],
                    done: []
                }
            }
        ],
        testing: [
            {
                id: 5,
                title: 'Write Unit Tests',
                labels: ['TESTING'],
                description: 'Write comprehensive unit tests for all components and functions.',
                subtasks: {
                    todo: [],
                    inProgress: [],
                    testing: [
                        {
                            id: 8,
                            title: 'API Tests',
                            labels: ['TESTING'],
                            description: 'Write unit tests for all API endpoints.',
                            githubUrl: 'https://github.com/example/api-tests'
                        }
                    ],
                    done: []
                }
            }
        ],
        done: [
            {
                id: 6,
                title: 'Project Initialization',
                labels: ['SETUP'],
                description: 'Initialize the project with basic structure and configuration.',
                subtasks: {
                    todo: [],
                    inProgress: [],
                    testing: [],
                    done: [
                        {
                            id: 9,
                            title: 'Repository Setup',
                            labels: ['SETUP'],
                            description: 'Create GitHub repository and initial commit.',
                            githubUrl: 'https://github.com/example/repo-setup'
                        },
                        {
                            id: 10,
                            title: 'Package.json',
                            labels: ['SETUP'],
                            description: 'Initialize package.json with dependencies.',
                            githubUrl: 'https://github.com/example/package-json'
                        }
                    ]
                }
            }
        ]
    };

    const getLabelColor = (label: string) => {
        const colors: { [key: string]: string } = {
            'DEVELOPMENT': '#AAD9DF',
            'DESIGN': '#AAD9DF',
            'FRONTEND': '#AAD9DF',
            'BACKEND': '#AAD9DF',
            'SECURITY': '#AAD9DF',
            'DATABASE': '#AAD9DF',
            'TESTING': '#AAD9DF',
            'SETUP': '#AAD9DF'
        };
        return colors[label] || '#AAD9DF';
    };

    const renderTaskModal = () => {
        if (!selectedTask) return null;

        return (
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
                zIndex: 1000,
                padding: '2rem'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '1200px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    position: 'relative'
                }}>
                    {/* Modal Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '2rem 2rem 1rem 2rem',
                        borderBottom: '1px solid #e9ecef'
                    }}>
                        <h2 style={{
                            color: '#495B69',
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: '600'
                        }}>
                            {selectedTask.title}
                        </h2>
                        <button
                            onClick={() => setSelectedTask(null)}
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: '#6c757d',
                                padding: '0.5rem'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div style={{ padding: '2rem' }}>
                        {/* Description */}
                        <div style={{ marginBottom: '2rem' }}>
                            <p style={{
                                color: '#495B69',
                                lineHeight: '1.6',
                                margin: 0
                            }}>
                                {selectedTask.description}
                            </p>
                        </div>

                        {/* Subtasks Section */}
                        <div>
                            <h3 style={{
                                color: '#495B69',
                                margin: '0 0 1.5rem 0',
                                fontSize: '1.25rem',
                                fontWeight: '600'
                            }}>
                                Subtasks
                            </h3>

                            {/* Subtask Kanban Board */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '1.5rem'
                            }}>
                                {/* TO DO Column */}
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    minHeight: '300px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '1rem'
                                    }}>
                                        <h4 style={{
                                            color: '#495B69',
                                            margin: 0,
                                            fontSize: '0.875rem',
                                            fontWeight: '600'
                                        }}>
                                            TO DO
                                        </h4>
                                        <span style={{
                                            backgroundColor: '#e9ecef',
                                            color: '#495B69',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {selectedTask.subtasks.todo.length}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {selectedTask.subtasks.todo.map((subtask: any) => (
                                            <div key={subtask.id} style={{
                                                backgroundColor: '#AAD9DF',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                                onClick={() => setSelectedSubtask(subtask)}
                                            >
                                                <h5 style={{
                                                    color: '#495B69',
                                                    margin: '0 0 0.5rem 0',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {subtask.title}
                                                </h5>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {subtask.labels.map((label: string, index: number) => (
                                                        <span key={index} style={{
                                                            backgroundColor: '#495B69',
                                                            color: 'white',
                                                            padding: '0.125rem 0.5rem',
                                                            borderRadius: '12px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500'
                                                        }}>
                                                            {label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* IN PROGRESS Column */}
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    minHeight: '300px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '1rem'
                                    }}>
                                        <h4 style={{
                                            color: '#495B69',
                                            margin: 0,
                                            fontSize: '0.875rem',
                                            fontWeight: '600'
                                        }}>
                                            IN PROGRESS
                                        </h4>
                                        <span style={{
                                            backgroundColor: '#e9ecef',
                                            color: '#495B69',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {selectedTask.subtasks.inProgress.length}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {selectedTask.subtasks.inProgress.map((subtask: any) => (
                                            <div key={subtask.id} style={{
                                                backgroundColor: '#AAD9DF',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                                onClick={() => setSelectedSubtask(subtask)}
                                            >
                                                <h5 style={{
                                                    color: '#495B69',
                                                    margin: '0 0 0.5rem 0',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {subtask.title}
                                                </h5>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {subtask.labels.map((label: string, index: number) => (
                                                        <span key={index} style={{
                                                            backgroundColor: '#495B69',
                                                            color: 'white',
                                                            padding: '0.125rem 0.5rem',
                                                            borderRadius: '12px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500'
                                                        }}>
                                                            {label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* TESTING Column */}
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    minHeight: '300px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '1rem'
                                    }}>
                                        <h4 style={{
                                            color: '#495B69',
                                            margin: 0,
                                            fontSize: '0.875rem',
                                            fontWeight: '600'
                                        }}>
                                            TESTING
                                        </h4>
                                        <span style={{
                                            backgroundColor: '#e9ecef',
                                            color: '#495B69',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {selectedTask.subtasks.testing.length}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {selectedTask.subtasks.testing.map((subtask: any) => (
                                            <div key={subtask.id} style={{
                                                backgroundColor: '#AAD9DF',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                                onClick={() => setSelectedSubtask(subtask)}
                                            >
                                                <h5 style={{
                                                    color: '#495B69',
                                                    margin: '0 0 0.5rem 0',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {subtask.title}
                                                </h5>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {subtask.labels.map((label: string, index: number) => (
                                                        <span key={index} style={{
                                                            backgroundColor: '#495B69',
                                                            color: 'white',
                                                            padding: '0.125rem 0.5rem',
                                                            borderRadius: '12px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500'
                                                        }}>
                                                            {label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* DONE Column */}
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    minHeight: '300px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '1rem'
                                    }}>
                                        <h4 style={{
                                            color: '#495B69',
                                            margin: 0,
                                            fontSize: '0.875rem',
                                            fontWeight: '600'
                                        }}>
                                            DONE ✓
                                        </h4>
                                        <span style={{
                                            backgroundColor: '#e9ecef',
                                            color: '#495B69',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {selectedTask.subtasks.done.length}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {selectedTask.subtasks.done.map((subtask: any) => (
                                            <div key={subtask.id} style={{
                                                backgroundColor: '#AAD9DF',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                                onClick={() => setSelectedSubtask(subtask)}
                                            >
                                                <h5 style={{
                                                    color: '#495B69',
                                                    margin: '0 0 0.5rem 0',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {subtask.title}
                                                </h5>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {subtask.labels.map((label: string, index: number) => (
                                                        <span key={index} style={{
                                                            backgroundColor: '#495B69',
                                                            color: 'white',
                                                            padding: '0.125rem 0.5rem',
                                                            borderRadius: '12px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500'
                                                        }}>
                                                            {label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSubtaskSidePanel = () => {
        if (!selectedSubtask) return null;

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '400px',
                height: '100vh',
                backgroundColor: 'white',
                borderLeft: '1px solid #e9ecef',
                boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.1)',
                zIndex: 1001,
                overflow: 'auto'
            }}>
                {/* Side Panel Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: '1px solid #e9ecef'
                }}>
                    <h3 style={{
                        color: '#495B69',
                        margin: 0,
                        fontSize: '1.25rem',
                        fontWeight: '600'
                    }}>
                        {selectedSubtask.title}
                    </h3>
                    <button
                        onClick={() => setSelectedSubtask(null)}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#6c757d',
                            padding: '0.25rem'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Side Panel Content */}
                <div style={{ padding: '1.5rem' }}>
                    {/* Description */}
                    <div style={{ marginBottom: '2rem' }}>
                        <p style={{
                            color: '#495B69',
                            lineHeight: '1.6',
                            margin: 0,
                            fontSize: '0.875rem'
                        }}>
                            {selectedSubtask.description}
                        </p>
                    </div>

                    {/* Code Section */}
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem'
                        }}>
                            <h4 style={{
                                color: '#495B69',
                                margin: 0,
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}>
                                Code
                            </h4>
                            <button
                                onClick={() => window.open(selectedSubtask.githubUrl, '_blank')}
                                style={{
                                    backgroundColor: '#495B69',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Go to Github
                            </button>
                        </div>

                        {/* Code Placeholder */}
                        <div style={{
                            backgroundColor: '#1e1e1e',
                            color: '#d4d4d4',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                            minHeight: '300px',
                            overflow: 'auto'
                        }}>
                            <div style={{ color: '#569cd6' }}>// Backend API call placeholder</div>
                            <div style={{ color: '#9cdcfe' }}>const</div>
                            <span style={{ color: '#4fc1ff' }}> response</span>
                            <span style={{ color: '#d4d4d4' }}> = </span>
                            <span style={{ color: '#4fc1ff' }}>await</span>
                            <span style={{ color: '#d4d4d4' }}> fetch(</span>
                            <span style={{ color: '#ce9178' }}>'/api/subtasks/{selectedSubtask.id}'</span>
                            <span style={{ color: '#d4d4d4' }}>);</span>
                            <br /><br />
                            <div style={{ color: '#9cdcfe' }}>const</div>
                            <span style={{ color: '#4fc1ff' }}> data</span>
                            <span style={{ color: '#d4d4d4' }}> = </span>
                            <span style={{ color: '#4fc1ff' }}>await</span>
                            <span style={{ color: '#d4d4d4' }}> response.json();</span>
                            <br /><br />
                            <div style={{ color: '#569cd6' }}>// This will be populated with actual backend data</div>
                            <div style={{ color: '#569cd6' }}>// when the API endpoints are implemented</div>
                            <br />
                            <div style={{ color: '#9cdcfe' }}>console</div>
                            <span style={{ color: '#d4d4d4' }}>.</span>
                            <span style={{ color: '#dcdcaa' }}>log</span>
                            <span style={{ color: '#d4d4d4' }}>(</span>
                            <span style={{ color: '#4fc1ff' }}>data</span>
                            <span style={{ color: '#d4d4d4' }}>);</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderBoard = () => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            padding: '1.5rem 0'
        }}>
            {/* TO DO Column */}
            <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '1rem',
                minHeight: '400px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                }}>
                    <h3 style={{ color: '#495B69', margin: '0', fontSize: '1rem', fontWeight: '600' }}>
                        TO DO
                    </h3>
                    <span style={{
                        backgroundColor: '#e9ecef',
                        color: '#495B69',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                    }}>
                        {kanbanData.todo.length}
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {kanbanData.todo.map((task) => (
                        <div key={task.id} style={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                            onClick={() => setSelectedTask(task)}
                        >
                            <h4 style={{
                                color: '#495B69',
                                margin: '0 0 0.75rem 0',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }}>
                                {task.title}
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {task.labels.map((label, index) => (
                                    <span key={index} style={{
                                        backgroundColor: getLabelColor(label),
                                        color: '#495B69',
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }}>
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* IN PROGRESS Column */}
            <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '1rem',
                minHeight: '400px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                }}>
                    <h3 style={{ color: '#495B69', margin: '0', fontSize: '1rem', fontWeight: '600' }}>
                        IN PROGRESS
                    </h3>
                    <span style={{
                        backgroundColor: '#e9ecef',
                        color: '#495B69',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                    }}>
                        {kanbanData.inProgress.length}
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {kanbanData.inProgress.map((task) => (
                        <div key={task.id} style={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                            onClick={() => setSelectedTask(task)}
                        >
                            <h4 style={{
                                color: '#495B69',
                                margin: '0 0 0.75rem 0',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }}>
                                {task.title}
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {task.labels.map((label, index) => (
                                    <span key={index} style={{
                                        backgroundColor: getLabelColor(label),
                                        color: '#495B69',
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }}>
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* TESTING Column */}
            <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '1rem',
                minHeight: '400px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                }}>
                    <h3 style={{ color: '#495B69', margin: '0', fontSize: '1rem', fontWeight: '600' }}>
                        TESTING
                    </h3>
                    <span style={{
                        backgroundColor: '#e9ecef',
                        color: '#495B69',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                    }}>
                        {kanbanData.testing.length}
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {kanbanData.testing.map((task) => (
                        <div key={task.id} style={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                            onClick={() => setSelectedTask(task)}
                        >
                            <h4 style={{
                                color: '#495B69',
                                margin: '0 0 0.75rem 0',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }}>
                                {task.title}
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {task.labels.map((label, index) => (
                                    <span key={index} style={{
                                        backgroundColor: getLabelColor(label),
                                        color: '#495B69',
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }}>
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* DONE Column */}
            <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '1rem',
                minHeight: '400px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                }}>
                    <h3 style={{ color: '#495B69', margin: '0', fontSize: '1rem', fontWeight: '600' }}>
                        DONE ✓
                    </h3>
                    <span style={{
                        backgroundColor: '#e9ecef',
                        color: '#495B69',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                    }}>
                        {kanbanData.done.length}
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {kanbanData.done.map((task) => (
                        <div key={task.id} style={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                            onClick={() => setSelectedTask(task)}
                        >
                            <h4 style={{
                                color: '#495B69',
                                margin: '0 0 0.75rem 0',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }}>
                                {task.title}
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {task.labels.map((label, index) => (
                                    <span key={index} style={{
                                        backgroundColor: getLabelColor(label),
                                        color: '#495B69',
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }}>
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{
            padding: '2rem',
            width: '100%',
            backgroundColor: 'white',
            minHeight: '100vh'
        }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1rem' }}>
        <span 
          style={{ 
            color: '#6c757d', 
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'color 0.2s ease'
          }}
          onClick={() => window.location.href = '/projects'}
          onMouseEnter={(e) => e.currentTarget.style.color = '#495B69'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6c757d'}
        >
          Projects
        </span>
      </div>

            {/* Project Title */}
            <h1 style={{
                color: '#495B69',
                margin: '0 0 2rem 0',
                fontSize: '2rem',
                fontWeight: '700'
            }}>
                {projectName}
            </h1>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e9ecef',
                paddingBottom: '0.5rem'
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: activeTab === tab.id ? '#495B69' : '#6c757d',
                            fontSize: '1rem',
                            fontWeight: activeTab === tab.id ? '600' : '400',
                            cursor: 'pointer',
                            padding: '0.5rem 0',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Image
                            src={`/${activeTab === tab.id ? tab.iconBold : tab.icon}`}
                            alt={tab.label}
                            width={18}
                            height={18}
                        />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'board' && renderBoard()}
            {activeTab === 'summary' && (
                <div style={{ padding: '2rem 0', color: '#495B69' }}>
                    <p>Summary content will go here</p>
                    <StatsGroup 
      tasksDone={12} 
      tasksAssigned={20} 
      numberCommits={35} 
    />
                </div>
            )}
            {activeTab === 'overview' && (
                <div style={{ padding: '2rem 0', color: '#495B69' }}>
                    <p>Overview content will go here</p>
                </div>
            )}
            {activeTab === 'code' && (
                <div style={{ padding: '2rem 0', color: '#495B69' }}>
                    <p>Code content will go here</p>
                </div>
            )}

            {/* Task Modal */}
            {renderTaskModal()}

            {/* Subtask Side Panel */}
            {renderSubtaskSidePanel()}
        </div>
    );
}
