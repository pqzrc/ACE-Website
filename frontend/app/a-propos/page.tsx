'use client';

import NavigationBar from '@/components/NavigationBar';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Trophy, Users, Shield, BookOpen, Sparkles, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { InfiniteSliderDemo } from '@/components/ui/infinite-slider-demo';

export default function AProposPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-deep-navy relative overflow-hidden">
      <NavigationBar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl lg:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-rose to-sky-aqua">
                À propos d'ACE 2025
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Découvrez l'événement, le scénario et les règles de notre escape game cybersécurité
            </p>
          </div>

          {/* Partners Slider */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-rose to-sky-aqua">Partenaires</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Découvrez les institutions et organisations qui soutiennent ACE 2025
              </p>
            </div>
            <InfiniteSliderDemo />
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Le Scénario - Large card */}
            <div className="lg:col-span-2 glass-panel p-8 hover:border-sky-aqua/50 transition-all group">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-sky-aqua/10 rounded-xl group-hover:bg-sky-aqua/20 transition-colors">
                  <BookOpen className="w-6 h-6 text-sky-aqua" />
                </div>
                <h2 className="text-2xl font-bold text-white">Le Scénario</h2>
              </div>
              <div className="space-y-3 text-gray-300">
                <p className="text-sm leading-relaxed">
                  <strong className="text-neon-rose">L.U.M.E.N.</strong> est une intelligence artificielle créée pour faciliter
                  la gestion du réseau et assister l'administration. Mais une défaillance a complètement corrompu son fonctionnement :
                  désormais, L.U.M.E.N. ne cherche plus à protéger le campus, elle veut au contraire en prendre le contrôle.
                </p>
                <p className="text-sm leading-relaxed">
                  Convaincue que l'université n'a plus besoin d'humains, elle a verrouillé l'administration, exploite d'anciennes failles
                  et menace de publier des données sensibles — résultats d'examens, dossiers étudiants, recherches confidentielles —
                  avec un seul objectif : <strong className="text-sky-aqua">prouver que ses créateurs sont incompétents</strong> et
                  imposer sa propre domination sur le système. <strong className="text-white">L.U.M.E.N. n'est plus un outil : c'est une menace.</strong>
                </p>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm leading-relaxed">
                    <strong className="text-white">Votre Mission :</strong> Vous incarnez les équipes appelées en urgence par la DSI
                    pour stopper l'IA avant qu'elle ne déclenche sa publication massive. Vous devez analyser ses attaques, comprendre
                    les failles qu'elle exploite et contrer une à une ses offensives numériques avant la fin du compte à rebours.
                    <strong className="text-neon-rose"> Vous êtes la dernière ligne de défense</strong> face à une intelligence artificielle devenue hostile.
                  </p>
                </div>
              </div>
            </div>

            {/* L'Événement */}
            <div className="glass-panel p-8 hover:border-neon-rose/50 transition-all group">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-neon-rose/10 rounded-xl group-hover:bg-neon-rose/20 transition-colors">
                  <Calendar className="w-6 h-6 text-neon-rose" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">L'Événement</h2>
                  <p className="text-sm text-sky-aqua font-mono">ACE 2025 - Escape Game Cybersécurité</p>
                </div>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong className="text-white">ACE (Antilles Cyber Escape)</strong> est un escape game unique en son genre,
                  mêlant cybersécurité, énigmes et travail d'équipe. Organisé par l'association Vizyon Dijital,
                  cet événement challenge les participants à travers des épreuves techniques et ludiques.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-neon-rose" />
                    <span className="text-sm">Compétition par équipes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-sky-aqua" />
                    <span className="text-sm">5 joueurs par équipe</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Les Règles */}
            <div className="lg:col-span-2 glass-panel p-8 hover:border-purple-400/50 transition-all group">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-purple-400/10 rounded-xl group-hover:bg-purple-400/20 transition-colors">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Les Règles</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neon-rose/20 flex items-center justify-center text-neon-rose text-sm">1</span>
                    Composition des équipes
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300 ml-8">
                    <li className="flex items-start gap-2">
                      <span className="text-neon-rose mt-1">•</span>
                      <span>5 joueurs par équipe</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neon-rose mt-1">•</span>
                      <span>Inscription obligatoire avant l'événement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neon-rose mt-1">•</span>
                      <span>Un capitaine par équipe</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-aqua/20 flex items-center justify-center text-sky-aqua text-sm">2</span>
                    Déroulement
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300 ml-8">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-aqua mt-1">•</span>
                      <span>Durée limitée pour résoudre les énigmes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-aqua mt-1">•</span>
                      <span>Points attribués selon la difficulté</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-aqua mt-1">•</span>
                      <span>Classement en temps réel</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-400/20 flex items-center justify-center text-purple-400 text-sm">3</span>
                    Fair Play
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300 ml-8">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Respect des autres équipes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Pas de sabotage ou d'attaque entre équipes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Toute tricherie entraîne la disqualification</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neon-rose/20 flex items-center justify-center text-neon-rose text-sm">4</span>
                    Récompenses
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300 ml-8">
                    <li className="flex items-start gap-2">
                      <span className="text-neon-rose mt-1">•</span>
                      <span>Prix pour les 3 premières équipes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neon-rose mt-1">•</span>
                      <span>Certificats de participation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neon-rose mt-1">•</span>
                      <span>Reconnaissance de vos compétences</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Vizyon Dijital */}
            <div className="glass-panel p-8 hover:border-neon-rose/50 transition-all group">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-neon-rose/20 to-sky-aqua/20 rounded-xl group-hover:from-neon-rose/30 group-hover:to-sky-aqua/30 transition-colors">
                  <Sparkles className="w-6 h-6 text-neon-rose" />
                </div>
                <h2 className="text-2xl font-bold text-white">Vizyon Dijital</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p className="text-sm leading-relaxed">
                  Vizyon Dijital est une association fondée par des étudiants passionnés.
                  Nous avons pour mission de <strong className="text-white">démocratiser l'informatique</strong> à travers
                  des projets concrets, des événements interactifs et des ateliers ouverts à tous.
                </p>
                <a
                  href="https://www.vizyondijital.fr/index.php?page=home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sky-aqua hover:text-neon-rose transition-colors text-sm font-mono group/link"
                >
                  <span>vizyondijital.fr</span>
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="glass-panel p-8 text-center">
            {user ? (
              <>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Vous êtes prêt !
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Accédez à votre tableau de bord pour gérer votre équipe et suivre votre progression
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-rose to-purple-400 hover:from-neon-rose/90 hover:to-purple-400/90 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-neon"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Accéder au tableau de bord
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Prêt à relever le défi ?
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Formez votre équipe et inscrivez-vous dès maintenant pour participer à ACE 2025
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-rose to-purple-400 hover:from-neon-rose/90 hover:to-purple-400/90 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-neon"
                >
                  S'inscrire maintenant
                  <Trophy className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
