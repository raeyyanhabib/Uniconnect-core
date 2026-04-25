import { useState, useEffect } from 'react';
import { Flag, Image, Plus, MapPin, Check, MessageSquare } from 'lucide-react';
import { C, cardStyle, inp, btnP, btnS, btnG } from '../services/theme';
import { api } from '../services/api';
import Badge from '../components/Badge';
import StatusBadge from '../components/StatusBadge';
import SectionHeader from '../components/SectionHeader';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import type {  User  } from '../types';

interface LostFoundPageProps { user?: User | null; }

export default function LostFoundPage({ user: _user }: LostFoundPageProps) {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState("Lost");
  const [descInput, setDescInput] = useState("");
  const [locInput, setLocInput] = useState("");

  // polls the lost-found API every 3 seconds so new reports show up in real time
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get('/api/lost-found');
        setItems(res.map((x: any) => ({
          itemId: x.id, type: x.type, description: x.description, location: x.location,
          dateReported: new Date(x.createdAt).toLocaleDateString(), status: x.status, reporter: x.reporterName
        })));
      } catch (err) { console.error(err); }
    };
    fetchItems();
    const interval = setInterval(fetchItems, 3000);
    return () => clearInterval(interval);
  }, []);

  // submits a new lost/found item report to the backend
  const submitReport = async () => {
    if (!descInput || !locInput) return alert("Description and Location are required");
    try {
      await api.post('/api/lost-found', { type: reportType, description: descInput, location: locInput });
      setShowReport(false);
      setDescInput(""); setLocInput("");
    } catch(err) { console.error(err); }
  };

  const resolveItem = async (id: string) => {
    try {
      await api.put(`/api/lost-found/${id}/resolve`);
    } catch(err) { console.error(err); }
  };

  const filtered = items.filter(i => {
    if (filter === "All") return true;
    if (filter === "Lost") return i.type === "Lost";
    if (filter === "Found") return i.type === "Found";
    if (filter === "Open") return i.status === "open";
    return true;
  });
  return (
    <div className="pageAnim" style={{ padding: 28 }}>
      {showReport && (
        <Modal title={`Report ${reportType} Item`} onClose={() => setShowReport(false)}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {["Lost", "Found"].map(t => (
              <button key={t} onClick={() => setReportType(t)}
                style={{ flex: 1, padding: "9px 16px", borderRadius: 8, border: `1px solid ${reportType === t ? C.cyan : C.border}`, background: reportType === t ? `${C.cyan}15` : C.depth, color: reportType === t ? C.cyan : C.txS, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                {t}
              </button>
            ))}
          </div>
          <FormField label="Description">
            <textarea style={{ ...inp, height: 80, resize: "none" }} value={descInput} onChange={e => setDescInput(e.target.value)} placeholder="Describe the item in detail (color, brand, features)…" />
          </FormField>
          <FormField label="Location">
            <input style={inp} value={locInput} onChange={e => setLocInput(e.target.value)} placeholder="Where was it lost/found?" />
          </FormField>
          <FormField label="Upload Image (optional)">
            <div style={{ border: `2px dashed ${C.border}`, borderRadius: 8, padding: "20px 16px", textAlign: "center", background: C.depth, cursor: "pointer" }}>
              <Image size={20} color={C.txM} style={{ marginBottom: 6 }} />
              <p style={{ color: C.txM, fontSize: 12, margin: 0 }}>Click to upload image</p>
            </div>
          </FormField>
          <button onClick={submitReport} style={{ ...btnP, marginTop: 8, width: "100%", justifyContent: "center" }}><Flag size={15} /> Submit Report</button>
        </Modal>
      )}
      <SectionHeader title="Lost & Found" subtitle="Help reunite students with their belongings"
        action={<button onClick={() => setShowReport(true)} style={btnP}><Plus size={16} /> Report Item</button>} />
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["Open", "Lost", "Found", "All"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${filter === f ? C.cyan : C.border}`, background: filter === f ? `${C.cyan}15` : "none", color: filter === f ? C.cyan : C.txS, cursor: "pointer", fontSize: 13, fontWeight: filter === f ? 600 : 400 }}>
            {f}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {filtered.map(item => (
          <div key={item.itemId} className="cardHover" style={{ ...cardStyle(), borderLeft: `3px solid ${item.type === "Lost" ? C.red : C.green}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge label={item.type} color={item.type === "Lost" ? C.red : C.green} />
                <StatusBadge status={item.status} />
              </div>
              <span style={{ fontSize: 11, color: C.txM }}>{item.dateReported}</span>
            </div>
            <p style={{ fontSize: 14, color: C.tx, margin: "0 0 8px", fontWeight: 500, lineHeight: 1.5 }}>{item.description}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <MapPin size={13} color={C.txM} />
              <span style={{ fontSize: 12, color: C.txM }}>{item.location}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.txM }}>Reported by: {item.reporter}</span>
              {item.status === "open" && <div style={{ display: "flex", gap: 8 }}><button onClick={() => resolveItem(item.itemId)} style={{ ...btnG, padding: "5px 12px", fontSize: 12 }}><Check size={13} /> Resolve</button><button style={{ ...btnS, padding: "5px 12px", fontSize: 12 }}><MessageSquare size={13} /> Contact</button></div>}
              {item.status === "resolved" && <Badge label="Reunited ✓" color={C.green} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
