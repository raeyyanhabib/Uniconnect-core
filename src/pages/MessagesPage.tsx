import { useState, useEffect, useRef } from 'react';
import { Search, Send } from 'lucide-react';
import { C, inp, btnP } from '../services/theme';
import { api } from '../services/api';
import Avatar from '../components/Avatar';
import type { User } from '../types';


// Props for the Messages page — takes the logged-in user and an optional
// targetUser that pre-selects a DM when navigating from another page
// (like clicking "Message" on a study partner).
interface MessagesPageProps {
  user?: User | null;
  targetUser?: { id: string; name: string } | null;
}


// The main messaging page — shows your conversation list on the left,
// suggests friends you haven't messaged yet, and renders the active chat on the right.
// If targetUser is passed in, it auto-opens a new conversation with that person.

export default function MessagesPage({ user: _user, targetUser }: MessagesPageProps) {
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [convos, setConvos] = useState<any[]>([]);
  const messagesEndRef = useRef<any>(null);

  const [partners, setPartners] = useState<any[]>([]);
  const [newTarget, setNewTarget] = useState<any>(null);


  // Fetch the partner list so we can show friends as "Suggested" in the sidebar.
  // This runs once when the page loads.
  useEffect(() => {
    api.get('/api/partners').then(setPartners).catch(console.error);
  }, []);


  // If we navigated here with a targetUser (e.g. clicked "Message" on a partner),
  // auto-set them as the new conversation target so the chat opens immediately.
  useEffect(() => {
    if (targetUser) {
      setActiveConv(null);
      setNewTarget(targetUser);
    }
  }, [targetUser]);


  // Poll for conversations every 3 seconds so new messages show up in real-time.
  // Merges existing message data to avoid losing already-loaded messages.
  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const res = await api.get('/api/messages');

        setConvos(cs => {
          const newCs = res.map((c: any) => ({
            conversationId: c.id,
            participantId: c.participantId,
            participant: { name: c.participantName },
            messages: cs.find(x => x.conversationId === c.id)?.messages || [],
            lastMsg: c.lastMessage || "",
            unread: 0,
            time: new Date(c.lastMessageTime || c.createdAt).toLocaleTimeString()
          }));
          return newCs;
        });

        if (res.length > 0 && !activeConv && !newTarget) {
          setActiveConv(res[0].id);
        }
      } catch (err) { console.error(err); }
    };

    fetchConvos();
    const interval = setInterval(fetchConvos, 3000);
    return () => clearInterval(interval);
  }, [activeConv, newTarget]);


  // When the active conversation changes, fetch all messages in that thread.
  // Also polls every 2 seconds so incoming messages appear live.
  useEffect(() => {
    if (!activeConv) return;

    const fetchMsgs = async () => {
      try {
        const res = await api.get(`/api/messages/${activeConv}/messages`);

        setConvos(cs => cs.map(c => c.conversationId === activeConv ? {
          ...c,
          messages: res.map((m: any) => ({ msgId: m.id, text: m.text, time: new Date(m.sentAt).toLocaleTimeString(), mine: m.mine === 1 }))
        } : c));
      } catch (err) { console.error(err); }
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 2000);
    return () => clearInterval(interval);
  }, [activeConv]);


  const currentConvo = convos.find(c => c.conversationId === activeConv);


  // Sends a message — either to an existing conversation or starts a new one.
  // After sending, immediately refreshes the message list so it appears right away.
  const sendMsg = async () => {
    if (!msgInput.trim()) return;
    if (!activeConv && !newTarget) return;

    const text = msgInput;
    setMsgInput("");

    try {
      const payload = activeConv ? { conversationId: activeConv, text } : { toUserId: newTarget.id, text };
      const apiRes = await api.post('/api/messages/send', payload);

      const targetConvId = activeConv || apiRes.conversationId;

      if (!activeConv) {
        setNewTarget(null);
        setActiveConv(targetConvId);
      }

      const res = await api.get(`/api/messages/${targetConvId}/messages`);

      setConvos(cs => cs.map(c => c.conversationId === targetConvId ? {
        ...c,
        messages: res.map((m: any) => ({ msgId: m.id, text: m.text, time: new Date(m.sentAt).toLocaleTimeString(), mine: m.mine === 1 })),
        lastMsg: text
      } : c));
    } catch (err) { console.error(err); }
  };


  return (
    <div className="pageAnim" style={{ height: "100%", display: "flex", overflow: "hidden" }}>

      {/* Left sidebar — search bar, suggested friends, and conversation list */}
      <div style={{ width: 280, borderRight: `1px solid ${C.border}`, background: C.depth, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: C.tx, margin: "0 0 10px" }}>Messages</h2>

          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.txM }} />
            <input style={{ ...inp, paddingLeft: 32, fontSize: 13, padding: "8px 12px 8px 32px" }} placeholder="Search…" />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* Suggested Friends — shows partners you haven't chatted with yet */}
          {partners.filter(p => !convos.some(c => c.participant.name === p.name)).length > 0 && (
            <div style={{ padding: "16px", borderBottom: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.txM, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Suggested Friends</p>

              {partners.filter(p => !convos.some(c => c.participant.name === p.name)).map(p => (
                <button key={p.id} onClick={() => { setActiveConv(null); setNewTarget(p); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px", background: newTarget?.id === p.id ? `${C.cyan}15` : "none", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <Avatar name={p.name} size={32} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.tx, margin: 0, flex: 1 }}>{p.name}</p>
                </button>
              ))}
            </div>
          )}

          {/* Active conversations — each one shows the last message preview */}
          {convos.length > 0 && <p style={{ fontSize: 11, fontWeight: 700, color: C.txM, margin: "16px 16px 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>Recent Conversations</p>}

          {convos.map(c => (
            <button key={c.conversationId} onClick={() => { setNewTarget(null); setActiveConv(c.conversationId); }}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", background: activeConv === c.conversationId ? `${C.cyan}10` : "none", border: "none", borderLeft: activeConv === c.conversationId ? `3px solid ${C.cyan}` : "3px solid transparent", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <div style={{ position: "relative" }}>
                <Avatar name={c.participant.name} size={38} />
                <div className="pulse" style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: C.green, border: `2px solid ${C.depth}` }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.tx, margin: 0 }}>{c.participant.name}</p>
                  <p style={{ fontSize: 10, color: C.txM, margin: 0 }}>{c.time}</p>
                </div>
                <p style={{ fontSize: 12, color: C.txM, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.lastMsg}</p>
              </div>

              {c.unread > 0 && <span style={{ background: C.cyan, borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{c.unread}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Right side — the actual chat window with messages and input */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {(currentConvo || newTarget) && (
          <>
            {/* Chat header showing who you're talking to */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: C.depth, display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={currentConvo ? currentConvo.participant.name : newTarget.name} size={36} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.tx, margin: 0 }}>{currentConvo ? currentConvo.participant.name : newTarget.name}</p>
                <p style={{ fontSize: 11, color: C.green, margin: 0 }}>● Online</p>
              </div>
            </div>

            {/* Message bubbles — yours on the right, theirs on the left */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
              {currentConvo?.messages?.map((m: any) => (
                <div key={m.msgId} style={{ display: "flex", justifyContent: m.mine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                  {!m.mine && <Avatar name={currentConvo.participant.name} size={28} />}

                  <div className={m.mine ? "msgBubbleMine" : "msgBubbleOther"} style={{ maxWidth: "65%", padding: "10px 14px" }}>
                    <p style={{ fontSize: 13, color: "#fff", margin: 0, lineHeight: 1.5 }}>{m.text}</p>
                    <p style={{ fontSize: 10, color: m.mine ? "rgba(255,255,255,0.6)" : C.txM, margin: "4px 0 0", textAlign: m.mine ? "right" : "left" }}>{m.time}</p>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Message input bar at the bottom */}
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, background: C.depth, display: "flex", gap: 10, alignItems: "flex-end" }}>
              <input style={{ ...inp, flex: 1, borderRadius: 20, padding: "10px 16px" }} placeholder="Type a message…" value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} />

              <button onClick={sendMsg} style={{ ...btnP, borderRadius: "50%", width: 40, height: 40, padding: 0, justifyContent: "center", flexShrink: 0 }}>
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
