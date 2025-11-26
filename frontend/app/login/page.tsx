'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import PixelBlast from "@/components/PixelBlast";
import NavigationBar from '@/components/NavigationBar';
import PasswordField from '@/components/forms/PasswordField';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      // Si une URL de redirection CTFd est disponible, on peut rediriger
      // Sinon, rediriger vers le dashboard
      if (result?.ctfdRedirectUrl) {
        // Optionnel: rediriger automatiquement vers CTFd
        // window.location.href = result.ctfdRedirectUrl;
        // Ou rediriger vers le dashboard et permettre à l'utilisateur d'accéder à CTFd plus tard
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-rose" />
      </div>
    );
  }

  // If user is logged in, don't render anything (redirect will happen)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-navy relative overflow-hidden">
      <NavigationBar />

      <div className="flex items-center justify-center min-h-screen p-4 relative">
        {/* Background Effects */}
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden blur-[3px]">
          <PixelBlast
            variant="circle"
            pixelSize={6}
            color="#B19EEF"
            patternScale={3}
            patternDensity={1.2}
            pixelSizeJitter={0.5}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.6}
            edgeFade={0.25}
            transparent
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block relative w-48 h-48 hover:scale-105 transition-transform duration-300">
              <Image
                src="/assets/logo/ACE-LOGO(2).svg"
                alt="ACE 2025"
                fill
                className="object-contain drop-shadow-[0_0_25px_rgba(255,42,109,0.6)]"
                priority
              />
            </Link>
          </div>

          {/* Card */}
          <div className="glass-panel p-8 rounded-2xl">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-neon-rose transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-deep-navy/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-rose/50 focus:ring-1 focus:ring-neon-rose/50 transition-all"
                    placeholder="agent@ace.com"
                  />
                </div>
              </div>

              <PasswordField
                label="Mot de passe"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neon-rose hover:bg-neon-rose/90 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-neon disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Connexion
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Pas de compte ?{' '}
              <Link href="/register" className="text-sky-aqua hover:text-sky-aqua/80 font-medium hover:underline transition-all">
                Inscription
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
