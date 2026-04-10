import React, { useState, useEffect } from 'react';
import { Users, Package, BookOpen, Layers, UserPlus, CheckCircle, Volume2, RefreshCw } from 'lucide-react';
import { C } from '../services/theme';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import type {  User, AuthPageProps  } from '../types';

interface DashboardPageProps { user?: any; onNavigate: (page: string) => void; }

export default function DashboardPage({ user, onNavigate }: DashboardPageProps) {
  const [stats, setStats] = useState({ partners: 0, groups: 0, resources: 0, loans: 0 });

  useEffect(() => {
    api.get('/api/users/dashboard').then(data => {
      if (data.stats) setStats(data.stats);
    }).catch(console.error);
  }, []);

  const recentActivity = [
    { icon: UserPlus, text: "Priya Sharma sent you a partner request", time: "2 min ago", color: C.cyan },
    { icon: CheckCircle, text: "Borrow request for 'Laptop Stand' approved", time: "1 hr ago", color: C.green },
    { icon: Volume2, text: "New announcement in Algorithms Study Squad", time: "3 hrs ago", color: C.purple },
    { icon: RefreshCw, text: "James O'Brien returned your book", time: "Yesterday", color: C.amber },
  ];
  return (
    <div className="pageAnim" style={{ padding: 28 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: C.tx, margin: 0 }}>
          Good afternoon, <span style={{ color: C.cyanLt }}>{user?.name?.split(' ')[0] || 'Student'}</span> 👋
        </h1>
        <p style={{ color: C.txM, fontSize: 14, marginTop: 6 }}>Here's what's happening on campus today.</p>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Study Partners" value={stats.partners} icon={Users} color={C.cyan} sub="Joined partners" />
        <StatCard label="Active Groups" value={stats.groups} icon={Layers} color={C.purple} sub="Enrolled" />
        <StatCard label="My Resources" value={stats.resources} icon={Package} color={C.amber} sub="Listed" />
        <StatCard label="Active Loans" value={stats.loans} icon={BookOpen} color={C.green} sub="Borrowed" />
      </div>
    </div>
  );
}
