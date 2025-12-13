'use client';

import { TimeSlotFormData } from '@/hooks/useTimeSlotsManagement';

interface TimeSlotFormProps {
  data: TimeSlotFormData & { isActive?: boolean };
  onChange: (data: TimeSlotFormData & { isActive?: boolean }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  showActiveToggle?: boolean;
  submitLabel?: string;
}

export default function TimeSlotForm({
  data,
  onChange,
  onSubmit,
  onCancel,
  showActiveToggle = false,
  submitLabel = 'Sauvegarder',
}: TimeSlotFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Nom de la salle
          </label>
          <input
            type="text"
            value={data.roomName}
            onChange={(e) => onChange({ ...data, roomName: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-rose"
            placeholder="H0, H1, A1, etc."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Heure de début
          </label>
          <input
            type="time"
            value={data.startTime}
            onChange={(e) => onChange({ ...data, startTime: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-rose"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Heure de fin
          </label>
          <input
            type="time"
            value={data.endTime}
            onChange={(e) => onChange({ ...data, endTime: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-rose"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Max équipes
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={data.maxTeams}
            onChange={(e) => onChange({ ...data, maxTeams: parseInt(e.target.value) })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-rose"
            required
          />
        </div>
      </div>

      {showActiveToggle && (
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              checked={data.isActive ?? true}
              onChange={(e) => onChange({ ...data, isActive: e.target.checked })}
              className="rounded border-slate-600 text-neon-rose focus:ring-neon-rose"
            />
            Créneau actif
          </label>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

