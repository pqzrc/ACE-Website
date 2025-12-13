'use client';

import { useState } from 'react';
import { Clock, Plus, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useTimeSlotsManagement, TimeSlotFormData } from '@/hooks/useTimeSlotsManagement';
import { TimeSlotCard, TimeSlotForm } from './timeslots';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function AdminTimeSlotsManagement() {
  const {
    timeSlots,
    teamsWithoutSlot,
    loading,
    error,
    success,
    expandedSlots,
    setError,
    setSuccess,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    assignTeam,
    removeTeam,
    toggleSlotExpanded,
    DEFAULT_FORM,
  } = useTimeSlotsManagement();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSlot, setNewSlot] = useState<TimeSlotFormData>(DEFAULT_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; slotId: string; slotName: string }>({
    isOpen: false,
    slotId: '',
    slotName: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createTimeSlot(newSlot);
    if (success) {
      setShowCreateModal(false);
      setNewSlot(DEFAULT_FORM);
    }
  };

  const openDeleteConfirmation = (slotId: string, slotName: string) => {
    setConfirmDelete({ isOpen: true, slotId, slotName });
  };

  const closeDeleteConfirmation = () => {
    setConfirmDelete({ isOpen: false, slotId: '', slotName: '' });
  };

  const confirmDeleteAction = async () => {
    await deleteTimeSlot(confirmDelete.slotId);
    closeDeleteConfirmation();
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
          <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-red-200">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
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
            <TimeSlotCard
              key={slot.id}
              slot={slot}
              isExpanded={expandedSlots.has(slot.id)}
              teamsWithoutSlot={teamsWithoutSlot}
              onToggleExpand={() => toggleSlotExpanded(slot.id)}
              onUpdate={(data) => updateTimeSlot(slot.id, data)}
              onDelete={() => openDeleteConfirmation(slot.id, slot.displayName)}
              onAssignTeam={assignTeam}
              onRemoveTeam={removeTeam}
            />
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Créer un nouveau créneau</h3>
            <TimeSlotForm
              data={newSlot}
              onChange={setNewSlot}
              onSubmit={handleCreate}
              onCancel={() => {
                setShowCreateModal(false);
                setNewSlot(DEFAULT_FORM);
              }}
              submitLabel="Créer"
            />
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
