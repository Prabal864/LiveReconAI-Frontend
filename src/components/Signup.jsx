import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = ({ setAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8086/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        navigate("/dashboard");
      } else {
        setError("Signup failed");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="signup-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg,#181825 60%,#ff6bcb 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        background: 'rgba(30,30,50,0.95)',
        borderRadius: '24px',
        boxShadow: '0 8px 40px #ff6bcb33',
        padding: '48px 36px',
        minWidth: 340,
        maxWidth: 380,
        width: '100%',
        position: 'relative',
        zIndex: 2,
        border: '1.5px solid #ff6bcb44',
        backdropFilter: 'blur(8px)'
      }}>
        <h2 style={{
          background: 'linear-gradient(90deg,#a259ff,#ff6bcb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
          fontSize: '2rem',
          marginBottom: 32,
          textAlign: 'center',
          letterSpacing: '-1px',
        }}>Sign Up</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: '#23233a',
              color: '#fff',
              fontSize: '1rem',
              marginBottom: 8,
              outline: 'none',
              boxShadow: '0 2px 8px #a259ff11',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: '#23233a',
              color: '#fff',
              fontSize: '1rem',
              marginBottom: 8,
              outline: 'none',
              boxShadow: '0 2px 8px #a259ff11',
            }}
          />
          <button type="submit" style={{
            background: 'linear-gradient(90deg,#a259ff,#ff6bcb)',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '14px 0',
            fontWeight: 700,
            fontSize: '1.1rem',
            marginTop: 8,
            boxShadow: '0 2px 16px #ff6bcb33',
            cursor: 'pointer',
            transition: 'background 0.2s',
            outline: 'none',
          }}>Sign Up</button>
          {error && <div style={{ color: '#ff6bcb', marginTop: 8, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
        </form>
      </div>
      {/* Glow background */}
      <div style={{
        position: 'absolute',
        left: '-120px',
        top: '-120px',
        width: '340px',
        height: '340px',
        borderRadius: '50%',
        background: 'radial-gradient(circle,#a259ff55 0%,transparent 70%)',
        zIndex: 1,
        filter: 'blur(16px)'
      }} />
      <div style={{
        position: 'absolute',
        right: '-120px',
        bottom: '-120px',
        width: '340px',
        height: '340px',
        borderRadius: '50%',
        background: 'radial-gradient(circle,#ff6bcb55 0%,transparent 70%)',
        zIndex: 1,
        filter: 'blur(16px)'
      }} />
    </div>
  );
};

export default Signup;
