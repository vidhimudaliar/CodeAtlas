export default function Contributions() {
    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#495B69', marginBottom: '2rem', fontSize: '2rem' }}>Contributions</h1>

            {/* Contribution Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#495B69', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>156</h2>
                    <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>Total Contributions</p>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#495B69', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>12</h2>
                    <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>Repositories</p>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#495B69', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>8</h2>
                    <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>Pull Requests</p>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#495B69', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>24</h2>
                    <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>Issues Resolved</p>
                </div>
            </div>

            {/* Recent Contributions */}
            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
            }}>
                <h2 style={{ color: '#495B69', marginBottom: '1.5rem' }}>Recent Contributions</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        {
                            type: 'Pull Request',
                            title: 'Fix authentication bug in login flow',
                            repository: 'ecommerce-platform',
                            status: 'Merged',
                            time: '2 hours ago',
                            color: '#28a745'
                        },
                        {
                            type: 'Issue',
                            title: 'Add dark mode support',
                            repository: 'portfolio-website',
                            status: 'Open',
                            time: '1 day ago',
                            color: '#007bff'
                        },
                        {
                            type: 'Commit',
                            title: 'Update documentation for API endpoints',
                            repository: 'task-management',
                            status: 'Completed',
                            time: '3 days ago',
                            color: '#6c757d'
                        },
                        {
                            type: 'Pull Request',
                            title: 'Implement responsive design for mobile',
                            repository: 'weather-dashboard',
                            status: 'Under Review',
                            time: '1 week ago',
                            color: '#ffc107'
                        },
                        {
                            type: 'Issue',
                            title: 'Performance optimization needed',
                            repository: 'social-analytics',
                            status: 'Closed',
                            time: '2 weeks ago',
                            color: '#dc3545'
                        }
                    ].map((contribution, index) => (
                        <div key={index} style={{
                            backgroundColor: 'white',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: contribution.color,
                                    flexShrink: 0
                                }}></div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{
                                            backgroundColor: '#AAD9DF',
                                            color: '#495B69',
                                            padding: '0.125rem 0.5rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {contribution.type}
                                        </span>
                                        <span style={{
                                            backgroundColor: contribution.status === 'Merged' ? '#d4edda' :
                                                contribution.status === 'Open' ? '#d1ecf1' :
                                                    contribution.status === 'Under Review' ? '#fff3cd' :
                                                        contribution.status === 'Closed' ? '#f8d7da' : '#e2e3e5',
                                            color: contribution.status === 'Merged' ? '#155724' :
                                                contribution.status === 'Open' ? '#0c5460' :
                                                    contribution.status === 'Under Review' ? '#856404' :
                                                        contribution.status === 'Closed' ? '#721c24' : '#6c757d',
                                            padding: '0.125rem 0.5rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {contribution.status}
                                        </span>
                                    </div>
                                    <h4 style={{ color: '#495B69', margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                                        {contribution.title}
                                    </h4>
                                    <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>
                                        {contribution.repository}
                                    </p>
                                </div>
                            </div>
                            <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                                {contribution.time}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contribution Calendar Placeholder */}
            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                marginTop: '2rem'
            }}>
                <h2 style={{ color: '#495B69', marginBottom: '1.5rem' }}>Contribution Calendar</h2>
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    textAlign: 'center',
                    color: '#6c757d'
                }}>
                    <p style={{ margin: '0' }}>Contribution calendar visualization would go here</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                        (This would typically show a grid of squares representing daily contributions)
                    </p>
                </div>
            </div>
        </div>
    );
}
