import { Users, Layers, Package, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { C } from '../services/theme';
import { api } from '../services/api';
import StatCard from '../components/StatCard';


// Props for the dashboard — takes the logged-in user and a navigation handler
interface DashboardPageProps {
  user?: any;
  onNavigate: (page: string) => void;
}


// The main Dashboard page — first thing students see after logging in.
// Shows a greeting, four stat cards with real numbers from the API,
// and a recent activity feed. Each stat card is clickable and navigates
// to the corresponding page.

export default function DashboardPage({ user, onNavigate }: DashboardPageProps) {
  const [stats, setStats] = useState({ partners: 0, groups: 0, resources: 0, loans: 0 });


  // Fetch real dashboard stats from the API on mount
  useEffect(() => {
    api.get('/api/users/dashboard').then(data => {
      if (data.stats) setStats(data.stats);
    }).catch(console.error);
  }, []);


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
    </div>
  );
}
