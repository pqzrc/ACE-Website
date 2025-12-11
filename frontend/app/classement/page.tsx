'use client';

import { useEffect, useState, useRef } from 'react';
import NavigationBar from '@/components/NavigationBar';
import PixelBlast from '@/components/PixelBlast';
import { api } from '@/lib/api';
import { Trophy, Medal, Award, Loader2, Clock, Lock } from 'lucide-react';

interface TeamMember {
  id: string;
  username: string | null;
  firstName: string;
  lastName: string;
  isCaptain: boolean;
}

interface TeamScore {
  id: string;
  name: string;
  currentScore: number;
  rank: number | null;
  captainId?: string | null;
  members?: TeamMember[];
  timeSlot?: {
    id: string;
    roomName: string;
    startTime: string;
    endTime: string;
  } | null;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface EventConfig {
  eventStart: string;
  eventEnd: string;
  resultsRelease: string;
  eventStatus: 'before' | 'during' | 'after';
  resultsAvailable: boolean;
}

export default function ClassementPage() {
  const [teams, setTeams] = useState<TeamScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventStatus, setEventStatus] = useState<'before' | 'during' | 'after'>('before');
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [canShowResults, setCanShowResults] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeamName, setSelectedTeamName] = useState<string>('');

  // Config loaded from backend via leaderboard endpoint (dynamic, no rebuild needed)
  const configRef = useRef<EventConfig | null>(null);

  // Fetch leaderboard (includes event config) on mount and every 10s
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/public/leaderboard');
        if (response.data.success) {
          const data = response.data.data;
          
          // Update event config from response
          const cfg: EventConfig = {
            eventStart: data.eventStart,
            eventEnd: data.eventEnd,
            resultsRelease: data.resultsRelease,
            eventStatus: data.eventStatus,
            resultsAvailable: data.resultsAvailable,
          };
          configRef.current = cfg;
          setCanShowResults(cfg.resultsAvailable);
          setEventStatus(cfg.eventStatus);
          setConfigLoaded(true);

          // Update teams if available
          if (!data.locked && data.teams) {
            const teamsRaw: TeamScore[] = data.teams || [];
            const teamsWithMembers: TeamScore[] = teamsRaw.map((team: TeamScore) => ({
              ...team,
              members: (team.members || []).map((member: TeamMember) => ({
                ...member,
                isCaptain: member.id === team.captainId
              }))
            }));
            setTeams(teamsWithMembers);
          }
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Impossible de charger le classement.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update countdown every second based on config (only when config is loaded)
  useEffect(() => {
    if (!configLoaded) return;

    const updateCountdown = () => {
      const cfg = configRef.current;
      if (!cfg) return;

      const now = Date.now();
      const start = new Date(cfg.eventStart).getTime();
      const end = new Date(cfg.eventEnd).getTime();
      const release = new Date(cfg.resultsRelease).getTime();

      if (now < start) {
        setEventStatus('before');
        setTimeRemaining(calculateTimeRemaining(start - now));
      } else if (now >= start && now < release) {
        // Pendant l'événement : compte à rebours jusqu'à la publication du classement
        setEventStatus('during');
        setTimeRemaining(calculateTimeRemaining(release - now));
      } else {
        setEventStatus('after');
        // Après l'événement, si pas encore publiés, countdown jusqu'à publication
        if (!cfg.resultsAvailable && now < release) {
          setTimeRemaining(calculateTimeRemaining(release - now));
        } else {
          setTimeRemaining(null);
        }
      }
    };

    // Update immediately
    updateCountdown();
    // Then update every second
    const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
  }, [configLoaded]);

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
        const teamsRaw: TeamScore[] = response.data.data.teams || [];
        const teamsWithMembers: TeamScore[] = teamsRaw.map((team) => ({
          ...team,
          members: (team.members || []).map((member) => ({
            ...member,
            isCaptain: member.id === team.captainId
          }))
        }));
        setTeams(teamsWithMembers);
      } else {
        setError('Erreur lors du chargement du classement');
      }
    } catch (err) {
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

  const formatMemberName = (member: TeamMember) => {
    if (member.username) return member.username;
    return `${member.firstName} ${member.lastName}`;
  };

  const handleShowMembers = (team: TeamScore) => {
    const members = team.members || [];
    setSelectedTeamMembers(members);
    setSelectedTeamName(team.name);
    setShowMembersModal(true);
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
          <div className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-neon-rose to-sky-aqua mb-2">
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
              <span className="text-transparent bg-clip-text bg-linear-to-r from-neon-rose to-sky-aqua">
                Classement
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              {!configLoaded && "Chargement..."}
              {configLoaded && eventStatus === 'before' && "L'événement n'a pas encore commencé"}
              {configLoaded && eventStatus === 'during' && "L'événement est en cours"}
              {configLoaded && eventStatus === 'after' && !canShowResults && "L'épreuve est terminée, le classement sera bientôt révélé"}
              {configLoaded && eventStatus === 'after' && canShowResults && "Découvrez les équipes en tête du classement"}
            </p>
          </div>

          {/* Loading initial config */}
          {!configLoaded && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-neon-rose" />
            </div>
          )}

          {/* Before Event - Countdown */}
          {configLoaded && eventStatus === 'before' && timeRemaining && (
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
          {configLoaded && eventStatus === 'during' && timeRemaining && (
            <div className="space-y-8">
              <div className="glass-panel p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-rose/10 mb-6">
                  <Lock className="w-8 h-8 text-neon-rose" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Le classement sera publié à la fin de l&apos;événement
                </h2>
                <p className="text-gray-400 mb-8">
                  Publication du classement dans
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
          {configLoaded && eventStatus === 'after' && (
            <>
              {!canShowResults ? (
                <div className="space-y-8">
                  <div className="glass-panel p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-rose/10 mb-6">
                      <Lock className="w-8 h-8 text-neon-rose" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Classement bientôt révélé
                    </h2>
                    <p className="text-gray-400 mb-8">
                      Le classement sera dévoilé après la remise des prix. Restez connectés !
                    </p>
                    {timeRemaining && (
                      <>
                        <p className="text-gray-400 mb-4">
                          Le classement sera publié dans
                        </p>
                        <CountdownDisplay time={timeRemaining} />
                      </>
                    )}
                  </div>
                </div>
              ) : loading ? (
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
                              <button
                                type="button"
                                onClick={() => handleShowMembers(team)}
                                className="font-semibold text-white hover:text-sky-aqua transition-colors"
                              >
                                {team.name}
                              </button>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="font-bold text-sky-aqua text-lg">
                                {team.currentScore || 0}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              {team.timeSlot ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-midnight-blue text-sky-aqua border border-sky-aqua/30">
                                  {team.timeSlot.roomName}
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

              {showMembersModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full max-w-md">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-400">Équipe</p>
                        <h3 className="text-xl font-bold text-white">{selectedTeamName}</h3>
                      </div>
                      <button
                        onClick={() => setShowMembersModal(false)}
                        className="text-slate-400 hover:text-white transition-colors"
                        aria-label="Fermer"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                      {selectedTeamMembers.length === 0 ? (
                        <p className="text-slate-400 text-sm">Aucun membre trouvé pour cette équipe.</p>
                      ) : (
                        selectedTeamMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 px-4 py-3"
                          >
                            <div className="text-white font-medium">{formatMemberName(member)}</div>
                            {member.isCaptain && (
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neon-rose/15 text-neon-rose border border-neon-rose/30">
                                Capitaine
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-6 py-4 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => setShowMembersModal(false)}
                        className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
                      >
                        Fermer
                      </button>
                    </div>
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
