import React, { useState, useEffect } from 'react';
import { Users, Package, Layers, Flag, ChevronRight } from 'lucide-react';
import { C, cardStyle } from '../services/theme';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

interface AdminDashboardPageProps { onNavigate: (page: string) => void; }

export default function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    api.get('/api/admin/dashboard').then(setData).catch(console.error);
  }, []);

  const stats = [
    { label: "Total Users", value: data ? data.totalUsers : "-", icon: Users, color: C.cyan, sub: `${data ? data.activeUsers : "-"} active` },
    { label: "Active Loans", value: data ? data.activeLoans : "-", icon: Package, color: C.amber, sub: `${data ? data.overdueLoans : "-"} overdue` },
    { label: "Study Groups", value: data ? data.totalGroups : "-", icon: Layers, color: C.purple, sub: `${data ? data.totalResources : "-"} listings` },
    { label: "Pending Reports", value: data ? data.pendingReports : "-", icon: Flag, color: C.red, sub: `${data ? data.lostItems : "-"} lost items` },
  ];

  return (
    <div className="pageAnim" style={{ padding: 28 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: C.tx, margin: 0 }}>Admin Dashboard</h1>
        <p style={{ color: C.txM, fontSize: 14, marginTop: 4 }}>Platform health & management overview</p>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={cardStyle()}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.tx, margin: "0 0 16px" }}>Pending Actions</h3>
          {[
            { label: "User reports awaiting review", count: 3, color: C.red, page: "adminReports" },
            { label: "Flagged resource listings", count: 2, color: C.amber, page: "adminResources" },
            { label: "Blocked user appeals", count: 1, color: C.purple, page: "adminUsers" },
          ].map(a => (
            <button key={a.label} onClick={() => onNavigate(a.page)}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.txS, cursor: "pointer", fontSize: 13, marginBottom: 8, textAlign: "left" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{a.label}</span>
              <span style={{ background: `${a.color}22`, color: a.color, borderRadius: 20, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{a.count}</span>
              <ChevronRight size={14} color={C.txM} />
            </button>
          ))}
        </div>
        <div style={cardStyle()}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.tx, margin: "0 0 16px" }}>Platform Stats</h3>
          {[
            { label: "Active Users", value: data ? `${data.activeUsers}` : "-", pct: 100, color: C.green },
            { label: "Resource Utilization", value: data ? `${data.totalResources} listed` : "-", pct: 100, color: C.amber },
            { label: "Group Fill Rate", value: data ? `${data.totalGroups} groups` : "-", pct: 100, color: C.purple },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.txS }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.tx }}>{s.value}</span>
              </div>
              <div style={{ height: 6, background: C.border, borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 3, transition: "width 1s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
