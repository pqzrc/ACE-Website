'use client';

import { useState } from 'react';
import { X, Phone, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPhoneNumber?: string;
    onUpdate: (phoneNumber: string) => void;
}

export default function ProfileModal({
    isOpen,
    onClose,
    currentPhoneNumber,
    onUpdate,
}: ProfileModalProps) {
    const [phoneNumber, setPhoneNumber] = useState<string>(currentPhoneNumber || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.put('/auth/profile', { phoneNumber });
            if (response.data.success) {
                setSuccess('Profil mis à jour avec succès !');
                onUpdate(phoneNumber);
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-deep-navy border border-white/10 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Mettre à jour le profil</h2>
                    <p className="text-gray-400 text-sm">
                        Modifiez votre numéro de téléphone
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Numéro de téléphone <span className="text-neon-rose">*</span>
                        </label>
                        <div className="phone-input-container">
                            <PhoneInput
                                international
                                defaultCountry="MQ"
                                value={phoneNumber}
                                onChange={(value) => setPhoneNumber(value || '')}
                                className="w-full bg-deep-navy/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus-within:border-neon-rose/50 focus-within:ring-1 focus-within:ring-neon-rose/50 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success message */}
                    {success && (
                        <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !phoneNumber}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-rose to-purple-600 hover:from-neon-rose/90 hover:to-purple-600/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-neon-rose/30 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Mise à jour...
                                </>
                            ) : (
                                <>
                                    <Phone className="w-5 h-5" />
                                    Enregistrer
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
