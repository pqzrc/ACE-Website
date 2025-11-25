import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from '../utils/logger';

import { getVerificationEmailHtml, getWelcomeEmailHtml, getTeamJoinEmailHtml } from '../utils/email-templates';

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
    const verificationUrl = `${config.frontendUrl}/verify?token=${token}`;

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
    const dashboardUrl = `${config.frontendUrl}/dashboard`;

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
    const teamUrl = `${config.frontendUrl}/team`;

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
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: config.smtpFrom,
      to: email,
      subject: 'Réinitialisation de mot de passe - ACE - Vizyon Dijital',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Réinitialisation de mot de passe</h2>
              <p>Bonjour ${firstName},</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
              <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #fc10ca; color: white; text-decoration: none; border-radius: 5px;">
                Réinitialiser mon mot de passe
              </a>
              <p>Ce lien expire dans 1 heure.</p>
              <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

export default new EmailService();

