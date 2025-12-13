import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config/env';

// No hardcoded fallbacks - must be configured via environment
const CTFD_WEBHOOK_URL = process.env.CTFD_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Validate at module load
if (!WEBHOOK_SECRET) {
  console.error('WARNING: WEBHOOK_SECRET not configured - webhooks will fail');
}

export class CTFdWebhookService {
  private static generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  private static async sendWebhook(event: string, data: any): Promise<void> {
    // Skip if not configured
    if (!CTFD_WEBHOOK_URL || !WEBHOOK_SECRET) {
      console.warn(`Webhook ${event} skipped - not configured`);
      return;
    }

    try {
      const payload = JSON.stringify({ event, data });
      const signature = this.generateSignature(payload, WEBHOOK_SECRET);

      await axios.post(CTFD_WEBHOOK_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
        timeout: 5000,
      });

      console.log(`Webhook envoyé à CTFd: ${event}`);
    } catch (error) {
      console.error(`Erreur webhook CTFd (${event}):`, error);
    }
  }

  static async notifyTeamCreated(teamId: string): Promise<void> {
    await this.sendWebhook('team.created', { teamId });
  }

  static async notifyTeamUpdated(teamId: string): Promise<void> {
    await this.sendWebhook('team.updated', { teamId });
  }

  static async notifyTeamDeleted(teamId: string, ctfdTeamId?: number | null, teamName?: string): Promise<void> {
    await this.sendWebhook('team.deleted', { teamId, ctfdTeamId, teamName });
  }

  static async notifyMemberAdded(teamId: string, userId: string): Promise<void> {
    await this.sendWebhook('team.member_added', { teamId, userId });
  }

  static async notifyMemberRemoved(teamId: string, userId: string): Promise<void> {
    await this.sendWebhook('team.member_removed', { teamId, userId });
  }
}
