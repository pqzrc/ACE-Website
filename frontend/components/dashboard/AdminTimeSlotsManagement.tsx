'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Clock, MapPin, Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface TimeSlot {
  id: string;
  roomName: string;
  startTime: string;
  endTime: string;
  maxTeams: number;
  isActive: boolean;
  teamCount: number;
  displayName: string;
}

interface AdminTimeSlotsManagementProps {
  // No props needed for now
}

export default function AdminTimeSlotsManagement({}: AdminTimeSlotsManagementProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; slotId: string; slotName: string }>({
    isOpen: false,
    slotId: '',
    slotName: '',
  });

  // Form states
  const [newSlot, setNewSlot] = useState({
    roomName: '',
    startTime: '',
    endTime: '',
    maxTeams: 6,
  });

  const [editSlot, setEditSlot] = useState({
    roomName: '',
    startTime: '',
    endTime: '',
    maxTeams: 6,
    isActive: true,
  });

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get('/timeslots/admin');
      if (response.data.success) {
        setTimeSlots(response.data.data.timeSlots || []);
      }
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError('Erreur lors du chargement des créneaux');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/timeslots', newSlot);
      if (response.data.success) {
        await fetchTimeSlots();
        setShowCreateModal(false);
        setNewSlot({ roomName: '', startTime: '', endTime: '', maxTeams: 6 });
        setError('');
        setSuccess('Créneau horaire créé avec succès !');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors de la création du créneau');
    }
  };

  const handleUpdateTimeSlot = async (slotId: string) => {
    try {
      const response = await api.put(`/timeslots/${slotId}`, editSlot);
      if (response.data.success) {
        await fetchTimeSlots();
        setEditingSlot(null);
        setError('');
        setSuccess('Créneau horaire mis à jour avec succès !');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour du créneau');
    }
  };

  const handleDeleteTimeSlot = async (slotId: string) => {
    try {
      const response = await api.delete(`/timeslots/${slotId}`);
      if (response.data.success) {
        await fetchTimeSlots();
        setError('');
        setSuccess('Créneau horaire supprimé avec succès !');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors de la suppression du créneau');
    }
  };

  const openDeleteConfirmation = (slotId: string, slotName: string) => {
    setConfirmDelete({
      isOpen: true,
      slotId,
      slotName,
    });
  };

  const closeDeleteConfirmation = () => {
    setConfirmDelete({
      isOpen: false,
      slotId: '',
      slotName: '',
    });
  };

  const confirmDeleteAction = () => {
    handleDeleteTimeSlot(confirmDelete.slotId);
    closeDeleteConfirmation();
  };

  const startEditing = (slot: TimeSlot) => {
    setEditingSlot(slot.id);
    setEditSlot({
      roomName: slot.roomName,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxTeams: slot.maxTeams,
      isActive: slot.isActive,
    });
  };

  const cancelEditing = () => {
    setEditingSlot(null);
    setEditSlot({ roomName: '', startTime: '', endTime: '', maxTeams: 6, isActive: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-rose"></div>
        <span className="ml-3 text-white">Chargement des créneaux...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Gestion des Créneaux Horaires</h2>
          <p className="text-slate-400">Créez et gérez les créneaux horaires pour les équipes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-neon-rose hover:bg-neon-rose/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau Créneau
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
          <span className="text-green-200">{success}</span>
          <button
            onClick={() => setSuccess('')}
            className="ml-auto text-green-400 hover:text-green-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-red-200">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Time Slots List */}
      <div className="space-y-4">
        {timeSlots.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun créneau horaire configuré</p>
            <p className="text-sm mt-2">Créez votre premier créneau pour commencer</p>
          </div>
        ) : (
          timeSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              {editingSlot === slot.id ? (
                // Edit Mode
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateTimeSlot(slot.id);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nom de la salle
                      </label>
                      <input
                        type="text"
                        value={editSlot.roomName}
                        onChange={(e) => setEditSlot({ ...editSlot, roomName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-rose"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Heure de début
                      </label>
                      <input
                        type="time"
                        value={editSlot.startTime}
                        onChange={(e) => setEditSlot({ ...editSlot, startTime: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-rose"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Heure de fin
                      </label>
                      <input
                        type="time"
                        value={editSlot.endTime}
                        onChange={(e) => setEditSlot({ ...editSlot, endTime: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-rose"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Max équipes
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={editSlot.maxTeams}
                        onChange={(e) => setEditSlot({ ...editSlot, maxTeams: parseInt(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-rose"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={editSlot.isActive}
                        onChange={(e) => setEditSlot({ ...editSlot, isActive: e.target.checked })}
                        className="rounded border-slate-600 text-neon-rose focus:ring-neon-rose"
                      />
                      Créneau actif
                    </label>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Sauvegarder
                    </button>
                  </div>
                </form>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-neon-rose/20 p-2 rounded-lg">
                        <MapPin className="w-5 h-5 text-neon-rose" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Salle {slot.roomName}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span>{slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {slot.teamCount}/{slot.maxTeams}
                      </div>
                      <div className="text-sm text-slate-400">équipes</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          slot.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`}
                      />
                      <span className={`text-sm ${
                        slot.isActive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {slot.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(slot)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteConfirmation(slot.id, slot.displayName)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Créer un nouveau créneau</h3>
            <form onSubmit={handleCreateTimeSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nom de la salle
                </label>
                <input
                  type="text"
                  value={newSlot.roomName}
                  onChange={(e) => setNewSlot({ ...newSlot, roomName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-rose"
                  placeholder="H0, H1, A1, etc."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-rose"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-rose"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre maximum d'équipes
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newSlot.maxTeams}
                  onChange={(e) => setNewSlot({ ...newSlot, maxTeams: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-rose"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSlot({ roomName: '', startTime: '', endTime: '', maxTeams: 6 });
                  }}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-neon-rose hover:bg-neon-rose/80 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDeleteAction}
        title="Supprimer le créneau"
        message={`Êtes-vous sûr de vouloir supprimer le créneau "${confirmDelete.slotName}" ? Cette action est irréversible et toutes les équipes assignées à ce créneau seront désassignées.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isDanger={true}
      />
    </div>
  );
}
