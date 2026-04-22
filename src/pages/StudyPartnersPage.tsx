import { useState, useEffect } from 'react';
import { Search, UserPlus, Users, Check, X, MessageSquare, UserMinus } from 'lucide-react';
import { C, cardStyle, inp, btnP, btnG, btnD } from '../services/theme';
import { api } from '../services/api';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import StarRating from '../components/StarRating';
import SectionHeader from '../components/SectionHeader';
import Tabs from '../components/Tabs';
import EmptyState from '../components/EmptyState';
import StudentCard from '../components/StudentCard';
import type { User } from '../types';


// The Study Partners page — lets students search for new partners, view incoming
// requests, and manage their existing partner list. The "Message" button on each
// partner now navigates directly to a DM with that specific person.

interface Student extends User {
  id: string; // The API returns id, we'll map it to userId
}

interface PartnerRequest {
  id: string;
  fromName: string;
  fromDept?: string;
  fromSemester?: number;
  createdAt: string;
  avgRating?: number;
}

export default function StudyPartnersPage({ onNavigate }: { onNavigate: (p: string, data?: any) => void }) {
  const [tab, setTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const [discoverableStudents, setDiscoverableStudents] = useState<Student[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<PartnerRequest[]>([]);
  const [myPartners, setMyPartners] = useState<Student[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());


  // Load all three data sets (search results, pending requests, current partners)
  // whenever the tab changes so everything stays fresh.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [searchRes, reqRes, partRes] = await Promise.all([
          api.get('/api/partners/search'),
          api.get('/api/partners/requests'),
          api.get('/api/partners')
        ]);

        // Map 'id' to 'userId' and ensure status is valid for the User type
        const mapToUser = (list: any[]): Student[] => list.map(item => ({
          ...item,
          userId: item.userId || item.id,
          status: item.status === 'blocked' ? 'blocked' : 'active'
        }));

        setDiscoverableStudents(mapToUser(searchRes));
        setIncomingRequests(reqRes);
        setMyPartners(mapToUser(partRes));
      } catch (err) {
        console.error("Failed to load partners data:", err);
      }
    };

    fetchData();
  }, [tab]);


  // Send a partner request to another student — shows an alert on success or failure
  const sendRequest = async (userId: string) => {
    try {
      await api.post('/api/partners/requests', { toId: userId });
      setSentRequests(prev => new Set(prev).add(userId));
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };


  // Accept or decline an incoming partner request, then refresh the lists
  const handleRequestAction = async (id: string, action: "accept" | "decline") => {
    try {
      await api.put(`/api/partners/requests/${id}`, { action });
      setIncomingRequests(reqs => reqs.filter(r => r.id !== id));

      if (action === "accept") {
        setMyPartners(await api.get('/api/partners'));
      }
    } catch (err) {
      console.error(err);
    }
  };


  // Remove an existing partner from your list
  const removePartner = async (partnerId: string) => {
    try {
      await api.delete(`/api/partners/${partnerId}`);
      setMyPartners(pts => pts.filter(p => p.id !== partnerId));
    } catch (err) {
      console.error(err);
    }
  };


  const depts = ["All", "Computer Science", "Mathematics", "Physics", "Electrical Engineering"];

  // Filter the search results by department and search query
  const filtered = discoverableStudents.filter(s =>
    (deptFilter === "All" || s.department === deptFilter) &&
    (searchQuery === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.department || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const tabs = [
    { id: "search", label: "Search Partners" },
    { id: "requests", label: "Partner Requests", count: incomingRequests.length },
    { id: "partners", label: "My Partners", count: myPartners.length },
  ];


  return (
    <div className="pageAnim" style={{ padding: 28 }}>
      <SectionHeader title="Study Partners" subtitle="Find and connect with students who share your courses" />
      <Tabs tabs={tabs} active={tab} onSelect={setTab} />

      {/* SEARCH TAB — browse and filter all discoverable students */}
      {tab === "search" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.txM }} />
              <input style={{ ...inp, paddingLeft: 36 }} placeholder="Search by name, department, or course…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <select style={{ ...inp, width: 180, appearance: "none" }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              {depts.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {filtered.map(student => (
              <StudentCard key={student.id} student={student} actionEl={
                student.status === "blocked"
                  ? <Badge label="Account Blocked" color={C.red} />
                  : sentRequests.has(student.id)
                    ? <div style={{ display: "flex", gap: 8 }}>
                        <button disabled style={{ ...btnP, padding: "7px 14px", fontSize: 12, background: "lightgrey", color: "#666", borderColor: "lightgrey" }}>
                          <Check size={14} /> Request Sent
                        </button>
                      </div>
                    : <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => sendRequest(student.id)} style={{ ...btnP, padding: "7px 14px", fontSize: 12 }}>
                        <UserPlus size={14} /> Send Request
                      </button>
                    </div>
              } />
            ))}
          </div>
        </div>
      )}

      {/* REQUESTS TAB — shows pending partner requests waiting for your response */}
      {tab === "requests" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {incomingRequests.length === 0
            ? <EmptyState icon={Users} title="No pending requests" subtitle="Partner requests will appear here" />
            : incomingRequests.map(req => (
                <div key={req.id} style={{ ...cardStyle(), display: "flex", alignItems: "center", gap: 16 }}>
                  <Avatar name={req.fromName} size={46} />

                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: C.tx, margin: 0 }}>{req.fromName}</p>
                    <p style={{ fontSize: 12, color: C.txS, margin: "2px 0 6px" }}>{req.fromDept} · Sem {req.fromSemester}</p>
                    <p style={{ fontSize: 12, color: C.txM, margin: 0 }}>Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>

                  <StarRating rating={req.avgRating || 0} />

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleRequestAction(req.id, "accept")} style={btnG}><Check size={14} /> Accept</button>
                    <button onClick={() => handleRequestAction(req.id, "decline")} style={btnD}><X size={14} /> Decline</button>
                  </div>
                </div>
              ))
          }
        </div>
      )}

      {/* PARTNERS TAB — your current partners with "Message" and "Remove" buttons */}
      {tab === "partners" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {myPartners.map(partner => (
            <StudentCard key={partner.id} student={partner} actionEl={
              <div style={{ display: "flex", gap: 8 }}>
                {/* This now navigates to the Messages page AND pre-selects this partner's DM */}
                <button onClick={() => onNavigate("messages", { targetUser: { id: partner.id, name: partner.name } })} style={{ ...btnP, padding: "7px 14px", fontSize: 12 }}><MessageSquare size={14} /> Message</button>
                <button onClick={() => removePartner(partner.id)} style={{ ...btnD, padding: "7px 12px", fontSize: 12 }}><UserMinus size={14} /></button>
              </div>
            } />
          ))}
        </div>
      )}
    </div>
  );
}
