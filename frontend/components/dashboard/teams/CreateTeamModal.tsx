'use client';

import { useState } from 'react';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, captainEmail?: string) => Promise<boolean>;
}

export default function CreateTeamModal({ isOpen, onClose, onCreate }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');
  const [createWithoutCaptain, setCreateWithoutCaptain] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!createWithoutCaptain && !captainEmail)) return;

    const success = await onCreate(name, createWithoutCaptain ? undefined : captainEmail);
    if (success) {
      setName('');
      setCaptainEmail('');
      setCreateWithoutCaptain(false);
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setCaptainEmail('');
    setCreateWithoutCaptain(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Créer une équipe</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Nom de l&apos;équipe</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="Nom de l'équipe (3-50 caractères)"
              minLength={3}
              maxLength={50}
              required
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="createWithoutCaptain"
                checked={createWithoutCaptain}
                onChange={(e) => {
                  setCreateWithoutCaptain(e.target.checked);
                  if (e.target.checked) setCaptainEmail('');
                }}
                className="w-4 h-4 text-purple-600 bg-slate-950 border-slate-700 rounded focus:ring-purple-500"
              />
              <label htmlFor="createWithoutCaptain" className="text-sm font-medium text-slate-300">
                Créer sans capitaine spécifique
              </label>
            </div>

            {!createWithoutCaptain && (
              <>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email du capitaine</label>
                <input
                  type="email"
                  value={captainEmail}
                  onChange={(e) => setCaptainEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="email@example.com"
                  required={!createWithoutCaptain}
                />
                <p className="text-xs text-slate-500 mt-2">
                  L&apos;utilisateur avec cet email deviendra le capitaine de l&apos;équipe.
                </p>
              </>
            )}

            {createWithoutCaptain && (
              <p className="text-xs text-slate-500 mt-2">
                L&apos;équipe sera créée sans capitaine. Vous pourrez ajouter des membres plus tard.
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
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

