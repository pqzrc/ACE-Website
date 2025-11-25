// Validation du username côté client
// Doit correspondre aux règles du backend

// Importe la liste complète de mots interdits (synchronisée avec le backend)
import { FORBIDDEN_WORDS } from './profanity-words';

// SENSITIVE_SUBSTRINGS désactivé pour éviter faux positifs (ex: "tigger")
// La modération se fait via l'interface admin CTFd si besoin

// Normalise un texte (lowercase, retire accents, leet speak, substitutions de lettres)
// Synchronisé avec backend/src/utils/profanity-filter.ts
const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retire les accents
    // Convertit le leet speak en lettres normales
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/6/g, 'g')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/9/g, 'g')
    // Substitutions de lettres courantes
    .replace(/v/g, 'u') // fvck → fuck
    .replace(/ph/g, 'f') // phuck → fuck
    .replace(/kk/g, 'ck') // fukk → fuck
    .replace(/xx/g, 'ck') // fuxx → fuck
    .replace(/\$/g, 's') // sh$t → shit
    .replace(/@/g, 'a') // f@ck → fuck
    // Retire les caractères spéciaux souvent utilisés pour contourner les filtres
    .replace(/[#%^&*()_+=\-\[\]{};':"\\|,.<>/?~`!]/g, '')
    .replace(/\s+/g, ''); // Retire les espaces
};

export interface UsernameValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valide un username selon toutes les règles
 */
export const validateUsername = (username: string): UsernameValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vide
  if (!username || username.trim() === '') {
    return { isValid: false, errors: ['Le nom d\'utilisateur est requis'], warnings: [] };
  }

  // Longueur minimum
  if (username.length < 3) {
    errors.push('Au moins 3 caractères requis');
  }

  // Longueur maximum
  if (username.length > 20) {
    errors.push('Maximum 20 caractères');
  }

  // Caractères autorisés
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Seuls les lettres, chiffres, - et _ sont autorisés');
  }

  // Doit commencer et finir par lettre ou chiffre
  if (!/^[a-zA-Z0-9].*[a-zA-Z0-9]$/.test(username) && username.length >= 2) {
    errors.push('Doit commencer et finir par une lettre ou un chiffre');
  }

  // Vérification des mots interdits (triple vérification - filtre modéré)
  // 1. Vérifier l'original
  const lowerUsername = username.toLowerCase();
  for (const word of FORBIDDEN_WORDS) {
    if (lowerUsername.includes(word.toLowerCase())) {
      errors.push('Ce nom contient des mots interdits');
      break;
    }
  }

  // 2. Vérifier la version normalisée (leet speak + substitutions)
  if (errors.length === 0) {
    const normalizedUsername = normalize(username);
    for (const word of FORBIDDEN_WORDS) {
      if (normalizedUsername.includes(normalize(word))) {
        errors.push('Ce nom contient des mots interdits');
        break;
      }
    }
  }

  // 3. Vérifier sans les chiffres (pour contournements complexes comme NI56GGER)
  if (errors.length === 0) {
    const withoutNumbers = username.toLowerCase().replace(/[0-9]/g, '');
    if (withoutNumbers) {
      for (const word of FORBIDDEN_WORDS) {
        if (withoutNumbers.includes(word.toLowerCase())) {
          errors.push('Ce nom contient des mots interdits');
          break;
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Règles de validation pour affichage
 */
export const USERNAME_RULES = [
  { id: 'length', text: '3 à 20 caractères', test: (u: string) => u.length >= 3 && u.length <= 20 },
  { id: 'chars', text: 'Lettres, chiffres, - et _ uniquement', test: (u: string) => /^[a-zA-Z0-9_-]+$/.test(u) },
  { id: 'edges', text: 'Commence et finit par lettre/chiffre', test: (u: string) => !u || u.length < 2 || /^[a-zA-Z0-9].*[a-zA-Z0-9]$/.test(u) },
  { id: 'appropriate', text: 'Pas de mots inappropriés', test: (u: string) => {
    if (!u) return true;

    // Triple vérification comme dans validateUsername (filtre modéré)
    const lowerU = u.toLowerCase();
    if (FORBIDDEN_WORDS.some(word => lowerU.includes(word.toLowerCase()))) {
      return false;
    }

    const normalized = normalize(u);
    if (FORBIDDEN_WORDS.some(word => normalized.includes(normalize(word)))) {
      return false;
    }

    const withoutNumbers = u.toLowerCase().replace(/[0-9]/g, '');
    if (withoutNumbers && FORBIDDEN_WORDS.some(word => withoutNumbers.includes(word.toLowerCase()))) {
      return false;
    }

    return true;
  }},
];
