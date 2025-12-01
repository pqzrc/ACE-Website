'use client';

import { useEffect, useState } from 'react';
import NavigationBar from '@/components/NavigationBar';
import PixelBlast from '@/components/PixelBlast';
import { api } from '@/lib/api';
import { Trophy, Medal, Award, Loader2, Clock, Lock } from 'lucide-react';

interface TeamScore {
  id: string;
  name: string;
  currentScore: number;
  rank: number | null;
  roomNumber: number | null;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function ClassementPage() {
  const [teams, setTeams] = useState<TeamScore[]>([]);
  const [roomNames, setRoomNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventStatus, setEventStatus] = useState<'before' | 'during' | 'after'>('before');
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  // Event dates from environment variables
  const EVENT_START = process.env.NEXT_PUBLIC_EVENT_START_TIME || '2025-12-11T09:00:00Z';
  const EVENT_END = process.env.NEXT_PUBLIC_EVENT_END_TIME || '2025-12-11T17:00:00Z';

  useEffect(() => {
    // Check event status and update countdown
    const updateEventStatus = () => {
      const now = new Date().getTime();
      const start = new Date(EVENT_START).getTime();
      const end = new Date(EVENT_END).getTime();

      if (now < start) {
        setEventStatus('before');
        const diff = start - now;
        setTimeRemaining(calculateTimeRemaining(diff));
      } else if (now >= start && now < end) {
        setEventStatus('during');
        const diff = end - now;
        setTimeRemaining(calculateTimeRemaining(diff));
      } else {
        setEventStatus('after');
        setTimeRemaining(null);
      }
    };

    updateEventStatus();
    const statusInterval = setInterval(updateEventStatus, 1000);

    return () => clearInterval(statusInterval);
  }, [EVENT_START, EVENT_END]);

  useEffect(() => {
    // Only fetch leaderboard after event
    if (eventStatus === 'after') {
      fetchLeaderboard();
      const interval = setInterval(fetchLeaderboard, 10000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [eventStatus]);

  const calculateTimeRemaining = (diff: number): TimeRemaining => {
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/public/leaderboard');
      if (response.data.success) {
        setTeams(response.data.data.teams || []);
        setRoomNames(response.data.data.roomNames || {});
      } else {
        setError('Erreur lors du chargement du classement');
      }
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError('Impossible de charger le classement. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number | null) => {
    if (rank === null) return null;
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankColor = (rank: number | null) => {
    if (rank === null) return 'text-gray-400';
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-white';
  };

  const CountdownDisplay = ({ time }: { time: TimeRemaining }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
      {[
        { label: 'Jours', value: time.days },
        { label: 'Heures', value: time.hours },
        { label: 'Minutes', value: time.minutes },
        { label: 'Secondes', value: time.seconds }
      ].map((item) => (
        <div key={item.label} className="glass-panel p-6 text-center">
          <div className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-rose to-sky-aqua mb-2">
            {String(item.value).padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">{item.label}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-deep-navy relative overflow-hidden">
      {/* PixelBlast Background - Light version */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, minHeight: '100vh' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#B19EEF"
            patternScale={2}
            patternDensity={0.8}
            pixelSizeJitter={0.3}
            enableRipples={false}
            liquid={false}
            speed={0.3}
            edgeFade={0.3}
            transparent
          />
        </div>
      </div>

      <NavigationBar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-rose to-sky-aqua">
                Classement
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              {eventStatus === 'before' && "L'événement n'a pas encore commencé"}
              {eventStatus === 'during' && "L'événement est en cours"}
              {eventStatus === 'after' && "Découvrez les équipes en tête du classement"}
            </p>
          </div>

          {/* Before Event - Countdown */}
          {eventStatus === 'before' && timeRemaining && (
            <div className="space-y-8">
              <div className="glass-panel p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-aqua/10 mb-6">
                  <Clock className="w-8 h-8 text-sky-aqua" />
                </div>
                <p className="text-gray-400 mb-8">
                  Le classement sera disponible après le début de l&apos;épreuve
                </p>
                <h2 className="text-2xl font-bold text-white mb-4">
                  L&apos;événement commence dans
                </h2>
                <CountdownDisplay time={timeRemaining} />

              </div>

            </div>
          )}

          {/* During Event - Locked */}
          {eventStatus === 'during' && timeRemaining && (
            <div className="space-y-8">
              <div className="glass-panel p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-rose/10 mb-6">
                  <Lock className="w-8 h-8 text-neon-rose" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Le classement sera disponible après l&apos;épreuve
                </h2>
                <p className="text-gray-400 mb-8">
                  L&apos;événement se termine dans
                </p>
              </div>
              <CountdownDisplay time={timeRemaining} />
              <div className="glass-panel p-6 text-center">
                <p className="text-sm text-gray-400">
                  Concentrez-vous sur les énigmes ! Le classement final sera révélé à la fin de l&apos;événement.
                </p>
              </div>
            </div>
          )}

          {/* After Event - Leaderboard */}
          {eventStatus === 'after' && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-neon-rose" />
                </div>
              ) : error ? (
                <div className="glass-panel p-8 text-center">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={fetchLeaderboard}
                    className="px-6 py-2 bg-neon-rose hover:bg-neon-rose/90 text-white font-bold rounded-xl transition-all"
                  >
                    Réessayer
                  </button>
                </div>
              ) : teams.length === 0 ? (
                <div className="glass-panel p-8 text-center">
                  <p className="text-gray-400">Aucune équipe dans le classement pour le moment.</p>
                </div>
              ) : (
                <div className="glass-panel overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-4 px-6 text-sm font-bold text-gray-300 uppercase tracking-wider">
                            Rang
                          </th>
                          <th className="text-left py-4 px-6 text-sm font-bold text-gray-300 uppercase tracking-wider">
                            Équipe
                          </th>
                          <th className="text-right py-4 px-6 text-sm font-bold text-gray-300 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="text-center py-4 px-6 text-sm font-bold text-gray-300 uppercase tracking-wider">
                            Salle
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map((team, index) => (
                          <tr
                            key={team.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                {getRankIcon(team.rank || index + 1)}
                                <span className={`font-bold text-lg ${getRankColor(team.rank || index + 1)}`}>
                                  {team.rank || index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-semibold text-white">{team.name}</span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="font-bold text-sky-aqua text-lg">
                                {team.currentScore || 0}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              {team.roomNumber ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-midnight-blue text-sky-aqua border border-sky-aqua/30">
                                  {roomNames[team.roomNumber] || `Salle ${team.roomNumber}`}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-sm">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
