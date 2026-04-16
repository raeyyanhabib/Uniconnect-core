import { useState, useEffect } from 'react';
import { Users, Check, X, ToggleRight, ToggleLeft, KeyRound, Layers, Package } from 'lucide-react';
import { C, cardStyle, inp, btnP, btnS } from '../services/theme';
import { api } from '../services/api';
import Avatar from '../components/Avatar';
import StarRating from '../components/StarRating';
import Tabs from '../components/Tabs';
import FormField from '../components/FormField';
import type { User } from '../types';


// Props for ProfilePage — takes the current user, navigation handler,
// and an onUserUpdate callback so the parent App can sync state when profile changes.
interface ProfilePageProps {
  user: User;
  onNavigate: (page: string) => void;
  onUserUpdate?: (user: User) => void;
}


// The complete profile page — has three tabs:
// 1. "My Profile" for viewing your info and stats
// 2. "Edit Profile" for changing name, bio, department, semester
// 3. "Privacy Settings" for toggling visibility options and changing password

export default function ProfilePage({ user, onNavigate, onUserUpdate }: ProfilePageProps) {
  const [profile, setProfile] = useState<any>(user);
  const [tab, setTab] = useState("view");
  const [editForm, setEditForm] = useState({ name: user.name, bio: user.bio || "", dept: user.department || "", semester: String(user.semester || "") });
  const [privacySettings, setPrivacySettings] = useState<Record<string, boolean | string>>({ showEmail: false, showDept: true, showSemester: true, showRating: true, allowPartnerRequests: true, profileVisibility: "public" });

  // Password change form state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  // Real stats from the dashboard API for the profile view cards
  const [stats, setStats] = useState({ partners: 0, groups: 0, resources: 0, loans: 0 });

  // Edit form feedback
  const [editMsg, setEditMsg] = useState("");
  const [editError, setEditError] = useState("");


  // On mount, fetch the user's full profile from the API and populate all the form fields.
  // Also grabs dashboard stats so the profile view shows real numbers.
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

    // Grab real stats for the profile stat cards
    api.get('/api/users/dashboard').then(data => {
      if (data.stats) setStats(data.stats);
    }).catch(console.error);
  }, []);


  // Shorthand for updating a single field in the edit form
  const upd = (k: string, v: string) => setEditForm(f => ({ ...f, [k]: v }));

  // Toggle a boolean privacy setting on/off
  const togglePrivacy = (k: string) => setPrivacySettings(p => ({ ...p, [k]: !p[k] }));

  const depts = ["Computer Science", "Mathematics", "Physics", "Electrical Engineering", "Mechanical Engineering", "Chemistry", "Economics"];

  const tabs = [
    { id: "view", label: "My Profile" },
    { id: "edit", label: "Edit Profile" },
    { id: "privacy", label: "Privacy Settings" },
  ];


  // Save profile changes to the database — calls PUT /api/users/me with the form data,
  // then updates local state and notifies the parent App so the topbar etc. stays in sync.
  const handleSaveProfile = async () => {
    setEditMsg("");
    setEditError("");

    try {
      const updated = await api.put('/api/users/me', {
        name: editForm.name,
        bio: editForm.bio,
        department: editForm.dept,
        semester: parseInt(editForm.semester) || null,
      });

      setProfile(updated);
      setEditMsg("Profile updated successfully!");

      // Sync the updated user data back to the parent App component
      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          name: updated.name,
          bio: updated.bio,
          department: updated.department,
          semester: updated.semester,
        });
      }
    } catch (err: any) {
      setEditError(err.message || "Failed to update profile");
    }
  };


  // Save privacy settings — calls PUT /api/users/me/privacy with the toggled values.
  const handleSavePrivacy = async () => {
    try {
      await api.put('/api/users/me/privacy', {
        showEmail: privacySettings.showEmail,
        showDept: privacySettings.showDept,
        showSemester: privacySettings.showSemester,
        showRating: privacySettings.showRating,
        allowRequests: privacySettings.allowPartnerRequests,
        visibility: privacySettings.profileVisibility,
      });

      alert("Privacy settings saved!");
    } catch (err: any) {
      alert("Error: " + (err.message || "Failed to save"));
    }
  };


  // Change password — verifies the current password server-side, then hashes and stores the new one.
  // Shows success or error feedback right below the button.
  const handleChangePassword = async () => {
    setPwMsg("");
    setPwError("");

    if (!currentPw || !newPw) {
      setPwError("Please fill in both fields");
      return;
    }

    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }

    try {
      const res = await api.put('/api/auth/change-password', {
        currentPassword: currentPw,
        newPassword: newPw,
      });

      setPwMsg(res.message || "Password updated successfully!");
      setCurrentPw("");
      setNewPw("");
    } catch (err: any) {
      setPwError(err.message || "Failed to change password");
    }
  };


  return (
    <div className="pageAnim" style={{ padding: 28, maxWidth: 720, margin: "0 auto" }}>
      <Tabs tabs={tabs} active={tab} onSelect={setTab} />

      {/* VIEW TAB — shows your profile card with avatar, name, department, rating, and live stats */}
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

          {/* Clickable stat cards showing real data — click to navigate to the respective page */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { label: "Study Partners", value: stats.partners, icon: Users, color: C.cyan, page: "studyPartners" },
              { label: "Study Groups", value: stats.groups, icon: Layers, color: C.purple, page: "studyGroups" },
              { label: "Resources Listed", value: stats.resources, icon: Package, color: C.amber, page: "resources" },
            ].map(s => (
              <div key={s.label}
                onClick={() => onNavigate(s.page)}
                style={{ ...cardStyle({ textAlign: "center", padding: 16 }), cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
              >
                <s.icon size={22} color={s.color} style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 26, fontWeight: 800, color: C.tx, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: C.txM, margin: "4px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT TAB — form fields that actually save to the database when you hit "Save Changes" */}
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
            <button style={{ ...btnP }} onClick={handleSaveProfile}><Check size={15} /> Save Changes</button>
            <button style={{ ...btnS }} onClick={() => setTab("view")}><X size={15} /> Cancel</button>
          </div>

          {editMsg && <div style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "8px 12px", marginTop: 12, color: C.green, fontSize: 13 }}>{editMsg}</div>}
          {editError && <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "8px 12px", marginTop: 12, color: C.red, fontSize: 13 }}>{editError}</div>}
        </div>
      )}

      {/* PRIVACY TAB — toggle switches for profile visibility and a password change form */}
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

            <button style={{ ...btnP, marginTop: 4 }} onClick={handleSavePrivacy}><Check size={15} /> Save Privacy Settings</button>
          </div>

          {/* Password change section — actually wired to the backend now */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.tx, margin: "0 0 6px" }}>Change Password</h3>
            <p style={{ color: C.txM, fontSize: 13, marginBottom: 16 }}>Update your account security credentials.</p>

            <FormField label="Current Password">
              <input type="password" style={{ ...inp, maxWidth: 300 }} placeholder="Current password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
            </FormField>

            <FormField label="New Password">
              <input type="password" style={{ ...inp, maxWidth: 300 }} placeholder="Min 8 characters" value={newPw} onChange={e => setNewPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleChangePassword()} />
            </FormField>

            <button style={{ ...btnP, marginTop: 10 }} onClick={handleChangePassword}><KeyRound size={15} /> Update Password</button>

            {pwMsg && <div style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "8px 12px", marginTop: 12, color: C.green, fontSize: 13 }}>{pwMsg}</div>}
            {pwError && <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "8px 12px", marginTop: 12, color: C.red, fontSize: 13 }}>{pwError}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
