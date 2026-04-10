import React, { useState, useEffect } from 'react';
import { Bell, Check, UserPlus, Package, Layers, RefreshCw, MessageSquare, Clock } from 'lucide-react';
import { C, cardStyle, btnS } from '../services/theme';
import { api } from '../services/api';
import SectionHeader from '../components/SectionHeader';
import type {  User  } from '../types';

interface NotificationsPageProps { user?: User | null; }

export default function NotificationsPage({ user: _user }: NotificationsPageProps) {
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    const fetchNs = async () => {
      try {
        const res = await api.get('/api/notifications');
        setNotifs(res);
      } catch (err) { console.error(err); }
    };
    fetchNs();
    const interval = setInterval(fetchNs, 3000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifs(ns => ns.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };
  
  const markRead = async (id: string) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifs(ns => ns.map(x => x.id === id ? { ...x, isRead: true } : x));
    } catch (err) { console.error(err); }
  };

  const notifIcons: Record<string, any> = {
    partner: { icon: UserPlus, color: C.cyan },
    borrow: { icon: Package, color: C.green },
    group: { icon: Layers, color: C.purple },
    return: { icon: RefreshCw, color: C.amber },
    message: { icon: MessageSquare, color: C.cyan },
    reminder: { icon: Clock, color: C.red },
  };

  return (
    <div className="pageAnim" style={{ padding: 28, maxWidth: 680, margin: "0 auto" }}>
      <SectionHeader title="Notifications" subtitle={`${notifs.filter(n => !n.isRead).length} unread`}
        action={<button onClick={markAllRead} style={{ ...btnS, padding: "7px 14px", fontSize: 12 }}><Check size={14} /> Mark all read</button>} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {notifs.map(n => {
          const info = notifIcons[n.type] || { icon: Bell, color: C.txS };
          const Icon = info.icon;
          return (
            <div key={n.id} onClick={() => !n.isRead && markRead(n.id)}
              style={{ ...cardStyle({ padding: "14px 18px", cursor: n.isRead ? "default" : "pointer" }), borderLeft: `3px solid ${n.isRead ? C.border : info.color}`, opacity: n.isRead ? 0.7 : 1, transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${info.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} color={info.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: n.isRead ? C.txS : C.tx, margin: 0, fontWeight: n.isRead ? 400 : 600 }}>{n.content}</p>
                  <p style={{ fontSize: 11, color: C.txM, margin: "4px 0 0" }}>{n.time}</p>
                </div>
                {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: "50%", background: info.color, flexShrink: 0 }} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
