import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../types';
import { User } from '../models/User';
import { Team } from '../models/Team';
import { Registration, RegistrationStatus } from '../models/Registration';
import { logger } from '../utils/logger';

export class AdminController {
  // Statistiques globales
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const totalRegistrations = await User.count();
      const verifiedUsers = await User.count({ where: { emailVerified: true } });
      const totalTeams = await Team.count();
      const completeTeams = await Team.count({ where: { isComplete: true } });

      // Répartition par composante
      const composanteDistribution = await User.findAll({
        attributes: ['composante', [User.sequelize!.fn('COUNT', 'id'), 'count']],
        group: ['composante'],
        raw: true,
      });

      // Statut des inscriptions
      const registrationStatus = await Registration.findAll({
        attributes: ['status', [Registration.sequelize!.fn('COUNT', 'id'), 'count']],
        group: ['status'],
        raw: true,
      });

      // Répartition par salle
      const roomDistribution = await Team.findAll({
        attributes: ['roomNumber', [Team.sequelize!.fn('COUNT', 'id'), 'teamCount']],
        where: { roomNumber: { [Op.not]: null } },
        group: ['roomNumber'],
        raw: true,
      });

      res.json({
        success: true,
        data: {
          overview: {
            totalRegistrations,
            verifiedUsers,
            totalTeams,
            completeTeams,
            incompleteTeams: totalTeams - completeTeams,
          },
          composanteDistribution,
          registrationStatus,
          roomDistribution,
        },
      });
    } catch (error) {
      logger.error('Get stats error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques.' });
    }
  }

  // Liste de toutes les inscriptions
  async getRegistrations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, composante, hasTeam } = req.query;

      const where: any = {};
      if (status) where.status = status;

      const registrations = await Registration.findAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'composante', 'specialty', 'emailVerified'],
            where: composante ? { composante } : undefined,
          },
          {
            model: Team,
            as: 'team',
            required: hasTeam === 'true',
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json({
        success: true,
        data: { registrations, count: registrations.length },
      });
    } catch (error) {
      logger.error('Get registrations error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des inscriptions.' });
    }
  }

  // Export CSV
  async exportCSV(req: AuthRequest, res: Response): Promise<void> {
    try {
      const registrations = await Registration.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email', 'composante', 'specialty', 'emailVerified'],
          },
          {
            model: Team,
            as: 'team',
            attributes: ['name', 'roomNumber'],
          },
        ],
      });

      // Générer CSV
      const csvHeader = 'Prénom,Nom,Email,Composante,Spécialité,Email Vérifié,Équipe,Salle,Statut\n';
      const csvRows = registrations.map((reg: any) => {
        const user = reg.user;
        const team = reg.team;
        return [
          user.firstName,
          user.lastName,
          user.email,
          user.composante || '',
          user.specialty || '',
          user.emailVerified ? 'Oui' : 'Non',
          team?.name || 'Aucune',
          team?.roomNumber || '',
          reg.status,
        ].join(',');
      }).join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inscriptions-ace.csv');
      res.send(csv);
    } catch (error) {
      logger.error('Export CSV error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'export CSV.' });
    }
  }

  // Assigner des équipes aux salles
  async assignRooms(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { assignments } = req.body; // [{ teamId, roomNumber }]

      for (const assignment of assignments) {
        await Team.update(
          { roomNumber: assignment.roomNumber === 0 ? null : assignment.roomNumber },
          { where: { id: assignment.teamId } }
        );
      }

      logger.info(`Rooms assigned: ${assignments.length} teams`);

      res.json({
        success: true,
        message: 'Salles assignées avec succès.',
      });
    } catch (error) {
      logger.error('Assign rooms error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'assignation des salles.' });
    }
  }

  // Gestion des noms de salles
  async getRoomNames(req: AuthRequest, res: Response): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      const roomsFile = path.join(__dirname, '../../data/rooms.json');

      if (!fs.existsSync(roomsFile)) {
        // Créer le dossier data s'il n'existe pas
        const dataDir = path.dirname(roomsFile);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        // Initialiser avec 4 salles par défaut pour la rétrocompatibilité
        const defaultRooms = {
          "1": "Salle 1",
          "2": "Salle 2",
          "3": "Salle 3",
          "4": "Salle 4"
        };
        fs.writeFileSync(roomsFile, JSON.stringify(defaultRooms, null, 2));
        res.json({ success: true, data: defaultRooms });
        return;
      }

      const data = fs.readFileSync(roomsFile, 'utf8');
      res.json({ success: true, data: JSON.parse(data) });
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

      const fs = require('fs');
      const path = require('path');
      const roomsFile = path.join(__dirname, '../../data/rooms.json');

      // Créer le dossier data s'il n'existe pas
      const dataDir = path.dirname(roomsFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      let rooms = {};
      if (fs.existsSync(roomsFile)) {
        rooms = JSON.parse(fs.readFileSync(roomsFile, 'utf8'));
      }

      rooms[roomNumber] = name;
      fs.writeFileSync(roomsFile, JSON.stringify(rooms, null, 2));

      res.json({ success: true, message: 'Nom de salle mis à jour.' });
    } catch (error) {
      logger.error('Update room name error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du nom de salle.' });
    }
  }

  async addRoom(req: AuthRequest, res: Response): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      const roomsFile = path.join(__dirname, '../../data/rooms.json');

      let rooms: Record<string, string> = {};
      if (fs.existsSync(roomsFile)) {
        rooms = JSON.parse(fs.readFileSync(roomsFile, 'utf8'));
      }

      // Trouver le prochain ID disponible
      const existingIds = Object.keys(rooms).map(Number);
      const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

      rooms[nextId.toString()] = `Salle ${nextId}`;
      fs.writeFileSync(roomsFile, JSON.stringify(rooms, null, 2));

      res.json({ success: true, message: 'Salle ajoutée.', data: { id: nextId, name: rooms[nextId.toString()] } });
    } catch (error) {
      logger.error('Add room error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout de la salle.' });
    }
  }

  async deleteRoom(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { roomNumber } = req.params;
      const roomNum = parseInt(roomNumber);

      const fs = require('fs');
      const path = require('path');
      const roomsFile = path.join(__dirname, '../../data/rooms.json');

      if (!fs.existsSync(roomsFile)) {
        res.status(404).json({ success: false, message: 'Aucune salle trouvée.' });
        return;
      }

      let rooms = JSON.parse(fs.readFileSync(roomsFile, 'utf8'));

      if (!rooms[roomNumber]) {
        res.status(404).json({ success: false, message: 'Salle non trouvée.' });
        return;
      }

      // Supprimer la salle du fichier
      delete rooms[roomNumber];
      fs.writeFileSync(roomsFile, JSON.stringify(rooms, null, 2));

      // Désassigner les équipes de cette salle
      await Team.update(
        { roomNumber: null },
        { where: { roomNumber: roomNum } }
      );

      res.json({ success: true, message: 'Salle supprimée et équipes désassignées.' });
    } catch (error) {
      logger.error('Delete room error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la salle.' });
    }
  }

  // Démarrer une session (OBSOLÈTE)
  async startSession(req: AuthRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Fonctionnalité désactivée.' });
  }

  // Arrêter une session (OBSOLÈTE)
  async stopSession(req: AuthRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'Fonctionnalité désactivée.' });
  }

  // Liste de toutes les équipes
  async getAllTeams(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { complete, roomNumber } = req.query;

      const where: any = {};
      if (complete !== undefined) where.isComplete = complete === 'true';
      if (roomNumber) where.roomNumber = parseInt(roomNumber as string);

      const teams = await Team.findAll({
        where,
        include: [
          {
            model: User,
            as: 'members',
            attributes: ['id', 'firstName', 'lastName', 'email', 'composante'],
          },
          {
            model: User,
            as: 'captain',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Ajouter le nombre de membres à chaque équipe
      const teamsWithCount = await Promise.all(
        teams.map(async (team) => ({
          ...team.toJSON(),
          memberCount: await team.getMemberCount(),
        }))
      );

      res.json({
        success: true,
        data: { teams: teamsWithCount, count: teams.length },
      });
    } catch (error) {
      logger.error('Get all teams error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des équipes.' });
    }
  }

  // Obtenir les scores de toutes les équipes
  async getScores(req: AuthRequest, res: Response): Promise<void> {
    try {
      const teams = await Team.findAll({
        attributes: ['id', 'name', 'currentScore', 'rank', 'roomNumber'],
        order: [['currentScore', 'DESC']],
      });

      res.json({
        success: true,
        data: { teams },
      });
    } catch (error) {
      logger.error('Get scores error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des scores.' });
    }
  }

  // Mettre à jour un utilisateur (admin uniquement)
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      // Sécurité : Filtrer les champs autorisés (Mass Assignment Protection)
      const allowedFields = ['firstName', 'lastName', 'email', 'composante', 'specialty', 'isAdmin', 'emailVerified'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = updates[key];
          return obj;
        }, {});

      await user.update(filteredUpdates);

      logger.info(`User ${userId} updated by admin`);

      res.json({
        success: true,
        message: 'Utilisateur mis à jour.',
        data: { user },
      });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour.' });
    }
  }

  // Supprimer une équipe (admin uniquement)
  async deleteTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;

      const team = await Team.findByPk(teamId);
      if (!team) {
        res.status(404).json({ success: false, message: 'Équipe non trouvée.' });
        return;
      }

      // Retirer tous les membres de l'équipe
      await User.update({ teamId: null }, { where: { teamId } });
      await Registration.update(
        { teamId: null, status: RegistrationStatus.VERIFIED },
        { where: { teamId } }
      );

      await team.destroy();

      logger.info(`Team ${teamId} deleted by admin`);

      res.json({
        success: true,
        message: 'Équipe supprimée.',
      });
    } catch (error) {
      logger.error('Delete team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression.' });
    }
  }
}

export default new AdminController();
