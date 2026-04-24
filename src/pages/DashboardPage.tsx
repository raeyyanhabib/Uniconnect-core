import { Users, Layers, Package, BookOpen, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { C } from '../services/theme';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

interface DashboardPageProps {
  user?: any;
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ user, onNavigate }: DashboardPageProps) {
  const [stats, setStats] = useState({ partners: 0, groups: 0, resources: 0, loans: 0 });

  // All widget data now lives in the DB — these states get hydrated from API calls below
  const [todos, setTodos] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [lostFound, setLostFound] = useState<any[]>([]);

  // Inline editing state for todos and events
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editTodoText, setEditTodoText] = useState("");
  const [newTodoText, setNewTodoText] = useState("");
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [editEventTitle, setEditEventTitle] = useState("");
  const [editEventDetails, setEditEventDetails] = useState("");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDetails, setNewEventDetails] = useState("");
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  // This big useEffect is the heartbeat of the dashboard — it pulls everything
  // (stats, news, lost-found, todos, events) from the backend on mount.
  useEffect(() => {
    api.get('/api/users/dashboard').then(data => {
      if (data.stats) setStats(data.stats);
    }).catch(console.error);

    api.get('/api/news').then(data => {
      setNews(data.map((n: any) => ({
        id: n.id, title: n.title, desc: n.content,
        img: n.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=100&h=100&fit=crop"
      })));
    }).catch(console.error);

    api.get('/api/lost-found').then(data => {
      setLostFound(data.slice(0, 5).map((x: any) => ({
        id: x.id, type: x.type, description: x.description, location: x.location
      })));
    }).catch(console.error);

    api.get('/api/todos').then(data => {
      setTodos(data.map((t: any) => ({ id: t.id, text: t.text, done: t.isDone === 1 })));
    }).catch(console.error);

    api.get('/api/events').then(data => {
      setEvents(data.map((e: any) => {
        const d = e.eventDate ? new Date(e.eventDate) : new Date();
        return { id: e.id, month: d.toLocaleString('en', { month: 'short' }), day: String(d.getDate()).padStart(2, '0'), title: e.title, details: e.details || "" };
      }));
    }).catch(console.error);
  }, []);


  // — Todo CRUD helpers —
  const addTodo = async () => {
    if (!newTodoText.trim()) return;
    try {
      const res = await api.post('/api/todos', { text: newTodoText });
      setTodos([{ id: res.todoId, text: newTodoText, done: false }, ...todos]);
      setNewTodoText(""); setShowAddTodo(false);
    } catch (err) { console.error(err); }
  };

  const toggleTodo = async (id: string, done: boolean) => {
    try {
      await api.put(`/api/todos/${id}`, { isDone: !done });
      setTodos(todos.map(t => t.id === id ? { ...t, done: !done } : t));
    } catch (err) { console.error(err); }
  };

  const saveTodoEdit = async (id: string) => {
    if (!editTodoText.trim()) return;
    try {
      await api.put(`/api/todos/${id}`, { text: editTodoText });
      setTodos(todos.map(t => t.id === id ? { ...t, text: editTodoText } : t));
      setEditingTodo(null);
    } catch (err) { console.error(err); }
  };

  const deleteTodo = async (id: string) => {
    try {
      await api.delete(`/api/todos/${id}`);
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) { console.error(err); }
  };

  // — Event CRUD helpers —
  const addEvent = async () => {
    if (!newEventTitle.trim()) return;
    try {
      const res = await api.post('/api/events', { title: newEventTitle, details: newEventDetails });
      const d = new Date();
      setEvents([...events, { id: res.eventId, month: d.toLocaleString('en', { month: 'short' }), day: String(d.getDate()).padStart(2, '0'), title: newEventTitle, details: newEventDetails }]);
      setNewEventTitle(""); setNewEventDetails(""); setShowAddEvent(false);
    } catch (err) { console.error(err); }
  };

  const saveEventEdit = async (id: string) => {
    if (!editEventTitle.trim()) return;
    try {
      await api.put(`/api/events/${id}`, { title: editEventTitle, details: editEventDetails });
      setEvents(events.map(e => e.id === id ? { ...e, title: editEventTitle, details: editEventDetails } : e));
      setEditingEvent(null);
    } catch (err) { console.error(err); }
  };

  const deleteEvent = async (id: string) => {
    try {
      await api.delete(`/api/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) { console.error(err); }
  };


  return (
    <div className="pageAnim" style={{ padding: 28 }}>

      {/* Greeting section */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: C.tx, margin: 0 }}>
          Good afternoon, <span style={{ color: C.cyanLt }}>{user?.name?.split(' ')[0] || 'Student'}</span> 👋
        </h1>
        <p style={{ color: C.txM, fontSize: 14, marginTop: 6 }}>Here's what's happening on campus today.</p>
      </div>

      {/* Four clickable stat cards — each one navigates to its respective page */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Study Partners" value={stats.partners} icon={Users} color={C.cyan} sub="Joined partners" onClick={() => onNavigate("studyPartners")} />
        <StatCard label="Active Groups" value={stats.groups} icon={Layers} color={C.purple} sub="Enrolled" onClick={() => onNavigate("studyGroups")} />
        <StatCard label="My Resources" value={stats.resources} icon={Package} color={C.amber} sub="Listed" onClick={() => onNavigate("resources")} />
        <StatCard label="Active Loans" value={stats.loans} icon={BookOpen} color={C.green} sub="Borrowed" onClick={() => onNavigate("lostFound")} />
      </div>

      {/* Main Content Area */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        
        {/* Left Column (Approx 40-50%) - News & Lost and Found */}
        <div style={{ flex: "1 1 40%", minWidth: 280, display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* News Portal — now synced with the News API */}
          <div style={{ background: C.depth, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: C.tx, margin: 0 }}>University News</h2>
              <button style={{ background: "none", border: "none", color: C.cyan, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: 0 }} onClick={() => onNavigate("addNews")}>
                <Plus size={14} /> Add News
              </button>
            </div>
            
            <div className="customScroll" style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
              {news.length === 0 && <p style={{ color: C.txM, fontSize: 13, textAlign: "center", padding: 16 }}>No news yet — be the first to post!</p>}
              {news.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 12, background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <img src={item.img} alt="News" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.tx, lineHeight: 1.3 }}>{item.title}</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: C.txM, lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lost & Found — now synced with the Lost & Found API */}
          <div style={{ background: C.depth, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: C.tx, margin: "0 0 16px 0" }}>Recent Lost & Found</h2>
            <div className="customScroll" style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 250, overflowY: "auto", paddingRight: 4 }}>
              {lostFound.length === 0 && <p style={{ color: C.txM, fontSize: 13, textAlign: "center", padding: 16 }}>No items reported yet.</p>}
              {lostFound.map(item => (
                <div key={item.id} style={{ padding: 12, borderRadius: 12, background: item.type === "Lost" ? "rgba(239,68,68,0.05)" : "rgba(14,165,233,0.05)", borderLeft: `3px solid ${item.type === "Lost" ? C.red : C.cyan}` }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.tx }}>{item.type}: {item.description}</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 12, color: C.txM }}>{item.location}</p>
                </div>
              ))}
            </div>
            <button style={{ background: "none", border: "none", color: C.cyan, fontSize: 13, fontWeight: 600, marginTop: 16, cursor: "pointer", width: "100%", textAlign: "center" }} onClick={() => onNavigate("lostFound")}>View All Items</button>
          </div>
        </div>

        {/* Right Column (Remaining space) - Events & To-Do */}
        <div style={{ flex: "1 1 50%", minWidth: 280, display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Upcoming Events — now editable and deletable */}
          <div style={{ background: C.depth, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: C.tx, margin: 0 }}>Upcoming Events</h2>
              <button style={{ background: "none", border: "none", color: C.cyan, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: 0 }} onClick={() => setShowAddEvent(true)}>
                <Plus size={14} /> Add Event
              </button>
            </div>

            {/* Inline add event form */}
            {showAddEvent && (
              <div style={{ marginBottom: 14, padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${C.border}` }}>
                <input style={{ background: C.depth, border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 10px", color: C.tx, fontSize: 13, width: "100%", marginBottom: 6, outline: "none" }} placeholder="Event title..." value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} />
                <input style={{ background: C.depth, border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 10px", color: C.tx, fontSize: 12, width: "100%", marginBottom: 8, outline: "none" }} placeholder="Details (e.g. Main Auditorium • 2:00 PM)" value={newEventDetails} onChange={e => setNewEventDetails(e.target.value)} />
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={addEvent} style={{ background: C.cyan, color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}><Check size={12} /> Save</button>
                  <button onClick={() => { setShowAddEvent(false); setNewEventTitle(""); setNewEventDetails(""); }} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, color: C.txS, cursor: "pointer" }}><X size={12} /> Cancel</button>
                </div>
              </div>
            )}

            <div className="customScroll" style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
              {events.length === 0 && !showAddEvent && <p style={{ color: C.txM, fontSize: 13, textAlign: "center", padding: 16 }}>No events yet — add one!</p>}
              {events.map((evt) => (
                <div key={evt.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: "rgba(139,92,246,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: C.purple, textTransform: "uppercase" }}>{evt.month}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: C.tx, lineHeight: 1 }}>{evt.day}</span>
                  </div>
                  {editingEvent === evt.id ? (
                    <div style={{ flex: 1 }}>
                      <input style={{ background: C.depth, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", color: C.tx, fontSize: 13, width: "100%", marginBottom: 4, outline: "none" }} value={editEventTitle} onChange={e => setEditEventTitle(e.target.value)} />
                      <input style={{ background: C.depth, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", color: C.tx, fontSize: 12, width: "100%", outline: "none" }} value={editEventDetails} onChange={e => setEditEventDetails(e.target.value)} />
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        <button onClick={() => saveEventEdit(evt.id)} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", padding: 2 }}><Check size={14} /></button>
                        <button onClick={() => setEditingEvent(null)} style={{ background: "none", border: "none", color: C.txM, cursor: "pointer", padding: 2 }}><X size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.tx }}>{evt.title}</p>
                      <p style={{ margin: "2px 0 0 0", fontSize: 12, color: C.txM }}>{evt.details}</p>
                    </div>
                  )}
                  {editingEvent !== evt.id && (
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => { setEditingEvent(evt.id); setEditEventTitle(evt.title); setEditEventDetails(evt.details); }} style={{ background: "none", border: "none", color: C.txM, cursor: "pointer", padding: 2 }}><Edit2 size={13} /></button>
                      <button onClick={() => deleteEvent(evt.id)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", padding: 2, opacity: 0.7 }}><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* To-Do List — now editable, deletable, and persisted in the DB */}
          <div style={{ background: C.depth, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: C.tx, margin: 0 }}>To-Do List</h2>
              <button style={{ background: "none", border: "none", color: C.cyan, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: 0 }} onClick={() => setShowAddTodo(true)}>
                <Plus size={14} /> Add Item
              </button>
            </div>

            {/* Inline add todo form */}
            {showAddTodo && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input style={{ background: C.depth, border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 10px", color: C.tx, fontSize: 13, flex: 1, outline: "none" }} placeholder="What needs doing?" value={newTodoText} onChange={e => setNewTodoText(e.target.value)} onKeyDown={e => e.key === "Enter" && addTodo()} autoFocus />
                <button onClick={addTodo} style={{ background: C.cyan, color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}><Check size={12} /></button>
                <button onClick={() => { setShowAddTodo(false); setNewTodoText(""); }} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 12, color: C.txS, cursor: "pointer" }}><X size={12} /></button>
              </div>
            )}
            
            <div className="customScroll" style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 250, overflowY: "auto", paddingRight: 4 }}>
              {todos.length === 0 && !showAddTodo && <p style={{ color: C.txM, fontSize: 13, textAlign: "center", padding: 16 }}>All clear — nothing to do!</p>}
              {todos.map((todo) => (
                <div key={todo.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id, todo.done)} style={{ accentColor: C.cyan, width: 16, height: 16, cursor: "pointer", flexShrink: 0 }} />
                  {editingTodo === todo.id ? (
                    <div style={{ flex: 1, display: "flex", gap: 6 }}>
                      <input style={{ background: C.depth, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 8px", color: C.tx, fontSize: 13, flex: 1, outline: "none" }} value={editTodoText} onChange={e => setEditTodoText(e.target.value)} onKeyDown={e => e.key === "Enter" && saveTodoEdit(todo.id)} autoFocus />
                      <button onClick={() => saveTodoEdit(todo.id)} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", padding: 2 }}><Check size={14} /></button>
                      <button onClick={() => setEditingTodo(null)} style={{ background: "none", border: "none", color: C.txM, cursor: "pointer", padding: 2 }}><X size={14} /></button>
                    </div>
                  ) : (
                    <span onClick={() => { setEditingTodo(todo.id); setEditTodoText(todo.text); }} style={{ fontSize: 13, color: todo.done ? C.txM : C.tx, textDecoration: todo.done ? "line-through" : "none", flex: 1, cursor: "text" }}>{todo.text}</span>
                  )}
                  {editingTodo !== todo.id && (
                    <button onClick={() => deleteTodo(todo.id)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", padding: 2, opacity: 0.6, flexShrink: 0 }}><Trash2 size={13} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
