import { User } from '../../models/User';
import { Team } from '../../models/Team';
import { Registration, RegistrationStatus } from '../../models/Registration';
import { TimeSlot } from '../../models/TimeSlot';
import { CTFdWebhookService } from '../ctfdWebhook.service';
import emailService from '../email.service';
import { logger } from '../../utils/logger';
import { generateCode } from '../../utils/crypto';

export class AdminTeamService {
  async getAllTeams(filters: { complete?: string; roomNumber?: string }) {
    const where: any = {};
    if (filters.complete !== undefined) where.isComplete = filters.complete === 'true';
    if (filters.roomNumber) where.roomNumber = parseInt(filters.roomNumber);

    const teams = await Team.findAll({
      where,
      include: [
        { model: User, as: 'members', attributes: ['id', 'firstName', 'lastName', 'email', 'composante'] },
        { model: User, as: 'captain', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: TimeSlot, as: 'timeSlot', attributes: ['id', 'roomName', 'startTime', 'endTime'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return Promise.all(teams.map(async (team) => ({
      ...team.toJSON(),
      memberCount: await team.getMemberCount(),
    })));
  }

  async deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
    const team = await Team.findByPk(teamId);
    if (!team) return { success: false, error: 'Équipe non trouvée.' };

    await User.update({ teamId: null }, { where: { teamId } });
    await Registration.update({ teamId: null, status: RegistrationStatus.VERIFIED }, { where: { teamId } });

    const { id, name, ctfdTeamId } = team;
    await team.destroy();

    logger.info(`Team ${teamId} deleted by admin`);
    CTFdWebhookService.notifyTeamDeleted(id, ctfdTeamId, name).catch(err => logger.error('Webhook error:', err));

    return { success: true };
  }

  async createTeamWithCaptain(data: { name: string; captainEmail?: string; timeSlotId?: string }) {
    let captain: User | null = null;

    if (data.captainEmail) {
      captain = await User.findOne({ where: { email: data.captainEmail } });
      if (!captain) return { success: false, error: 'Utilisateur avec cet email non trouvé.' };
      if (captain.teamId) return { success: false, error: "Cet utilisateur fait déjà partie d'une équipe." };
    }

    let inviteCode = generateCode(6);
    while (await Team.findOne({ where: { inviteCode } })) {
      inviteCode = generateCode(6);
    }

    const team = await Team.create({
      name: data.name,
      captainId: captain?.id || null,
      inviteCode,
      timeSlotId: data.timeSlotId || null,
      isComplete: false,
      currentScore: 0,
      createdByAdmin: true,
    });

    if (captain) {
      await captain.update({ teamId: team.id });
      await Registration.update({ teamId: team.id, status: RegistrationStatus.TEAM_INCOMPLETE }, { where: { userId: captain.id } });
      logger.info(`Team ${team.id} created by admin with captain ${captain.email}`);
    } else {
      logger.info(`Team ${team.id} created by admin without captain`);
    }

    return { success: true, team, captain };
  }

  async addMemberToTeam(data: { teamId: string; userId?: string; userEmail?: string }) {
    const team = await Team.findByPk(data.teamId);
    if (!team) return { success: false, error: 'Équipe non trouvée.' };

    let user: User | null = null;
    if (data.userEmail) {
      user = await User.findOne({ where: { email: data.userEmail } });
    } else if (data.userId) {
      user = await User.findByPk(data.userId);
    }

    if (!user) return { success: false, error: 'Utilisateur non trouvé.' };
    if (user.teamId) return { success: false, error: "Cet utilisateur fait déjà partie d'une équipe." };
    if (await team.isFull()) return { success: false, error: 'Cette équipe est déjà complète.' };

    await user.update({ teamId: team.id });

    if (!team.captainId) {
      team.captainId = user.id;
      await team.save();
      logger.info(`User ${user.email} automatically assigned as captain of team ${team.name} by admin`);
    }

    const memberCount = await team.getMemberCount();
    const newStatus = memberCount >= 3 ? RegistrationStatus.TEAM_COMPLETE : RegistrationStatus.TEAM_INCOMPLETE;
    await Registration.update({ teamId: team.id, status: newStatus }, { where: { userId: user.id } });
    await team.update({ isComplete: memberCount === 5 });

    await emailService.sendAdminAddPlayerEmail(user.email, user.firstName, team.name);
    logger.info(`User ${user.email} added to team ${data.teamId} by admin`);

    return { success: true, user, team };
  }

  async updateTeam(teamId: string, updates: Record<string, any>): Promise<Team | null> {
    const team = await Team.findByPk(teamId);
    if (!team) return null;

    await team.update(updates);
    logger.info(`Team ${teamId} updated by admin/CTFd`, { updates });
    return team;
  }

  async assignTimeSlot(teamId: string, timeSlotId: string | null) {
    const team = await Team.findByPk(teamId);
    if (!team) return { success: false, error: 'Équipe non trouvée.' };

    if (timeSlotId) {
      const timeSlot = await TimeSlot.findByPk(timeSlotId);
      if (!timeSlot) return { success: false, error: 'Créneau horaire non trouvé.' };
      if (!timeSlot.isActive) return { success: false, error: "Ce créneau horaire n'est pas disponible." };

      const isFull = await timeSlot.isFull();
      if (isFull && team.timeSlotId !== timeSlotId) {
        return { success: false, error: `Le créneau ${timeSlot.getDisplayName()} est complet.` };
      }
    }

    team.timeSlotId = timeSlotId || null;
    await team.save();
    logger.info(`Admin assigned time slot ${timeSlotId} to team ${team.name}`);

    return { success: true, team };
  }
}

export default new AdminTeamService();
