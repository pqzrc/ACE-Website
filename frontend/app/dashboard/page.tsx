'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Clock, Users, Flag, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import { useAdminActions } from '@/hooks/useAdminActions';
import { useTeamData } from '@/hooks/useTeamData';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import UserProfile from '@/components/dashboard/UserProfile';
import TeamSection from '@/components/dashboard/TeamSection';
import AdminTabs from '@/components/dashboard/AdminTabs';
import AdminStats from '@/components/dashboard/AdminStats';
import AdminTeamsManagement from '@/components/dashboard/AdminTeamsManagement';
import AdminRoomsManagement from '@/components/dashboard/AdminRoomsManagement';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import EmailVerificationBanner from '@/components/dashboard/EmailVerificationBanner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, updateUser } = useAuth();
  const { team, roomNames: teamRoomNames, loading: teamLoading, setTeam } = useTeamData();
  const { stats, teams: allTeams, roomNames: adminRoomNames, loading: adminLoading, updateTeam, setRoomNames, refresh } = useAdminData(user?.isAdmin ?? false);
  const { handleExportCSV, handleAssignRoom, handleUpdateRoomName, handleAddRoom, handleDeleteRoom } = useAdminActions(allTeams, updateTeam);

  // Merge roomNames from both sources (admin takes precedence)
  const roomNames = user?.isAdmin ? adminRoomNames : teamRoomNames;
  const [activeTab, setActiveTab] = useState<'team' | 'stats' | 'teams' | 'rooms' | 'timeslots'>('team');
  const [leavingTeam, setLeavingTeam] = useState(false);
  const [redirectingToCTFd, setRedirectingToCTFd] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Modal State
  const [deleteRoomModal, setDeleteRoomModal] = useState<{ isOpen: boolean; roomNumber: number | null }>({
    isOpen: false,
    roomNumber: null
  });

  const loading = teamLoading || (user?.isAdmin && adminLoading);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleAssignRoomWithAlert = async (teamId: string, roomNumber: number) => {
    try {
      await handleAssignRoom(teamId, roomNumber);
      setSuccess('Salle assignée avec succès !');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erreur lors de l\'assignation');
      setSuccess('');
    }
  };

  const handleUpdateRoomNameWithAlert = async (roomNumber: number, name: string) => {
    try {
      await handleUpdateRoomName(roomNumber, name);
      setRoomNames(prev => ({ ...prev, [roomNumber]: name }));
      setSuccess('Nom de salle mis à jour avec succès !');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erreur lors de la mise à jour du nom');
      setSuccess('');
    }
  };

  const handleAddRoomWithAlert = async () => {
    try {
      const newRoom = await handleAddRoom();
      if (newRoom) {
        setRoomNames(prev => ({ ...prev, [newRoom.id]: newRoom.name }));
        setSuccess('Salle ajoutée avec succès !');
        setError('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Erreur lors de l\'ajout de la salle');
      setSuccess('');
    }
  };

  const handleDeleteRoomClick = (roomNumber: number) => {
    setDeleteRoomModal({ isOpen: true, roomNumber });
  };

  const confirmDeleteRoom = async () => {
    const roomNumber = deleteRoomModal.roomNumber;
    if (!roomNumber) return;

    try {
      await handleDeleteRoom(roomNumber);
      setRoomNames(prev => {
        const newRooms = { ...prev };
        delete newRooms[roomNumber];
        return newRooms;
      });
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const handleLeaveTeam = async () => {
    if (!team) return;

    const isCaptain = team.captainId === user?.id;
    const confirmMessage = isCaptain
      ? `Êtes-vous sûr de vouloir supprimer l'équipe "${team.name}" ? Cette action est irréversible et tous les membres seront retirés.`
      : `Êtes-vous sûr de vouloir quitter l'équipe "${team.name}" ?`;

    if (!confirm(confirmMessage)) return;

    setLeavingTeam(true);
    try {
      const response = await api.post('/teams/leave');
      if (response.data.success) {
        // Refresh user profile to update teamId
        const profileResponse = await api.get('/auth/profile');
        if (profileResponse.data.success) {
          updateUser(profileResponse.data.data);
        }
        setTeam(null);
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Erreur lors de la sortie de l\'équipe');
    } finally {
      setLeavingTeam(false);
    }
  };

  const handleRedirectToCTFd = async () => {
    setRedirectingToCTFd(true);
    try {
      // Récupérer le token depuis le cookie ou le localStorage
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1] || localStorage.getItem('token');

      if (!token || !user?.email) {
        alert('Session expirée. Veuillez vous reconnecter.');
        setRedirectingToCTFd(false);
        return;
      }

      // Créer un formulaire invisible pour envoyer le token à CTFd
      const ctfdUrl = process.env.NEXT_PUBLIC_CTFD_URL || 'http://localhost:8000';
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${ctfdUrl}/sso/authenticate`;
      form.target = '_blank'; // Ouvrir dans un nouvel onglet
      form.style.display = 'none';

      // Ajouter le token
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'token';
      tokenInput.value = token;
      form.appendChild(tokenInput);

      // Ajouter l'email
      const emailInput = document.createElement('input');
      emailInput.type = 'hidden';
      emailInput.name = 'email';
      emailInput.value = user.email;
      form.appendChild(emailInput);

      // Soumettre le formulaire
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      // Attendre un peu avant de réactiver le bouton
      setTimeout(() => setRedirectingToCTFd(false), 1000);
    } catch (error: unknown) {
      console.error('Erreur lors de la connexion à CTFd:', error);
      alert('Erreur lors de la connexion à CTFd');
      setRedirectingToCTFd(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-deep-navy relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-aqua/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-rose/5 blur-[120px] rounded-full pointer-events-none" />

      <DashboardHeader user={user} onLogout={logout} teamScore={team?.currentScore} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Bonjour, {user.firstName} !
            </h1>
            <p className="text-gray-400">Bienvenue dans votre dashboard.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Bouton CTFd */}
            <button
              onClick={handleRedirectToCTFd}
              disabled={redirectingToCTFd}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-rose to-purple-600 hover:from-neon-rose/90 hover:to-purple-600/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-neon-rose/30 hover:scale-105"
            >
              <Flag className="w-5 h-5" />
              <span>{redirectingToCTFd ? 'Connexion...' : 'Accéder au CTFd'}</span>
            </button>
            {/* Countdown */}
            <div className="flex items-center gap-3 px-4 py-2 bg-sky-aqua/10 border border-sky-aqua/20 rounded-xl">
              <Clock className="w-5 h-5 text-sky-aqua" />
              <span className="text-sky-aqua font-mono font-bold">J-?? AVANT LE LANCEMENT</span>
            </div>
          </div>
        </div>

        {/* Email Verification Banner */}
        {!user.emailVerified && (
          <EmailVerificationBanner email={user.email} />
        )}

        {/* Admin Tabs */}
        {user.isAdmin && (
          <div className="mb-6">
            <AdminTabs activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as 'team' | 'stats' | 'teams' | 'rooms' | 'timeslots')} />
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && user.isAdmin && stats && (
          <AdminStats stats={stats} />
        )}

        {/* All Teams Tab */}
        {activeTab === 'teams' && user.isAdmin && (
          <AdminTeamsManagement teams={allTeams} onRefresh={refresh} />
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && user.isAdmin && (
          <AdminRoomsManagement
            teams={allTeams}
            roomNames={roomNames}
            onAssignRoom={handleAssignRoomWithAlert}
            onUpdateRoomName={handleUpdateRoomNameWithAlert}
            onAddRoom={handleAddRoomWithAlert}
            onDeleteRoom={handleDeleteRoomClick}
          />
        )}

        <ConfirmationModal
          isOpen={deleteRoomModal.isOpen}
          onClose={() => setDeleteRoomModal({ isOpen: false, roomNumber: null })}
          onConfirm={confirmDeleteRoom}
          title="Supprimer la salle ?"
          message={`Êtes-vous sûr de vouloir supprimer la salle ${deleteRoomModal.roomNumber} ? Toutes les équipes assignées à cette salle seront désassignées. Cette action est irréversible.`}
          confirmText="Supprimer"
          isDanger={true}
        />

        {/* Team Tab (default) */}
        {activeTab === 'team' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Column 1: User Profile */}
            <div className="lg:col-span-1">
              <UserProfile user={user} />
            </div>

            {/* Column 2 & 3: Team Section */}
            <div className="lg:col-span-2">
              <div className="glass-panel p-6 rounded-2xl border border-white/10 h-full">
                <h3 className="flex items-center gap-2 font-display text-xl font-bold text-white mb-6">
                  <Users className="w-6 h-6 text-purple-500" />
                  Statut de l&apos;équipe
                </h3>
                <TeamSection
                  team={team}
                  userId={user.id}
                  onLeaveTeam={handleLeaveTeam}
                  leavingTeam={leavingTeam}
                  roomNames={roomNames}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
