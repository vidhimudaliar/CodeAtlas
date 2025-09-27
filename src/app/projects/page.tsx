export default function Projects() {
    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#495B69', margin: '0', fontSize: '2rem' }}>Projects</h1>
                <button style={{
                    backgroundColor: '#AAD9DF',
                    color: '#495B69',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500'
                }}>
                    + New Project
                </button>
            </div>

            {/* Projects Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
            }}>
                {[
                    {
                        name: 'E-commerce Platform',
                        description: 'A full-stack e-commerce application built with React and Node.js',
                        status: 'In Progress',
                        technologies: ['React', 'Node.js', 'MongoDB'],
                        lastUpdated: '2 hours ago'
                    },
                    {
                        name: 'Portfolio Website',
                        description: 'Personal portfolio website showcasing projects and skills',
                        status: 'Completed',
                        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
                        lastUpdated: '1 day ago'
                    },
                    {
                        name: 'Task Management App',
                        description: 'Collaborative task management tool for teams',
                        status: 'Planning',
                        technologies: ['React', 'Express', 'PostgreSQL'],
                        lastUpdated: '3 days ago'
                    },
                    {
                        name: 'Weather Dashboard',
                        description: 'Real-time weather information dashboard with charts',
                        status: 'In Progress',
                        technologies: ['Vue.js', 'Chart.js', 'OpenWeather API'],
                        lastUpdated: '1 week ago'
                    },
                    {
                        name: 'Social Media Analytics',
                        description: 'Analytics dashboard for social media metrics',
                        status: 'Completed',
                        technologies: ['React', 'D3.js', 'Python'],
                        lastUpdated: '2 weeks ago'
                    },
                    {
                        name: 'Mobile Banking App',
                        description: 'Secure mobile banking application with biometric authentication',
                        status: 'In Progress',
                        technologies: ['React Native', 'Node.js', 'MySQL'],
                        lastUpdated: '3 weeks ago'
                    }
                ].map((project, index) => (
                    <div key={index} style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h3 style={{ color: '#495B69', margin: '0', fontSize: '1.25rem' }}>{project.name}</h3>
                            <span style={{
                                backgroundColor: project.status === 'Completed' ? '#d4edda' :
                                    project.status === 'In Progress' ? '#fff3cd' : '#e2e3e5',
                                color: project.status === 'Completed' ? '#155724' :
                                    project.status === 'In Progress' ? '#856404' : '#6c757d',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '16px',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                            }}>
                                {project.status}
                            </span>
                        </div>

                        <p style={{ color: '#6c757d', margin: '0 0 1rem 0', lineHeight: '1.5' }}>
                            {project.description}
                        </p>

                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {project.technologies.map((tech, techIndex) => (
                                    <span key={techIndex} style={{
                                        backgroundColor: '#AAD9DF',
                                        color: '#495B69',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '16px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }}>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '1rem',
                            borderTop: '1px solid #e9ecef'
                        }}>
                            <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                                Updated {project.lastUpdated}
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button style={{
                                    backgroundColor: 'transparent',
                                    color: '#495B69',
                                    border: '1px solid #AAD9DF',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}>
                                    View
                                </button>
                                <button style={{
                                    backgroundColor: '#AAD9DF',
                                    color: '#495B69',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}>
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
