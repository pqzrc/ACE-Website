'use client';

import { useState, useEffect } from 'react';
import { User, Check, X, Loader2 } from 'lucide-react';
import { validateUsername, USERNAME_RULES } from '@/lib/username-validation';
import { api } from '@/lib/api';

interface UsernameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidityChange?: (isValid: boolean) => void;
}

export default function UsernameField({ value, onChange, onValidityChange }: UsernameFieldProps) {
  const [focused, setFocused] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Validation locale
  const validation = validateUsername(value);

  // Vérification de disponibilité (debounced)
  useEffect(() => {
    // Annule le timeout précédent
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    // Reset l'état si le champ est vide ou invalide
    if (!value || !validation.isValid) {
      setAvailable(null);
      setChecking(false);
      return;
    }

    // Démarre un nouveau timeout pour vérifier la disponibilité
    setChecking(true);
    const timeout = setTimeout(async () => {
      try {
        // TODO: Créer une route API pour vérifier la disponibilité du username
        // Pour l'instant, on simule juste un délai
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulé comme disponible pour le moment
        // Dans une vraie implémentation, faire un appel API ici
        setAvailable(true);
        setChecking(false);
      } catch (error) {
        setChecking(false);
      }
    }, 800); // Attend 800ms après la dernière saisie

    setCheckTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [value, validation.isValid]);

  // Notifie le parent de la validité
  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(validation.isValid && (available === true || available === null));
    }
  }, [validation.isValid, available, onValidityChange]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Nom d'utilisateur (Pseudo) <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <User className="h-5 w-5 text-gray-500" />
        </div>

        <input
          type="text"
          name="username"
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="CyberNinja974"
          required
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-neon-purple focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
        />

        {/* Indicateur de statut */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {checking && value && validation.isValid && (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          )}
          {!checking && value && validation.isValid && available === true && (
            <Check className="h-5 w-5 text-green-500" />
          )}
          {!checking && value && validation.isValid && available === false && (
            <X className="h-5 w-5 text-red-500" />
          )}
          {value && !validation.isValid && (
            <X className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Message d'aide */}
      <p className="text-xs text-gray-500 mt-1 ml-1">
        Ce nom sera affiché publiquement sur le classement.
      </p>

      {/* Erreurs de validation */}
      {value && validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-xs text-red-500 ml-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Règles de validation (affichées au focus ou si erreur) */}
      {(focused || (value && !validation.isValid)) && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Règles du nom d'utilisateur :
          </p>
          <ul className="space-y-1">
            {USERNAME_RULES.map((rule) => {
              const passes = !value || rule.test(value);
              return (
                <li
                  key={rule.id}
                  className={`text-xs flex items-center gap-2 ${
                    passes ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {passes ? (
                    <Check className="h-3 w-3 flex-shrink-0" />
                  ) : (
                    <X className="h-3 w-3 flex-shrink-0" />
                  )}
                  {rule.text}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Message de disponibilité */}
      {!checking && value && validation.isValid && available === false && (
        <p className="text-xs text-red-500 ml-1 flex items-center gap-1">
          <X className="h-3 w-3" />
          Ce nom d'utilisateur est déjà pris
        </p>
      )}
      {!checking && value && validation.isValid && available === true && (
        <p className="text-xs text-green-600 ml-1 flex items-center gap-1">
          <Check className="h-3 w-3" />
          Ce nom d'utilisateur est disponible
        </p>
      )}
    </div>
  );
}
