import { useState, useEffect } from 'react';
import { Search, Plus, Calendar, Star, Flag, MessageSquare, Download, Pause, Play, Edit, Trash2, CheckCircle, Image, Check, X, RotateCcw, Package, ArrowRight, Clock } from 'lucide-react';
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
  const [showHandover, setShowHandover] = useState<any | null>(null);
  const [showReview, setShowReview] = useState<any | null>(null);
  const [showReport, setShowReport] = useState<any | null>(null);
  const [newResource, setNewResource] = useState({ title: "", category: "Book", condition: "Good", duration: "7", description: "" });
  const [userRating, setUserRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [handoverForm, setHandoverForm] = useState({ location: "Library Main Entrance", date: "", time: "14:00", notes: "" });
  const [reportForm, setReportForm] = useState({ type: "Item returned damaged", description: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [allResources, setAllResources] = useState<any[]>([]);
  const [myResources, setMyResources] = useState<any[]>([]);
  const [borrowReqs, setBorrowReqs] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  
  // pulls all resource data in one shot — browse list, my listings, borrow requests, and history
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
        setHistory(histRes.map((h: any) => ({ ...h, transactionId: h.id, startDate: new Date(h.startDate).toLocaleDateString(), rawDueDate: h.dueDate, dueDate: h.dueDate ? new Date(h.dueDate).toLocaleDateString() : null, returnDate: h.returnDate ? new Date(h.returnDate).toLocaleDateString() : null })));
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

  // posts a new resource listing to the marketplace — validates title then flips to My Listings tab
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

  // --- Transaction action handlers ---
  const confirmReceipt = async (txId: string) => {
    setActionLoading(txId);
    try {
      await api.put(`/api/resources/transactions/${txId}/receipt`, {});
      setHistory(hs => hs.map(h => h.transactionId === txId ? { ...h, status: 'active' } : h));
    } catch (err) { console.error(err); }
    setActionLoading(null);
  };

  const initiateReturn = async (txId: string) => {
    setActionLoading(txId);
    try {
      await api.put(`/api/resources/transactions/${txId}/return`, {});
      setHistory(hs => hs.map(h => h.transactionId === txId ? { ...h, status: 'returned', returnDate: new Date().toLocaleDateString() } : h));
    } catch (err) { console.error(err); }
    setActionLoading(null);
  };

  const confirmReturn = async (txId: string) => {
    setActionLoading(txId);
    try {
      await api.put(`/api/resources/transactions/${txId}/return`, {});
      setHistory(hs => hs.map(h => h.transactionId === txId ? { ...h, status: 'returned', returnDate: new Date().toLocaleDateString() } : h));
    } catch (err) { console.error(err); }
    setActionLoading(null);
  };

  const submitReview = async () => {
    if (!showReview || userRating === 0) return;
    try {
      await api.post(`/api/resources/transactions/${showReview.transactionId}/review`, {
        rating: userRating,
        review: reviewComment || null
      });
      setHistory(hs => hs.map(h => h.transactionId === showReview.transactionId ? { ...h, rating: userRating, review: reviewComment } : h));
      setShowReview(null);
      setUserRating(0);
      setReviewComment("");
    } catch (err) { console.error(err); }
  };

  const submitHandover = async () => {
    if (!showHandover) return;
    try {
      await api.put(`/api/resources/borrow-requests/${showHandover.requestId}/handover`, {
        location: handoverForm.location,
        date: `${handoverForm.date}T${handoverForm.time}`
      });
      setShowHandover(null);
      setHandoverForm({ location: "Library Main Entrance", date: "", time: "14:00", notes: "" });
    } catch (err) { console.error(err); }
  };

  const submitReport = async () => {
    if (!showReport) return;
    try {
      await api.post(`/api/resources/transactions/${showReport.transactionId}/dispute`, {
        type: reportForm.type,
        description: reportForm.description
      });
      setShowReport(null);
      setReportForm({ type: "Item returned damaged", description: "" });
    } catch (err) { console.error(err); }
  };

  // Helpers
  const isOverdue = (rawDueDate: string | null) => {
    if (!rawDueDate) return false;
    return new Date(rawDueDate) < new Date();
  };

  const daysUntilDue = (rawDueDate: string | null) => {
    if (!rawDueDate) return null;
    const diff = Math.ceil((new Date(rawDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isOwner = (h: any) => _user?.userId === h.ownerId;
  const isBorrower = (h: any) => _user?.userId === h.borrowerId;

  const activeTransactions = history.filter(h => h.status === 'active');

  const tabs = [
    { id: "browse", label: "Browse" },
    { id: "post", label: "Post Resource" },
    { id: "myListings", label: "My Listings", count: myResources.length },
    { id: "borrowRequests", label: "Borrow Requests", count: borrowReqs.filter(b => b.status === "pending").length },
    { id: "transactions", label: "Transactions", count: activeTransactions.length },
    { id: "history", label: "History" },
  ];
  return (
    <div className="pageAnim" style={{ padding: 28 }}>
      {/* Schedule Handover Modal */}
      {showHandover && (
        <Modal title="Schedule Campus Handover" onClose={() => setShowHandover(null)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 14px", background: `${C.cyan}10`, border: `1px solid ${C.cyan}25`, borderRadius: 10 }}>
            <Package size={18} color={C.cyan} />
            <div>
              <p style={{ fontWeight: 700, color: C.tx, margin: 0, fontSize: 13 }}>{showHandover.resourceTitle}</p>
              <p style={{ fontSize: 12, color: C.txM, margin: "2px 0 0" }}>Arrange a meet-up to hand over this item</p>
            </div>
          </div>
          <FormField label="Meeting Location">
            <input style={inp} value={handoverForm.location} onChange={e => setHandoverForm(f => ({ ...f, location: e.target.value }))} />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Date">
              <input type="date" style={inp} value={handoverForm.date} onChange={e => setHandoverForm(f => ({ ...f, date: e.target.value }))} />
            </FormField>
            <FormField label="Time">
              <input type="time" style={inp} value={handoverForm.time} onChange={e => setHandoverForm(f => ({ ...f, time: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Notes (optional)">
            <input style={inp} value={handoverForm.notes} onChange={e => setHandoverForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special instructions?" />
          </FormField>
          <button onClick={submitHandover} style={{ ...btnP, marginTop: 8, width: "100%", justifyContent: "center" }}><Calendar size={15} /> Confirm Handover</button>
        </Modal>
      )}

      {/* Rate & Review Modal */}
      {showReview && (
        <Modal title="Rate & Review" onClose={() => { setShowReview(null); setUserRating(0); setReviewComment(""); }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <Avatar name={showReview.borrowerName || showReview.ownerName} size={44} />
            <div>
              <p style={{ fontWeight: 700, color: C.tx, margin: 0 }}>{showReview.borrowerName || showReview.ownerName}</p>
              <p style={{ fontSize: 12, color: C.txM, margin: "3px 0 0" }}>Transaction: {showReview.resourceTitle}</p>
            </div>
          </div>
          <FormField label="Rating">
            <div style={{ display: "flex", gap: 8 }}>
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setUserRating(i)} style={{ background: "none", border: "none", cursor: "pointer", transition: "transform 0.15s", transform: i <= userRating ? "scale(1.15)" : "scale(1)" }}>
                  <Star size={28} fill={i <= userRating ? C.amber : "none"} color={i <= userRating ? C.amber : C.txM} />
                </button>
              ))}
            </div>
            {userRating > 0 && <p style={{ fontSize: 12, color: C.txM, margin: "8px 0 0" }}>{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][userRating]}</p>}
          </FormField>
          <FormField label="Comment (optional)">
            <textarea style={{ ...inp, height: 80, resize: "none" }} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="How was the experience?" />
          </FormField>
          <button onClick={submitReview} disabled={userRating === 0} style={{ ...btnP, marginTop: 8, width: "100%", justifyContent: "center", opacity: userRating === 0 ? 0.5 : 1 }}><Star size={15} /> Submit Review</button>
        </Modal>
      )}

      {/* Report Dispute Modal */}
      {showReport && (
        <Modal title="Report Overdue / Damaged Item" onClose={() => setShowReport(null)}>
          <div style={{ padding: "12px 14px", background: `${C.red}12`, border: `1px solid ${C.red}33`, borderRadius: 8, marginBottom: 16 }}>
            <p style={{ color: C.red, fontSize: 13, margin: 0 }}>⚠ Filing a dispute will notify the admin team and the borrower.</p>
          </div>
          <p style={{ fontSize: 13, color: C.txM, margin: "0 0 16px" }}>Item: <strong style={{ color: C.tx }}>{showReport.resourceTitle}</strong></p>
          <FormField label="Issue Type">
            <select style={{ ...inp, appearance: "none" }} value={reportForm.type} onChange={e => setReportForm(f => ({ ...f, type: e.target.value }))}>
              <option>Item returned damaged</option>
              <option>Item not returned (overdue)</option>
              <option>Wrong item returned</option>
              <option>Other</option>
            </select>
          </FormField>
          <FormField label="Description">
            <textarea style={{ ...inp, height: 80, resize: "none" }} value={reportForm.description} onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the issue in detail…" />
          </FormField>
          <button onClick={submitReport} style={{ ...btnD, marginTop: 8, width: "100%", justifyContent: "center" }}><Flag size={15} /> Submit Dispute</button>
        </Modal>
      )}

      <SectionHeader title="Resources" subtitle="Lend and borrow campus resources" />
      <Tabs tabs={tabs} active={tab} onSelect={setTab} />

      {/* ===== Browse Tab ===== */}
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

      {/* ===== Post Resource Tab ===== */}
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

      {/* ===== My Listings Tab ===== */}
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

      {/* ===== Borrow Requests Tab ===== */}
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
              {req.status === "approved" && (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => setShowHandover(req)} style={{ ...btnP, padding: "7px 14px", fontSize: 12 }}><Calendar size={14} /> Schedule Handover</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== Active Transactions Tab ===== */}
      {tab === "transactions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {activeTransactions.length === 0 && (
            <div style={{ ...cardStyle(), textAlign: "center", padding: "48px 24px" }}>
              <Package size={40} color={C.txM} style={{ marginBottom: 12 }} />
              <p style={{ color: C.txM, fontSize: 14, margin: 0 }}>No active transactions right now.</p>
              <p style={{ color: C.txM, fontSize: 12, margin: "6px 0 0" }}>When you borrow or lend items, they'll appear here.</p>
            </div>
          )}

          {activeTransactions.map(h => {
            const ownerRole = isOwner(h);
            const borrowerRole = isBorrower(h);
            const overdue = isOverdue(h.rawDueDate);
            const daysLeft = daysUntilDue(h.rawDueDate);

            return (
              <div key={h.transactionId} style={{
                ...cardStyle(),
                borderLeft: overdue ? `3px solid ${C.red}` : `3px solid ${C.green}`,
                position: "relative",
                overflow: "hidden"
              }}>
                {/* Role badge */}
                <div style={{ position: "absolute", top: 12, right: 16 }}>
                  <span style={{
                    background: ownerRole ? `${C.purple}20` : `${C.cyan}20`,
                    color: ownerRole ? C.purple : C.cyan,
                    border: `1px solid ${ownerRole ? C.purple : C.cyan}30`,
                    borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 0.5
                  }}>
                    {ownerRole ? "Owner" : "Borrower"}
                  </span>
                </div>

                {/* Item info */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.cyan}20, ${C.purple}20)`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <Package size={20} color={C.cyanLt} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: C.tx, margin: 0, fontSize: 15 }}>{h.resourceTitle}</p>
                    <p style={{ fontSize: 13, color: C.txS, margin: "4px 0 0" }}>
                      {ownerRole ? <>Lent to <strong>{h.borrowerName}</strong></> : <>Borrowed from <strong>{h.ownerName}</strong></>}
                    </p>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <Badge label={h.category || "Item"} color={C.cyan} />
                    </div>
                  </div>
                </div>

                {/* Timeline bar */}
                <div style={{
                  background: C.depth, borderRadius: 10, padding: "12px 16px", marginBottom: 16,
                  border: `1px solid ${C.border}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 10, color: C.txM, margin: 0, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>Borrowed</p>
                      <p style={{ fontSize: 13, color: C.tx, margin: "4px 0 0", fontWeight: 600 }}>{h.startDate}</p>
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 2, background: C.border, borderRadius: 2, position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, height: 2, borderRadius: 2,
                          width: daysLeft !== null && daysLeft > 0 ? `${Math.max(10, 100 - (daysLeft / 14 * 100))}%` : "100%",
                          background: overdue ? C.red : C.green, transition: "width 0.3s"
                        }} />
                      </div>
                      <ArrowRight size={14} color={C.txM} />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 10, color: C.txM, margin: 0, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>Due</p>
                      <p style={{ fontSize: 13, color: overdue ? C.red : C.tx, margin: "4px 0 0", fontWeight: 600 }}>{h.dueDate || "—"}</p>
                    </div>
                  </div>

                  {daysLeft !== null && (
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                      <Clock size={12} color={overdue ? C.red : C.amber} />
                      <p style={{ fontSize: 12, color: overdue ? C.red : C.amber, margin: 0, fontWeight: 600 }}>
                        {overdue ? `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? "s" : ""}` : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {/* Borrower actions */}
                  {borrowerRole && h.status === "active" && (
                    <>
                      <button onClick={() => confirmReceipt(h.transactionId)} disabled={actionLoading === h.transactionId}
                        style={{ ...btnG, padding: "8px 16px", fontSize: 12, opacity: actionLoading === h.transactionId ? 0.6 : 1 }}>
                        <CheckCircle size={14} /> Confirm Receipt
                      </button>
                      <button onClick={() => initiateReturn(h.transactionId)} disabled={actionLoading === h.transactionId}
                        style={{ ...btnP, padding: "8px 16px", fontSize: 12, opacity: actionLoading === h.transactionId ? 0.6 : 1 }}>
                        <RotateCcw size={14} /> Initiate Return
                      </button>
                    </>
                  )}

                  {/* Owner actions */}
                  {ownerRole && h.status === "active" && (
                    <>
                      <button onClick={() => confirmReturn(h.transactionId)} disabled={actionLoading === h.transactionId}
                        style={{ ...btnG, padding: "8px 16px", fontSize: 12, opacity: actionLoading === h.transactionId ? 0.6 : 1 }}>
                        <CheckCircle size={14} /> Confirm Return
                      </button>
                      <button onClick={() => setShowHandover({ ...h, requestId: h.transactionId })}
                        style={{ ...btnS, padding: "8px 16px", fontSize: 12 }}>
                        <Calendar size={14} /> Schedule Pickup
                      </button>
                      {overdue && (
                        <button onClick={() => setShowReport(h)}
                          style={{ ...btnD, padding: "8px 16px", fontSize: 12 }}>
                          <Flag size={14} /> Report Issue
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Completed History Tab ===== */}
      {tab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {history.filter(h => h.status === 'returned').length === 0 && history.filter(h => h.status !== 'active').length === 0 && (
            <div style={{ ...cardStyle(), textAlign: "center", padding: "48px 24px" }}>
              <RotateCcw size={40} color={C.txM} style={{ marginBottom: 12 }} />
              <p style={{ color: C.txM, fontSize: 14, margin: 0 }}>No completed transactions yet.</p>
            </div>
          )}
          {history.filter(h => h.status !== 'active').map(h => (
            <div key={h.transactionId} style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: h.status === "returned" ? `${C.green}15` : `${C.amber}15`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {h.status === "returned" ? <CheckCircle size={18} color={C.green} /> : <Clock size={18} color={C.amber} />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: C.tx, margin: "0 0 4px" }}>{h.resourceTitle}</p>
                    <p style={{ fontSize: 13, color: C.txS, margin: "0 0 4px" }}>
                      {isOwner(h) ? <>Lent to <strong>{h.borrowerName}</strong></> : <>Borrowed from <strong>{h.ownerName}</strong></>}
                    </p>
                    <p style={{ fontSize: 12, color: C.txM, margin: 0 }}>
                      {h.startDate} → {h.returnDate || "Not returned"}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StatusBadge status={h.status} />
                  {h.rating && <div style={{ marginTop: 8 }}><StarRating rating={h.rating} /></div>}
                </div>
              </div>

              {/* Review / Rate button for completed transactions without a rating */}
              {h.status === "returned" && !h.rating && isOwner(h) && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
                  <button onClick={() => setShowReview(h)}
                    style={{ ...btnP, padding: "8px 16px", fontSize: 12 }}>
                    <Star size={14} /> Rate & Review
                  </button>
                  <button onClick={() => setShowReport(h)}
                    style={{ ...btnD, padding: "8px 16px", fontSize: 12 }}>
                    <Flag size={14} /> Report Issue
                  </button>
                </div>
              )}

              {/* Show existing review */}
              {h.review && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: C.depth, borderRadius: 8, border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 12, color: C.txM, margin: 0 }}>"{h.review}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
