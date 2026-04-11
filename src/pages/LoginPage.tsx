import React, { useState } from 'react';
import { BookOpen, Check, RefreshCw, Mail, Lock, Eye, Shield } from 'lucide-react';
import { C, inp, btnP, btnS } from '../services/theme';
import { api, setToken } from '../services/api';
import FormField from '../components/FormField';
import type { AuthPageProps } from '../types';


// The login page — the first thing users see when they open UniConnect.
// Handles student login via email/password, with links to admin portal,
// registration, and password reset. Enter key is fully supported.

export default function LoginPage({ onLogin, onNavigate }: AuthPageProps) {
  const [email, setEmail] = useState("alex.chen@university.edu");
  const [password, setPassword] = useState("password123");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // Handles the actual login — sends credentials to the API,
  // stores the JWT token, and passes the user data up to the App.
  // The 'role' parameter lets us distinguish between student and admin logins.
  const handleLogin = async (role: string) => {
    setLoading(true);
    setError("");

    try {
      if (role === "admin") {
        const data = await api.post('/api/auth/login', { email: 'admin@university.edu', password: 'admin123' });
        setToken(data.token);
        onLogin?.(JSON.stringify({ ...data.user, role: 'admin' }));
      } else {
        const data = await api.post('/api/auth/login', { email, password });
        setToken(data.token);
        onLogin?.(JSON.stringify(data.user));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };


  // Let the user press Enter to submit the form instead of clicking the button
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleLogin("student");
    }
  };


  return (
    <div style={{ height: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 40%, rgba(14,165,233,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(139,92,246,0.05) 0%, transparent 50%)" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>

        {/* Logo and tagline */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${C.cyan},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={24} color="#fff" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, background: `linear-gradient(135deg,${C.cyanLt},${C.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              UniConnect
            </h1>
          </div>
          <p style={{ color: C.txM, fontSize: 14, margin: 0 }}>Your campus collaboration platform</p>
        </div>

        {/* Login form card */}
        <div className="authCard" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.tx, marginTop: 0, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: C.txM, fontSize: 13, marginBottom: 24 }}>Sign in with your university email</p>

          <FormField label="University Email">
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.txM }} />
              <input style={{ ...inp, paddingLeft: 36 }} value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="you@university.edu" />
            </div>
          </FormField>

          <FormField label="Password">
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.txM }} />
              <input type={showPw ? "text" : "password"} style={{ ...inp, paddingLeft: 36, paddingRight: 40 }} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder="••••••••" />
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.txM, cursor: "pointer" }}>
                <Eye size={16} />
              </button>
            </div>
          </FormField>

          <button onClick={() => onNavigate("resetPassword")} style={{ background: "none", border: "none", color: C.cyan, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 10 }}>
            Forgot password?
          </button>

          {error && <div style={{ background: "rgba(239,68,68,0.12)", border: `1px solid rgba(239,68,68,0.3)`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, color: C.red, fontSize: 13 }}>{error}</div>}

          <button onClick={() => handleLogin("student")} style={{ ...btnP, width: "100%", justifyContent: "center", marginBottom: 12, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? <RefreshCw size={16} className="spin" /> : <><Check size={16} /> Sign In</>}
          </button>

          <button onClick={() => onNavigate("adminLogin")} style={{ ...btnS, width: "100%", justifyContent: "center", fontSize: 13 }}>
            <Shield size={14} /> Admin Portal
          </button>

          {/* Registration link */}
          <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 24, paddingTop: 20, textAlign: "center" }}>
            <span style={{ color: C.txM, fontSize: 13 }}>Don't have an account? </span>
            <button onClick={() => onNavigate("register")} style={{ background: "none", border: "none", color: C.cyan, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Register here</button>
          </div>
        </div>
      </div>
    </div>
  );
}
