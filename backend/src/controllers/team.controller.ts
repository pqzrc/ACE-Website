import { Response } from 'express';
import { Team } from '../models/Team';
import { User } from '../models/User';
import { Registration, RegistrationStatus } from '../models/Registration';
import { TimeSlot } from '../models/TimeSlot';
import { AuthRequest } from '../types';
import { generateCode } from '../utils/crypto';
import { logger } from '../utils/logger';
import emailService from '../services/email.service';
import { CTFdWebhookService } from '../services/ctfdWebhook.service';
import { Op } from 'sequelize';

export class TeamController {
  // Créer une nouvelle équipe
  async createTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const { name, timeSlotId } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      if (!user.emailVerified) {
        res.status(403).json({
          success: false,
          message: 'Veuillez vérifier votre email avant de créer une équipe. Vérifiez votre boîte de réception ou demandez un nouvel email de vérification.'
        });
        return;
      }

      if (!user.phoneNumber) {
        res.status(403).json({
          success: false,
          message: 'Veuillez ajouter un numéro de téléphone à votre profil avant de créer une équipe.'
        });
        return;
      }

      if (user.teamId) {
        res.status(400).json({ success: false, message: 'Vous faites déjà partie d\'une équipe.' });
        return;
      }

      // Validate time slot if provided
      if (timeSlotId) {
        const timeSlot = await TimeSlot.findByPk(timeSlotId);
        if (!timeSlot) {
          res.status(404).json({ success: false, message: 'Créneau horaire non trouvé.' });
          return;
        }

        if (!timeSlot.isActive) {
          res.status(400).json({ success: false, message: 'Ce créneau horaire n\'est pas disponible.' });
          return;
        }

        // Check if time slot is full (max 6 teams)
        const isFull = await timeSlot.isFull();
        if (isFull) {
          res.status(400).json({
            success: false,
            message: `Le créneau ${timeSlot.getDisplayName()} est complet (${timeSlot.maxTeams} équipes maximum).`
          });
          return;
        }
      }

      // Vérifier que le nom d'équipe est unique
      const existingTeam = await Team.findOne({ where: { name } });
      if (existingTeam) {
        res.status(400).json({ success: false, message: 'Ce nom d\'équipe existe déjà.' });
        return;
      }

      // Générer un code d'invitation unique
      let inviteCode: string;
      let codeExists = true;

      while (codeExists) {
        inviteCode = generateCode(6);
        const teamWithCode = await Team.findOne({ where: { inviteCode } });
        codeExists = !!teamWithCode;
      }

      const team = await Team.create({
        name,
        inviteCode: inviteCode!,
        captainId: userId,
        timeSlotId: timeSlotId || null,
        isComplete: false,
      });

      // Ajouter l'utilisateur à l'équipe
      user.teamId = team.id;
      await user.save();

      // Mettre à jour l'inscription
      await Registration.update(
        { teamId: team.id, status: RegistrationStatus.TEAM_INCOMPLETE },
        { where: { userId } }
      );

      logger.info(`Équipe créée: ${name} par ${user.email}`);

      CTFdWebhookService.notifyTeamCreated(team.id).catch(err =>
        logger.error('Webhook error:', err)
      );

      // Send confirmation email to captain
      try {
        await emailService.sendTeamCreatedEmail(user.email, user.firstName, team.name, team.inviteCode);
      } catch (emailError) {
        logger.error('Email error:', emailError);
        // Continue anyway - email failure shouldn't block team creation
      }

