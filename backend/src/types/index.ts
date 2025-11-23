import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string | null;
  affiliation?: string | null;
  teamId?: string | null;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export interface TeamMemberInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
}

export interface CTFdUser {
  id: number;
  name: string;
  email: string;
  team_id?: number;
}

export interface CTFdTeam {
  id: number;
  name: string;
  members: number[];
}

export interface CTFdScore {
  team_id: number;
  team_name: string;
  score: number;
  pos: number;
}

export interface RoomSession {
  roomNumber: number;
  startTime: Date | null;
  endTime: Date | null;
  isActive: boolean;
  teams: string[];
}

