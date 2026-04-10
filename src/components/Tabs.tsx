import React from 'react';
import { C } from '../services/theme';

export interface TabData { id: string; label: string; icon?: React.ReactNode; count?: number; }
interface TabsProps { tabs: TabData[]; active: string; onSelect: (id: string) => void; }

export default function Tabs({ tabs, active, onSelect }: TabsProps) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
      {tabs.map(t => (
        <button key={t.id} className={`tabBtn${active === t.id ? " tabActive" : ""}`}
          onClick={() => onSelect(t.id)}
          style={{ background: "none", border: "none", borderBottom: active === t.id ? `2px solid ${C.cyan}` : "2px solid transparent",
            color: active === t.id ? C.cyanLt : C.txS, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: -1 }}>
          {t.icon && <span style={{ marginRight: 6 }}>{t.icon}</span>}
          {t.label}
          {t.count !== undefined && (
            <span style={{ marginLeft: 8, background: active === t.id ? C.cyan : C.border, borderRadius: 20, padding: "1px 7px", fontSize: 11, color: active === t.id ? "#fff" : C.txS }}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
