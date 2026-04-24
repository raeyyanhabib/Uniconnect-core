import React, { useState, useEffect } from 'react';
import { Users, Layers, Package, BarChart2, UserCheck, Flag, MapPin, BookOpen, MessageSquare, Bell, User, LogOut, Newspaper } from 'lucide-react';
import { C } from './services/theme';
import type { User as UserType } from './types';
import Avatar from './components/Avatar';
import { api } from './services/api';

// Import Pages
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyStudentPage from './pages/VerifyStudentPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import StudyPartnersPage from './pages/StudyPartnersPage';
import StudyGroupsPage from './pages/StudyGroupsPage';
import ResourcesPage from './pages/ResourcesPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import LostFoundPage from './pages/LostFoundPage';
import AddNewsPage from './pages/AddNewsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import AdminReportsPage from './pages/AdminReportsPage';


// These define the sidebar navigation structure — what links show up and in what groups.
// Student nav items are separated from admin nav items so each role gets its own sidebar.

interface NavItem { id: string; label: string; icon: React.ElementType; badge?: number; }
interface NavGroup { label: string; items: NavItem[]; }

interface NavData {
  targetUser?: { id: string; name: string };
  [key: string]: unknown;
}


const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: BarChart2 },
      { id: "studyPartners", label: "Study Partners", icon: Users },
      { id: "studyGroups", label: "Study Groups", icon: Layers },
      { id: "resources", label: "Resource Market", icon: Package },
    ],
  },
  {
    label: "Connect",
    items: [
      { id: "messages", label: "Messages", icon: MessageSquare },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "addNews", label: "Add News", icon: Newspaper },
      { id: "lostFound", label: "Lost & Found", icon: MapPin },
    ],
  },
];

// The navigation links that admins see — completely different set of pages
const adminNavGroups: NavGroup[] = [
  {
    label: "Admin Panel",
    items: [
      { id: "adminDashboard", label: "Dashboard", icon: BarChart2 },
      { id: "adminUsers", label: "Manage Users", icon: UserCheck },
      { id: "adminResources", label: "Resource Listings", icon: Package },
      { id: "adminReports", label: "Platform Reports", icon: Flag },
    ],
  },
];


// The left sidebar component — shows the UniConnect logo at top,
// navigation links in the middle, and profile/logout at the bottom.

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user?: UserType | null;
  isAdmin?: boolean;
  unreadNotifCount?: number;
  unreadMessagesCount?: number;
}

