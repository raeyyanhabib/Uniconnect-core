import React from 'react';
import { C } from '../services/theme';

interface SectionHeaderProps { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; }

export default function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.tx, margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ color: C.txS, fontSize: 14, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
