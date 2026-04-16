import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { C, cardStyle, btnD } from '../services/theme';
import { api } from '../services/api';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import type {  User  } from '../types';

interface AdminResourcesPageProps { user?: User | null; }

export default function AdminResourcesPage({ user: _user }: AdminResourcesPageProps) {
  const [res, setRes] = useState<any[]>([]);
  
  useEffect(() => { 
    api.get('/api/admin/resources').then(setRes).catch(console.error); 
  }, []);
  
  const removeItem = async (id: string) => {
    try {
      await api.delete(`/api/admin/resources/${id}`);
      setRes(rs => rs.filter(r => r.id !== id));
    } catch(err) { console.error(err); }
  };

  return (
    <div className="pageAnim" style={{ padding: 28 }}>
      <SectionHeader title="Resource Listings" subtitle="Moderate and manage platform resource listings" />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {res.map(r => (
          <div key={r.id} style={{ ...cardStyle(), borderLeft: `3px solid ${r.reportCount > 0 ? C.red : C.green}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <p style={{ fontWeight: 700, color: C.tx, margin: 0 }}>{r.title}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p style={{ fontSize: 13, color: C.txS, margin: 0 }}>by {r.ownerName} · {r.category}</p>
                {r.reportCount > 0 && <p style={{ fontSize: 12, color: C.red, margin: "6px 0 0" }}>⚑ Reported {r.reportCount} times</p>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => removeItem(r.id)} style={btnD}><Trash2 size={14} /> Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
