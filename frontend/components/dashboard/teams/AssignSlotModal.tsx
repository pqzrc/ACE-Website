'use client';

import { useState, useEffect } from 'react';
import { TimeSlotOption } from '@/hooks/useAdminTeamsManagement';

interface AssignSlotModalProps {
  isOpen: boolean;
  currentSlotId: string | null;
  timeSlots: TimeSlotOption[];
  onClose: () => void;
  onAssign: (timeSlotId: string | null) => Promise<boolean>;
}

export default function AssignSlotModal({
  isOpen,
  currentSlotId,
  timeSlots,
  onClose,
  onAssign,
}: AssignSlotModalProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(currentSlotId);

  useEffect(() => {
    setSelectedSlotId(currentSlotId);
  }, [currentSlotId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onAssign(selectedSlotId);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Assigner un créneau horaire</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Créneau horaire</label>
            <select
              value={selectedSlotId || ''}
              onChange={(e) => setSelectedSlotId(e.target.value || null)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Retirer le créneau</option>
              {timeSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.displayName}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              Sélectionnez un créneau pour l&apos;équipe ou laissez vide pour retirer le créneau actuel.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

