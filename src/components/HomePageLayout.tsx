"use client";

import { NavbarMinimalColored } from "@/components/NavbarMinimalColored";
import Image from 'next/image';

export default function HomePageLayout() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      {/* Side navbar - now fixed */}
      <NavbarMinimalColored />

      {/* Dashboard content with left margin for fixed sidebar */}
      <div style={{
        flex: 1,
        padding: "1.5rem",
        width: "calc(100% - 80px)",
        backgroundColor: "#F5F5F5",
        marginLeft: "80px", // Account for fixed sidebar width
        overflow: "auto",
        boxSizing: "border-box"
      }}>
        <h1 style={{
          color: '#495B69',
          marginBottom: '1.5rem',
          fontSize: '1.75rem',
          fontWeight: '600'
        }}>Dashboard</h1>

        {/* Main Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '100%'
        }}>
          {/* Your Projects Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flex: '1',
            minHeight: '0'
          }}>
            <h2 style={{
              color: '#495B69',
              marginBottom: '1.5rem',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              Your Projects
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              height: '100%',
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
                Create a Project
              </button>
            </div>
          </div>

          {/* Your Contributions Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flex: '1',
            minHeight: '0'
          }}>
            <h2 style={{
              color: '#495B69',
              marginBottom: '1.5rem',
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
              height: '100%',
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
      </div>
    </div>
  );
}
