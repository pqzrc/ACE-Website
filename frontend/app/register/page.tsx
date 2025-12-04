'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, School, BookOpen, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import PixelBlast from "@/components/PixelBlast";
import NavigationBar from '@/components/NavigationBar';
import FormField from '@/components/forms/FormField';
import FormSection from '@/components/forms/FormSection';
import SuccessMessage from '@/components/ui/SuccessMessage';
import HCaptcha from '@/components/HCaptcha';
import UsernameField from '@/components/forms/UsernameField';
import PasswordField from '@/components/forms/PasswordField';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    composante: '',
    specialty: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');

  // hCaptcha sitekey depuis les variables d'environnement
  const hcaptchaSitekey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || '';

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

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
      // Clean phone number (remove spaces, dashes, dots)
      const cleanedPhoneNumber = formData.phoneNumber.replace(/[\s\-\.]/g, '');

      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        phoneNumber: cleanedPhoneNumber,
        composante: formData.composante,
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
          subMessage="Veuillez vérifier votre email afin de pouvoir participer."
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
            liquid={false}
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
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Numéro de téléphone <span className="text-neon-rose">*</span>
                  </label>
                  <div className="phone-input-container">
                    <PhoneInput
                      international
                      defaultCountry="MQ"
                      value={formData.phoneNumber}
                      onChange={(value) => setFormData({ ...formData, phoneNumber: value || '' })}
                      className="w-full bg-deep-navy/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus-within:border-neon-rose/50 focus-within:ring-1 focus-within:ring-neon-rose/50 transition-all"
                      required
                    />
                  </div>
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
                    <PasswordField
                      label="Mot de passe"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <PasswordField
                      label="Confirmation"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={8}
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
                    label="Composante (Université des Antilles)"
                    name="composante"
                    value={formData.composante}
                    onChange={handleChange}
                    icon={School}
                    iconColor="text-gray-500"
                  >
                    <option value="" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Sélectionnez votre composante...</option>
                    <option value="Institut Universitaire de Technologie (IUT) (Martinique)" style={{ backgroundColor: '#050511', color: '#ffffff' }}>
                      Institut Universitaire de Technologie (IUT) (Martinique)
                    </option>
                    <option value="Faculté de droit et d'économie" style={{ backgroundColor: '#050511', color: '#ffffff' }}>
                      Faculté de droit et d'économie
                    </option>
                    <option value="Faculté Jean Bernabé" style={{ backgroundColor: '#050511', color: '#ffffff' }}>
                      Faculté Jean Bernabé
                    </option>
                    <option value="Institut National Supérieur du Professorat et de l'Education (INSPE) (Martinique)" style={{ backgroundColor: '#050511', color: '#ffffff' }}>
                      Institut National Supérieur du Professorat et de l'Education (INSPE) (Martinique)
                    </option>
                    <option value="Bureau de la Formation Continue et de l'Apprentissage (BFCA) (Martinique)" style={{ backgroundColor: '#050511', color: '#ffffff' }}>
                      Bureau de la Formation Continue et de l'Apprentissage (BFCA) (Martinique)
                    </option>
                    <option value="Faculté des Sciences Technologies et Environnement (STE)" style={{ backgroundColor: '#050511', color: '#ffffff' }}>
                      Faculté des Sciences Technologies et Environnement (STE)
                    </option>
                    <option value="UFR Santé - Faculté Hyacinthe BASTARAUD (Martinique)" style={{ backgroundColor: '#050511', color: '#ffffff' }}>
                      UFR Santé - Faculté Hyacinthe BASTARAUD (Martinique)
                    </option>
                    <option value="Institut d'urbanisme, d'architecture et d'aménagement des Antilles" style={{ backgroundColor: '#050511', color: '#ffffff' }}>
                      Institut d'urbanisme, d'architecture et d'aménagement des Antilles
                    </option>
                    <option value="Institut de Biodiversité et de l'Écologie" style={{ backgroundColor: '#050511', color: '#ffffff' }}>
                      Institut de Biodiversité et de l'Écologie
                    </option>
                  </FormField>

                  <FormField
                    label="Domaine d'études / Spécialité"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    icon={BookOpen}
                    iconColor="text-gray-500"
                  >
                    <option value="" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Sélectionner...</option>
                    <optgroup label="Informatique & Technologie" style={{ backgroundColor: '#050511', color: '#9ca3af' }}>
                      <option value="NSI" style={{ backgroundColor: '#050511', color: '#ffffff' }}>NSI (Numérique et Sciences Informatiques)</option>
                      <option value="Informatique" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Informatique</option>
                      <option value="Cybersécurité" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Cybersécurité</option>
                      <option value="Réseaux" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Réseaux et Télécommunications</option>
                      <option value="Intelligence Artificielle" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Intelligence Artificielle</option>
                    </optgroup>
                    <optgroup label="Sciences" style={{ backgroundColor: '#050511', color: '#9ca3af' }}>
                      <option value="SI" style={{ backgroundColor: '#050511', color: '#ffffff' }}>SI (Sciences de l'Ingénieur)</option>
                      <option value="Mathématiques" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Mathématiques</option>
                      <option value="Physique" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Physique</option>
                      <option value="Chimie" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Chimie</option>
                      <option value="Biologie" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Biologie</option>
                      <option value="Sciences de la Terre" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Sciences de la Terre</option>
                    </optgroup>
                    <optgroup label="Lettres & Sciences Humaines" style={{ backgroundColor: '#050511', color: '#9ca3af' }}>
                      <option value="Lettres" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Lettres</option>
                      <option value="Histoire" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Histoire</option>
                      <option value="Géographie" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Géographie</option>
                      <option value="Philosophie" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Philosophie</option>
                      <option value="Sociologie" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Sociologie</option>
                      <option value="Psychologie" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Psychologie</option>
                    </optgroup>
                    <optgroup label="Langues" style={{ backgroundColor: '#050511', color: '#9ca3af' }}>
                      <option value="Langues Étrangères" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Langues Étrangères</option>
                      <option value="Linguistique" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Linguistique</option>
                    </optgroup>
                    <optgroup label="Droit & Économie" style={{ backgroundColor: '#050511', color: '#9ca3af' }}>
                      <option value="Droit" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Droit</option>
                      <option value="Économie" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Économie</option>
                      <option value="Sciences Politiques" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Sciences Politiques</option>
                    </optgroup>
                    <optgroup label="Communication & Arts" style={{ backgroundColor: '#050511', color: '#9ca3af' }}>
                      <option value="Communication" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Communication</option>
                    </optgroup>
                    <optgroup label="Santé & Sport" style={{ backgroundColor: '#050511', color: '#9ca3af' }}>
                      <option value="Médecine" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Médecine</option>
                      <option value="STAPS" style={{ backgroundColor: '#050511', color: '#ffffff' }}>STAPS (Sport)</option>
                    </optgroup>
                    <optgroup label="Autre" style={{ backgroundColor: '#050511', color: '#9ca3af' }}>
                      <option value="Autre" style={{ backgroundColor: '#050511', color: '#ffffff' }}>Autre</option>
                    </optgroup>
                  </FormField>
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
