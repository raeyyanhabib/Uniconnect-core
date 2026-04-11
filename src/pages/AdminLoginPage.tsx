import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { C, inp, btnP } from '../services/theme';
import { api, setToken } from '../services/api';
import FormField from '../components/FormField';
import type { AuthPageProps } from '../types';


// The admin login page — a separate portal for university administrators.
// Uses a distinct visual style (purple accents) to differentiate from student login.
// Enter key is fully supported here too.

export default function AdminLoginPage({ onLogin, onNavigate }: AuthPageProps) {
  const [email, setEmail] = useState("admin@university.edu");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // Handles admin login — sends credentials, stores the JWT,
  // and passes the admin user data (with role forced to 'admin') up to the App.
  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.post('/api/auth/login', { email, password });
      setToken(data.token);
      onLogin?.(JSON.stringify({ ...data.user, role: 'admin' }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };


  // Enter key triggers login
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleLogin();
    }
  };


  return (
    <div style={{ height: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.06) 0%, transparent 60%)" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>

        {/* Admin portal header with shield icon */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Shield size={32} color={C.purple} />
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, background: `linear-gradient(135deg,${C.cyanLt},${C.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Admin Portal
            </h1>
          </div>
        </div>

        {/* Login form card */}
        <div className="authCard" style={{ padding: 32, borderTop: `4px solid ${C.purple}` }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.tx, marginTop: 0, marginBottom: 4 }}>System Access</h2>
          <p style={{ color: C.txM, fontSize: 13, marginBottom: 24 }}>Restricted to university administration</p>

          <FormField label="Admin Email">
            <input style={{ ...inp }} value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="admin@university.edu" />
          </FormField>

          <FormField label="Password">
            <input type="password" style={{ ...inp }} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder="••••••••" />
          </FormField>

          {error && <div style={{ color: C.red, fontSize: 13, padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8, marginBottom: 12 }}>{error}</div>}

          <button onClick={handleLogin} style={{ ...btnP, width: "100%", justifyContent: "center", background: `linear-gradient(135deg,${C.purple},${C.cyanDk})`, marginBottom: 16 }} disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>

          <button onClick={() => onNavigate("login")} style={{ background: "none", border: "none", color: C.txM, fontSize: 13, cursor: "pointer", width: "100%" }}>
            Return to Student Portal
          </button>
        </div>
      </div>
    </div>
  );
}
