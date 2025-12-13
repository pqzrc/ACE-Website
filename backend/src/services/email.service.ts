import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from '../utils/logger';

import {
  getVerificationEmailHtml,
  getWelcomeEmailHtml,
  getTeamJoinEmailHtml,
  getTeamCreatedEmailHtml,
  getPasswordResetEmailHtml,
  getAdminAddPlayerEmailHtml,
} from '../utils/new-email-templates';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const transportConfig: any = {
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false, // true for 465, false for other ports
      pool: true, // Use connection pooling for faster emails
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 2000, // 2 seconds timeout
      greetingTimeout: 2000,
    };

    // MailHog et autres serveurs SMTP locaux n'ont pas besoin d'authentification
    if (config.smtpUser && config.smtpPass) {
      transportConfig.auth = {
        user: config.smtpUser,
        pass: config.smtpPass,
      };
    }

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verificationUrl = `${config.frontendPublicUrl}/verify?token=${token}`;

    const mailOptions = {
      from: config.smtpFrom,
      to: email,
      subject: 'URGENT : Ordre de Mobilisation - Opération Data-Campus',
      html: getVerificationEmailHtml(firstName, verificationUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendAccountConfirmedEmail(email: string, firstName: string, teamName: string = 'Non assigné'): Promise<void> {
    const dashboardUrl = `${config.frontendPublicUrl}/dashboard`;

    const mailOptions = {
      from: config.smtpFrom,
      to: email,
      subject: 'Accréditation Validée - Opération Data-Campus',
      html: getWelcomeEmailHtml(firstName, teamName, dashboardUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Account confirmed email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send account confirmed email:', error);
      // Non-blocking error
    }
  }

  async sendWelcomeEmail(email: string, firstName: string, teamName: string): Promise<void> {
    const teamUrl = `${config.frontendPublicUrl}/team`;

    const mailOptions = {
      from: config.smtpFrom,
      to: email,
      subject: 'Affectation Équipe Confirmée - Opération Data-Campus',
      html: getTeamJoinEmailHtml(firstName, teamName, teamUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Team join email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send team join email:', error);
    }
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${config.frontendPublicUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: config.smtpFrom,
      to: email,
      subject: 'Réinitialisation de mot de passe - ACE',
      html: getPasswordResetEmailHtml(firstName, resetUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendTeamCreatedEmail(email: string, firstName: string, teamName: string, inviteCode: string): Promise<void> {
    const dashboardUrl = `${config.frontendPublicUrl}/dashboard`;

    const mailOptions = {
      from: config.smtpFrom,
      to: email,
      subject: 'Équipe Créée - Mission L.U.M.E.N.',
      html: getTeamCreatedEmailHtml(firstName, teamName, inviteCode, dashboardUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Team created email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send team created email:', error);
      // Non-blocking error
    }
  }
  async sendAdminAddPlayerEmail(email: string, firstName: string, teamName: string): Promise<void> {
    const teamUrl = `${config.frontendPublicUrl}/team`;

    const mailOptions = {
      from: config.smtpFrom,
      to: email,
      subject: 'Affectation Équipe - Opération Data-Campus',
      html: getAdminAddPlayerEmailHtml(firstName, teamName, teamUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Admin add player email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send admin add player email:', error);
    }
  }
}

export default new EmailService();
