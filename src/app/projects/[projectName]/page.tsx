"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function DynamicProjectPage() {
    const params = useParams();
    const projectName = params.projectName as string;
    const [activeTab, setActiveTab] = useState('board');

    const tabs = [
        { id: 'summary', label: 'Summary', icon: 'summary-icon.svg', iconBold: 'summary-icon-bold.svg' },
        { id: 'board', label: 'Board', icon: 'board-icon.svg', iconBold: 'board-icon-bold.svg' },
        { id: 'overview', label: 'Overview', icon: 'overview-icon.svg', iconBold: 'overview-icon-bold.svg' },
        { id: 'code', label: 'Code', icon: 'code-icon.svg', iconBold: 'code-icon-bold.svg' }
    ];

    const kanbanData = {
        todo: [
            { id: 1, title: 'Setup Development Environment', labels: ['DEVELOPMENT'] },
            { id: 2, title: 'Design User Interface', labels: ['DESIGN', 'FRONTEND'] },
            { id: 3, title: 'Implement Authentication', labels: ['BACKEND', 'SECURITY'] }
        ],
        inProgress: [
            { id: 4, title: 'Create Database Schema', labels: ['DATABASE'] }
        ],
        testing: [
            { id: 5, title: 'Write Unit Tests', labels: ['TESTING'] }
        ],
        done: [
            { id: 6, title: 'Project Initialization', labels: ['SETUP'] }
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
                        }}>
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
                        }}>
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
                        }}>
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
                        }}>
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
        </div>
    );
}
