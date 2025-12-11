import { Response } from 'express';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';
import teamService from '../services/team.service';

export class TeamController {
  async createTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const { name, timeSlotId } = req.body;
      const result = await teamService.createTeam(req.user.id, name, timeSlotId);

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Équipe créée avec succès !',
        data: {
          team: {
            id: result.team!.id,
            name: result.team!.name,
            inviteCode: result.team!.inviteCode,
            captainId: result.team!.captainId,
          },
        },
      });
    } catch (error) {
      logger.error('Create team error:', error);
      res.status(500).json({ success: false, message: "Erreur lors de la création de l'équipe." });
    }
  }

  async joinTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const { inviteCode } = req.body;
      const result = await teamService.joinTeamByCode(req.user.id, inviteCode);

      if (!result.success || !('team' in result) || !result.team) {
        const errorMsg = 'error' in result ? result.error : 'Erreur inconnue';
        res.status(400).json({ success: false, message: errorMsg });
        return;
      }

      res.json({
        success: true,
        message: "Vous avez rejoint l'équipe avec succès !",
        data: { team: { id: result.team.id, name: result.team.name } },
      });
    } catch (error) {
      logger.error('Join team error:', error);
      res.status(500).json({ success: false, message: "Erreur lors de la jonction à l'équipe." });
    }
  }

  async getTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const team = await teamService.getTeamById(id);

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
      res.status(500).json({ success: false, message: "Erreur lors de la récupération de l'équipe." });
    }
  }

  async leaveTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const result = await teamService.leaveTeam(req.user.id);

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }

      res.json({
        success: true,
        message: result.teamDeleted ? 'Équipe supprimée.' : "Vous avez quitté l'équipe.",
      });
    } catch (error) {
      logger.error('Leave team error:', error);
      res.status(500).json({ success: false, message: "Erreur lors du départ de l'équipe." });
    }
  }

  async getMyTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const team = await teamService.getTeamByUserId(req.user.id);

      if (!team) {
        res.status(404).json({ success: false, message: "Vous ne faites pas partie d'une équipe." });
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

  async getAvailableTeams(req: AuthRequest, res: Response): Promise<void> {
    try {
      const slots = await teamService.getAvailableTeams();
      res.json({ success: true, data: { slots } });
    } catch (error) {
      logger.error('Get available teams error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des équipes disponibles.' });
    }
  }

  async joinAvailableTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const { timeSlotId } = req.body;
      const result = await teamService.joinAvailableTeamInSlot(req.user.id, timeSlotId);

      if (!result.success || !('team' in result) || !result.team) {
        const errorMsg = 'error' in result ? result.error : 'Erreur inconnue';
        res.status(400).json({ success: false, message: errorMsg });
        return;
      }

      const { team, timeSlot } = result;

      res.json({
        success: true,
        message: 'Vous avez rejoint une équipe avec succès !',
        data: {
          team: {
            id: team.id,
            name: team.name,
            timeSlot: timeSlot
              ? { displayName: timeSlot.getDisplayName() }
              : { displayName: 'Équipes sans créneau assigné' },
          },
        },
      });
    } catch (error) {
      logger.error('Join available team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la jonction à une équipe disponible.' });
    }
  }

  async updateTeamTimeSlot(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const { timeSlotId } = req.body;
      const result = await teamService.updateTimeSlot(req.user.id, timeSlotId);

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }

      res.json({
        success: true,
        message: timeSlotId ? 'Créneau horaire mis à jour avec succès.' : 'Créneau horaire retiré.',
        data: { team: result.team },
      });
    } catch (error) {
      logger.error('Update team time slot error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du créneau horaire.' });
    }
  }
}

export default new TeamController();
