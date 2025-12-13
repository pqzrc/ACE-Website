import { User } from '../../models/User';
import { Team } from '../../models/Team';
import { Registration, RegistrationStatus } from '../../models/Registration';
import { CTFdWebhookService } from '../ctfdWebhook.service';
import ctfdService from '../ctfd.service';
import { logger } from '../../utils/logger';

const ALLOWED_UPDATE_FIELDS = ['firstName', 'lastName', 'email', 'phoneNumber', 'composante', 'specialty', 'isAdmin', 'emailVerified'];

export class AdminUserService {
  async updateUser(userId: string, updates: Record<string, any>): Promise<User | null> {
    const user = await User.findByPk(userId);
    if (!user) return null;

    const filteredUpdates = Object.keys(updates)
      .filter(key => ALLOWED_UPDATE_FIELDS.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    await user.update(filteredUpdates);
    logger.info(`User ${userId} updated by admin`);
    return user;
  }

  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    const user = await User.findByPk(userId, {
      include: [{ model: Team, as: 'team' }],
    });

    if (!user) return { success: false, error: 'Utilisateur non trouvé.' };

    const userEmail = user.email;
    const ctfdUserId = user.ctfdUserId;
    const teamId = user.teamId;

    if (teamId) {
      const team = await Team.findByPk(teamId);
      if (team && team.captainId === user.id) {
        await User.update({ teamId: null }, { where: { teamId } });
        await Registration.update({ teamId: null, status: RegistrationStatus.VERIFIED }, { where: { teamId } });

        const { id, name, ctfdTeamId } = team;
        await team.destroy();

        CTFdWebhookService.notifyTeamDeleted(id, ctfdTeamId, name).catch(err => logger.error('Webhook error:', err));
        logger.info(`Team ${name} deleted because captain ${userEmail} was deleted`);
      } else {
        user.teamId = null;
        await user.save();
      }
    }

    await Registration.destroy({ where: { userId } });

    if (ctfdUserId) {
      await ctfdService.deleteUser(ctfdUserId);
    }

    await user.destroy();
    logger.info(`User ${userEmail} (${userId}) deleted by admin`);

    return { success: true };
  }
}

export default new AdminUserService();
