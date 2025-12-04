export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  specialty?: string | null;
  username?: string | null;
  composante?: string | null;
  phoneNumber?: string | null;
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
  composante?: string | null;
  roomNumber: number | null;
  sessionStartTime: string | null;
  currentScore: number;
  rank: number | null;
  timeSlotId?: string | null;
  timeSlot?: {
    id: string;
    displayName: string;
    roomName: string;
    startTime: string;
    endTime: string;
  } | null;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  composante?: string | null;
  specialty?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

