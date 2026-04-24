import { useState, useEffect } from 'react';
import { Layers, ArrowLeft, UserPlus, UserMinus, Send, Volume2, LogOut, Lock, Plus, Eye } from 'lucide-react';
import { C, cardStyle, inp, btnP, btnS, btnD } from '../services/theme';
import { api } from '../services/api';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import SectionHeader from '../components/SectionHeader';
import Tabs from '../components/Tabs';
import EmptyState from '../components/EmptyState';
import FormField from '../components/FormField';

export default function StudyGroupsPage() {
  const [tab, setTab] = useState("myGroups");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [detailedGroup, setDetailedGroup] = useState<any>(null);
  const [newGroup, setNewGroup] = useState({ name: "", desc: "", course: "", max: "8", visibility: "public" });
  const [newAnnouncement, setNewAnnouncement] = useState("");

  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<any[]>([]);
  const currentUserId = JSON.parse(localStorage.getItem('uc_user') || '{}')?.userId;

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        if (tab === "myGroups") {
          setMyGroups(await api.get('/api/groups/mine'));
        } else if (tab === "discover") {
          setDiscoverGroups(await api.get('/api/groups/discover'));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchGroups();
  }, [tab]);

  // fetches group details (members + announcements) when you click into a specific group
  useEffect(() => {
    let isMounted = true;
    if (selectedGroup) {
      api.get(`/api/groups/${selectedGroup}`)
        .then(data => {
          if (isMounted) setDetailedGroup(data);
        })
        .catch(console.error);
    }
    return () => { isMounted = false; };
  }, [selectedGroup]);

  const handleJoin = async (id: string) => {
    try {
      await api.post(`/api/groups/${id}/join`, {});
      setTab("myGroups");
      setMyGroups(await api.get('/api/groups/mine'));
    } catch (err) { console.error(err); }
  };

  const handleLeave = async (id: string) => {
    try {
      await api.delete(`/api/groups/${id}/leave`);
      setSelectedGroup(null);
      setMyGroups(await api.get('/api/groups/mine'));
    } catch (err) { console.error(err); }
  };

  // fires off a new study group to the backend and auto-switches to the My Groups tab
  const createGroup = async () => {
    if (!newGroup.name) return alert("Group name required");
    try {
      await api.post('/api/groups', {
        name: newGroup.name,
        description: newGroup.desc,
        courseCode: newGroup.course,
        maxMembers: parseInt(newGroup.max, 10) || 10,
        visibility: newGroup.visibility
      });
      setTab("myGroups");
      setNewGroup({ name: "", desc: "", course: "", max: "10", visibility: "public" });
      setMyGroups(await api.get('/api/groups/mine'));
    } catch(err) { console.error(err); }
  };

  const postAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    try {
      await api.post(`/api/groups/${selectedGroup}/announcements`, { content: newAnnouncement });
      setNewAnnouncement("");
      setDetailedGroup(await api.get(`/api/groups/${selectedGroup}`));
    } catch(err) { console.error(err); }
  };

  const removeMember = async (userId: string) => {
    try {
      await api.delete(`/api/groups/${selectedGroup}/members/${userId}`);
      setDetailedGroup(await api.get(`/api/groups/${selectedGroup}`));
    } catch(err) { console.error(err); }
  };

  const tabs = [
    { id: "myGroups", label: "My Groups", count: myGroups.length },
    { id: "discover", label: "Discover", count: discoverGroups.length },
    { id: "create", label: "Create Group" },
  ];
  if (selectedGroup) {
    const grp = detailedGroup;
    if (!grp) return <div style={{ padding: 28 }}>Loading group details...</div>;
    return (
      <div className="pageAnim" style={{ padding: 28, maxWidth: 800, margin: "0 auto" }}>
        <button onClick={() => setSelectedGroup(null)} style={{ ...btnS, marginBottom: 20, padding: "8px 16px", fontSize: 13 }}><ArrowLeft size={15} /> Back to Groups</button>
        <div style={{ ...cardStyle(), marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.tx, margin: 0 }}>{grp.name}</h2>
              <p style={{ color: C.txS, fontSize: 13, margin: "6px 0 0" }}>{grp.description}</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <StatusBadge status={grp.visibility || "public"} />
              {grp.isCreator === 1 && <Badge label="Creator" color={C.amber} />}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Badge label={grp.courseCode || "Global"} color={C.cyan} />
            <Badge label={`${grp.memberCount}/${grp.maxMembers} members`} color={C.txS} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={cardStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.tx, margin: 0 }}>Members ({grp.members?.length || 0})</h3>
              {grp.isCreator === 1 && <button style={{ ...btnS, padding: "5px 10px", fontSize: 11 }}><UserPlus size={13} /> Invite</button>}
            </div>
            {grp.members?.map((m: { id: string; name: string; department: string }) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <Avatar name={m.name} size={32} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.tx, margin: 0 }}>{m.name}</p>
                  <p style={{ fontSize: 11, color: C.txM, margin: 0 }}>{m.department}</p>
                </div>
                {m.id === currentUserId && <Badge label="You" color={C.cyan} />}
                {grp.isCreator === 1 && m.id !== currentUserId && (
                  <button onClick={() => removeMember(m.id)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", padding: 4 }}><UserMinus size={15} /></button>
                )}
              </div>
            ))}
          </div>
          <div style={cardStyle()}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.tx, margin: "0 0 14px" }}>Announcements</h3>
            {grp.isCreator === 1 && (
              <div style={{ marginBottom: 16 }}>
                <textarea style={{ ...inp, height: 70, resize: "none", fontSize: 13 }} value={newAnnouncement} onChange={e => setNewAnnouncement(e.target.value)} placeholder="Post an announcement…" />
                <button onClick={postAnnouncement} style={{ ...btnP, marginTop: 8, padding: "7px 14px", fontSize: 12 }}><Send size={13} /> Post</button>
              </div>
            )}
            {(grp.announcements?.length ?? 0) === 0
              ? <EmptyState icon={Volume2} title="No announcements yet" />
              : grp.announcements?.map((a: { id: string; content: string; authorName: string; createdAt: string }) => (
                  <div key={a.id} style={{ padding: "12px 14px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 10 }}>
                    <p style={{ fontSize: 13, color: C.tx, margin: "0 0 6px", lineHeight: 1.5 }}>{a.content}</p>
                    <p style={{ fontSize: 11, color: C.txM, margin: 0 }}>{a.authorName} · {new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
            }
          </div>
        </div>
        {grp.isCreator === 0 && (
          <button onClick={() => handleLeave(grp.id)} style={{ ...btnD, marginTop: 20 }}><LogOut size={14} /> Leave Group</button>
        )}
      </div>
    );
  }
  return (
    <div className="pageAnim" style={{ padding: 28 }}>
      <SectionHeader title="Study Groups" subtitle="Collaborate with classmates on shared courses" />
      <Tabs tabs={tabs} active={tab} onSelect={setTab} />
      {tab === "myGroups" && (
        myGroups.length === 0
          ? <EmptyState icon={Layers} title="You haven't joined any groups" subtitle="Discover groups to join" action={<button onClick={() => setTab("discover")} style={btnP}>Explore Groups</button>} />
          : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {myGroups.map(g => (
                <div key={g.id} className="cardHover" style={cardStyle()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: C.tx, margin: 0 }}>{g.name}</h3>
                    <StatusBadge status={g.visibility} />
                  </div>
                  <p style={{ fontSize: 13, color: C.txM, margin: "0 0 10px", lineHeight: 1.5 }}>{g.description}</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <Badge label={g.courseCode || "General"} color={C.cyan} />
                    <Badge label={`${g.memberCount}/${g.maxMembers}`} color={C.txS} />
                    {g.isCreator === 1 && <Badge label="Creator" color={C.amber} />}
                  </div>
                  <button onClick={() => setSelectedGroup(g.id)} style={{ ...btnS, padding: "7px 14px", fontSize: 12 }}>
                    <Eye size={14} /> View Group
                  </button>
                </div>
              ))}
            </div>
      )}
      {tab === "discover" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {discoverGroups.map(g => (
            <div key={g.id} className="cardHover" style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.tx, margin: 0 }}>{g.name}</h3>
                <StatusBadge status={g.visibility} />
              </div>
              <p style={{ fontSize: 13, color: C.txM, margin: "0 0 10px", lineHeight: 1.5 }}>{g.description}</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <Badge label={g.courseCode || "General"} color={C.cyan} />
                <Badge label={`${g.memberCount}/${g.maxMembers} members`} color={C.txS} />
              </div>
              {g.isMember === 1
                ? <Badge label="Joined" color={C.green} />
                : g.visibility === "private"
                  ? <button style={{ ...btnS, padding: "7px 14px", fontSize: 12 }}><Lock size={14} /> Request to Join</button>
                  : <button onClick={() => handleJoin(g.id)} style={{ ...btnP, padding: "7px 14px", fontSize: 12 }}><Plus size={14} /> Join Group</button>
              }
            </div>
          ))}
        </div>
      )}
      {tab === "create" && (
        <div style={{ maxWidth: 540 }}>
          <div style={cardStyle()}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.tx, margin: "0 0 20px" }}>Create New Study Group</h3>
            <FormField label="Group Name">
              <input style={inp} value={newGroup.name} onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))} placeholder="e.g. CS401 Algorithms Team" />
            </FormField>
            <FormField label="Description">
              <textarea style={{ ...inp, height: 80, resize: "none" }} value={newGroup.desc} onChange={e => setNewGroup(g => ({ ...g, desc: e.target.value }))} placeholder="What will your group study?" />
            </FormField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FormField label="Course Code">
                <input style={inp} value={newGroup.course} onChange={e => setNewGroup(g => ({ ...g, course: e.target.value }))} placeholder="e.g. CS401" />
              </FormField>
              <FormField label="Max Members">
                <select style={{ ...inp, appearance: "none" }} value={newGroup.max} onChange={e => setNewGroup(g => ({ ...g, max: e.target.value }))}>
                  {[4,6,8,10,12,15,20].map(n => <option key={n}>{n}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Visibility">
              <div style={{ display: "flex", gap: 10 }}>
                {["public", "private"].map(v => (
                  <button key={v} onClick={() => setNewGroup(g => ({ ...g, visibility: v }))}
                    style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: `1px solid ${newGroup.visibility === v ? C.cyan : C.border}`, background: newGroup.visibility === v ? `${C.cyan}15` : C.depth, color: newGroup.visibility === v ? C.cyan : C.txS, cursor: "pointer", fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>
                    {v === "public" ? <><Eye size={13} style={{ marginRight: 6 }} />Public</> : <><Lock size={13} style={{ marginRight: 6 }} />Private</>}
                  </button>
                ))}
              </div>
            </FormField>
            <button onClick={createGroup} style={{ ...btnP, marginTop: 4 }}><Plus size={16} /> Create Group</button>
          </div>
        </div>
      )}
    </div>
  );
}
