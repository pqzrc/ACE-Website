'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Terminal, LogOut, Menu, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavLink {
  to: string;
  label: string;
  isActive?: boolean;
}

interface NavigationBarProps {
  links?: NavLink[];
  logoUrl?: string;
  brandName?: string;
}

export default function NavigationBar({
  links = [],
  brandName = "ACE 2025"
}: NavigationBarProps) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const defaultLinks: NavLink[] = [
    { to: '/', label: 'Accueil', isActive: pathname === '/' },
    { to: '/classement', label: 'Classement', isActive: pathname === '/classement' },
    { to: '/a-propos', label: 'À propos', isActive: pathname === '/a-propos' },
    ...(user ? [
      { to: '/dashboard', label: 'Tableau de bord', isActive: pathname === '/dashboard' }
    ] : [])
  ];

  const activeLinks = links.length > 0 ? links : defaultLinks;

  const handleLogout = async () => {
    try {
      await logout();
      setExpanded(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isHomePage = pathname === '/';

  return (
    <header className={`${isHomePage ? 'absolute' : 'sticky'} top-0 left-0 right-0 z-50 ${isHomePage ? 'pt-6 md:pt-8' : 'py-6 md:py-8  '}`}>
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        {/* Conteneur arrondi avec blur */}
        <div className={`${isHomePage ? 'rounded-3xl' : 'rounded-2xl'} px-6 py-4 md:px-8 md:py-5 backdrop-blur-xl bg-white/5 border border-white/20 shadow-glass`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" title={brandName} className="flex items-center gap-4 outline-none group">
                <div className="relative w-12 h-12">
                  <Image
                    src="/assets/logo/ACE-LOGO(2).svg"
                    alt="ACE Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_15px_rgba(255,42,109,0.5)]"
                  />
                </div>
                <span className="hidden md:block text-2xl font-display font-bold text-white tracking-tight">
                  ACE <span className="text-sky-aqua">2025</span>
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden gap-2">
              <button
                type="button"
                className="text-white p-3 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setExpanded(!expanded)}
              >
                {!expanded ? (
                  <Menu className="w-8 h-8" />
                ) : (
                  <X className="w-8 h-8" />
                )}
              </button>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:items-center lg:justify-center gap-3">
              {activeLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`px-6 py-3 text-base font-bold rounded-xl transition-all duration-200 ${link.isActive
                    ? 'text-white bg-white/15 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-sm'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Info & Logout */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              {user ? (
                <div className="flex items-center gap-5 pl-5 border-l border-white/20">
                  <div className="text-right hidden xl:block">
                    <p className="text-base font-bold text-white">{user.username || user.email}</p>
                    <div className="flex justify-end">
                      <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-white/10 text-sky-aqua">
                        {user.isAdmin ? "Admin" : user.teamId ? "Membre d'équipe" : "Utilisateur Libre"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="h-12 w-12 flex items-center justify-center rounded-full hover:bg-red-500/20 hover:text-red-500 text-gray-300 transition-all"
                    title="Se déconnecter"
                  >
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <LogOut className="h-6 w-6" />
                    )}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {expanded && (
          <div className="lg:hidden overflow-hidden transition-all duration-300 ease-in-out mt-4 pt-4">
            <div className="flex flex-col gap-2 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/20 shadow-glass">
              {activeLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`p-3 font-bold rounded-xl transition-colors ${link.isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  onClick={() => setExpanded(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 p-3 font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Déconnexion...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}


