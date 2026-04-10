import React from 'react';
import { C } from '../services/theme';

interface FormFieldProps { label: React.ReactNode; children: React.ReactNode; }

export default function FormField({ label, children }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.txS, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
