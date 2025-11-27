import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Registration, RegistrationStatus } from '../models/Registration';
import authService from '../services/auth.service';
import emailService from '../services/email.service';
import ctfdService from '../services/ctfd.service';
import { verifyCaptcha, isCaptchaRequired } from '../services/captcha.service';
import { generateToken } from '../utils/crypto';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, username, phoneNumber, composante, specialty, captchaToken } = req.body;

      // Verify CAPTCHA if required
      if (isCaptchaRequired()) {
        if (!captchaToken) {
          res.status(400).json({
            success: false,
            message: 'Veuillez compléter le CAPTCHA.',
          });
          return;
        }

        const captchaValid = await verifyCaptcha(captchaToken, req.ip);
        if (!captchaValid) {
          res.status(400).json({
            success: false,
            message: 'CAPTCHA invalide. Veuillez réessayer.',
          });
          return;
        }
      }

      // Check if user already exists (case-insensitive email)
      const existingUser = await User.findOne({
        where: {
          email: { [Op.iLike]: email }
        }
      });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Un compte avec cet email existe déjà.',
        });
        return;
      }

      // Check if username already exists (case-insensitive)
      if (username) {
        const existingUsername = await User.findOne({
          where: {
            username: { [Op.iLike]: username }
          }
        });
        if (existingUsername) {
          res.status(400).json({
            success: false,
            message: 'Ce nom d\'utilisateur est déjà pris.',
          });
          return;
        }
      }

      // Generate verification token
      const verificationToken = generateToken();
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        username,
        phoneNumber,
        composante,
        specialty,
        verificationToken,
        verificationTokenExpiry,
        emailVerified: false,
        isAdmin: false,
      });

      // Create registration record
      await Registration.create({
        userId: user.id,
        status: RegistrationStatus.PENDING,
      });

      // Send verification email in background (don't wait)
      emailService.sendVerificationEmail(email, verificationToken, firstName).catch(() => {
        logger.warn(`Failed to send verification email to ${email}. User can still verify manually.`);
      });

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'Inscription réussie ! Vérifiez votre email pour activer votre compte.',
        data: {
          userId: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'inscription.',
      });
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      // Find user with this token
      const user = await User.findOne({
        where: { verificationToken: token },
      });

      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Token invalide ou expiré.',
        });
        return;
      }

      // Check if token expired
      if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
        res.status(400).json({
          success: false,
          message: 'Token expiré. Demandez un nouveau lien de vérification.',
        });
        return;
      }

      // Update user
      user.emailVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpiry = null;
      await user.save();

      // Update registration status
      await Registration.update(
        { status: RegistrationStatus.VERIFIED, verifiedAt: new Date() },
        { where: { userId: user.id } }
      );

      // Send account confirmed email in background
      emailService.sendAccountConfirmedEmail(user.email, user.firstName).catch(() => {
        logger.warn(`Failed to send account confirmed email to ${user.email}.`);
      });

      logger.info(`Email verified for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Email vérifié avec succès ! Vous pouvez maintenant créer ou rejoindre une équipe.',
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification.',
      });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect.',
        });
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect.',
        });
        return;
      }

      // Generate token
      const token = authService.generateToken(user);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Créer une session SSO dans CTFd (ne bloque pas le login si échec)
      let ctfdRedirectUrl: string | null = null;
      try {
        ctfdRedirectUrl = await ctfdService.createSSOSession(token, user.email);
        if (ctfdRedirectUrl) {
          logger.info(`CTFd SSO session created for: ${email}`);
        }
      } catch (error) {
        // Ne pas bloquer le login si CTFd est indisponible
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
          // Inclure l'URL de redirection CTFd si disponible
          ...(ctfdRedirectUrl && { ctfdRedirectUrl }),
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion.',
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Non authentifié.',
        });
        return;
      }

      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'verificationToken'] },
        include: ['team'],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé.',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du profil.',
      });
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Pour des raisons de sécurité, on ne dit pas si l'utilisateur existe ou non
        res.json({
          success: true,
          message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
        });
        return;
      }

      // Generate reset token
      const resetToken = generateToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      await user.save();

      // Send email
      await emailService.sendPasswordResetEmail(email, resetToken, user.firstName);

      res.json({
        success: true,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la demande de réinitialisation.',
      });
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Op.gt]: new Date() },
        },
      });

      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Le lien de réinitialisation est invalide ou a expiré.',
        });
        return;
      }

      // Update password
      user.password = password;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la réinitialisation du mot de passe.',
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('token');
    res.json({
      success: true,
      message: 'Déconnexion réussie.',
    });
  }

  /**
   * Resend verification email
   */
  async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé.',
        });
        return;
      }

      if (user.emailVerified) {
        res.status(400).json({
          success: false,
          message: 'Email déjà vérifié.',
        });
        return;
      }

      // Generate new token
      const verificationToken = generateToken();
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user.verificationToken = verificationToken;
      user.verificationTokenExpiry = verificationTokenExpiry;
      await user.save();

      // Send email
      await emailService.sendVerificationEmail(email, verificationToken, user.firstName);

      res.json({
        success: true,
        message: 'Email de vérification renvoyé.',
      });
    } catch (error) {
      logger.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email.',
      });
    }
  }
}

export default new AuthController();

