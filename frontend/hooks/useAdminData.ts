import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Stats {
  overview: {
    totalRegistrations: number;
    verifiedUsers: number;
    totalTeams: number;
    completeTeams: number;
    incompleteTeams: number;
  };
  composanteDistribution: Array<{ composante: string; count: number }>;
}

export interface AdminTeam {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
  isComplete: boolean;
  roomNumber: number | null;
  currentScore: number;
  rank: number | null;
  captain: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  members: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export function useAdminData(isAdmin: boolean) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [roomNames, setRoomNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [statsRes, teamsRes, roomsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/teams'),
        api.get('/admin/rooms/names'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (teamsRes.data.success) setTeams(teamsRes.data.data.teams);
      if (roomsRes.data.success) setRoomNames(roomsRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [isAdmin]);

  const updateTeam = (teamId: string, updates: Partial<AdminTeam>) => {
    setTeams(teams.map(t => t.id === teamId ? { ...t, ...updates } : t));
  };

  return { stats, teams, roomNames, loading, error, updateTeam, setTeams, setRoomNames, refresh: fetchData };
}

