import React from 'react';
import { C } from '../services/theme';

interface BadgeProps { label: React.ReactNode; color?: string; bg?: string; }

export default function Badge({ label, color = C.cyan, bg }: BadgeProps) {
  const bgCol = bg || `${color}22`;
  return (
    <span className="chip" style={{ background: bgCol, color }}>
      {label}
    </span>
  );
}
