import React, { useState } from 'react';
import { BookOpen, User, Mail, Lock, Building, GraduationCap, Hash, ArrowLeft, RefreshCw, CheckCircle, ChevronRight } from 'lucide-react';
import { C, inp, btnP, btnS } from '../services/theme';
import { api } from '../services/api';
import FormField from '../components/FormField';
import type {  AuthPageProps  } from '../types';

export default function RegisterPage({ onNavigate }: AuthPageProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", dept: "Computer Science", semester: "6", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const depts = ["Computer Science", "Mathematics", "Physics", "Electrical Engineering", "Mechanical Engineering", "Chemistry", "Economics"];

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const { name, email, dept, semester, password } = form;
      const emailRegex = /^([a-zA-Z])(\d{2})(\d{4})@(lhr|isb|fsd|khi|pwr)\.nu\.edu\.pk$/i;
      const match = email.trim().match(emailRegex);
      if (!match) {
        throw new Error("Invalid campus email. Example: l240690@lhr.nu.edu.pk");
      }
      
      const letter = match[1].toLowerCase();
      const year = match[2];
      const campus = match[4].toLowerCase();

      const campusMap: Record<string, string> = { lhr: 'l', isb: 'i', fsd: 'f', khi: 'k', pwr: 'p' };
      if (campusMap[campus] !== letter) {
          throw new Error('Roll number character does not match campus location.');
      }
      
      const computedSemester = (26 - parseInt(year, 10)) * 2;
      const finalSemester = computedSemester > 0 ? computedSemester : parseInt(semester, 10);

      const data = await api.post('/api/auth/register', { name, email, department: dept, semester: finalSemester, password });
      localStorage.setItem('uc_pending_user_id', data.userId);
      onNavigate("verifyStudent");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.06) 0%, transparent 60%)" }} />
      <div style={{ width: "100%", maxWidth: 460, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${C.cyan},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={18} color="#fff" /></div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, background: `linear-gradient(135deg,${C.cyanLt},${C.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>UniConnect</h1>
          </div>
        </div>
        <div className="authCard" style={{ padding: 32 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? C.cyan : C.border, transition: "background 0.3s" }} />
            ))}
          </div>
          {step === 1 ? (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.tx, marginTop: 0, marginBottom: 4 }}>Create account</h2>
              <p style={{ color: C.txM, fontSize: 13, marginBottom: 24 }}>Step 1 of 2 – Personal info</p>
              <FormField label="Full Name">
                <div style={{ position: "relative" }}>
                  <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.txM }} />
                  <input style={{ ...inp, paddingLeft: 34 }} value={form.name} onChange={e => upd("name", e.target.value)} placeholder="Your full name" />
                </div>
              </FormField>
              <FormField label="University Email">
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.txM }} />
                  <input style={{ ...inp, paddingLeft: 34 }} value={form.email} onChange={e => upd("email", e.target.value)} placeholder="yourname@university.edu" />
                </div>
              </FormField>
              <FormField label="Password">
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.txM }} />
                  <input type="password" style={{ ...inp, paddingLeft: 34 }} value={form.password} onChange={e => upd("password", e.target.value)} placeholder="Min 8 characters" />
                </div>
              </FormField>
              <button onClick={() => setStep(2)} style={{ ...btnP, width: "100%", justifyContent: "center" }}>Continue <ChevronRight size={16} /></button>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.tx, marginTop: 0, marginBottom: 4 }}>Academic details</h2>
              <p style={{ color: C.txM, fontSize: 13, marginBottom: 24 }}>Step 2 of 2 – Verify your student status</p>
              <FormField label="Department">
                <div style={{ position: "relative" }}>
                  <Building size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.txM }} />
                  <select style={{ ...inp, paddingLeft: 34, appearance: "none" }} value={form.dept} onChange={e => upd("dept", e.target.value)}>
                    {depts.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </FormField>
              <FormField label="Current Semester">
                <div style={{ position: "relative" }}>
                  <GraduationCap size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.txM }} />
                  <select style={{ ...inp, paddingLeft: 34, appearance: "none" }} value={form.semester} onChange={e => upd("semester", e.target.value)}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </FormField>
              <FormField label="Student ID">
                <div style={{ position: "relative" }}>
                  <Hash size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.txM }} />
                  <input style={{ ...inp, paddingLeft: 34 }} placeholder="e.g. STU20230042" />
                </div>
              </FormField>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ ...btnS, flex: 1, justifyContent: "center" }}><ArrowLeft size={15} /> Back</button>
                <button onClick={handleRegister} style={{ ...btnP, flex: 1, justifyContent: "center", opacity: loading ? 0.7 : 1 }} disabled={loading}>
                  {loading ? <RefreshCw size={15} className="spin" /> : <>Register <CheckCircle size={15} /></>}
                </button>
              </div>
              {error && <div style={{ background: "rgba(239,68,68,0.12)", border: `1px solid rgba(239,68,68,0.3)`, borderRadius: 8, padding: "8px 12px", marginTop: 12, color: C.red, fontSize: 13 }}>{error}</div>}
            </>
          )}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <span style={{ color: C.txM, fontSize: 13 }}>Already have an account? </span>
            <button onClick={() => onNavigate("login")} style={{ background: "none", border: "none", color: C.cyan, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}
