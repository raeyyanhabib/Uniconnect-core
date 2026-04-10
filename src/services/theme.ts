import React from "react";

export const C = {
  base: "#0F172A", depth: "#0B1120", surface: "#1E293B",
  card: "#1E293B", cardAlt: "#334155",
  border: "rgba(255,255,255,0.08)", borderLight: "rgba(255,255,255,0.12)",
  cyan: "#3B82F6", cyanLt: "#60A5FA", cyanDk: "#2563EB",
  amber: "#F59E0B", amberLt: "#FCD34D",
  green: "#10B981", red: "#EF4444", purple: "#6366F1", pink: "#EC4899",
  tx: "#F8FAFC", txS: "#E2E8F0", txM: "#94A3B8",
};

export const inp: React.CSSProperties = {
  width: "100%", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px", padding: "12px 16px", color: C.tx, fontSize: "14px", outline: "none", transition: "border 0.2s ease"
};

export const btnP: React.CSSProperties = {
  background: C.cyan, color: "#fff",
  border: "none", borderRadius: "12px", padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px",
  fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 10px rgba(59,130,246,0.3)", transition: "all 0.2s ease"
};

export const btnS: React.CSSProperties = {
  background: "transparent", color: C.txS, border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "12px", padding: "10px 20px", fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s ease"
};

export const btnD: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)", color: C.red, border: "1px solid rgba(239,68,68,0.2)",
  borderRadius: "12px", padding: "8px 14px", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s ease"
};

export const btnG: React.CSSProperties = {
  background: "rgba(16,185,129,0.1)", color: C.green, border: "1px solid rgba(16,185,129,0.2)",
  borderRadius: "12px", padding: "8px 14px", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s ease"
};

export function cardStyle(extra: React.CSSProperties = {}): React.CSSProperties {
  return { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, ...extra };
}
