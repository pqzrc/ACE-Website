'use client';

import { useState } from 'react';
import { AdminUser } from '@/hooks/useAdminData';

interface AddMemberModalProps {
  isOpen: boolean;
  availableUsers: AdminUser[];
  onClose: () => void;
  onAdd: (userId: string) => Promise<boolean>;
}

export default function AddMemberModal({ isOpen, availableUsers, onClose, onAdd }: AddMemberModalProps) {
  const [selectedUserId, setSelectedUserId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const success = await onAdd(selectedUserId);
    if (success) {
      setSelectedUserId('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Ajouter un membre</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sélectionner un utilisateur sans équipe
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            >
              <option value="">Choisir un utilisateur</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              Seuls les utilisateurs sans équipe sont listés.
            </p>
            {availableUsers.length === 0 && (
              <p className="text-xs text-amber-400 mt-2">
                Aucun utilisateur disponible (tous ont déjà une équipe).
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={availableUsers.length === 0}
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

