'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Clock, MapPin, X, CheckCircle, Loader2, Calendar } from 'lucide-react';

interface TimeSlot {
  id: string;
  displayName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  teamCount: number;
  maxTeams: number;
}

interface TimeSlotSelectorProps {
  currentTimeSlotId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
  isCaptain: boolean;
}

export default function TimeSlotSelector({ currentTimeSlotId, onClose, onSuccess, isCaptain }: TimeSlotSelectorProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const response = await api.get('/timeslots/available');
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

  const handleSelectTimeSlot = async (timeSlotId: string | null) => {
    if (!isCaptain) {
      setError('Seul le capitaine peut modifier le créneau horaire');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const response = await api.patch('/teams/update-timeslot', { timeSlotId });
      if (response.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du créneau');
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-sky-aqua" />
              Choisir un créneau horaire
            </h3>
            <p className="text-gray-400 text-sm">
              {isCaptain ? 'Sélectionnez le créneau qui convient à votre équipe' : 'Seul le capitaine peut modifier le créneau'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-sky-aqua animate-spin" />
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucun créneau disponible pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Option pour retirer le créneau */}
            {currentTimeSlotId && (
              <button
                onClick={() => handleSelectTimeSlot(null)}
                disabled={!isCaptain || updating}
                className="w-full p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <X className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="font-bold text-white">Retirer le créneau actuel</p>
                      <p className="text-xs text-gray-400">Vous pourrez le choisir à nouveau plus tard</p>
                    </div>
                  </div>
                </div>
              </button>
            )}

            {timeSlots.map((slot) => {
              const isSelected = slot.id === currentTimeSlotId;
              const isFull = slot.teamCount >= slot.maxTeams;

              return (
                <button
                  key={slot.id}
                  onClick={() => handleSelectTimeSlot(slot.id)}
                  disabled={!isCaptain || updating || (isFull && !isSelected)}
                  className={`w-full p-4 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'border-sky-aqua bg-sky-aqua/20'
                      : isFull
                      ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                      : 'border-white/10 bg-surface/50 hover:bg-surface hover:border-sky-aqua/50'
                  } ${!isCaptain || updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className={`w-5 h-5 ${isSelected ? 'text-sky-aqua' : 'text-gray-400'}`} />
                        <span className={`font-bold ${isSelected ? 'text-sky-aqua' : 'text-white'}`}>
                          {slot.displayName}
                        </span>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-sky-aqua" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </div>
                        <div>
                          <span className={`${isFull && !isSelected ? 'text-red-400' : 'text-gray-400'}`}>
                            {slot.teamCount}/{slot.maxTeams} équipes
                          </span>
                        </div>
                      </div>
                    </div>
                    {updating && isSelected && (
                      <Loader2 className="w-5 h-5 text-sky-aqua animate-spin ml-3" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
