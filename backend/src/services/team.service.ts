import { User } from '../models/User';
import { Team } from '../models/Team';
import { Registration, RegistrationStatus } from '../models/Registration';
import { TimeSlot } from '../models/TimeSlot';
import { generateCode } from '../utils/crypto';
import { logger } from '../utils/logger';
import emailService from './email.service';
import { CTFdWebhookService } from './ctfdWebhook.service';

export class TeamService {
  async validateUserForTeam(userId: string): Promise<{ valid: boolean; user?: User; error?: string }> {
    const user = await User.findByPk(userId);
    if (!user) return { valid: false, error: 'Utilisateur non trouvé.' };
    if (!user.emailVerified) return { valid: false, error: 'Veuillez vérifier votre email avant de créer/rejoindre une équipe.' };
    if (!user.phoneNumber) return { valid: false, error: 'Veuillez ajouter un numéro de téléphone à votre profil.' };
    if (user.teamId) return { valid: false, error: "Vous faites déjà partie d'une équipe." };
    return { valid: true, user };
  }

  async validateTimeSlot(timeSlotId: string | null): Promise<{ valid: boolean; timeSlot?: TimeSlot; error?: string }> {
    if (!timeSlotId) return { valid: true };

    const timeSlot = await TimeSlot.findByPk(timeSlotId);
    if (!timeSlot) return { valid: false, error: 'Créneau horaire non trouvé.' };
    if (!timeSlot.isActive) return { valid: false, error: "Ce créneau horaire n'est pas disponible." };

    const isFull = await timeSlot.isFull();
    if (isFull) return { valid: false, error: `Le créneau ${timeSlot.getDisplayName()} est complet.` };

    return { valid: true, timeSlot };
  }

  async createTeam(userId: string, name: string, timeSlotId?: string) {
    const userValidation = await this.validateUserForTeam(userId);
    if (!userValidation.valid) return { success: false, error: userValidation.error };

    const user = userValidation.user!;
    const slotValidation = await this.validateTimeSlot(timeSlotId || null);
    if (!slotValidation.valid) return { success: false, error: slotValidation.error };

    const existingTeam = await Team.findOne({ where: { name } });
    if (existingTeam) return { success: false, error: "Ce nom d'équipe existe déjà." };

    let inviteCode = generateCode(6);
    while (await Team.findOne({ where: { inviteCode } })) {
      inviteCode = generateCode(6);
    }

    const team = await Team.create({
      name,
      inviteCode,
      captainId: userId,
      timeSlotId: timeSlotId || null,
      isComplete: false,
    });

    user.teamId = team.id;
    await user.save();

    await Registration.update({ teamId: team.id, status: RegistrationStatus.TEAM_INCOMPLETE }, { where: { userId } });

    logger.info(`Équipe créée: ${name} par ${user.email}`);
    CTFdWebhookService.notifyTeamCreated(team.id).catch(err => logger.error('Webhook error:', err));

    try {
      await emailService.sendTeamCreatedEmail(user.email, user.firstName, team.name, team.inviteCode);
    } catch (e) {
      logger.error('Email error:', e);
    }

    return { success: true, team };
  }

  async joinTeamByCode(userId: string, inviteCode: string) {
    const userValidation = await this.validateUserForTeam(userId);
    if (!userValidation.valid) return { success: false, error: userValidation.error };

    const user = userValidation.user!;
    const team = await Team.findOne({ where: { inviteCode } });
    if (!team) return { success: false, error: "Code d'invitation invalide." };

    if (await team.isFull()) return { success: false, error: 'Cette équipe est complète (5 membres max).' };

    return this.addUserToTeam(user, team);
  }

  async joinAvailableTeamInSlot(userId: string, timeSlotId: string) {
    const userValidation = await this.validateUserForTeam(userId);
    if (!userValidation.valid) return { success: false, error: userValidation.error };

    const user = userValidation.user!;
    let teams: Team[];
    let timeSlot: TimeSlot | null = null;

    if (timeSlotId === 'no-slot') {
      teams = await Team.findAll({ where: { timeSlotId: null }, include: [{ model: User, as: 'members', attributes: ['id'] }] });
    } else {
      timeSlot = await TimeSlot.findByPk(timeSlotId);
      if (!timeSlot || !timeSlot.isActive) return { success: false, error: 'Créneau horaire non trouvé ou inactif.' };
      teams = await Team.findAll({ where: { timeSlotId }, include: [{ model: User, as: 'members', attributes: ['id'] }] });
    }

    let availableTeam: Team | null = null;
    for (const team of teams) {
      if ((await team.getMemberCount()) < 5) {
        availableTeam = team;
        break;
      }
    }

    if (!availableTeam) {
      const slotName = timeSlotId === 'no-slot' ? 'les équipes sans créneau' : timeSlot?.getDisplayName();
      return { success: false, error: `Aucune équipe disponible pour ${slotName}.` };
    }

    return this.addUserToTeam(user, availableTeam, timeSlot);
  }

  private async addUserToTeam(user: User, team: Team, timeSlot?: TimeSlot | null) {
    user.teamId = team.id;
    await user.save();

    if (!team.captainId) {
      team.captainId = user.id;
      await team.save();
      logger.info(`User ${user.email} automatically assigned as captain of team ${team.name}`);
    }

    await Registration.update({ teamId: team.id, status: RegistrationStatus.TEAM_INCOMPLETE }, { where: { userId: user.id } });

    const memberCount = await team.getMemberCount();
    if (memberCount === 5) {
      team.isComplete = true;
      await team.save();
      await Registration.update({ status: RegistrationStatus.TEAM_COMPLETE }, { where: { teamId: team.id } });
    }

    await emailService.sendWelcomeEmail(user.email, user.firstName, team.name);
    logger.info(`Utilisateur ${user.email} a rejoint l'équipe ${team.name}`);
    CTFdWebhookService.notifyMemberAdded(team.id, user.id).catch(err => logger.error('Webhook error:', err));

    return { success: true, team, timeSlot };
  }

