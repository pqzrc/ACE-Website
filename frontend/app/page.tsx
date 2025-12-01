'use client';

import Link from "next/link";
import { ArrowRight, LayoutDashboard, BookOpen } from "lucide-react";
import PixelBlast from "@/components/PixelBlast";
import NavigationBar from "@/components/NavigationBar";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in by checking for token
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-deep-navy relative overflow-hidden selection:bg-neon-rose selection:text-white">

      {/* Header */}
      <NavigationBar />

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="relative w-full h-screen flex items-center justify-center">
          {/* PixelBlast Background */}
          <div className="absolute inset-0 z-0">
            <PixelBlast
              variant="circle"
              pixelSize={16}
              color="#B19EEF"
              patternScale={4}
              patternDensity={3.5}
              pixelSizeJitter={0.6}
              enableRipples
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid
              liquidStrength={0.12}
              liquidRadius={1.2}
              liquidWobbleSpeed={5}
              speed={0.6}
              edgeFade={0.0}
              transparent
            />
          </div>

          {/* Content Overlay */}
          <div className="container mx-auto px-6 text-center relative z-10 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-midnight-blue/50 border border-neon-rose/30 mb-8 animate-fade-in backdrop-blur-md pointer-events-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-rose opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-rose"></span>
              </span>
              <span className="text-xs font-medium text-neon-rose uppercase tracking-wider">Inscriptions ouvertes</span>
            </div>

            <h1 className="font-display text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
                Escape Game
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-rose to-sky-aqua text-glow">
                Cybersécurité
              </span>
            </h1>

            {/* Conditional Buttons based on login status */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="group relative px-8 py-4 bg-neon-rose hover:bg-neon-rose/90 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-neon flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Accéder au tableau de bord
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/a-propos"
                    className="px-8 py-4 bg-deep-navy/80 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl backdrop-blur-md transition-all flex items-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    Voir les règles
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="group relative px-8 py-4 bg-neon-rose hover:bg-neon-rose/90 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-neon flex items-center gap-2"
                  >
                    Rejoindre l&apos;aventure
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 bg-deep-navy/80 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl backdrop-blur-md transition-all"
                  >
                    J&apos;ai déjà un compte
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
