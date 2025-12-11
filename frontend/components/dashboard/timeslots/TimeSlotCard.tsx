'use client';

import { useState } from 'react';
import { Clock, MapPin, Edit2, Trash2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { TimeSlot, TimeSlotFormData, AvailableTeam } from '@/hooks/useTimeSlotsManagement';
import TimeSlotForm from './TimeSlotForm';
import TimeSlotTeamsList from './TimeSlotTeamsList';

interface TimeSlotCardProps {
  slot: TimeSlot;
  isExpanded: boolean;
  teamsWithoutSlot: AvailableTeam[];
  onToggleExpand: () => void;
  onUpdate: (data: TimeSlotFormData & { isActive: boolean }) => Promise<boolean>;
  onDelete: () => void;
  onAssignTeam: (teamId: string, slotId: string) => void;
  onRemoveTeam: (teamId: string) => void;
}

export default function TimeSlotCard({
  slot,
  isExpanded,
  teamsWithoutSlot,
  onToggleExpand,
  onUpdate,
  onDelete,
  onAssignTeam,
  onRemoveTeam,
}: TimeSlotCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<TimeSlotFormData & { isActive: boolean }>({
    roomName: slot.roomName,
    startTime: slot.startTime,
    endTime: slot.endTime,
    maxTeams: slot.maxTeams,
    isActive: slot.isActive,
  });

  const handleStartEdit = () => {
    setEditData({
      roomName: slot.roomName,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxTeams: slot.maxTeams,
      isActive: slot.isActive,
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onUpdate(editData);
    if (success) setIsEditing(false);
  };

  const handleEditChange = (data: TimeSlotFormData & { isActive?: boolean }) => {
    setEditData({
      ...data,
      isActive: data.isActive ?? editData.isActive,
    });
  };

  if (isEditing) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <TimeSlotForm
          data={editData}
          onChange={handleEditChange}
          onSubmit={handleSubmit}
          onCancel={() => setIsEditing(false)}
          showActiveToggle
          submitLabel="Sauvegarder"
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-neon-rose/20 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-neon-rose" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Salle {slot.roomName}
                </h3>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onToggleExpand}
              className="flex items-center gap-2 text-center hover:bg-slate-800 rounded-lg px-3 py-2 transition-colors"
            >
              <div>
                <div className="text-2xl font-bold text-white">
                  {slot.teamCount}/{slot.maxTeams}
                </div>
                <div className="text-sm text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  équipes
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  slot.isActive ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span className={`text-sm ${
                slot.isActive ? 'text-green-400' : 'text-red-400'
              }`}>
                {slot.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartEdit}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <TimeSlotTeamsList
            teams={slot.teams || []}
            teamsWithoutSlot={teamsWithoutSlot}
            slotId={slot.id}
            teamCount={slot.teamCount}
            maxTeams={slot.maxTeams}
            onAssignTeam={onAssignTeam}
            onRemoveTeam={onRemoveTeam}
          />
        )}
      </div>
    </div>
  );
}

