'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAdminData } from '@/hooks/useAdminData';
import { useAdminActions } from '@/hooks/useAdminActions';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AdminTabs from '@/components/dashboard/AdminTabs';
import AdminStats from '@/components/dashboard/AdminStats';
import AdminTeamsList from '@/components/dashboard/AdminTeamsList';
import AdminRoomsManagement from '@/components/dashboard/AdminRoomsManagement';
import AdminTimeSlotsManagement from '@/components/dashboard/AdminTimeSlotsManagement';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { stats, teams, roomNames, loading, updateTeam, setTeams, setRoomNames } = useAdminData(user?.isAdmin ?? false);
  const { handleExportCSV, handleAssignRoom, handleUpdateRoomName, handleAddRoom, handleDeleteRoom } = useAdminActions(teams, updateTeam);
  const [activeTab, setActiveTab] = useState<'stats' | 'teams' | 'rooms' | 'timeslots'>('stats');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleAssignRoomWithAlert = async (teamId: string, roomNumber: number) => {
    try {
      await handleAssignRoom(teamId, roomNumber);
      setSuccess('Salle assignée avec succès !');
      setError('');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'assignation');
      setSuccess('');
    }
  };

  const handleAddRoomWithUpdate = async () => {
    try {
      const result = await handleAddRoom();
      if (result) {
        // Update room names with the new room
        setRoomNames(prev => ({
          ...prev,
          [result.id]: result.name
        }));
        setSuccess('Salle ajoutée avec succès !');
        setError('');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout de la salle');
      setSuccess('');
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner message="Chargement..." />;
  }

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-deep-navy relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-aqua/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-rose/5 blur-[120px] rounded-full pointer-events-none" />

      <DashboardHeader user={user} onLogout={logout} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <AdminTabs
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as 'stats' | 'teams' | 'rooms' | 'timeslots')}
            showTeamTab={false}
          />
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 flex items-center gap-3 mb-6">
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
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center gap-3 mb-6">
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

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <AdminStats stats={stats} />
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <AdminTeamsList teams={teams} />
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <AdminRoomsManagement
            teams={teams}
            onAssignRoom={handleAssignRoomWithAlert}
            roomNames={roomNames}
            onUpdateRoomName={async (roomNumber, name) => {
              await handleUpdateRoomName(roomNumber, name);
              setRoomNames(prev => ({ ...prev, [roomNumber]: name }));
            }}
            onAddRoom={handleAddRoomWithUpdate}
            onDeleteRoom={async (roomNumber) => {
              await handleDeleteRoom(roomNumber);
              setRoomNames(prev => {
                const newNames = { ...prev };
                delete newNames[roomNumber];
                return newNames;
              });
            }}
          />
        )}

        {/* Time Slots Tab */}
        {activeTab === 'timeslots' && (
          <AdminTimeSlotsManagement />
        )}
      </main>
    </div>
  );
}



