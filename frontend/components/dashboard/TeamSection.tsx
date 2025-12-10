import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Trophy,
  Key,
  PlusCircle,
  UserPlus,
  Copy,
  Check,
  Trash2,
  DoorOpen,
  AlertTriangle,
  Loader2,
  Calendar
} from 'lucide-react';
import { clsx } from 'clsx';
import { Team } from '@/lib/types';
import TimeSlotSelector from './TimeSlotSelector';

interface TeamSectionProps {
  team: Team | null;
  userId: string;
  onLeaveTeam: () => void;
  leavingTeam: boolean;
}

export default function TeamSection({ team, userId, onLeaveTeam, leavingTeam }: TeamSectionProps) {
  const [copied, setCopied] = useState(false);
  const [showTimeSlotSelector, setShowTimeSlotSelector] = useState(false);

  if (!team) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Users className="w-10 h-10 text-gray-500" />
        </div>
        <h4 className="text-xl text-white font-bold mb-2">Aucune équipe assignée</h4>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Pour participer à l&apos;opération, vous devez rejoindre une équipe existante ou en former une nouvelle.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Link
            href="/team/create"
            className="group p-4 rounded-xl border border-neon-rose/30 bg-neon-rose/10 hover:bg-neon-rose/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <PlusCircle className="w-5 h-5 text-neon-rose" />
              <span className="font-bold text-white">Créer une équipe</span>
            </div>
            <p className="text-xs text-gray-400 group-hover:text-gray-300">
              Former une nouvelle équipe et inviter des agents.
            </p>
          </Link>

          <Link
            href="/team/join"
            className="group p-4 rounded-xl border border-sky-aqua/30 bg-sky-aqua/10 hover:bg-sky-aqua/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <UserPlus className="w-5 h-5 text-sky-aqua" />
              <span className="font-bold text-white">Rejoindre</span>
            </div>
            <p className="text-xs text-gray-400 group-hover:text-gray-300">
              Intégrer une équipe existante avec un code.
            </p>
          </Link>

          <Link
            href="/no-team"
            className="group p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-white">Je n'ai pas d'équipe</span>
            </div>
            <p className="text-xs text-gray-400 group-hover:text-gray-300">
              Rejoindre une équipe disponible par créneau.
            </p>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Team Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
        <div className="flex-1">
          <h2 className="text-3xl font-display font-bold text-white text-glow">{team.name}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className={clsx(
              "px-2 py-0.5 rounded text-xs font-medium border",
              team.isComplete
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
            )}>
              {team.isComplete ? 'COMPLET' : 'RECRUTEMENT EN COURS'}
            </span>
            <span className="text-gray-400 text-sm">{team.memberCount} / 5 Agents</span>
          </div>

          {/* Time Slot Display/Selector */}
          <div className="mt-4">
            {team.timeSlot ? (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-sky-aqua/10 border border-sky-aqua/30 rounded-lg">
                <Calendar className="w-4 h-4 text-sky-aqua" />
                <div>
                  <p className="text-xs text-sky-aqua font-bold">
                    Salle {team.timeSlot.roomName} – {team.timeSlot.startTime.substring(0, 5)}-{team.timeSlot.endTime.substring(0, 5)}
                  </p>
                </div>
                {team.captainId === userId && (
                  <button
                    onClick={() => setShowTimeSlotSelector(true)}
                    className="ml-2 text-xs text-sky-aqua hover:text-white transition-colors underline"
                  >
                    Modifier
                  </button>
                )}
              </div>
            ) : (
              team.captainId === userId && (
                <button
                  onClick={() => setShowTimeSlotSelector(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Choisir un créneau horaire</span>
                </button>
              )
            )}
          </div>
        </div>

      </div>

      {/* Invite Code */}
      <div className="bg-gradient-to-r from-neon-rose/10 to-sky-aqua/10 rounded-xl p-6 border border-neon-rose/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-neon-rose/20 rounded-lg flex items-center justify-center">
            <Key className="w-6 h-6 text-neon-rose" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Code d&apos;invitation</p>
            <p className="text-xs text-gray-400">Partagez ce code pour inviter des membres</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 font-mono text-3xl font-bold text-white tracking-[0.3em] bg-black/40 px-6 py-4 rounded-xl border-2 border-neon-rose/50 select-all text-center">
            {team.inviteCode || 'Chargement...'}
          </div>
          {team.inviteCode && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(team.inviteCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-6 py-4 bg-neon-rose hover:bg-neon-rose/90 text-white font-bold rounded-xl transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copier
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Member List */}
      <div>
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Membres actifs</h4>
        <div className="grid gap-3">
          {team.members.map((member) => (
            <div
              key={member.id}
              className={clsx(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                member.id === userId
                  ? "bg-white/10 border-white/20"
                  : "bg-surface border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                  member.id === team.captainId ? "bg-neon-rose text-white" : "bg-gray-700 text-gray-300"
                )}>
                  {member.firstName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-white flex items-center gap-2">
                    {member.firstName} {member.lastName}
                    {member.id === team.captainId && (
                      <span className="text-xs bg-neon-rose/20 text-neon-rose px-1.5 py-0.5 rounded border border-neon-rose/30">
                        CAPITAINE
                      </span>
                    )}
                    {member.id === userId && (
                      <span className="text-xs bg-sky-aqua/20 text-sky-aqua px-1.5 py-0.5 rounded border border-sky-aqua/30">
                        VOUS
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{member.composante} • {member.specialty}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-gray-500 uppercase">{member.specialty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-neon-rose/10 to-purple-500/10 border border-neon-rose/20 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <span className="font-bold text-white">Score Actuel</span>
        </div>
        <div className="text-2xl font-mono font-bold text-white">
          {team.currentScore} <span className="text-sm text-gray-400 font-sans font-normal">pts</span>
        </div>
      </div>

      {/* Leave/Delete Team Button */}
      <div className="mt-8 pt-6 border-t border-white/10">
        {team.captainId === userId ? (
          <button
            onClick={onLeaveTeam}
            disabled={leavingTeam}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {leavingTeam ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Supprimer l&apos;équipe
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onLeaveTeam}
            disabled={leavingTeam}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {leavingTeam ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sortie...
              </>
            ) : (
              <>
                <DoorOpen className="w-5 h-5" />
                Quitter l&apos;équipe
              </>
            )}
          </button>
        )}
        {team.captainId === userId && (
          <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Cette action supprimera l&apos;équipe et retirera tous les membres
          </p>
        )}
      </div>

      {/* Time Slot Selector Modal */}
      {showTimeSlotSelector && (
        <TimeSlotSelector
          currentTimeSlotId={team.timeSlotId || null}
          isCaptain={team.captainId === userId}
          onClose={() => setShowTimeSlotSelector(false)}
          onSuccess={() => {
            // Trigger a page refresh to get updated team data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

