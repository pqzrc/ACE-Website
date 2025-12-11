import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface TeamInfo {
  id: string;
  name: string;
  isComplete: boolean;
}

export interface AvailableTeam {
  id: string;
  name: string;
  isComplete: boolean;
  memberCount: number;
  timeSlotId: string | null;
}

export interface TimeSlot {
  id: string;
  roomName: string;
  startTime: string;
  endTime: string;
  maxTeams: number;
  isActive: boolean;
  teamCount: number;
  displayName: string;
  teams?: TeamInfo[];
}

export interface TimeSlotFormData {
  roomName: string;
  startTime: string;
  endTime: string;
  maxTeams: number;
  isActive?: boolean;
}

const DEFAULT_FORM: TimeSlotFormData = {
  roomName: '',
  startTime: '',
  endTime: '',
  maxTeams: 6,
};

export function useTimeSlotsManagement() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [allTeams, setAllTeams] = useState<AvailableTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  const showSuccess = useCallback((message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setError(message);
  }, []);

  const fetchTimeSlots = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/timeslots/admin');
      if (response.data.success) {
        setTimeSlots(response.data.data.timeSlots || []);
      }
    } catch (err) {
      console.error('Error fetching time slots:', err);
      showError('Erreur lors du chargement des créneaux');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const fetchAllTeams = useCallback(async () => {
    try {
      const response = await api.get('/admin/teams');
      if (response.data.success) {
        setAllTeams(response.data.data.teams || []);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  }, []);

  useEffect(() => {
    fetchTimeSlots();
    fetchAllTeams();
  }, [fetchTimeSlots, fetchAllTeams]);

  const createTimeSlot = useCallback(async (data: TimeSlotFormData) => {
    try {
      const response = await api.post('/timeslots', data);
      if (response.data.success) {
        await fetchTimeSlots();
        showSuccess('Créneau horaire créé avec succès !');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error.response?.data?.message || 'Erreur lors de la création du créneau');
      return false;
    }
  }, [fetchTimeSlots, showSuccess, showError]);

  const updateTimeSlot = useCallback(async (slotId: string, data: TimeSlotFormData & { isActive: boolean }) => {
    try {
      const response = await api.put(`/timeslots/${slotId}`, data);
      if (response.data.success) {
        await fetchTimeSlots();
        showSuccess('Créneau horaire mis à jour avec succès !');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error.response?.data?.message || 'Erreur lors de la mise à jour du créneau');
      return false;
    }
  }, [fetchTimeSlots, showSuccess, showError]);

  const deleteTimeSlot = useCallback(async (slotId: string) => {
    try {
      const response = await api.delete(`/timeslots/${slotId}`);
      if (response.data.success) {
        await fetchTimeSlots();
        showSuccess('Créneau horaire supprimé avec succès !');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error.response?.data?.message || 'Erreur lors de la suppression du créneau');
      return false;
    }
  }, [fetchTimeSlots, showSuccess, showError]);

  const assignTeam = useCallback(async (teamId: string, timeSlotId: string) => {
    try {
      const response = await api.post('/timeslots/assign-team', { teamId, timeSlotId });
      if (response.data.success) {
        await Promise.all([fetchTimeSlots(), fetchAllTeams()]);
        showSuccess('Équipe assignée au créneau avec succès !');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error.response?.data?.message || 'Erreur lors de l\'assignation');
      return false;
    }
  }, [fetchTimeSlots, fetchAllTeams, showSuccess, showError]);

  const removeTeam = useCallback(async (teamId: string) => {
    try {
      const response = await api.post('/timeslots/assign-team', { teamId, timeSlotId: null });
      if (response.data.success) {
        await Promise.all([fetchTimeSlots(), fetchAllTeams()]);
        showSuccess('Équipe retirée du créneau avec succès !');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error.response?.data?.message || 'Erreur lors du retrait');
      return false;
    }
  }, [fetchTimeSlots, fetchAllTeams, showSuccess, showError]);

  const toggleSlotExpanded = useCallback((slotId: string) => {
    setExpandedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slotId)) {
        newSet.delete(slotId);
      } else {
        newSet.add(slotId);
      }
      return newSet;
    });
  }, []);

  const teamsWithoutSlot = allTeams.filter((t) => !t.timeSlotId);

  return {
    timeSlots,
    allTeams,
    teamsWithoutSlot,
    loading,
    error,
    success,
    expandedSlots,
    clearMessages,
    setError,
    setSuccess,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    assignTeam,
    removeTeam,
    toggleSlotExpanded,
    DEFAULT_FORM,
  };
}

