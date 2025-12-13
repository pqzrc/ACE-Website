import { Response } from 'express';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';
import {
  adminStatsService,
  adminExportService,
  adminRoomService,
  adminUserService,
  adminTeamService,
} from '../services/admin';

export class AdminController {
  // Stats
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await adminStatsService.getStats();
      res.json({ success: true, data });
    } catch (error) {
      logger.error('Get stats error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques.' });
    }
  }

  async getRegistrations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, composante, hasTeam } = req.query as Record<string, string>;
      const registrations = await adminStatsService.getRegistrations({ status, composante, hasTeam });
      res.json({ success: true, data: { registrations, count: registrations.length } });
    } catch (error) {
      logger.error('Get registrations error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des inscriptions.' });
    }
  }

  async getScores(req: AuthRequest, res: Response): Promise<void> {
    try {
      const teams = await adminStatsService.getScores();
      res.json({ success: true, data: { teams } });
    } catch (error) {
      logger.error('Get scores error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des scores.' });
    }
  }

  // Export
  async exportCSV(req: AuthRequest, res: Response): Promise<void> {
    try {
      const csv = await adminExportService.exportSimpleCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inscriptions-ace.csv');
      res.send(csv);
    } catch (error) {
      logger.error('Export CSV error:', error);
      res.status(500).json({ success: false, message: "Erreur lors de l'export CSV." });
    }
  }

  async exportCustomCSV(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fields } = req.body;
      if (!fields || !Array.isArray(fields) || fields.length === 0) {
        res.status(400).json({ success: false, message: 'Champs requis non fournis.' });
        return;
      }

      const csv = await adminExportService.exportCustomCSV(fields);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="inscriptions-ace-custom.csv"');
      res.send(csv);
    } catch (error) {
      logger.error('Export custom CSV error:', error);
      res.status(500).json({ success: false, message: "Erreur lors de l'export CSV personnalisé." });
    }
  }

  // Rooms
  async getRoomNames(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await adminRoomService.getRoomNames();
      res.json({ success: true, data });
    } catch (error) {
      logger.error('Get room names error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des noms de salles.' });
    }
  }

  async updateRoomName(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { roomNumber, name } = req.body;
      if (!roomNumber || !name) {
        res.status(400).json({ success: false, message: 'Numéro de salle et nom requis.' });
        return;
      }
      await adminRoomService.updateRoomName(roomNumber, name);
      res.json({ success: true, message: 'Nom de salle mis à jour.' });
    } catch (error) {
      logger.error('Update room name error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du nom de salle.' });
    }
  }

  async addRoom(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await adminRoomService.addRoom();
      res.json({ success: true, message: 'Salle ajoutée.', data });
    } catch (error) {
      logger.error('Add room error:', error);
      res.status(500).json({ success: false, message: "Erreur lors de l'ajout de la salle." });
    }
  }

  async deleteRoom(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { roomNumber } = req.params;
      const deleted = await adminRoomService.deleteRoom(roomNumber);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Salle non trouvée.' });
        return;
      }
      res.json({ success: true, message: 'Salle supprimée et équipes désassignées.' });
    } catch (error) {
      logger.error('Delete room error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la salle.' });
    }
  }

  async assignRooms(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { assignments } = req.body;
      await adminRoomService.assignRooms(assignments);
      logger.info(`Rooms assigned: ${assignments.length} teams`);
      res.json({ success: true, message: 'Salles assignées avec succès.' });
    } catch (error) {
      logger.error('Assign rooms error:', error);
      res.status(500).json({ success: false, message: "Erreur lors de l'assignation des salles." });
    }
  }

  // Users
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const user = await adminUserService.updateUser(userId, req.body);
      if (!user) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }
      res.json({ success: true, message: 'Utilisateur mis à jour.', data: { user } });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour.' });
    }
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const result = await adminUserService.deleteUser(userId);
      if (!result.success) {
        res.status(404).json({ success: false, message: result.error });
        return;
      }
      res.json({ success: true, message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'utilisateur." });
    }
  }

  // Teams
  async getAllTeams(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { complete, roomNumber } = req.query as Record<string, string>;
      const teams = await adminTeamService.getAllTeams({ complete, roomNumber });
      res.json({ success: true, data: { teams, count: teams.length } });
    } catch (error) {
      logger.error('Get all teams error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des équipes.' });
    }
  }

  async deleteTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      const result = await adminTeamService.deleteTeam(teamId);
      if (!result.success) {
        res.status(404).json({ success: false, message: result.error });
        return;
      }
      res.json({ success: true, message: 'Équipe supprimée.' });
    } catch (error) {
      logger.error('Delete team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression.' });
    }
  }

  async createTeamWithCaptain(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await adminTeamService.createTeamWithCaptain(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }
      res.json({ success: true, message: 'Équipe créée avec succès.', data: { team: result.team, captain: result.captain } });
    } catch (error) {
      logger.error('Create team with captain error:', error);
      res.status(500).json({ success: false, message: "Erreur lors de la création de l'équipe." });
    }
  }

  async addMemberToTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await adminTeamService.addMemberToTeam(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }
      res.json({ success: true, message: "Membre ajouté à l'équipe avec succès.", data: { user: result.user, team: result.team } });
    } catch (error) {
      logger.error('Add member to team error:', error);
      res.status(500).json({ success: false, message: "Erreur lors de l'ajout du membre." });
    }
  }

  async updateTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      const team = await adminTeamService.updateTeam(teamId, req.body);
      if (!team) {
        res.status(404).json({ success: false, message: 'Équipe non trouvée.' });
        return;
      }
      res.json({ success: true, message: 'Équipe mise à jour avec succès.', data: team });
    } catch (error) {
      logger.error('Update team error:', error);
      res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de l'équipe." });
    }
  }

  async assignTeamTimeSlot(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId, timeSlotId } = req.body;
      const result = await adminTeamService.assignTimeSlot(teamId, timeSlotId);
      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }
      res.json({
        success: true,
        message: timeSlotId ? 'Créneau horaire assigné avec succès.' : 'Créneau horaire retiré.',
        data: { team: result.team },
      });
    } catch (error) {
      logger.error('Assign team time slot error:', error);
      res.status(500).json({ success: false, message: "Erreur lors de l'assignation du créneau horaire." });
    }
  }

  // Obsolète
  async startSession(_req: AuthRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Fonctionnalité désactivée.' });
  }

  async stopSession(_req: AuthRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Fonctionnalité désactivée.' });
  }
}

export default new AdminController();
