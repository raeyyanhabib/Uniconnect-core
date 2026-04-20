import { Users, Layers, Package, BookOpen, Plus } from 'lucide-react';
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

  // Dummy states for the widgets so they operate smoothly.
  const [todos, setTodos] = useState([
    { id: 1, text: "Return borrowed textbook", done: false },
    { id: 2, text: "Message study group about assignment", done: true },
    { id: 3, text: "Review resources for AI project", done: false }
  ]);

  const [events, setEvents] = useState([
    { id: 1, month: "Oct", day: "12", title: "Tech Symposium 2026", details: "Main Auditorium • 10:00 AM" }
  ]);

  const [news, setNews] = useState([
    { id: 1, title: "Library Hackathon Winners", desc: "Congratulations to team ByteMe for winning the grand prize!", img: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=100&h=100&fit=crop" },
    { id: 2, title: "New Campus Café Opening", desc: "Grab your morning coffee at the new Student Center café starting Monday.", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&h=100&fit=crop" }
  ]);

  // Fetch real dashboard stats from the API on mount
  useEffect(() => {
    api.get('/api/users/dashboard').then(data => {
      if (data.stats) setStats(data.stats);
    }).catch(console.error);
  }, []);

  const addDummyTodo = () => {
    setTodos([...todos, { id: Date.now(), text: "New generic task " + (todos.length + 1), done: false }]);
  };

  const addDummyEvent = () => {
    setEvents([...events, { id: Date.now(), month: "Nov", day: "05", title: "Study Fair " + (events.length + 1), details: "Courtyard • 1:00 PM" }]);
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
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

      {/* Four clickable stat cards */}
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
          
          {/* News Portal */}
          <div style={{ background: C.depth, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: C.tx, margin: 0 }}>University News</h2>
              <button style={{ background: "none", border: "none", color: C.cyan, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: 0 }} onClick={() => onNavigate("addNews")}>
                <Plus size={14} /> Add News
              </button>
            </div>
            
            <div className="customScroll" style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
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

          {/* Lost & Found */}
          <div style={{ background: C.depth, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: C.tx, margin: "0 0 16px 0" }}>Recent Lost & Found</h2>
            <div className="customScroll" style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 250, overflowY: "auto", paddingRight: 4 }}>
              <div style={{ padding: 12, borderRadius: 12, background: "rgba(239,68,68,0.05)", borderLeft: `3px solid ${C.red}` }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.tx }}>Lost: Apple Pencil</p>
                <p style={{ margin: "4px 0 0 0", fontSize: 12, color: C.txM }}>Found near main library on 2nd floor.</p>
              </div>
              <div style={{ padding: 12, borderRadius: 12, background: "rgba(14,165,233,0.05)", borderLeft: `3px solid ${C.cyan}` }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.tx }}>Found: Car Keys</p>
                <p style={{ margin: "4px 0 0 0", fontSize: 12, color: C.txM }}>Black keychain, handed over to security.</p>
              </div>
              <div style={{ padding: 12, borderRadius: 12, background: "rgba(239,68,68,0.05)", borderLeft: `3px solid ${C.red}` }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.tx }}>Lost: Notebook</p>
                <p style={{ margin: "4px 0 0 0", fontSize: 12, color: C.txM }}>Blue calculus notebook, left in Room 204.</p>
              </div>
            </div>
            <button style={{ background: "none", border: "none", color: C.cyan, fontSize: 13, fontWeight: 600, marginTop: 16, cursor: "pointer", width: "100%", textAlign: "center" }} onClick={() => onNavigate("lostFound")}>View All Items</button>
          </div>
        </div>

        {/* Right Column (Remaining space) - Events & To-Do */}
        <div style={{ flex: "1 1 50%", minWidth: 280, display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Upcoming Events */}
          <div style={{ background: C.depth, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: C.tx, margin: 0 }}>Upcoming Events</h2>
              <button style={{ background: "none", border: "none", color: C.cyan, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: 0 }} onClick={addDummyEvent}>
                <Plus size={14} /> Add Event
              </button>
            </div>
            <div className="customScroll" style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
              {events.map((evt) => (
                <div key={evt.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: "rgba(139,92,246,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: C.purple, textTransform: "uppercase" }}>{evt.month}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: C.tx, lineHeight: 1 }}>{evt.day}</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.tx }}>{evt.title}</p>
                    <p style={{ margin: "2px 0 0 0", fontSize: 12, color: C.txM }}>{evt.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* To-Do List */}
          <div style={{ background: C.depth, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: C.tx, margin: 0 }}>To-Do List</h2>
              <button style={{ background: "none", border: "none", color: C.cyan, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: 0 }} onClick={addDummyTodo}>
                <Plus size={14} /> Add Item
              </button>
            </div>
            
            <div className="customScroll" style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 250, overflowY: "auto", paddingRight: 4 }}>
              {todos.map((todo) => (
                <label key={todo.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} style={{ accentColor: C.cyan, width: 16, height: 16, cursor: "pointer" }} />
                  <span style={{ fontSize: 13, color: todo.done ? C.txM : C.tx, textDecoration: todo.done ? "line-through" : "none" }}>{todo.text}</span>
                </label>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
