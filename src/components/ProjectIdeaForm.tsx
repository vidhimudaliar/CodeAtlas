"use client";

import { useState } from "react";

export default function ProjectIdeaForm() {
  const [idea, setIdea] = useState("");
  const [selectionType, setSelectionType] = useState<'framework' | 'techstack'>('framework');
  const [framework, setFramework] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [repository, setRepository] = useState("");

  const handleTechStackToggle = (language: string) => {
    setTechStack(prev =>
      prev.includes(language)
        ? prev.filter(lang => lang !== language)
        : [...prev, language]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("You submitted");
    if (idea.trim() === "") return;
    setIdea("");
  };

  return (
    <div style={{
      width: "100%"
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Project Idea Textarea */}
        <div>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., Explain your idea in a few words"
            style={{
              width: "100%",
              height: "120px",
              padding: "1rem",
              backgroundColor: "#FFFFFF",
              color: "#495B69",
              border: "1px solid #e9ecef",
              borderRadius: "12px",
              fontSize: "1rem",
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Select Specifications */}
        <div>
          <h3 style={{
            color: '#495B69',
            fontSize: '1.1rem',
            fontWeight: '500',
            marginBottom: '1rem'
          }}>
            Select Specifications
          </h3>

          {/* Selection Type Toggle */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            backgroundColor: '#F5F5F5',
            padding: '0.25rem',
            borderRadius: '8px'
          }}>
            <button
              type="button"
              onClick={() => setSelectionType('framework')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: selectionType === 'framework' ? '#495B69' : 'transparent',
                color: selectionType === 'framework' ? '#FFFFFF' : '#495B69',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Choose Framework
            </button>
            <button
              type="button"
              onClick={() => setSelectionType('techstack')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: selectionType === 'techstack' ? '#495B69' : 'transparent',
                color: selectionType === 'techstack' ? '#FFFFFF' : '#495B69',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Choose Tech Stack
            </button>
          </div>

          {/* Framework Selection */}
          {selectionType === 'framework' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                color: '#495B69',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Choose Framework *
              </label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#FFFFFF",
                  color: "#495B69",
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="">Select Framework</option>
                <option value="nextjs">Next.js</option>
                <option value="django">Django</option>
                <option value="angular">Angular.js</option>
              </select>
            </div>
          )}

          {/* Tech Stack Multi-Selection */}
          {selectionType === 'techstack' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                color: '#495B69',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Choose Programming Languages *
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.5rem'
              }}>
                {['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'C++'].map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => handleTechStackToggle(language)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: techStack.includes(language) ? '#AAD9DF' : '#FFFFFF',
                      color: techStack.includes(language) ? '#495B69' : '#495B69',
                      border: techStack.includes(language) ? '2px solid #FFFFFF' : '1px solid #e9ecef',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: techStack.includes(language) ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    {language}
                  </button>
                ))}
              </div>
              {techStack.length > 0 && (
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#6c757d'
                }}>
                  Selected: {techStack.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Repository Selection */}
          <div>
            <label style={{
              display: 'block',
              color: '#495B69',
              fontSize: '0.9rem',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Select a Repository
            </label>
            <select
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#FFFFFF",
                color: "#495B69",
                border: "1px solid #e9ecef",
                borderRadius: "8px",
                fontSize: "0.9rem",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="">No Selection</option>
              <option value="github">GitHub</option>
              <option value="gitlab">GitLab</option>
              <option value="bitbucket">Bitbucket</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            type="submit"
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#495B69",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "1rem",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#3a4a5c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#495B69";
            }}
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
