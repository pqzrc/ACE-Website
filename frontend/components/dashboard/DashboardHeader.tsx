import Link from 'next/link';
import Image from 'next/image';
import { Terminal, LogOut, Shield, User } from 'lucide-react';

interface User {
  firstName: string;
  isAdmin: boolean;
  phoneNumber?: string | null;
}

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
  teamScore?: number;
  onProfileClick: () => void;
}

export default function DashboardHeader({ user, onLogout, teamScore, onProfileClick }: DashboardHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-deep-navy/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
              <Image
                src="/assets/logo/ACE-LOGO(2).svg"
                alt="ACE Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-wide group-hover:text-neon-rose transition-colors">
              ACE<span className="text-neon-rose">2025</span>
            </span>
          </Link>

          {/* Score Display in Header */}
          {teamScore !== undefined && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <span className="text-xs text-gray-400 uppercase font-bold">Score</span>
              <span className="font-mono font-bold text-neon-rose">{teamScore}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-gray-400">SYSTÈME EN LIGNE</span>
          </div>

          <div className="flex items-center gap-4">
            {user.isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-rose/20 text-neon-rose border border-neon-rose/50 rounded-lg">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">ADMIN</span>
              </div>
            )}
            <button
              onClick={onProfileClick}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Profil</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
