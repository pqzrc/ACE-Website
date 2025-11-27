'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface EmailVerificationBannerProps {
  email: string;
}

export default function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResendEmail = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await api.post('/auth/resend-verification', { email });
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000); // Hide success message after 5s
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
      setTimeout(() => setError(''), 5000); // Hide error message after 5s
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-yellow-400 font-bold mb-1">Email non vérifié</h3>
          <p className="text-gray-300 text-sm mb-3">
            Vous devez vérifier votre email pour accéder à toutes les fonctionnalités.
            Vérifiez votre boîte de réception ({email}).
          </p>

          {success && (
            <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>Email de vérification envoyé avec succès !</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleResendEmail}
            disabled={loading || success}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi en cours...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Email envoyé !
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Renvoyer l'email de vérification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
