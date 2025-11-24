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
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { stats, teams, loading, updateTeam, setTeams } = useAdminData(user?.isAdmin ?? false);
  const { handleExportCSV, handleAssignRoom, handleUpdateRoomName, handleAddRoom, handleDeleteRoom } = useAdminActions(teams, updateTeam);
  const [activeTab, setActiveTab] = useState<'stats' | 'teams' | 'rooms'>('stats');
  const [roomNames, setRoomNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleAssignRoomWithAlert = async (teamId: string, roomNumber: number) => {
    try {
      await handleAssignRoom(teamId, roomNumber);
      alert('Salle assignée avec succès');
    } catch (error) {
      alert('Erreur lors de l\'assignation');
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
            onTabChange={(tab) => setActiveTab(tab as 'stats' | 'teams' | 'rooms')}
            showTeamTab={false}
          />
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <AdminStats stats={stats} onExportCSV={handleExportCSV} />
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
            onAddRoom={async () => {
              await handleAddRoom();
            }}
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
      </main>
    </div>
  );
}



