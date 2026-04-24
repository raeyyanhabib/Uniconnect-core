// user management page — admins can search, view, and block/unblock students from here
import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { C, cardStyle, inp, btnG, btnD } from '../services/theme';
import { api } from '../services/api';
import SectionHeader from '../components/SectionHeader';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import type {  User  } from '../types';

interface AdminUsersPageProps { user?: User | null; }

export default function AdminUsersPage({ user: _user }: AdminUsersPageProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  
  useEffect(() => { 
    api.get('/api/admin/users').then(setUsers).catch(console.error); 
  }, []);
  
  const toggleBlock = async (id: string) => {
    try {
      await api.put(`/api/admin/users/${id}/block`);
      setUsers(us => us.map(u => u.id === id ? { ...u, status: u.status === "blocked" ? "active" : "blocked" } : u));
    } catch (err) { console.error(err); }
  };
  
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div className="pageAnim" style={{ padding: 28 }}>
      <SectionHeader title="Manage Users" subtitle="Block, unblock, and monitor student accounts" />
      <div style={{ position: "relative", maxWidth: 400, marginBottom: 20 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.txM }} />
        <input style={{ ...inp, paddingLeft: 34 }} placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={cardStyle({ padding: 0, overflow: "hidden" })}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surface }}>
              {["User", "Department", "Status", "Joined", "Reports", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.txM, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.card : "transparent" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={u.name} size={32} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.tx, margin: 0 }}>{u.name}</p>
                      <p style={{ fontSize: 11, color: C.txM, margin: 0 }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.txS }}>{u.department}</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge status={u.status} /></td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.txM }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ color: C.txM, fontSize: 13 }}>-</span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={() => toggleBlock(u.id)}
                    style={{ ...(u.status === "blocked" ? btnG : btnD), padding: "6px 12px", fontSize: 12 }}>
                    {u.status === "blocked" ? <><UserCheck size={13} /> Unblock</> : <><UserX size={13} /> Block</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
