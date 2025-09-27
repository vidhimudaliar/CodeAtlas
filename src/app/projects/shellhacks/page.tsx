"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function ShellhacksProject() {
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
                title: 'Create a Hacker Guide',
                labels: ['PARTICIPANT', 'ONLINE'],
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                subtasks: {
                    todo: [
                        {
                            id: 1,
                            title: 'Workshop Rooms',
                            labels: ['LOCATION'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                            githubUrl: 'https://github.com/shellhacks/workshop-rooms'
                        },
                        {
                            id: 2,
                            title: 'Sleeping Rooms',
                            labels: ['LOCATION'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                            githubUrl: 'https://github.com/shellhacks/sleeping-rooms'
                        }
                    ],
                    inProgress: [
                        {
                            id: 3,
                            title: 'Food Area',
                            labels: ['FOOD'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                            githubUrl: 'https://github.com/shellhacks/food-area'
                        }
                    ],
                    testing: [
                        {
                            id: 4,
                            title: 'Sponsor Dinner Room',
                            labels: ['SPONSOR'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                            githubUrl: 'https://github.com/shellhacks/sponsor-dinner'
                        }
                    ],
                    done: [
                        {
                            id: 5,
                            title: 'Grand Ballroom',
                            labels: ['VENUE'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                            githubUrl: 'https://github.com/shellhacks/grand-ballroom'
                        }
                    ]
                }
            },
            {
                id: 2,
                title: 'Plan Dinner Day 2',
                labels: ['FOOD', 'PARTICIPANT'],
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                subtasks: {
                    todo: [
                        {
                            id: 6,
                            title: 'Menu Planning',
                            labels: ['FOOD'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/menu-planning'
                        },
                        {
                            id: 7,
                            title: 'Catering Setup',
                            labels: ['LOGISTICS'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/catering-setup'
                        }
                    ],
                    inProgress: [
                        {
                            id: 8,
                            title: 'Dietary Restrictions',
                            labels: ['PARTICIPANT'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/dietary-restrictions'
                        }
                    ],
                    testing: [],
                    done: []
                }
            },
            {
                id: 3,
                title: 'Start a waitlist',
                labels: ['FRONTEND'],
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                subtasks: {
                    todo: [
                        {
                            id: 9,
                            title: 'Database Design',
                            labels: ['BACKEND'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/database-design'
                        },
                        {
                            id: 10,
                            title: 'UI Components',
                            labels: ['FRONTEND'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/ui-components'
                        }
                    ],
                    inProgress: [],
                    testing: [],
                    done: []
                }
            },
            {
                id: 4,
                title: 'Reach out to Sponsors',
                labels: ['SPONSOR'],
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                subtasks: {
                    todo: [
                        {
                            id: 11,
                            title: 'Sponsor List',
                            labels: ['SPONSOR'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/sponsor-list'
                        },
                        {
                            id: 12,
                            title: 'Email Templates',
                            labels: ['COMMUNICATION'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/email-templates'
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
                id: 5,
                title: 'Accept 1300 Participants',
                labels: ['PARTICIPANT'],
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                subtasks: {
                    todo: [],
                    inProgress: [
                        {
                            id: 13,
                            title: 'Registration System',
                            labels: ['TECH'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/registration-system'
                        }
                    ],
                    testing: [],
                    done: []
                }
            }
        ],
        testing: [
            {
                id: 6,
                title: 'Plan Sponsor Dinner',
                labels: ['SPONSOR'],
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                subtasks: {
                    todo: [],
                    inProgress: [],
                    testing: [
                        {
                            id: 14,
                            title: 'Venue Selection',
                            labels: ['VENUE'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/venue-selection'
                        }
                    ],
                    done: []
                }
            },
            {
                id: 7,
                title: 'Confirm Rooms',
                labels: ['LOCATION'],
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
                subtasks: {
                    todo: [
                        {
                            id: 15,
                            title: 'Workshop Rooms',
                            labels: ['LOCATION'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/workshop-rooms-2'
                        },
                        {
                            id: 16,
                            title: 'Sleeping Rooms',
                            labels: ['LOCATION'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/sleeping-rooms-2'
                        }
                    ],
                    inProgress: [
                        {
                            id: 17,
                            title: 'Food Area',
                            labels: ['FOOD'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/food-area-2'
                        }
                    ],
                    testing: [
                        {
                            id: 18,
                            title: 'Sponsor Dinner Room',
                            labels: ['SPONSOR'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/sponsor-dinner-2'
                        }
                    ],
                    done: [
                        {
                            id: 19,
                            title: 'Grand Ballroom',
                            labels: ['VENUE'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/grand-ballroom-2'
                        }
                    ]
                }
            }
        ],
        done: [
            {
                id: 8,
                title: 'Deploy Main Website',
                labels: ['ONLINE'],
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                subtasks: {
                    todo: [],
                    inProgress: [],
                    testing: [],
                    done: [
                        {
                            id: 20,
                            title: 'Domain Setup',
                            labels: ['TECH'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/domain-setup'
                        },
                        {
                            id: 21,
                            title: 'SSL Certificate',
                            labels: ['SECURITY'],
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            githubUrl: 'https://github.com/shellhacks/ssl-certificate'
                        }
                    ]
                }
            }
        ]
    };

    const getLabelColor = (label: string) => {
        const colors: { [key: string]: string } = {
            'PARTICIPANT': '#AAD9DF',
            'ONLINE': '#AAD9DF',
            'FOOD': '#AAD9DF',
            'FRONTEND': '#AAD9DF',
            'SPONSOR': '#AAD9DF',
            'LOCATION': '#AAD9DF'
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
                Shellhacks
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
