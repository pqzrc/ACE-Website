'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Users, Clock, MapPin, ArrowLeft, Info, Loader2, UserPlus, Mail } from 'lucide-react';
import EmailVerificationBanner from '@/components/dashboard/EmailVerificationBanner';

interface TimeSlotWithTeams {
    timeSlot: {
        id: string;
        displayName: string;
        roomName: string;
        startTime: string;
        endTime: string;
    };
    availableTeamsCount: number;
    teams: Array<{
        id: string;
        name: string;
        memberCount: number;
        availableSpots: number;
    }>;
}

export default function NoTeamPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [slots, setSlots] = useState<TimeSlotWithTeams[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAvailableTeams = async () => {
            try {
                const response = await api.get('/teams/available');
                if (response.data.success) {
                    setSlots(response.data.data.slots);
                }
            } catch (err) {
                console.error('Erreur lors du chargement des équipes disponibles:', err);
                setError('Erreur lors du chargement des équipes disponibles.');
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableTeams();
    }, []);

    const handleJoinSlot = async (timeSlotId: string) => {
        // Check email verification first
        if (user && !user.emailVerified) {
            setError('Vous devez vérifier votre email avant de pouvoir rejoindre une équipe. Vérifiez votre boîte de réception ou demandez un nouvel email de vérification.');
            return;
        }

        setError('');
        setJoining(true);

        try {
            const response = await api.post('/teams/join-available', { timeSlotId });
            if (response.data.success) {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la jonction à une équipe.');
            setJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-deep-navy px-4 py-8 relative overflow-hidden">
            {/* Background Ambient Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-aqua/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-rose/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-4xl">
                <div className="mb-8">
                    <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Retour au QG
                    </Link>

                    {/* Email Verification Warning */}
                    {user && !user.emailVerified && (
                        <div className="mb-6">
                            <EmailVerificationBanner email={user.email} />
                        </div>
                    )}

                    <h1 className="font-display text-4xl font-bold text-white mb-3 flex items-center gap-3">
                        <Users className="w-10 h-10 text-sky-aqua" />
                        Je n'ai pas d'équipe
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Rejoignez une équipe existante qui recherche des membres supplémentaires.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="glass-panel p-12 rounded-2xl border border-white/10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-sky-aqua animate-spin" />
                        <span className="ml-3 text-gray-400 text-lg">Chargement des équipes disponibles...</span>
                    </div>
                ) : slots.length > 0 ? (
                    <div className="space-y-6">
                        {slots.map((slot) => (
                            <div key={slot.timeSlot.id} className="glass-panel p-6 rounded-2xl border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-6 h-6 text-sky-aqua" />
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{slot.timeSlot.displayName}</h3>
                                            <p className="text-sm text-gray-400">
                                                {slot.availableTeamsCount} {slot.availableTeamsCount === 1 ? 'équipe disponible' : 'équipes disponibles'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleJoinSlot(slot.timeSlot.id)}
                                        disabled={joining}
                                        className="flex items-center gap-2 px-6 py-3 bg-sky-aqua hover:bg-sky-aqua/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-sky-aqua/30"
                                    >
                                        {joining ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Jonction...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-5 h-5" />
                                                Rejoindre
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="grid gap-3 mt-4">
                                    {slot.teams.map((team) => (
                                        <div
                                            key={team.id}
                                            className="bg-surface/50 border border-white/5 rounded-xl p-4 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Users className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-white">{team.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {team.memberCount} / 5 membres ({team.availableSpots} {team.availableSpots === 1 ? 'place disponible' : 'places disponibles'})
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Aucune équipe disponible</h3>
                        <p className="text-gray-400 mb-6">
                            Toutes les équipes sont actuellement complètes. Pourquoi ne pas créer votre propre équipe ?
                        </p>
                        <Link
                            href="/team/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-rose hover:bg-neon-rose/90 text-white font-bold rounded-xl transition-all"
                        >
                            <UserPlus className="w-5 h-5" />
                            Créer une équipe
                        </Link>
                    </div>
                )}

                <div className="mt-8 glass-panel p-6 rounded-2xl border border-white/10">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                        <Info className="w-4 h-4 text-sky-aqua" />
                        Comment ça fonctionne ?
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-aqua mt-1.5 shrink-0" />
                            Sélectionnez un créneau horaire qui vous convient
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-aqua mt-1.5 shrink-0" />
                            Vous serez automatiquement ajouté à une équipe disponible dans ce créneau
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-aqua mt-1.5 shrink-0" />
                            Les équipes ont besoin de 3 à 5 membres pour être complètes
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
