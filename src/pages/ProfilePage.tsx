import React, { useState, useEffect } from 'react';
import { Users, Check, X, ToggleRight, ToggleLeft, KeyRound, Layers, Package } from 'lucide-react';
import { C, cardStyle, inp, btnP, btnS } from '../services/theme';
import { api } from '../services/api';
import Avatar from '../components/Avatar';
import StarRating from '../components/StarRating';
import Tabs from '../components/Tabs';
import FormField from '../components/FormField';
import type {  User  } from '../types';

interface ProfilePageProps { user: User; onNavigate: (page: string) => void; }

export default function ProfilePage({ user, onNavigate: _onNavigate }: ProfilePageProps) {
  const [profile, setProfile] = useState<any>(user);
  const [tab, setTab] = useState("view");
  const [editForm, setEditForm] = useState({ name: user.name, bio: user.bio || "", dept: user.department || "", semester: String(user.semester || "") });
  const [privacySettings, setPrivacySettings] = useState<Record<string, boolean | string>>({ showEmail: false, showDept: true, showSemester: true, showRating: true, allowPartnerRequests: true, profileVisibility: "public" });

  useEffect(() => {
    api.get('/api/users/me').then(data => {
      setProfile(data);
      setEditForm({ name: data.name, bio: data.bio || "", dept: data.department || "", semester: String(data.semester || "") });
      setPrivacySettings({
        showEmail: data.showEmail === 1,
        showDept: data.showDept === 1,
        showSemester: data.showSemester === 1,
        showRating: data.showRating === 1,
        allowPartnerRequests: data.allowRequests === 1,
        profileVisibility: data.visibility || "public"
      });
    }).catch(console.error);
  }, []);

  const upd = (k: string, v: string) => setEditForm(f => ({ ...f, [k]: v }));
  const togglePrivacy = (k: string) => setPrivacySettings(p => ({ ...p, [k]: !p[k] }));
  const depts = ["Computer Science", "Mathematics", "Physics", "Electrical Engineering", "Mechanical Engineering", "Chemistry", "Economics"];
  const tabs = [
    { id: "view", label: "My Profile" },
    { id: "edit", label: "Edit Profile" },
    { id: "privacy", label: "Privacy Settings" },
  ];
  return (
    <div className="pageAnim" style={{ padding: 28, maxWidth: 720, margin: "0 auto" }}>
      <Tabs tabs={tabs} active={tab} onSelect={setTab} />
      {tab === "view" && (
        <div>
          <div style={{ ...cardStyle(), display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ position: "relative" }}>
              <Avatar name={profile.name} size={72} />
              <div className="pulse" style={{ width: 12, height: 12, borderRadius: "50%", background: C.green, position: "absolute", bottom: 2, right: 2, border: `2px solid ${C.card}` }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: C.tx, margin: 0 }}>{profile.name}</h2>
              <p style={{ color: C.txS, fontSize: 14, margin: "4px 0 8px" }}>{profile.department} · Semester {profile.semester}</p>
              <StarRating rating={profile.avgRating || 0} />
              <p style={{ fontSize: 14, color: C.txM, margin: "12px 0 0", lineHeight: 1.6 }}>{profile.bio}</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { label: "Study Partners", value: "-", icon: Users, color: C.cyan },
              { label: "Study Groups", value: "-", icon: Layers, color: C.purple },
              { label: "Resources Listed", value: "-", icon: Package, color: C.amber },
            ].map(s => (
              <div key={s.label} style={{ ...cardStyle({ textAlign: "center", padding: 16 }) }}>
                <s.icon size={22} color={s.color} style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 26, fontWeight: 800, color: C.tx, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: C.txM, margin: "4px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "edit" && (
        <div style={cardStyle()}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.tx, margin: "0 0 20px" }}>Edit Profile</h3>
          <FormField label="Display Name">
            <input style={inp} value={editForm.name} onChange={e => upd("name", e.target.value)} />
          </FormField>
          <FormField label="Bio">
            <textarea style={{ ...inp, height: 90, resize: "vertical", lineHeight: 1.5 }} value={editForm.bio} onChange={e => upd("bio", e.target.value)} />
          </FormField>
          <FormField label="Department">
            <select style={{ ...inp, appearance: "none" }} value={editForm.dept} onChange={e => upd("dept", e.target.value)}>
              {depts.map(d => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Current Semester">
            <select style={{ ...inp, appearance: "none" }} value={editForm.semester} onChange={e => upd("semester", e.target.value)}>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </FormField>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button style={{ ...btnP }}><Check size={15} /> Save Changes</button>
            <button style={{ ...btnS }} onClick={() => setTab("view")}><X size={15} /> Cancel</button>
          </div>
        </div>
      )}
      {tab === "privacy" && (
        <div style={cardStyle()}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.tx, margin: "0 0 6px" }}>Privacy Settings</h3>
          <p style={{ color: C.txM, fontSize: 13, marginBottom: 24 }}>Control what other students can see on your profile.</p>
          {[
            { key: "showEmail", label: "Show email address", desc: "Allow others to see your university email" },
            { key: "showDept", label: "Show department", desc: "Display your department on your profile" },
            { key: "showSemester", label: "Show semester", desc: "Display your current semester" },
            { key: "showRating", label: "Show rating", desc: "Allow others to see your average rating" },
            { key: "allowPartnerRequests", label: "Allow partner requests", desc: "Let other students send you study partner requests" },
          ].map(s => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.tx, margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 12, color: C.txM, margin: "3px 0 0" }}>{s.desc}</p>
              </div>
              <button onClick={() => togglePrivacy(s.key)} style={{ background: "none", border: "none", cursor: "pointer", color: privacySettings[s.key] ? C.cyan : C.txM }}>
                {privacySettings[s.key] ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
          ))}
          <div style={{ marginTop: 20 }}>
            <FormField label="Profile Visibility">
              <select style={{ ...inp, appearance: "none", maxWidth: 200 }} value={String(privacySettings.profileVisibility)} onChange={e => setPrivacySettings(p => ({ ...p, profileVisibility: e.target.value }))}>
                <option value="public">Public – Visible to all students</option>
                <option value="partners">Partners Only</option>
                <option value="private">Private – Hidden</option>
              </select>
            </FormField>
            <button style={{ ...btnP, marginTop: 4 }}><Check size={15} /> Save Privacy Settings</button>
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.tx, margin: "0 0 6px" }}>Change Password</h3>
            <p style={{ color: C.txM, fontSize: 13, marginBottom: 16 }}>Update your account security credentials.</p>
            <FormField label="Current Password">
              <input type="password" style={{ ...inp, maxWidth: 300 }} placeholder="Current password" />
            </FormField>
            <FormField label="New Password">
              <input type="password" style={{ ...inp, maxWidth: 300 }} placeholder="Min 8 characters" />
            </FormField>
            <button style={{ ...btnP, marginTop: 10 }} onClick={() => alert("Password updated successfully!")}><KeyRound size={15} /> Update Password</button>
          </div>
        </div>
      )}
    </div>
  );
}
