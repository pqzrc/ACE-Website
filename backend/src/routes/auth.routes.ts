import { Router } from 'express';
import { z } from 'zod';
import authController from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authLimiter, loginLimiter } from '../middleware/rateLimiter.middleware';
import { isUsernameAppropriate, isNameAppropriate } from '../utils/profanity-filter';

const router = Router();

// Schémas de validation
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z
    .string()
    .min(2, 'Prénom requis')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .refine(
      (name) => isNameAppropriate(name),
      'Le prénom contient des mots inappropriés'
    ),
  lastName: z
    .string()
    .min(2, 'Nom requis')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .refine(
      (name) => isNameAppropriate(name),
      'Le nom contient des mots inappropriés'
    ),
  phoneNumber: z
    .string()
    .regex(/^((\+33|0)[1-9]\d{8}|(\+596|\+590|\+594|\+262)\d{9})$/, 'Numéro de téléphone invalide (France métropolitaine et DOM-TOM)')
    .optional()
    .or(z.literal('')),
  username: z
    .string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(20, 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'
    )
    .regex(
      /^[a-zA-Z0-9].*[a-zA-Z0-9]$/,
      'Le nom d\'utilisateur doit commencer et finir par une lettre ou un chiffre'
    )
    .refine(
      (username) => isUsernameAppropriate(username),
      'Ce nom d\'utilisateur contient des mots interdits'
    ),
  // Champs optionnels pour les statistiques
  composante: z.string().optional(),
  specialty: z.string().optional(),
  // hCaptcha token (requis en production, optionnel en dev)
  captchaToken: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requis'),
});

const resendVerificationSchema = z.object({
  email: z.string().email('Email invalide'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

// Routes publiques
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', authLimiter, validate(resendVerificationSchema), authController.resendVerification);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Routes protégées
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.post('/logout', authController.logout);

export default router;

