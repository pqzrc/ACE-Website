export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  school?: string | null;
  grade?: string | null;
  specialty?: string | null;
  username?: string | null;
  affiliation?: string | null;
  teamId?: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
  ctfdUserId?: number | null;
}

export interface Team {
  id: string;
  name: string;
  inviteCode: string;
  captainId: string;
  members: TeamMember[];
  memberCount: number;
  isComplete: boolean;
  affiliation?: string | null;
  roomNumber: number | null;
  sessionStartTime: string | null;
  currentScore: number;
  rank: number | null;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  grade: string;
  specialty: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

