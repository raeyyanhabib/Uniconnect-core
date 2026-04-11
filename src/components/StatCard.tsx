import React from 'react';
import { C, cardStyle } from '../services/theme';


// Props for the StatCard — renders a labeled metric with an icon.
// The optional onClick makes it clickable for navigation (e.g. dashboard cards).
interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  color?: string;
  sub?: React.ReactNode;
  onClick?: () => void;
}


// A reusable stat card component used on the Dashboard and Profile pages.
// Shows a label, big number, icon, and optional subtitle.
// If onClick is provided, it becomes a clickable card with a hover effect.

export default function StatCard({ label, value, icon: Icon, color = C.cyan, sub, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        ...cardStyle(),
        flex: 1,
        minWidth: 160,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => { if (onClick) { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)"; }}}
      onMouseLeave={e => { if (onClick) { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}}
    >
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
