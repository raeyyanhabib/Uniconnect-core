import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, Star, Flag, MessageSquare, Download, Pause, Play, Edit, Trash2, CheckCircle, Image, Check, X } from 'lucide-react';
import { C, cardStyle, inp, btnP, btnS, btnD, btnG } from '../services/theme';
import { api } from '../services/api';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import SectionHeader from '../components/SectionHeader';
import Tabs from '../components/Tabs';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import ResourceCard from '../components/ResourceCard';
import type {  User  } from '../types';

interface ResourcesPageProps { user?: User | null; }

export default function ResourcesPage({ user: _user }: ResourcesPageProps) {
  const [tab, setTab] = useState("browse");
  const [searchQ, setSearchQ] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showHandover, setShowHandover] = useState(false);
  const [showReview, setShowReview] = useState<any | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [newResource, setNewResource] = useState({ title: "", category: "Book", condition: "Good", duration: "7", description: "" });
  const [userRating, setUserRating] = useState(0);

  const [allResources, setAllResources] = useState<any[]>([]);
  const [myResources, setMyResources] = useState<any[]>([]);
  const [borrowReqs, setBorrowReqs] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = [];
        if (catFilter !== "All") queryParams.push(`category=${catFilter}`);
        if (searchQ) queryParams.push(`q=${searchQ}`);
        const qs = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

        const [resRes, mineRes, reqsRes, histRes] = await Promise.all([
          api.get(`/api/resources${qs}`),
          api.get('/api/resources/mine'),
          api.get('/api/resources/borrow-requests'),
          api.get('/api/resources/history')
        ]);
        setAllResources(resRes.map((r: any) => ({ ...r, resourceId: r.id })));
        setMyResources(mineRes.map((r: any) => ({ ...r, resourceId: r.id })));
        setBorrowReqs(reqsRes.map((r: any) => ({ ...r, requestId: r.id, resource: { title: r.resourceTitle }, requester: { name: r.requesterName }, requestedDuration: r.duration, requestDate: new Date(r.createdAt).toLocaleDateString() })));
        setHistory(histRes.map((h: any) => ({ ...h, transactionId: h.id, startDate: new Date(h.startDate).toLocaleDateString(), returnDate: h.returnDate ? new Date(h.returnDate).toLocaleDateString() : null })));
      } catch (err) { console.error(err); }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [catFilter, searchQ, tab]);

  const cats = ["All", "Book", "Equipment", "Notes"];

  const toggleStatus = async (id: string) => {
    try {
      await api.patch(`/api/resources/${id}/toggle`, {});
      setMyResources(rs => rs.map(r => r.resourceId === id ? { ...r, status: r.status === "paused" ? "available" : "paused" } : r));
    } catch(err) { console.error(err); }
  };

  const removeResource = async (id: string) => {
    try {
      await api.delete(`/api/resources/${id}`);
      setMyResources(rs => rs.filter(r => r.resourceId !== id));
    } catch(err) { console.error(err); }
  };

  const submitPosting = async () => {
    if (!newResource.title) return alert("Title is required");
    try {
      await api.post('/api/resources', { 
        title: newResource.title, category: newResource.category, 
        condition: newResource.condition, maxDays: parseInt(newResource.duration, 10), 
        description: newResource.description 
      });
      setTab("myListings");
      setNewResource({ title: "", category: "Book", condition: "Good", duration: "7", description: "" });
    } catch (err) { console.error(err); }
  };

  const tabs = [
    { id: "browse", label: "Browse" },
    { id: "post", label: "Post Resource" },
    { id: "myListings", label: "My Listings", count: myResources.length },
    { id: "borrowRequests", label: "Borrow Requests", count: borrowReqs.filter(b => b.status === "pending").length },
    { id: "history", label: "Lending History" },
  ];
  return (
    <div className="pageAnim" style={{ padding: 28 }}>
      {showHandover && (
        <Modal title="Schedule Campus Handover" onClose={() => setShowHandover(false)}>
          <FormField label="Meeting Location">
            <input style={inp} defaultValue="Library Main Entrance" />
          </FormField>
          <FormField label="Date">
            <input type="date" style={inp} defaultValue="2024-03-13" />
          </FormField>
          <FormField label="Time">
            <input type="time" style={inp} defaultValue="14:00" />
          </FormField>
          <FormField label="Notes (optional)">
            <input style={inp} placeholder="Any special instructions?" />
          </FormField>
          <button onClick={() => setShowHandover(false)} style={{ ...btnP, marginTop: 8, width: "100%", justifyContent: "center" }}><Calendar size={15} /> Confirm Handover</button>
        </Modal>
      )}
      {showReview && (
        <Modal title="Rate & Review User" onClose={() => setShowReview(null)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <Avatar name={showReview.borrowerName} size={44} />
            <div>
              <p style={{ fontWeight: 700, color: C.tx, margin: 0 }}>{showReview.borrowerName}</p>
              <p style={{ fontSize: 12, color: C.txM, margin: "3px 0 0" }}>Returned: {showReview.resourceTitle}</p>
            </div>
          </div>
          <FormField label="Rating">
            <div style={{ display: "flex", gap: 8 }}>
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setUserRating(i)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <Star size={28} fill={i <= userRating ? C.amber : "none"} color={i <= userRating ? C.amber : C.txM} />
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Comment">
            <textarea style={{ ...inp, height: 80, resize: "none" }} placeholder="How was the experience?" />
          </FormField>
          <button onClick={() => setShowReview(null)} style={{ ...btnP, marginTop: 8, width: "100%", justifyContent: "center" }}><Star size={15} /> Submit Review</button>
        </Modal>
      )}
      {showReport && (
        <Modal title="Report Overdue / Damaged Item" onClose={() => setShowReport(false)}>
          <div style={{ padding: "12px 14px", background: `${C.red}12`, border: `1px solid ${C.red}33`, borderRadius: 8, marginBottom: 16 }}>
            <p style={{ color: C.red, fontSize: 13, margin: 0 }}>⚠ Filing a dispute will notify the admin team and the borrower.</p>
          </div>
          <FormField label="Issue Type">
            <select style={{ ...inp, appearance: "none" }}>
              <option>Item returned damaged</option>
              <option>Item not returned (overdue)</option>
              <option>Wrong item returned</option>
              <option>Other</option>
            </select>
          </FormField>
          <FormField label="Description">
            <textarea style={{ ...inp, height: 80, resize: "none" }} placeholder="Describe the issue in detail…" />
          </FormField>
          <button onClick={() => setShowReport(false)} style={{ ...btnD, marginTop: 8, width: "100%", justifyContent: "center" }}><Flag size={15} /> Submit Dispute</button>
        </Modal>
      )}
      <SectionHeader title="Resources" subtitle="Lend and borrow campus resources" />
      <Tabs tabs={tabs} active={tab} onSelect={setTab} />
      {tab === "browse" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.txM }} />
              <input style={{ ...inp, paddingLeft: 36 }} placeholder="Search resources…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
            <select style={{ ...inp, width: 150, appearance: "none" }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {allResources.map(r => (
              <ResourceCard key={r.resourceId} resource={r} actionEl={
                <div style={{ display: "flex", gap: 8 }}>
                  {r.status === "available" && <button onClick={async () => {
                    try {
                      await api.post(`/api/resources/${r.resourceId}/borrow`, {});
                      alert("Borrow request sent!");
                    } catch(err: any) { alert("Error: " + err.message); }
                  }} style={{ ...btnP, padding: "7px 14px", fontSize: 12 }}><Download size={14} /> Request Borrow</button>}
                  <button style={{ ...btnS, padding: "7px 12px", fontSize: 12 }}><MessageSquare size={14} /> Contact</button>
                </div>
              } />
            ))}
          </div>
        </div>
      )}
      {tab === "post" && (
        <div style={{ maxWidth: 540 }}>
          <div style={cardStyle()}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.tx, margin: "0 0 20px" }}>Post Resource for Lending</h3>
            <FormField label="Title">
              <input style={inp} value={newResource.title} onChange={e => setNewResource(r => ({ ...r, title: e.target.value }))} placeholder="e.g. Introduction to Algorithms 4th ed." />
            </FormField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FormField label="Category">
                <select style={{ ...inp, appearance: "none" }} value={newResource.category} onChange={e => setNewResource(r => ({ ...r, category: e.target.value }))}>
                  {["Book", "Equipment", "Notes", "Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Condition">
                <select style={{ ...inp, appearance: "none" }} value={newResource.condition} onChange={e => setNewResource(r => ({ ...r, condition: e.target.value }))}>
                  {["Excellent", "Good", "Fair", "Poor"].map(c => <option key={c}>{c}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Max Borrow Duration (days)">
              <input type="number" style={inp} value={newResource.duration} onChange={e => setNewResource(r => ({ ...r, duration: e.target.value }))} min="1" max="30" />
            </FormField>
            <FormField label="Description">
              <textarea style={{ ...inp, height: 80, resize: "none" }} value={newResource.description} onChange={e => setNewResource(r => ({ ...r, description: e.target.value }))} placeholder="Describe the item…" />
            </FormField>
            <FormField label="Upload Image (optional)">
              <div style={{ border: `2px dashed ${C.border}`, borderRadius: 8, padding: "24px 16px", textAlign: "center", background: C.depth, cursor: "pointer" }}>
                <Image size={24} color={C.txM} style={{ marginBottom: 8 }} />
                <p style={{ color: C.txM, fontSize: 13, margin: 0 }}>Click or drag to upload an image</p>
              </div>
            </FormField>
            <button onClick={submitPosting} style={{ ...btnP, marginTop: 4 }}><Plus size={16} /> Post Listing</button>
          </div>
        </div>
      )}
      {tab === "myListings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myResources.map(r => (
            <div key={r.resourceId} style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontWeight: 700, color: C.tx, margin: 0 }}>{r.title}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <Badge label={r.category} color={C.cyan} />
                    <StatusBadge status={r.status} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => toggleStatus(r.resourceId)} style={{ ...btnS, padding: "6px 12px", fontSize: 12 }}>
                    {r.status === "paused" ? <><Play size={13} /> Resume</> : <><Pause size={13} /> Pause</>}
                  </button>
                  <button style={{ ...btnS, padding: "6px 10px", fontSize: 12 }}><Edit size={13} /></button>
                  <button onClick={() => removeResource(r.resourceId)} style={{ ...btnD, padding: "6px 10px", fontSize: 12 }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "borrowRequests" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {borrowReqs.map(req => (
            <div key={req.requestId} style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontWeight: 700, color: C.tx, margin: "0 0 4px" }}>{req.resource.title}</p>
                  <p style={{ fontSize: 13, color: C.txS, margin: 0 }}>Requested by <strong>{req.requester.name}</strong> · {req.requestedDuration} days · {req.requestDate}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
              {req.status === "pending" && (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={async () => {
                    try {
                      await api.put(`/api/resources/borrow-requests/${req.requestId}`, { action: "approve" });
                      setBorrowReqs(rs => rs.map(r => r.requestId === req.requestId ? { ...r, status: "approved" } : r));
                    } catch(err) { console.error(err); }
                  }} style={btnG}><Check size={14} /> Approve</button>
                  <button onClick={async () => {
                    try {
                      await api.put(`/api/resources/borrow-requests/${req.requestId}`, { action: "reject" });
                      setBorrowReqs(rs => rs.map(r => r.requestId === req.requestId ? { ...r, status: "rejected" } : r));
                    } catch(err) { console.error(err); }
                  }} style={btnD}><X size={14} /> Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {tab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {history.map(h => (
            <div key={h.transactionId} style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontWeight: 700, color: C.tx, margin: "0 0 4px" }}>{h.resourceTitle}</p>
                  <p style={{ fontSize: 13, color: C.txS, margin: "0 0 6px" }}>Borrowed by <strong>{h.borrowerName}</strong></p>
                  <p style={{ fontSize: 12, color: C.txM, margin: 0 }}>
                    {h.startDate} → {h.returnDate || "Not returned"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StatusBadge status={h.status} />
                  {h.rating && <div style={{ marginTop: 8 }}><StarRating rating={h.rating} /></div>}
                </div>
              </div>
              {h.status === "active" && _user?.userId === h.ownerId && (
                <div style={{ marginTop: 12 }}>
                  <button onClick={async () => {
                     try {
                       await api.put(`/api/resources/transactions/${h.transactionId}/return`, {});
                     } catch(err) { console.error(err); }
                  }} style={{ ...btnG, padding: "7px 14px", fontSize: 12 }}><CheckCircle size={14} /> Mark Returned</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
