import { User } from 'lucide-react';

interface UserProfileProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    username?: string | null;
    school?: string | null;
    grade?: string | null;
    specialty?: string | null;
    affiliation?: string | null;
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">
          <User className="w-5 h-5 text-neon-rose" />
          Profil utilisateur
        </h3>

        <div className="space-y-4">
          <div className="group">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 group-hover:text-sky-aqua transition-colors">
              Identité
            </p>
            <p className="text-white font-medium text-lg">
              {user.firstName} {user.lastName}
            </p>
          </div>

          {user.username && (
            <div className="group">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 group-hover:text-sky-aqua transition-colors">
                Nom d'utilisateur
              </p>
              <p className="text-white font-mono text-sm">@{user.username}</p>
            </div>
          )}

          <div className="group">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 group-hover:text-sky-aqua transition-colors">
              Contact
            </p>
            <p className="text-white font-mono text-sm truncate">{user.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 group-hover:text-sky-aqua transition-colors">
                Affiliation / Établissement
              </p>
              <p className="text-white font-medium">{user.affiliation || user.school || <span className="text-gray-500 italic">Non renseigné</span>}</p>
            </div>
            <div className="group">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 group-hover:text-sky-aqua transition-colors">
                Niveau
              </p>
              <p className="text-white">{user.grade || <span className="text-gray-500 italic">Non renseigné</span>}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="bg-surface rounded-lg p-3 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Spécialité</span>
              <span className="text-sky-aqua font-bold">{user.specialty || <span className="text-gray-500 italic font-normal">Non renseigné</span>}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
