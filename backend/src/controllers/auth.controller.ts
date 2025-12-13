import { Request, Response } from 'express';
import { verifyCaptcha, isCaptchaRequired } from '../services/captcha.service';
import ctfdService from '../services/ctfd.service';
import { authTokenService, authRegistrationService, authPasswordService, authProfileService } from '../services/auth';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, username, phoneNumber, composante, specialty, captchaToken } = req.body;

      // Verify CAPTCHA if required
      if (isCaptchaRequired()) {
        if (!captchaToken) {
          res.status(400).json({ success: false, message: 'Veuillez compléter le CAPTCHA.' });
          return;
        }
        const captchaValid = await verifyCaptcha(captchaToken, req.ip);
        if (!captchaValid) {
          res.status(400).json({ success: false, message: 'CAPTCHA invalide. Veuillez réessayer.' });
          return;
        }
      }

      const result = await authRegistrationService.register({
        email, password, firstName, lastName, username, phoneNumber, composante, specialty
      });

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Inscription réussie ! Vérifiez votre email pour activer votre compte.',
        data: { userId: result.user.id, email: result.user.email },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'inscription.' });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      const result = await authRegistrationService.verifyEmail(token);

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }

      res.json({
        success: true,
        message: 'Email vérifié avec succès ! Vous pouvez maintenant créer ou rejoindre une équipe.',
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la vérification.' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { User } = await import('../models/User');

      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
        return;
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
        return;
      }

      const token = authTokenService.generateToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Create CTFd SSO session (non-blocking)
      let ctfdRedirectUrl: string | null = null;
      try {
        ctfdRedirectUrl = await ctfdService.createSSOSession(token, user.email);
        if (ctfdRedirectUrl) logger.info(`CTFd SSO session created for: ${email}`);
      } catch {
        logger.warn(`Failed to create CTFd SSO session for ${email}, continuing with login`);
      }

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        message: 'Connexion réussie.',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            phoneNumber: user.phoneNumber,
            composante: user.composante,
            isAdmin: user.isAdmin,
            emailVerified: user.emailVerified,
            teamId: user.teamId,
          },
          ...(ctfdRedirectUrl && { ctfdRedirectUrl }),
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la connexion.' });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const result = await authProfileService.getProfile(req.user.id);

      if (!result.success) {
        res.status(404).json({ success: false, message: result.error });
        return;
      }

      res.json({ success: true, data: result.user });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération du profil.' });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await authPasswordService.requestReset(email);

      // Always return success for security (don't reveal if user exists)
      res.json({
        success: true,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la demande de réinitialisation.' });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      const result = await authPasswordService.resetPassword(token, password);

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la réinitialisation du mot de passe.' });
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('token');
    res.json({ success: true, message: 'Déconnexion réussie.' });
  }

  async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await authRegistrationService.resendVerification(email);

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }

      res.json({ success: true, message: 'Email de vérification renvoyé.' });
    } catch (error) {
      logger.error('Resend verification error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'email.' });
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const { phoneNumber } = req.body;
      const result = await authProfileService.updatePhoneNumber(req.user.id, phoneNumber);

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès.',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            phoneNumber: result.user.phoneNumber,
          },
        },
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour.' });
    }
  }
}

export default new AuthController();
