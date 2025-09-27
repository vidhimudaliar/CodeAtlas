export default function Profile() {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: '#495B69', marginBottom: '2rem', fontSize: '2rem' }}>Profile</h1>

            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#AAD9DF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '1.5rem'
                    }}>
                        <span style={{ fontSize: '2rem', color: '#495B69' }}>👤</span>
                    </div>
                    <div>
                        <h2 style={{ color: '#495B69', margin: '0 0 0.5rem 0' }}>John Doe</h2>
                        <p style={{ color: '#6c757d', margin: '0' }}>Software Developer</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                    }}>
                        <h3 style={{ color: '#495B69', marginBottom: '1rem' }}>Personal Information</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ color: '#495B69' }}>Email:</strong>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>john.doe@example.com</p>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ color: '#495B69' }}>Location:</strong>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>San Francisco, CA</p>
                        </div>
                        <div>
                            <strong style={{ color: '#495B69' }}>Bio:</strong>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>Passionate developer with 5+ years of experience in web development.</p>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                    }}>
                        <h3 style={{ color: '#495B69', marginBottom: '1rem' }}>Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL'].map(skill => (
                                <span key={skill} style={{
                                    backgroundColor: '#AAD9DF',
                                    color: '#495B69',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '16px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