      res.status(201).json({
        success: true,
        message: 'Équipe créée avec succès !',
        data: {
          team: {
            id: team.id,
            name: team.name,
            inviteCode: team.inviteCode,
            captainId: team.captainId,
          },
        },
      });
    } catch (error) {
      logger.error('Create team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'équipe.' });
    }
  }

  // Rejoindre une équipe avec un code d'invitation
  async joinTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const { inviteCode } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      if (!user.emailVerified) {
        res.status(403).json({ success: false, message: 'Email non vérifié.' });
        return;
      }

      if (!user.phoneNumber) {
        res.status(403).json({
          success: false,
          message: 'Veuillez ajouter un numéro de téléphone à votre profil avant de rejoindre une équipe.'
        });
        return;
      }

      if (user.teamId) {
        res.status(400).json({ success: false, message: 'Vous faites déjà partie d\'une équipe.' });
        return;
      }

      const team = await Team.findOne({ where: { inviteCode } });
      if (!team) {
        res.status(404).json({ success: false, message: 'Code d\'invitation invalide.' });
        return;
      }

      // Vérifier si l'équipe est pleine
      const isFull = await team.isFull();
      if (isFull) {
        res.status(400).json({ success: false, message: 'Cette équipe est complète (5 membres max).' });
        return;
      }

      // Ajouter l'utilisateur à l'équipe
      user.teamId = team.id;
      await user.save();

      // If the team has no captain, make this user the captain
      if (!team.captainId) {
        team.captainId = user.id;
        await team.save();
        logger.info(`User ${user.email} automatically assigned as captain of team ${team.name}`);
      }

      // Mettre à jour l'inscription
      await Registration.update(
        { teamId: team.id, status: RegistrationStatus.TEAM_INCOMPLETE },
        { where: { userId } }
      );

      // Vérifier si l'équipe est maintenant complète
      const memberCount = await team.getMemberCount();
      if (memberCount === 5) {
        team.isComplete = true;
        await team.save();

        if (team.isComplete) {
          await Registration.update(
            { status: RegistrationStatus.TEAM_COMPLETE },
            { where: { teamId: team.id } }
          );
        }
      }

      // Envoyer email de bienvenue
      await emailService.sendWelcomeEmail(user.email, user.firstName, team.name);

      logger.info(`Utilisateur ${user.email} a rejoint l'équipe ${team.name}`);

      CTFdWebhookService.notifyMemberAdded(team.id, user.id).catch(err =>
        logger.error('Webhook error:', err)
      );

      res.json({
        success: true,
        message: 'Vous avez rejoint l\'équipe avec succès !',
        data: {
          team: {
            id: team.id,
            name: team.name,
          },
        },
      });
    } catch (error) {
      logger.error('Join team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la jonction à l\'équipe.' });
    }
  }

  // Obtenir les détails d'une équipe
  async getTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const team = await Team.findByPk(id, {
        include: [
          {
            model: User,
            as: 'members',
            attributes: ['id', 'firstName', 'lastName', 'email', 'composante', 'specialty'],
          },
          {
            model: User,
            as: 'captain',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: TimeSlot,
            as: 'timeSlot',
            attributes: ['id', 'roomName', 'startTime', 'endTime'],
          },
        ],
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Équipe non trouvée.' });
        return;
      }

      const memberCount = await team.getMemberCount();

      res.json({
        success: true,
        data: {
          team: {
            id: team.id,
            name: team.name,
            inviteCode: team.inviteCode,
            captainId: team.captainId,
            captain: team.captain,
            members: team.members,
            memberCount,
            isComplete: team.isComplete,
            roomNumber: team.roomNumber,
            sessionStartTime: team.sessionStartTime,
          },
        },
      });
    } catch (error) {
      logger.error('Get team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'équipe.' });
    }
  }

  // Quitter une équipe
  async leaveTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const userId = req.user.id;
      const user = await User.findByPk(userId);

      if (!user || !user.teamId) {
        res.status(400).json({ success: false, message: 'Vous ne faites pas partie d\'une équipe.' });
        return;
      }

      const team = await Team.findByPk(user.teamId);
      if (!team) {
        logger.error(`Team ${user.teamId} not found during leave`);
        res.status(404).json({ success: false, message: 'Équipe non trouvée.' });
        return;
      }

      // Si c'est le capitaine, on supprime l'équipe
      if (team.captainId === userId) {
        await User.update({ teamId: null }, { where: { teamId: team.id } });
        await Registration.update(
          { teamId: null, status: RegistrationStatus.VERIFIED },
          { where: { teamId: team.id } }
        );
        const deletedTeamId = team.id;
        const deletedTeamName = team.name;
        const deletedCtfdTeamId = team.ctfdTeamId;
        await team.destroy();

        logger.info(`Équipe ${deletedTeamName} supprimée par le capitaine`);

        CTFdWebhookService.notifyTeamDeleted(deletedTeamId, deletedCtfdTeamId, deletedTeamName).catch(err =>
          logger.error('Webhook error:', err)
        );

        res.json({ success: true, message: 'Équipe supprimée.' });
      } else {
        // Sinon on retire juste l'utilisateur
        user.teamId = null;
        await user.save();

        await Registration.update(
          { teamId: null, status: RegistrationStatus.VERIFIED },
          { where: { userId } }
        );

        // Mettre à jour le statut de l'équipe
        const memberCount = await team.getMemberCount();
        team.isComplete = memberCount === 5;
        await team.save();

        logger.info(`Utilisateur ${user.email} a quitté l'équipe ${team.name}`);

        CTFdWebhookService.notifyMemberRemoved(team.id, user.id).catch(err =>
          logger.error('Webhook error:', err)
        );

        res.json({ success: true, message: 'Vous avez quitté l\'équipe.' });
      }
    } catch (error) {
      logger.error('Leave team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors du départ de l\'équipe.' });
    }
  }

  // Obtenir l'équipe de l'utilisateur connecté
  async getMyTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const user = await User.findByPk(req.user.id);
      if (!user || !user.teamId) {
        res.status(404).json({ success: false, message: 'Vous ne faites pas partie d\'une équipe.' });
        return;
      }

      const team = await Team.findByPk(user.teamId, {
        attributes: ['id', 'name', 'inviteCode', 'captainId', 'isComplete', 'roomNumber', 'sessionStartTime', 'currentScore', 'rank'],
        include: [
          {
            model: User,
            as: 'members',
            attributes: ['id', 'firstName', 'lastName', 'email', 'composante', 'specialty'],
          },
          {
            model: User,
            as: 'captain',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: TimeSlot,
            as: 'timeSlot',
            attributes: ['id', 'roomName', 'startTime', 'endTime'],
          },
        ],
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Équipe non trouvée.' });
        return;
      }

      const memberCount = await team.getMemberCount();

      res.json({
        success: true,
        data: {
          team: {
            id: team.id,
            name: team.name,
            inviteCode: team.inviteCode,
            captainId: team.captainId,
            captain: team.captain,
            members: team.members,
            memberCount,
            isComplete: team.isComplete,
            roomNumber: team.roomNumber,
            sessionStartTime: team.sessionStartTime,
            currentScore: team.currentScore,
            rank: team.rank,
          },
        },
      });
    } catch (error) {
      logger.error('Get my team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération de votre équipe.' });
    }
  }

  // Get available teams grouped by time slot (for users without a team)
  async getAvailableTeams(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Get all active time slots
      const timeSlots = await TimeSlot.findAll({
        where: { isActive: true },
        order: [['startTime', 'ASC']],
      });

      const availableBySlot = await Promise.all(
        timeSlots.map(async (slot) => {
          // Find teams in this slot that are NOT full (< 5 members) AND created by admin
          const teams = await Team.findAll({
            where: {
              timeSlotId: slot.id,
              createdByAdmin: true
            },
            include: [
              {
                model: User,
                as: 'members',
                attributes: ['id'],
              },
            ],
          });

          const availableTeams: Array<{
            id: string;
            name: string;
            memberCount: number;
            availableSpots: number;
          }> = [];
          for (const team of teams) {
            const memberCount = await team.getMemberCount();
            if (memberCount < 5) {
              availableTeams.push({
                id: team.id,
                name: team.name,
                memberCount,
                availableSpots: 5 - memberCount,
              });
            }
          }

          return {
            timeSlot: {
              id: slot.id,
              displayName: slot.getDisplayName(),
              roomName: slot.roomName,
              startTime: slot.startTime,
              endTime: slot.endTime,
            },
            availableTeamsCount: availableTeams.length,
            teams: availableTeams,
          };
        })
      );

      // Also get teams without a time slot (created by admins)
      const teamsWithoutSlot = await Team.findAll({
        where: {
          timeSlotId: null,
          createdByAdmin: true
        },
        include: [
          {
            model: User,
            as: 'members',
            attributes: ['id'],
          },
        ],
      });

      const availableTeamsWithoutSlot: Array<{
        id: string;
        name: string;
        memberCount: number;
        availableSpots: number;
      }> = [];

      for (const team of teamsWithoutSlot) {
        const memberCount = await team.getMemberCount();
        if (memberCount < 5) {
          availableTeamsWithoutSlot.push({
            id: team.id,
            name: team.name,
            memberCount,
            availableSpots: 5 - memberCount,
          });
        }
      }

      // Add teams without slot as a special "slot" if any exist
      const allSlots = [...availableBySlot];
      if (availableTeamsWithoutSlot.length > 0) {
        allSlots.unshift({
          timeSlot: {
            id: 'no-slot',
            displayName: 'Équipes sans créneau assigné',
            roomName: 'À définir',
            startTime: '',
            endTime: '',
          },
          availableTeamsCount: availableTeamsWithoutSlot.length,
          teams: availableTeamsWithoutSlot,
        });
      }

      // Filter out slots with no available teams
      const slotsWithTeams = allSlots.filter(slot => slot.availableTeamsCount > 0);

      res.json({
        success: true,
        data: { slots: slotsWithTeams },
      });
    } catch (error) {
      logger.error('Get available teams error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des équipes disponibles.',
      });
    }
  }

  // Join an available team automatically based on time slot preference
  async joinAvailableTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const { timeSlotId } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      if (!user.emailVerified) {
        res.status(403).json({ success: false, message: 'Email non vérifié.' });
        return;
      }

      if (!user.phoneNumber) {
        res.status(403).json({
          success: false,
          message: 'Veuillez ajouter un numéro de téléphone à votre profil avant de rejoindre une équipe.'
        });
        return;
      }

      if (user.teamId) {
        res.status(400).json({ success: false, message: 'Vous faites déjà partie d\'une équipe.' });
        return;
      }

      let teams: Team[] = [];
      let timeSlot: TimeSlot | null = null;

      if (timeSlotId === 'no-slot') {
        // Special case: find teams without a time slot
        teams = await Team.findAll({
          where: { timeSlotId: null },
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id'],
            },
          ],
        });
      } else {
        // Validate time slot
        timeSlot = await TimeSlot.findByPk(timeSlotId);
        if (!timeSlot || !timeSlot.isActive) {
          res.status(404).json({ success: false, message: 'Créneau horaire non trouvé ou inactif.' });
          return;
        }

        // Find a team in this slot that is NOT full
        teams = await Team.findAll({
          where: { timeSlotId },
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id'],
            },
          ],
        });
      }

      let availableTeam: Team | null = null;
      for (const team of teams) {
        const memberCount = await team.getMemberCount();
        if (memberCount < 5) {
          availableTeam = team;
          break;
        }
      }

      if (!availableTeam) {
        const slotName = timeSlotId === 'no-slot' ? 'les équipes sans créneau assigné' : timeSlot?.getDisplayName();
        res.status(404).json({
          success: false,
          message: `Aucune équipe disponible pour ${slotName}.`,
        });
        return;
      }

      // Add user to the available team
      user.teamId = availableTeam.id;
      await user.save();

      // If the team has no captain, make this user the captain
      if (!availableTeam.captainId) {
        availableTeam.captainId = user.id;
        await availableTeam.save();
        logger.info(`User ${user.email} automatically assigned as captain of team ${availableTeam.name}`);
      }

      // Update registration
      await Registration.update(
        { teamId: availableTeam.id, status: RegistrationStatus.TEAM_INCOMPLETE },
        { where: { userId } }
      );

      // Check if team is now complete (exactly 5 members)
      const memberCount = await availableTeam.getMemberCount();
      availableTeam.isComplete = memberCount === 5;
        await availableTeam.save();

        if (availableTeam.isComplete) {
          await Registration.update(
            { status: RegistrationStatus.TEAM_COMPLETE },
            { where: { teamId: availableTeam.id } }
          );
      }

      // Send welcome email
      await emailService.sendWelcomeEmail(user.email, user.firstName, availableTeam.name);

      const slotName = timeSlotId === 'no-slot' ? 'no-slot' : timeSlot?.getDisplayName();
      logger.info(`User ${user.email} joined available team ${availableTeam.name} in slot ${slotName}`);

      CTFdWebhookService.notifyMemberAdded(availableTeam.id, user.id).catch(err =>
        logger.error('Webhook error:', err)
      );

      res.json({
        success: true,
        message: 'Vous avez rejoint une équipe avec succès !',
        data: {
          team: {
            id: availableTeam.id,
            name: availableTeam.name,
            timeSlot: timeSlot ? {
              displayName: timeSlot.getDisplayName(),
            } : {
              displayName: 'Équipes sans créneau assigné',
            },
          },
        },
      });
    } catch (error) {
      logger.error('Join available team error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la jonction à une équipe disponible.',
      });
    }
  }

  // Update team time slot (captain only)
  async updateTeamTimeSlot(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const { timeSlotId } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        include: [{ model: Team, as: 'team' }],
      });

      if (!user || !user.teamId) {
        res.status(404).json({ success: false, message: 'Vous ne faites partie d\'aucune équipe.' });
        return;
      }

      const team = await Team.findByPk(user.teamId);
      if (!team) {
        res.status(404).json({ success: false, message: 'Équipe non trouvée.' });
        return;
      }

      // Check if user is captain
      if (team.captainId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Seul le capitaine peut modifier le créneau horaire de l\'équipe.'
        });
        return;
      }

      // Validate time slot if provided (null is allowed to unset)
      if (timeSlotId !== null) {
        const timeSlot = await TimeSlot.findByPk(timeSlotId);
        if (!timeSlot) {
          res.status(404).json({ success: false, message: 'Créneau horaire non trouvé.' });
          return;
        }

        if (!timeSlot.isActive) {
          res.status(400).json({ success: false, message: 'Ce créneau horaire n\'est pas disponible.' });
          return;
        }

        // Check if time slot is full (max 6 teams)
        const isFull = await timeSlot.isFull();
        if (isFull) {
          res.status(400).json({
            success: false,
            message: `Le créneau ${timeSlot.getDisplayName()} est complet (${timeSlot.maxTeams} équipes maximum).`
          });
          return;
        }
      }

      // Update team time slot
      team.timeSlotId = timeSlotId;
      await team.save();

      logger.info(`Team ${team.name} time slot updated by captain ${user.email}`);

      res.json({
        success: true,
        message: timeSlotId ? 'Créneau horaire mis à jour avec succès.' : 'Créneau horaire retiré.',
        data: { team },
      });
    } catch (error) {
      logger.error('Update team time slot error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du créneau horaire.',
      });
    }
  }
}

export default new TeamController();
