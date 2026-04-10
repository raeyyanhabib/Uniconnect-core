import React from 'react';
import { C, cardStyle } from '../services/theme';

interface StatCardProps { label: string; value: React.ReactNode; icon: React.ElementType; color?: string; sub?: React.ReactNode; }

export default function StatCard({ label, value, icon: Icon, color = C.cyan, sub }: StatCardProps) {
  return (
    <div style={{ ...cardStyle(), flex: 1, minWidth: 160 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: C.txS, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>{label}</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: C.tx, margin: "6px 0 0" }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: C.txM, margin: "4px 0 0" }}>{sub}</p>}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={22} color={color} />
        </div>
      </div>
    </div>
  );
}
