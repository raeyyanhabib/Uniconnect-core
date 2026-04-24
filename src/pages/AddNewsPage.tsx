import { useState } from 'react';
import { Newspaper, Upload, Check } from 'lucide-react';
import { C, inp, btnP } from '../services/theme';
import { api } from '../services/api';

interface AddNewsPageProps {
  onNavigate: (page: string) => void;
}

// The Add News page — lets students broadcast announcements to the dashboard.
// On submit it fires a POST to /api/news so the article actually persists.
export default function AddNewsPage({ onNavigate }: AddNewsPageProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    try {
      await api.post('/api/news', { title, content });
      setSubmitted(true);
      setTimeout(() => {
        onNavigate("dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  if (submitted) {
    return (
      <div className="pageAnim" style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80%" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Check size={32} color={C.green} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.tx, margin: "0 0 8px 0" }}>News Posted!</h2>
        <p style={{ color: C.txM, fontSize: 14 }}>Your announcement has been broadcasted to the campus.</p>
      </div>
    );
  }

  return (
    <div className="pageAnim" style={{ padding: 28, maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: C.tx, margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
          <Newspaper size={28} color={C.cyan} /> Add University News
        </h1>
        <p style={{ color: C.txM, fontSize: 14, marginTop: 6 }}>Broadcast an announcement or event to the student dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: C.depth, padding: 28, borderRadius: 16, border: `1px solid ${C.border}` }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.tx, marginBottom: 8 }}>Headline / Title</label>
          <input 
            style={{ ...inp, width: "100%", fontSize: 15 }} 
            placeholder="e.g. Campus Library Extended Hours" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.tx, marginBottom: 8 }}>Content</label>
          <textarea 
            style={{ ...inp, width: "100%", minHeight: 120, resize: "vertical" }} 
            placeholder="What's the full story?" 
            value={content} 
            onChange={e => setContent(e.target.value)} 
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.tx, marginBottom: 8 }}>Attach Picture (Optional)</label>
          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 100, border: `2px dashed ${C.border}`, borderRadius: 12, cursor: "pointer", background: "rgba(255,255,255,0.02)" }}>
            <Upload size={24} color={C.txM} style={{ marginBottom: 8 }} />
            <span style={{ fontSize: 12, color: C.txM, fontWeight: 600 }}>Click to browse or drag image here</span>
            <input type="file" style={{ display: "none" }} accept="image/*" />
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button type="button" onClick={() => onNavigate("dashboard")} style={{ background: "none", border: `1px solid ${C.border}`, color: C.tx, padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            Cancel
          </button>
          <button type="submit" style={{ ...btnP }}>
            Publish News
          </button>
        </div>
      </form>
    </div>
  );
}
