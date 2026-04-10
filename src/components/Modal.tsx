import React from 'react';
import { X } from 'lucide-react';
import { C } from '../services/theme';

interface ModalProps { title: React.ReactNode; onClose: () => void; children: React.ReactNode; width?: number; }

export default function Modal({ title, onClose, children, width = 500 }: ModalProps) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: width }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.tx }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.txS, cursor: "pointer", padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ padding: "16px 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
}