function Sidebar({ currentPage, onNavigate, user: _user, isAdmin, unreadNotifCount = 0, unreadMessagesCount = 0 }: SidebarProps) {
  const groups = isAdmin ? adminNavGroups : navGroups;

  return (
    <div style={{ width: 224, background: C.depth, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100%", flexShrink: 0 }}>

      {/* Logo area at the top of the sidebar */}
      <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${C.cyan},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 17, background: `linear-gradient(135deg,${C.cyanLt},${C.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>UniConnect</span>
        </div>
      </div>

      {/* Navigation links — loops through each group and renders its items */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
        {groups.map(group => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.txM, textTransform: "uppercase", letterSpacing: 1.2, padding: "0 8px", marginBottom: 6 }}>{group.label}</p>

            {group.items.map(item => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button key={item.id} className={`sideNavItem${active ? " sideNavActive" : ""}`}
                  onClick={() => onNavigate(item.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: active ? "rgba(14,165,233,0.1)" : "none", border: active ? `none` : "none", borderRight: active ? `2px solid ${C.cyan}` : "2px solid transparent", borderRadius: active ? "8px 0 0 8px" : 8, padding: "9px 10px", color: active ? C.cyanLt : C.txS, cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, textAlign: "left" }}>
                  <Icon size={16} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.id === "notifications" && unreadNotifCount > 0 && <span style={{ background: C.red, color: "#fff", borderRadius: "50%", padding: "2px 5px", fontSize: 10, fontWeight: 700 }}>{unreadNotifCount}</span>}
                  {item.id === "messages" && unreadMessagesCount > 0 && <span style={{ background: C.red, color: "#fff", borderRadius: "50%", padding: "2px 5px", fontSize: 10, fontWeight: 700 }}>{unreadMessagesCount}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom section — profile link and sign out button */}
      <div style={{ padding: "12px 10px", borderTop: `1px solid ${C.border}` }}>
        {!isAdmin && (
          <button className="sideNavItem" onClick={() => onNavigate("profile")}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: currentPage === "profile" ? "rgba(14,165,233,0.1)" : "none", border: "none", borderRadius: 8, padding: "9px 10px", color: C.txS, cursor: "pointer", fontSize: 13, fontWeight: 500, textAlign: "left", marginBottom: 4 }}>
            <User size={16} /> Profile
          </button>
        )}

        <button className="sideNavItem" onClick={() => onNavigate("login")}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", borderRadius: 8, padding: "9px 10px", color: C.red, cursor: "pointer", fontSize: 13, fontWeight: 500, textAlign: "left", opacity: 0.8 }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}


// The top bar that sits above every page — shows the current page title,
// notification/message icons, and the user's avatar with their name.

interface TopBarProps {
  user: UserType;
  currentPage: string;
  onNavigate: (page: string) => void;
  unreadNotifCount?: number;
  unreadMessagesCount?: number;
}

function TopBar({ user, currentPage, onNavigate, unreadNotifCount = 0, unreadMessagesCount = 0 }: TopBarProps) {

  // Human-friendly labels for each page ID so the top bar shows a nice title
  const pageLabels: Record<string, string> = {
    dashboard: "Dashboard", studyPartners: "Study Partners", studyGroups: "Study Groups",
    resources: "Resources", messages: "Messages", notifications: "Notifications",
    lostFound: "Lost & Found", profile: "Profile", adminDashboard: "Admin Dashboard",
    adminUsers: "Manage Users", adminResources: "Resource Listings", adminReports: "Platform Reports",
  };

  return (
    <div style={{ height: 58, background: C.depth, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: C.tx, margin: 0 }}>{pageLabels[currentPage] || "UniConnect"}</h2>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => onNavigate("notifications")} style={{ background: "none", border: "none", color: C.txS, cursor: "pointer", position: "relative", padding: 4 }}>
          <Bell size={20} />
          {unreadNotifCount > 0 && (
            <span style={{ position: "absolute", top: -4, right: -4, background: C.red, color: "#fff", borderRadius: "50%", padding: "2px 5px", fontSize: 10, fontWeight: 700 }}>
              {unreadNotifCount}
            </span>
          )}
        </button>

        <button onClick={() => onNavigate("messages")} style={{ background: "none", border: "none", color: C.txS, cursor: "pointer", position: "relative", padding: 4 }}>
          <MessageSquare size={20} />
          {unreadMessagesCount > 0 && (
            <span style={{ position: "absolute", top: -4, right: -4, background: C.red, color: "#fff", borderRadius: "50%", padding: "2px 5px", fontSize: 10, fontWeight: 700 }}>
              {unreadMessagesCount}
            </span>
          )}
        </button>

        <button onClick={() => onNavigate("profile")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8 }}>
          <Avatar name={user.name} size={30} />
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.tx, margin: 0 }}>{user.name}</p>
            <p style={{ fontSize: 10, color: C.txM, margin: 0 }}>{user.department || user.role}</p>
          </div>
        </button>
      </div>
    </div>
  );
}


// The main layout shell that wraps every authenticated page.
// It combines the Sidebar + TopBar around whatever page content is passed as children.

interface AppShellProps {
  user: UserType;
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
  unreadNotifCount?: number;
  unreadMessagesCount?: number;
  children: React.ReactNode;
}

function AppShell({ user, currentPage, onNavigate, isAdmin, unreadNotifCount, unreadMessagesCount, children }: AppShellProps) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} user={user} isAdmin={isAdmin} unreadNotifCount={unreadNotifCount} unreadMessagesCount={unreadMessagesCount} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar user={user} currentPage={currentPage} onNavigate={onNavigate} unreadNotifCount={unreadNotifCount} unreadMessagesCount={unreadMessagesCount} />

        <div style={{ flex: 1, overflowY: "auto", background: C.base }}>
          {children}
        </div>
      </div>
    </div>
  );
}


// The root App component — this is the brain of the entire application.
// It manages who's logged in, what page we're on, and routes everything accordingly.
// It also supports passing navigation data between pages (like opening a specific DM).

export default function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [navData, setNavData] = useState<NavData | null>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Polls the server for unread notification count every 5 seconds
  useEffect(() => {
    if (!currentUser) { setUnreadNotifCount(0); return; }

    const fetchCount = async () => {
      try {
        const res = await api.get('/api/notifications/unread-count');
        setUnreadNotifCount(res.count || 0);
      } catch { /* ignore when not authenticated */ }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    window.addEventListener('uc_notifications_read', fetchCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener('uc_notifications_read', fetchCount);
    };
  }, [currentUser]);

  // Polls the server for unread message count — same idea as notifications above
  useEffect(() => {
    if (!currentUser) { setUnreadMessagesCount(0); return; }

    const fetchMsgCount = async () => {
      try {
        const res = await api.get('/api/messages/unread-count');
        setUnreadMessagesCount(res.count || 0);
      } catch { /* ignore */ }
    };

    fetchMsgCount();
    const interval = setInterval(fetchMsgCount, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);


  // Called after a successful login — parses the user data from the API response,
  // maps it into our internal User type, saves to localStorage, and routes to the right dashboard.
  const handleLogin = (userData: string) => {
    try {
      const user = JSON.parse(userData);

      const mappedUser: UserType = {
        userId: user.id || user.userId,
        name: user.name,
        email: user.email,
        department: user.department,
        semester: user.semester,
        bio: user.bio,
        averageRating: user.avgRating || 0,
        status: user.status || 'active',
        role: user.role,
        adminLevel: user.adminLevel || 0,
      };

      setCurrentUser(mappedUser);
      localStorage.setItem('uc_user', JSON.stringify(mappedUser));

      if (user.role === 'admin') {
        setIsAdmin(true);
        setCurrentPage("adminDashboard");
      } else {
        setIsAdmin(false);
        setCurrentPage("dashboard");
      }
    } catch (e) {
      console.error("Failed to parse user data on login");
    }
  };


  // The main navigation function — every page calls this to move around the app.
  // It also supports an optional second argument for passing data between pages
  // (like when you click "Message" on a partner, it passes their info to the messages page).
  // Navigating to "login" clears the session and logs you out.
  const navigate = (page: string, data?: NavData) => {
    if (page === "notifications") setUnreadNotifCount(0);
    if (page === "messages") setUnreadMessagesCount(0);

    if (page === "login") {
      setCurrentUser(null);
      setIsAdmin(false);
      localStorage.removeItem('uc_user');
      localStorage.removeItem('uc_token');
    }

    setNavData(data || null);
    setCurrentPage(page);
  };


  // On app startup, check if there's a saved session in localStorage.
  // If there is, restore it so the user doesn't have to log in again every time.
  useEffect(() => {
    const savedUser = localStorage.getItem('uc_user');
    const savedToken = localStorage.getItem('uc_token');

    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);

        if (user.role === 'admin') {
          setIsAdmin(true);
          setCurrentPage("adminDashboard");
        } else {
          setIsAdmin(false);
          setCurrentPage("dashboard");
        }
      } catch (e) {
        console.error("Failed to restore session");
        localStorage.removeItem('uc_user');
        localStorage.removeItem('uc_token');
      }
    }
  }, []);


  // Auth pages — these don't need the sidebar/topbar shell, they're full-screen
  if (currentPage === "login") return <LoginPage onNavigate={navigate} onLogin={handleLogin} />;
  if (currentPage === "adminLogin") return <AdminLoginPage onNavigate={navigate} onLogin={handleLogin} />;
  if (currentPage === "register") return <RegisterPage onNavigate={navigate} />;
  if (currentPage === "verifyStudent") return <VerifyStudentPage onNavigate={navigate} />;
  if (currentPage === "resetPassword") return <ResetPasswordPage onNavigate={navigate} />;

  // If somehow we get here without a user, kick back to login
  if (!currentUser) return <LoginPage onNavigate={navigate} onLogin={handleLogin} />;

  // Main authenticated app — wraps the current page in the shell with sidebar and topbar
  return (
    <AppShell user={currentUser} currentPage={currentPage} onNavigate={navigate} isAdmin={isAdmin} unreadNotifCount={unreadNotifCount} unreadMessagesCount={unreadMessagesCount}>

      {currentPage === "dashboard" && <DashboardPage user={currentUser} onNavigate={navigate} />}
      {currentPage === "addNews" && <AddNewsPage onNavigate={navigate} />}
      {currentPage === "profile" && <ProfilePage user={currentUser} onNavigate={navigate} onUserUpdate={(u: UserType) => { setCurrentUser(u); localStorage.setItem('uc_user', JSON.stringify(u)); }} />}
      {currentPage === "studyPartners" && <StudyPartnersPage onNavigate={navigate} />}
      {currentPage === "studyGroups" && <StudyGroupsPage />}
      {currentPage === "resources" && <ResourcesPage user={currentUser} />}
      {currentPage === "messages" && <MessagesPage user={currentUser} targetUser={navData?.targetUser} />}
      {currentPage === "notifications" && <NotificationsPage user={currentUser} />}
      {currentPage === "lostFound" && <LostFoundPage user={currentUser} />}

      {currentPage === "adminDashboard" && isAdmin && <AdminDashboardPage onNavigate={navigate} />}
      {currentPage === "adminUsers" && isAdmin && <AdminUsersPage user={currentUser} />}
      {currentPage === "adminResources" && isAdmin && <AdminResourcesPage user={currentUser} />}
      {currentPage === "adminReports" && isAdmin && <AdminReportsPage user={currentUser} />}

    </AppShell>
  );
}
