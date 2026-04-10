export interface User {
  userId: string;
  name: string;
  email: string;
  department?: string;
  semester?: number;
  bio?: string;
  averageRating?: number;
  status: 'active' | 'blocked';
  role?: 'student' | 'admin';
  mutualCourses?: string[];
  adminLevel?: number;
  joined?: string;
  reports?: number;
  dept?: string;
}

export interface Resource {
  resourceId: string;
  title: string;
  category: 'Book' | 'Equipment' | 'Notes' | 'Other';
  condition?: string;
  maxBorrowDuration?: number;
  status: 'available' | 'borrowed' | 'paused' | 'flagged' | 'active';
  ownerId?: string;
  ownerName?: string;
  owner?: string;
  description?: string;
  reason?: string | null;
  date?: string | null;
}

export interface Announcement {
  announcementId: string;
  content: string;
  timestamp: string;
  author: string;
}

export interface StudyGroup {
  groupId: string;
  groupName: string;
  description: string;
  courseCode: string;
  maxMembers: number;
  visibility: 'public' | 'private';
  memberCount: number;
  members: User[];
  isCreator: boolean;
  joined: boolean;
  announcements: Announcement[];
}

export interface AuthPageProps {
  onNavigate: (page: string) => void;
  onLogin?: (role: string) => void;
}

export const __uc_types = true;
