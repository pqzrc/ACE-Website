'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Shield, Users, ArrowLeft, Info, Loader2, Plus, Clock, MapPin } from 'lucide-react';

interface TimeSlot {
  id: string;
  roomName: string;
  startTime: string;
  endTime: string;
  maxTeams: number;
  teamCount: number;
  isFull: boolean;
  displayName: string;
}

export default function CreateTeamPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await api.get('/timeslots/available');
        if (response.data.success) {
          setTimeSlots(response.data.data.timeSlots);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des créneaux:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/teams/create', {
        name: teamName,
        timeSlotId: selectedTimeSlotId || undefined,
      });
      if (response.data.success) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'équipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-navy flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-neon-rose/10 blur-[100px] rounded-full -z-10" />

      <div className="glass-panel p-8 rounded-2xl border border-white/10 max-w-2xl w-full">
        <div className="mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour au QG
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-neon-rose" />
            Créer une équipe
          </h1>
          <p className="text-gray-400">
            Initialisez une nouvelle équipe et sélectionnez un créneau horaire.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Identifiant de l'équipe
            </label>
            <div className="relative group">
              <Users className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-neon-rose transition-colors" />
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                minLength={3}
                maxLength={50}
                placeholder="Ex: Cyber_Phantom_Unit"
                className="w-full bg-deep-navy/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-rose/50 focus:ring-1 focus:ring-neon-rose/50 transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-1">
              3 à 50 caractères. Doit être unique sur le réseau.
            </p>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 ml-1">
              Créneau horaire (optionnel)
            </label>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-8 bg-surface rounded-xl border border-white/5">
                <Loader2 className="w-5 h-5 text-sky-aqua animate-spin" />
                <span className="ml-2 text-gray-400">Chargement des créneaux...</span>
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTimeSlotId('')}
                  className={`p-4 rounded-xl border transition-all text-left ${selectedTimeSlotId === ''
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-surface border-white/5 hover:border-white/10'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-white">Aucun créneau</p>
                      <p className="text-xs text-gray-500">Choisir plus tard</p>
                    </div>
                  </div>
                </button>
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => !slot.isFull && setSelectedTimeSlotId(slot.id)}
                    disabled={slot.isFull}
                    className={`p-4 rounded-xl border transition-all text-left ${selectedTimeSlotId === slot.id
                      ? 'bg-sky-aqua/20 border-sky-aqua/50'
                      : slot.isFull
                        ? 'bg-surface/50 border-white/5 opacity-50 cursor-not-allowed'
                        : 'bg-surface border-white/5 hover:border-white/10'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-sky-aqua" />
                        <div>
                          <p className="font-medium text-white">{slot.displayName}</p>
                          <p className="text-xs text-gray-500">
                            {slot.teamCount} / {slot.maxTeams} équipes
                          </p>
                        </div>
                      </div>
                      {slot.isFull && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">
                          COMPLET
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-surface rounded-xl p-4 border border-white/5 text-center text-gray-400">
                Aucun créneau disponible pour le moment.
              </div>
            )}
          </div>

          <div className="bg-surface rounded-xl p-4 border border-white/5">
            <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
              <Info className="w-4 h-4 text-sky-aqua" />
              Protocoles de Commandement
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-rose mt-1.5 shrink-0" />
                Vous serez désigné comme Capitaine.
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-rose mt-1.5 shrink-0" />
                Un code d'accès unique sera généré pour le recrutement.
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-rose mt-1.5 shrink-0" />
                L'équipe doit comporter 3 à 5 agents opérationnels.
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-rose hover:bg-neon-rose/90 text-white font-bold py-4 rounded-xl transition-all hover:shadow-neon disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Initialiser l'équipe
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
