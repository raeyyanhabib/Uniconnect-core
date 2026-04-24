// OTP verification page — student enters their 6-digit code to activate their account
import { useState } from 'react';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { C, btnP } from '../services/theme';
import { api } from '../services/api';
import type {  AuthPageProps  } from '../types';

export default function VerifyStudentPage({ onNavigate }: AuthPageProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      const userId = localStorage.getItem('uc_pending_user_id');
      await api.post('/api/auth/verify', { userId, code });
      localStorage.removeItem('uc_pending_user_id');
      onNavigate("login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        <div className="authCard" style={{ padding: 36, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: `${C.cyan}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Mail size={28} color={C.cyan} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.tx, margin: "0 0 8px" }}>Verify your email</h2>
          <p style={{ color: C.txM, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            We've sent a 6-digit code to <strong style={{ color: C.txS }}>your@university.edu</strong>. Enter it below to verify your student status.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }}>
            <input value={code} onChange={e => setCode(e.target.value)} maxLength={6} style={{ width: "100%", height: 52, textAlign: "center", letterSpacing: 8, fontSize: 22, fontWeight: 700, background: C.depth, border: `1px solid ${C.borderLight}`, borderRadius: 10, color: C.tx }} placeholder="000000" />
          </div>
          {error && <div style={{ background: "rgba(239,68,68,0.12)", border: `1px solid rgba(239,68,68,0.3)`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, color: C.red, fontSize: 13 }}>{error}</div>}
          <button onClick={handleVerify} style={{ ...btnP, width: "100%", justifyContent: "center", marginBottom: 12, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? <RefreshCw size={16} className="spin" /> : <><CheckCircle size={16} /> Verify & Continue</>}
          </button>
          <button style={{ background: "none", border: "none", color: C.txS, fontSize: 13, cursor: "pointer" }}>
            Didn't receive it? Resend code
          </button>
        </div>
      </div>
    </div>
  );
}
