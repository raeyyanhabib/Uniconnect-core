import React, { useState } from 'react';
import { KeyRound, RefreshCw } from 'lucide-react';
import { C, inp, btnP } from '../services/theme';
import { api } from '../services/api';
import FormField from '../components/FormField';
import type {  AuthPageProps  } from '../types';

export default function ResetPasswordPage({ onNavigate }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post('/api/auth/reset-password', { email });
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div className="authCard" style={{ padding: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: `${C.amber}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <KeyRound size={24} color={C.amber} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.tx, margin: "0 0 8px" }}>{sent ? "Check your email" : "Reset password"}</h2>
          {!sent ? (
            <>
              <p style={{ color: C.txM, fontSize: 13, marginBottom: 24 }}>Enter your university email and we'll send a reset link.</p>
              <FormField label="University Email">
                <input style={inp} placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
              </FormField>
              {error && <div style={{ background: "rgba(239,68,68,0.12)", border: `1px solid rgba(239,68,68,0.3)`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, color: C.red, fontSize: 13 }}>{error}</div>}
              <button onClick={handleReset} style={{ ...btnP, width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? <RefreshCw size={15} className="spin" /> : "Send Reset Link"}
              </button>
            </>
          ) : (
            <>
              <p style={{ color: C.txM, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>We've sent a password reset link to your email. Check your inbox and follow the instructions.</p>
              <button onClick={() => onNavigate("login")} style={{ ...btnP, width: "100%", justifyContent: "center" }}>Back to Sign In</button>
            </>
          )}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => onNavigate("login")} style={{ background: "none", border: "none", color: C.txS, fontSize: 13, cursor: "pointer" }}>
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
