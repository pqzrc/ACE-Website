'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { User, Mail, Lock, School, BookOpen, GraduationCap, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import PixelBlast from "@/components/PixelBlast";
import NavigationBar from '@/components/NavigationBar';
import FormField from '@/components/forms/FormField';
import FormSection from '@/components/forms/FormSection';
import SuccessMessage from '@/components/ui/SuccessMessage';
import HCaptcha from '@/components/HCaptcha';
import UsernameField from '@/components/forms/UsernameField';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    affiliation: '',
    grade: '',
    specialty: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');

  // hCaptcha sitekey depuis les variables d'environnement
  const hcaptchaSitekey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        affiliation: formData.affiliation,
        school: formData.affiliation, // Map affiliation to school for backward compatibility
        grade: formData.grade,
        specialty: formData.specialty,
        captchaToken: captchaToken || undefined,
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors de l&apos;inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-deep-navy relative overflow-hidden">
        <NavigationBar />
        <SuccessMessage
          title="Mission acceptée !"
          message="Un lien d'activation sécurisé a été envoyé à"
          email={formData.email}
          linkHref="/login"
          linkText="Retour à la base"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-navy relative overflow-hidden">
      <NavigationBar />
      <div className="py-12 px-4 relative overflow-hidden flex items-center justify-center min-h-screen">
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

        <div className="w-full max-w-3xl relative z-10">
          <div className="text-center mb-10">
            <Link href="/" className="inline-block relative w-40 h-40 mb-6 hover:scale-105 transition-transform duration-300">
              <Image
                src="/assets/logo/ACE-LOGO(2).svg"
                alt="ACE 2025"
                fill
                className="object-contain drop-shadow-[0_0_25px_rgba(255,42,109,0.6)]"
                priority
              />
            </Link>
            <h1 className="font-display text-4xl font-bold text-white mb-2 text-glow">Inscription</h1>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/10">
            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section Identité */}
              <FormSection title="Identité" titleColor="text-sky-aqua">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    label="Prénom"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    icon={User}
                    iconColor="text-gray-500"
                  />
                  <FormField
                    label="Nom"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    icon={User}
                    iconColor="text-gray-500"
                  />
                </div>
                <div className="mt-6">
                  <UsernameField
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </FormSection>

              {/* Section Connexion */}
              <FormSection title="Identifiants" titleColor="text-neon-rose">
                <div className="space-y-6">
                  <FormField
                    label="Adresse email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemple@gmail.com"
                    required
                    icon={Mail}
                    iconColor="text-gray-500"
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Mot de passe"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      icon={Lock}
                      iconColor="text-gray-500"
                    />
                    <FormField
                      label="Confirmation"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      icon={Lock}
                      iconColor="text-gray-500"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Section Informations (optionnelles pour statistiques) */}
              <FormSection title="Informations (optionnel)" titleColor="text-purple-500">
                <p className="text-gray-400 text-sm mb-4">
                  Ces informations nous aident à améliorer l'événement. Elles sont optionnelles mais appréciées.
                </p>
                <div className="space-y-6">
                  <FormField
                    label="Établissement / Affiliation"
                    name="affiliation"
                    value={formData.affiliation}
                    onChange={handleChange}
                    placeholder="Lycée Bellepierre, Université, Entreprise..."
                    icon={School}
                    iconColor="text-gray-500"
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Niveau"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      icon={GraduationCap}
                      iconColor="text-gray-500"
                    >
                      <option value="" className="bg-deep-navy">Sélectionner...</option>
                      <optgroup label="Lycée" className="bg-deep-navy">
                        <option value="Seconde" className="bg-deep-navy">Seconde</option>
                        <option value="Première" className="bg-deep-navy">Première</option>
                        <option value="Terminale" className="bg-deep-navy">Terminale</option>
                      </optgroup>
                      <optgroup label="Université" className="bg-deep-navy">
                        <option value="Licence 1" className="bg-deep-navy">Licence 1</option>
                        <option value="Licence 2" className="bg-deep-navy">Licence 2</option>
                        <option value="Licence 3" className="bg-deep-navy">Licence 3</option>
                        <option value="Master 1" className="bg-deep-navy">Master 1</option>
                        <option value="Master 2" className="bg-deep-navy">Master 2</option>
                        <option value="Doctorat" className="bg-deep-navy">Doctorat</option>
                      </optgroup>
                      <optgroup label="Autre" className="bg-deep-navy">
                        <option value="Professionnel" className="bg-deep-navy">Professionnel</option>
                        <option value="Autre" className="bg-deep-navy">Autre</option>
                      </optgroup>
                    </FormField>
                    <FormField
                      label="Domaine d'études / Spécialité"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      icon={BookOpen}
                      iconColor="text-gray-500"
                    >
                      <option value="" className="bg-deep-navy">Sélectionner...</option>
                      <optgroup label="Informatique & Technologie" className="bg-deep-navy">
                        <option value="NSI" className="bg-deep-navy">NSI (Numérique et Sciences Informatiques)</option>
                        <option value="Informatique" className="bg-deep-navy">Informatique</option>
                        <option value="Cybersécurité" className="bg-deep-navy">Cybersécurité</option>
                        <option value="Réseaux" className="bg-deep-navy">Réseaux et Télécommunications</option>
                        <option value="Intelligence Artificielle" className="bg-deep-navy">Intelligence Artificielle</option>
                      </optgroup>
                      <optgroup label="Sciences" className="bg-deep-navy">
                        <option value="SI" className="bg-deep-navy">SI (Sciences de l'Ingénieur)</option>
                        <option value="Mathématiques" className="bg-deep-navy">Mathématiques</option>
                        <option value="Physique" className="bg-deep-navy">Physique</option>
                        <option value="Chimie" className="bg-deep-navy">Chimie</option>
                        <option value="Biologie" className="bg-deep-navy">Biologie</option>
                        <option value="Sciences de la Terre" className="bg-deep-navy">Sciences de la Terre</option>
                      </optgroup>
                      <optgroup label="Lettres & Sciences Humaines" className="bg-deep-navy">
                        <option value="Lettres" className="bg-deep-navy">Lettres</option>
                        <option value="Histoire" className="bg-deep-navy">Histoire</option>
                        <option value="Géographie" className="bg-deep-navy">Géographie</option>
                        <option value="Philosophie" className="bg-deep-navy">Philosophie</option>
                        <option value="Sociologie" className="bg-deep-navy">Sociologie</option>
                        <option value="Psychologie" className="bg-deep-navy">Psychologie</option>
                      </optgroup>
                      <optgroup label="Langues" className="bg-deep-navy">
                        <option value="Langues Étrangères" className="bg-deep-navy">Langues Étrangères</option>
                        <option value="Linguistique" className="bg-deep-navy">Linguistique</option>
                      </optgroup>
                      <optgroup label="Droit & Économie" className="bg-deep-navy">
                        <option value="Droit" className="bg-deep-navy">Droit</option>
                        <option value="Économie" className="bg-deep-navy">Économie</option>
                        <option value="Sciences Politiques" className="bg-deep-navy">Sciences Politiques</option>
                      </optgroup>
                      <optgroup label="Communication & Arts" className="bg-deep-navy">
                        <option value="Communication" className="bg-deep-navy">Communication</option>
                      </optgroup>
                      <optgroup label="Santé & Sport" className="bg-deep-navy">
                        <option value="Médecine" className="bg-deep-navy">Médecine</option>
                        <option value="STAPS" className="bg-deep-navy">STAPS (Sport)</option>
                      </optgroup>
                      <optgroup label="Autre" className="bg-deep-navy">
                        <option value="Autre" className="bg-deep-navy">Autre</option>
                      </optgroup>
                    </FormField>
                  </div>
                </div>
              </FormSection>

              {/* hCaptcha - Seulement en production */}
              {hcaptchaSitekey && (
                <div className="flex justify-center">
                  <HCaptcha
                    sitekey={hcaptchaSitekey}
                    onVerify={(token) => setCaptchaToken(token)}
                    onError={() => setCaptchaToken('')}
                    onExpire={() => setCaptchaToken('')}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neon-rose hover:bg-neon-rose/90 text-white font-bold py-4 rounded-xl transition-all hover:shadow-neon disabled:opacity-50 flex items-center justify-center gap-2 group mt-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Initialisation...
                  </>
                ) : (
                  <>
                    Confirmer l&apos;inscription
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-sky-aqua hover:text-sky-aqua/80 font-medium hover:underline transition-all">
                Connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
