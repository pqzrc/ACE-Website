import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AdminTeam {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
  isComplete: boolean;
  captain: TeamMember | null;
  members: TeamMember[];
  timeSlotId?: string | null;
  timeSlot?: {
    id: string;
    displayName: string;
    roomName: string;
  } | null;
}

export interface TimeSlotOption {
  id: string;
  displayName: string;
}

export function useAdminTeamsManagement(
  initialTeams: AdminTeam[],
  onRefresh: () => void
) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlotOption[]>([]);

  const showSuccess = useCallback((message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setError(message);
  }, []);

  // Fetch time slots for filter and assignment
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const res = await api.get('/timeslots/admin');
        if (res.data.success) {
          const slots = (res.data.data.timeSlots || []).map((s: { id: string; displayName: string }) => ({
            id: s.id,
            displayName: s.displayName,
          }));
          setTimeSlots(slots);
        }
      } catch (err) {
        console.error('Error fetching time slots', err);
      }
    };
    fetchTimeSlots();
  }, []);

  const deleteTeam = useCallback(async (teamId: string) => {
    try {
      await api.delete(`/admin/teams/${teamId}`);
      showSuccess('Équipe supprimée avec succès.');
      onRefresh();
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error.response?.data?.message || 'Erreur lors de la suppression de l\'équipe.');
      return false;
    }
  }, [onRefresh, showSuccess, showError]);

  const createTeam = useCallback(async (name: string, captainEmail?: string) => {
    try {
      const payload: { name: string; captainEmail?: string } = { name };
      if (captainEmail) payload.captainEmail = captainEmail;

      await api.post('/admin/teams/create', payload);
      showSuccess('Équipe créée avec succès.');
      onRefresh();
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error.response?.data?.message || 'Erreur lors de la création de l\'équipe.');
      return false;
    }
  }, [onRefresh, showSuccess, showError]);

  const addMember = useCallback(async (teamId: string, userId: string) => {
    try {
      await api.post('/admin/teams/add-member', { teamId, userId });
      showSuccess('Membre ajouté avec succès.');
      onRefresh();
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error.response?.data?.message || 'Erreur lors de l\'ajout du membre.');
      return false;
    }
  }, [onRefresh, showSuccess, showError]);

  const assignTimeSlot = useCallback(async (teamId: string, timeSlotId: string | null) => {
    try {
      await api.post('/admin/teams/assign-timeslot', { teamId, timeSlotId });
      showSuccess(timeSlotId ? 'Créneau assigné avec succès.' : 'Créneau retiré avec succès.');
      onRefresh();
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error.response?.data?.message || 'Erreur lors de l\'assignation du créneau.');
      return false;
    }
  }, [onRefresh, showSuccess, showError]);

  return {
    error,
    success,
    timeSlots,
    setError,
    setSuccess,
    deleteTeam,
    createTeam,
    addMember,
    assignTimeSlot,
  };
}

