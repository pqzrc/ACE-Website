'use client';

import { motion } from 'framer-motion';
import { Trash2, UserPlus, Calendar } from 'lucide-react';
import { AdminTeam } from '@/hooks/useAdminTeamsManagement';

interface TeamCardProps {
  team: AdminTeam;
  onDelete: () => void;
  onAddMember: () => void;
  onAssignSlot: () => void;
}

export default function TeamCard({ team, onDelete, onAddMember, onAssignSlot }: TeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {team.name}
            {team.isComplete && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                Complet
              </span>
            )}
          </h3>
          <div className="text-sm text-slate-400 mt-1">
            Code: <span className="font-mono text-purple-400">{team.inviteCode}</span> •
            Salle: {team.timeSlot?.roomName || 'Non assignée'}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAssignSlot}
            className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
            title="Assigner un créneau"
          >
            <Calendar className="w-5 h-5" />
          </button>
          <button
            onClick={onAddMember}
            className="p-2 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
            title="Ajouter un membre"
          >
            <UserPlus className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
            title="Supprimer l'équipe"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-yellow-400">
          <span className="font-bold">Capitaine:</span>
          {team.captain ? (
            `${team.captain.firstName} ${team.captain.lastName} (${team.captain.email})`
          ) : (
            <span className="text-slate-400 italic">Aucun capitaine assigné</span>
          )}
        </div>

        {team.members.length > 0 ? (
          <div className="space-y-1">
            <div className="text-sm font-bold text-slate-300">Membres:</div>
            {team.members.map((member) => (
              <div key={member.id} className="text-sm text-slate-400 pl-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                {member.firstName} {member.lastName} ({member.email})
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 italic">Aucun membre supplémentaire</div>
        )}
      </div>
    </motion.div>
  );
}

