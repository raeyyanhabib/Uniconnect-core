import React from 'react';
import { C } from '../services/theme';

interface EmptyStateProps { icon: React.ElementType; title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; }

export default function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.txM }}>
      <Icon size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
      <p style={{ fontSize: 18, fontWeight: 700, color: C.txS, margin: 0 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 14, margin: "8px 0 20px" }}>{subtitle}</p>}
      {action}
    </div>
  );
}
