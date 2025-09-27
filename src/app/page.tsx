"use client";

import { useState } from "react";


export default function Home() {


  const [idea, setIdea] = useState("")
  const [condition, setCondition] = useState("")
  const [stack, setStack] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("You submitted")
    // code to send to agent ...
    if (idea.trim() === "") return; // ignore empty submissions
    setIdea(""); // clear input after submission ... change this afterwards
  };

  return (
    <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>

      <form className='theform' onSubmit={handleSubmit} style={{ padding: '16px', boxShadow: '0 6px 16px rgba(0,0,0,0.04)' }}>
        <div className='form-title'>Enter your project idea</div>
        <div style={{ marginBottom: '12px' }}>
          
          <textarea
            className='input1'
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., Explain your idea in a few words"
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              backgroundColor:'#f2f2f2',
              color: '#000',
              border: '1px solid #ccc',
      
              
            }}
          />
        </div>

        <div>Select Specifications</div>
        <div style={{ marginBottom: '12px' }}>
          <label>Choose Framework *</label>
          <select
            className='select-button'
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px 12px',
              backgroundColor: '#f2f2f2',
              color: '#000',
              border: '1px solid #ccc',
              
            }}
          >
            <option value="New">Next.js</option>
            <option value="Like New">Angular.js</option>
            <option value="Gently Used">Django</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Choose Tech Stack *</label>
          <select
            className='select-button'
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px 12px',
              backgroundColor: '#f2f2f2',
              color: '#000',
              border: '1px solid #ccc',
              
            }}
          >
            <option value="New">Next.js</option>
            <option value="Like New">Angular.js</option>
            <option value="Gently Used">Django</option>
          </select>
        </div>

        

        <button
          type="submit"
          style={{
            padding: '12px 20px',
            backgroundColor: '#543737',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '20px',
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}