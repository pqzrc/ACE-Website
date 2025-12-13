'use client';

import { useState } from 'react';
import { Search, Shield, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { AdminUser } from '@/hooks/useAdminData';
import { useAdminTeamsManagement, AdminTeam } from '@/hooks/useAdminTeamsManagement';
import { TeamCard, CreateTeamModal, AddMemberModal, AssignSlotModal } from './teams';

interface AdminTeamsManagementProps {
  teams: AdminTeam[];
  users: AdminUser[];
  onRefresh: () => void;
}

export default function AdminTeamsManagement({ teams, users, onRefresh }: AdminTeamsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAssignSlotModal, setShowAssignSlotModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTeamSlotId, setSelectedTeamSlotId] = useState<string | null>(null);

  const {
    error,
    success,
    timeSlots,
    setError,
    setSuccess,
    deleteTeam,
    createTeam,
    addMember,
    assignTimeSlot,
  } = useAdminTeamsManagement(teams, onRefresh);

  const availableUsers = users.filter((u) => !u.team);

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.captain && team.captain.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      team.inviteCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSlot =
      selectedSlot === 'all'
        ? true
        : selectedSlot === 'no-slot'
          ? !team.timeSlotId
          : team.timeSlotId === selectedSlot;

    return matchesSearch && matchesSlot;
  });

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.')) return;
    await deleteTeam(teamId);
  };

  const openAddMember = (teamId: string) => {
    setSelectedTeamId(teamId);
    setShowAddMemberModal(true);
  };

  const openAssignSlot = (teamId: string, currentSlotId: string | null) => {
    setSelectedTeamId(teamId);
    setSelectedTeamSlotId(currentSlotId);
    setShowAssignSlotModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-400" />
          Gestion des Équipes
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une équipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tous les créneaux</option>
            <option value="no-slot">Sans créneau</option>
            {timeSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>{slot.displayName}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Créer une équipe
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <button onClick={() => setError('')} className="ml-auto">×</button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <p>{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto">×</button>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid gap-4">
        {filteredTeams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            onDelete={() => handleDeleteTeam(team.id)}
            onAddMember={() => openAddMember(team.id)}
            onAssignSlot={() => openAssignSlot(team.id, team.timeSlotId || null)}
          />
        ))}

        {filteredTeams.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Aucune équipe trouvée
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createTeam}
      />

      <AddMemberModal
        isOpen={showAddMemberModal}
        availableUsers={availableUsers}
        onClose={() => {
          setShowAddMemberModal(false);
          setSelectedTeamId(null);
        }}
        onAdd={(userId) => addMember(selectedTeamId!, userId)}
      />

      <AssignSlotModal
        isOpen={showAssignSlotModal}
        currentSlotId={selectedTeamSlotId}
        timeSlots={timeSlots}
        onClose={() => {
          setShowAssignSlotModal(false);
          setSelectedTeamId(null);
          setSelectedTeamSlotId(null);
        }}
        onAssign={(slotId) => assignTimeSlot(selectedTeamId!, slotId)}
      />
    </div>
  );
}
