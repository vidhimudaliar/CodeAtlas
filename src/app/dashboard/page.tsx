export default function Dashboard() {
    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#495B69', marginBottom: '2rem', fontSize: '2rem' }}>Dashboard</h1>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: '#6c757d', margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>Total Projects</p>
                            <h2 style={{ color: '#495B69', margin: '0', fontSize: '2rem' }}>24</h2>
                        </div>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#AAD9DF',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>📁</span>
                        </div>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: '#6c757d', margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>Contributions</p>
                            <h2 style={{ color: '#495B69', margin: '0', fontSize: '2rem' }}>156</h2>
                        </div>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#AAD9DF',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>🏆</span>
                        </div>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: '#6c757d', margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>Active Tasks</p>
                            <h2 style={{ color: '#495B69', margin: '0', fontSize: '2rem' }}>8</h2>
                        </div>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#AAD9DF',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>📊</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
            }}>
                <h2 style={{ color: '#495B69', marginBottom: '1.5rem' }}>Recent Activity</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { action: 'Created new project', project: 'E-commerce App', time: '2 hours ago' },
                        { action: 'Updated', project: 'Portfolio Website', time: '1 day ago' },
                        { action: 'Committed to', project: 'React Dashboard', time: '3 days ago' },
                        { action: 'Completed task in', project: 'API Integration', time: '1 week ago' }
                    ].map((item, index) => (
                        <div key={index} style={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <span style={{ color: '#495B69' }}>{item.action} </span>
                                <strong style={{ color: '#495B69' }}>{item.project}</strong>
                            </div>
                            <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>{item.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}