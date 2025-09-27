import Image from 'next/image';

export default function Dashboard() {
    return (
        <div style={{
            padding: '2rem',
            width: '100%',
            backgroundColor: '#F5F5F5',
            minHeight: '100vh'
        }}>
            <h1 style={{ color: '#495B69', marginBottom: '2rem', fontSize: '2rem' }}>Dashboard</h1>

            {/* Main Cards */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                width: '100%'
            }}>
                {/* Your Projects Card */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{
                        color: '#495B69',
                        marginBottom: '2rem',
                        fontSize: '1.5rem',
                        fontWeight: '600'
                    }}>
                        Your Projects
                    </h2>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5rem'
                    }}>
                        <Image
                            src="/project-large-icon.svg"
                            alt="Projects"
                            width={80}
                            height={80}
                        />
                        <p style={{
                            color: '#495B69',
                            margin: '0',
                            fontSize: '1rem',
                            textAlign: 'center'
                        }}>
                            Create your first project
                        </p>
                        <button style={{
                            backgroundColor: '#495B69',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}>
                            Create a Project
                        </button>
                    </div>
                </div>

                {/* Your Contributions Card */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{
                        color: '#495B69',
                        marginBottom: '2rem',
                        fontSize: '1.5rem',
                        fontWeight: '600'
                    }}>
                        Your Contributions
                    </h2>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5rem'
                    }}>
                        <Image
                            src="/contribution-large-icon.svg"
                            alt="Contributions"
                            width={80}
                            height={80}
                        />
                        <p style={{
                            color: '#495B69',
                            margin: '0',
                            fontSize: '1rem',
                            textAlign: 'center'
                        }}>
                            Find your first contribution
                        </p>
                        <button style={{
                            backgroundColor: '#495B69',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}>
                            Find a Contribution
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}