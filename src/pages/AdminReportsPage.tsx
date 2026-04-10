import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, Flag } from 'lucide-react';
import { C, cardStyle, btnG, btnS, btnD } from '../services/theme';
import { api } from '../services/api';
import SectionHeader from '../components/SectionHeader';
import Badge from '../components/Badge';
import StatusBadge from '../components/StatusBadge';
import type {  User  } from '../types';

interface AdminReportsPageProps { user?: User | null; }

export default function AdminReportsPage({ user: _user }: AdminReportsPageProps) {
  const [reports, setReports] = useState<any[]>([]);
  
  useEffect(() => { 
    api.get('/api/admin/reports').then(setReports).catch(console.error); 
  }, []);
  
  const updateStatus = async (id: string, s: string) => {
    try {
      await api.put(`/api/admin/reports/${id}`, { status: s });
      setReports(rs => rs.map(x => x.id === id ? { ...x, status: s } : x));
    } catch(err) { console.error(err); }
  };

  return (
    <div className="pageAnim" style={{ padding: 28 }}>
      <SectionHeader title="Platform Reports" subtitle="Review and resolve user-submitted reports" />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {reports.map(r => (
          <div key={r.id} style={cardStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <Badge label={r.type} color={C.cyan} />
                  <StatusBadge status={r.status} />
                </div>
                <p style={{ fontWeight: 600, color: C.tx, margin: "0 0 4px" }}>{r.description}</p>
                <p style={{ fontSize: 13, color: C.txS, margin: 0 }}>
                  Reported: <strong>{r.reportedName}</strong> · By: {r.reporterName} · {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {r.status !== "resolved" && (
              <div style={{ display: "flex", gap: 8 }}>
                {r.status === "pending" && (
                  <button onClick={() => updateStatus(r.id, "investigating")}
                    style={btnS}><Activity size={14} /> Start Investigation</button>
                )}
                <button onClick={() => updateStatus(r.id, "resolved")}
                  style={btnG}><CheckCircle size={14} /> Mark Resolved</button>
                <button onClick={() => updateStatus(r.id, "escalated")} style={btnD}><Flag size={14} /> Escalate</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
