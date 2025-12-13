'use client';

import { Users, UserPlus, UserMinus } from 'lucide-react';
import { TeamInfo, AvailableTeam } from '@/hooks/useTimeSlotsManagement';

interface TimeSlotTeamsListProps {
  teams: TeamInfo[];
  teamsWithoutSlot: AvailableTeam[];
  slotId: string;
  teamCount: number;
  maxTeams: number;
  onAssignTeam: (teamId: string, slotId: string) => void;
  onRemoveTeam: (teamId: string) => void;
}

export default function TimeSlotTeamsList({
  teams,
  teamsWithoutSlot,
  slotId,
  teamCount,
  maxTeams,
  onAssignTeam,
  onRemoveTeam,
}: TimeSlotTeamsListProps) {
  return (
    <div className="border-t border-slate-800 pt-4 mt-4 space-y-4">
      {/* Current teams in slot */}
      {teams && teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-white text-sm">{team.name}</span>
              {team.isComplete ? (
                <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded">
                  Complète
                </span>
              ) : (
                <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded">
                  Incomplète
                </span>
              )}
              <button
                onClick={() => onRemoveTeam(team.id)}
                className="ml-auto p-1 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                title="Retirer du créneau"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm text-center py-2">
          Aucune équipe inscrite à ce créneau
        </p>
      )}

      {/* Add team selector */}
      {teamCount < maxTeams && teamsWithoutSlot.length > 0 && (
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-slate-400" />
          <select
            onChange={(e) => {
              if (e.target.value) {
                onAssignTeam(e.target.value, slotId);
                e.target.value = '';
              }
            }}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-rose"
          >
            <option value="">Ajouter une équipe...</option>
            {teamsWithoutSlot.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.memberCount} membres) {team.isComplete ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {teamCount >= maxTeams && (
        <p className="text-orange-400 text-sm text-center">
          Créneau complet
        </p>
      )}
    </div>
  );
}