  async leaveTeam(userId: string) {
    const user = await User.findByPk(userId);
    if (!user || !user.teamId) return { success: false, error: "Vous ne faites pas partie d'une équipe." };

    const team = await Team.findByPk(user.teamId);
    if (!team) return { success: false, error: 'Équipe non trouvée.' };

    if (team.captainId === userId) {
      await User.update({ teamId: null }, { where: { teamId: team.id } });
      await Registration.update({ teamId: null, status: RegistrationStatus.VERIFIED }, { where: { teamId: team.id } });

      const { id, name, ctfdTeamId } = team;
      await team.destroy();

      logger.info(`Équipe ${name} supprimée par le capitaine`);
      CTFdWebhookService.notifyTeamDeleted(id, ctfdTeamId, name).catch(err => logger.error('Webhook error:', err));

      return { success: true, teamDeleted: true };
    }

    user.teamId = null;
    await user.save();
    await Registration.update({ teamId: null, status: RegistrationStatus.VERIFIED }, { where: { userId } });

    const memberCount = await team.getMemberCount();
    team.isComplete = memberCount === 5;
    await team.save();

    logger.info(`Utilisateur ${user.email} a quitté l'équipe ${team.name}`);
    CTFdWebhookService.notifyMemberRemoved(team.id, user.id).catch(err => logger.error('Webhook error:', err));

    return { success: true, teamDeleted: false };
  }

  async getTeamById(teamId: string) {
    return Team.findByPk(teamId, {
      include: [
        { model: User, as: 'members', attributes: ['id', 'firstName', 'lastName', 'email', 'composante', 'specialty'] },
        { model: User, as: 'captain', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: TimeSlot, as: 'timeSlot', attributes: ['id', 'roomName', 'startTime', 'endTime'] },
      ],
    });
  }

  async getTeamByUserId(userId: string) {
    const user = await User.findByPk(userId);
    if (!user?.teamId) return null;

    return Team.findByPk(user.teamId, {
      attributes: ['id', 'name', 'inviteCode', 'captainId', 'isComplete', 'roomNumber', 'sessionStartTime', 'currentScore', 'rank'],
      include: [
        { model: User, as: 'members', attributes: ['id', 'firstName', 'lastName', 'email', 'composante', 'specialty'] },
        { model: User, as: 'captain', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: TimeSlot, as: 'timeSlot', attributes: ['id', 'roomName', 'startTime', 'endTime'] },
      ],
    });
  }

  async getAvailableTeams() {
    const timeSlots = await TimeSlot.findAll({ where: { isActive: true }, order: [['startTime', 'ASC']] });

    type AvailableTeam = { id: string; name: string; memberCount: number; availableSpots: number };

    const availableBySlot = await Promise.all(
      timeSlots.map(async (slot) => {
        const teams = await Team.findAll({
          where: { timeSlotId: slot.id, createdByAdmin: true },
          include: [{ model: User, as: 'members', attributes: ['id'] }],
        });

        const availableTeams: AvailableTeam[] = [];
        for (const team of teams) {
          const memberCount = await team.getMemberCount();
          if (memberCount < 5) {
            availableTeams.push({ id: team.id, name: team.name, memberCount, availableSpots: 5 - memberCount });
          }
        }

        return {
          timeSlot: { id: slot.id, displayName: slot.getDisplayName(), roomName: slot.roomName, startTime: slot.startTime, endTime: slot.endTime },
          availableTeamsCount: availableTeams.length,
          teams: availableTeams,
        };
      })
    );

    const teamsWithoutSlot = await Team.findAll({
      where: { timeSlotId: null, createdByAdmin: true },
      include: [{ model: User, as: 'members', attributes: ['id'] }],
    });

    const availableWithoutSlot: AvailableTeam[] = [];
    for (const team of teamsWithoutSlot) {
      const memberCount = await team.getMemberCount();
      if (memberCount < 5) {
        availableWithoutSlot.push({ id: team.id, name: team.name, memberCount, availableSpots: 5 - memberCount });
      }
    }

    const allSlots = [...availableBySlot];
    if (availableWithoutSlot.length > 0) {
      allSlots.unshift({
        timeSlot: { id: 'no-slot', displayName: 'Équipes sans créneau assigné', roomName: 'À définir', startTime: '', endTime: '' },
        availableTeamsCount: availableWithoutSlot.length,
        teams: availableWithoutSlot,
      });
    }

    return allSlots.filter(slot => slot.availableTeamsCount > 0);
  }

  async updateTimeSlot(userId: string, timeSlotId: string | null) {
    const user = await User.findByPk(userId);
    if (!user?.teamId) return { success: false, error: "Vous ne faites partie d'aucune équipe." };

    const team = await Team.findByPk(user.teamId);
    if (!team) return { success: false, error: 'Équipe non trouvée.' };
    if (team.captainId !== userId) return { success: false, error: "Seul le capitaine peut modifier le créneau horaire." };

    if (timeSlotId) {
      const validation = await this.validateTimeSlot(timeSlotId);
      if (!validation.valid) return { success: false, error: validation.error };
    }

    team.timeSlotId = timeSlotId;
    await team.save();

    logger.info(`Team ${team.name} time slot updated by captain ${user.email}`);
    return { success: true, team };
  }
}

export default new TeamService();
