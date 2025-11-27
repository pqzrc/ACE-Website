import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../types';
import { User } from '../models/User';
import { Team } from '../models/Team';
import { Registration, RegistrationStatus } from '../models/Registration';
import { TimeSlot } from '../models/TimeSlot';
import { logger } from '../utils/logger';
import emailService from '../services/email.service';
import { getAdminAddPlayerEmailHtml } from '../utils/new-email-templates';

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

  // Export CSV (legacy - GET method)
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

  // Export CSV with custom fields (POST method)
  async exportCustomCSV(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fields } = req.body;
      
      if (!fields || !Array.isArray(fields) || fields.length === 0) {
        res.status(400).json({ success: false, message: 'Champs requis non fournis.' });
        return;
      }

      // Load all data with relations
      const registrations = await Registration.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'username', 'composante', 'specialty', 'emailVerified', 'createdAt'],
          },
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name', 'captainId', 'roomNumber', 'currentScore', 'rank', 'timeSlotId'],
            include: [
              {
                model: TimeSlot,
                as: 'timeSlot',
                attributes: ['roomName', 'startTime', 'endTime'],
                required: false,
              },
            ],
          },
        ],
      });

      // Load room names
      let roomNames: Record<number, string> = {};
      try {
        const fs = require('fs');
        const path = require('path');
        const roomsFile = path.join(__dirname, '../../data/rooms.json');
        if (fs.existsSync(roomsFile)) {
          const fileContent = fs.readFileSync(roomsFile, 'utf8');
          roomNames = JSON.parse(fileContent);
        }
      } catch (fileError) {
        logger.warn('Could not load rooms.json:', fileError);
      }

      // Field mapping
      const fieldLabels: Record<string, string> = {
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Email',
        phoneNumber: 'Téléphone',
        username: 'Nom d\'utilisateur',
        composante: 'Composante',
        specialty: 'Spécialité',
        emailVerified: 'Email vérifié',
        teamName: 'Équipe',
        teamRole: 'Rôle équipe',
        roomNumber: 'Salle',
        roomName: 'Nom salle',
        timeSlot: 'Créneau horaire',
        currentScore: 'Points',
        rank: 'Classement',
        registrationStatus: 'Statut inscription',
        createdAt: 'Date inscription',
      };

      // Generate CSV header
      const csvHeader = fields.map(field => fieldLabels[field] || field).join(',') + '\n';

      // Generate CSV rows
      const csvRows = registrations.map((reg: any) => {
        const user = reg.user;
        const team = reg.team;
        const timeSlot = team?.timeSlot;

        return fields.map(field => {
          switch (field) {
            case 'firstName':
              return user?.firstName || '';
            case 'lastName':
              return user?.lastName || '';
            case 'email':
              return user?.email || '';
            case 'phoneNumber':
              return user?.phoneNumber || '';
            case 'username':
              return user?.username || '';
            case 'composante':
              return user?.composante || '';
            case 'specialty':
              return user?.specialty || '';
            case 'emailVerified':
              return user?.emailVerified ? 'Oui' : 'Non';
            case 'teamName':
              return team?.name || 'Aucune';
            case 'teamRole':
              return team?.captainId === user?.id ? 'Capitaine' : 'Membre';
            case 'roomNumber':
              return team?.roomNumber || '';
            case 'roomName':
              return team?.roomNumber ? (roomNames[team.roomNumber] || `Salle ${team.roomNumber}`) : '';
            case 'timeSlot':
              return timeSlot ? `Salle ${timeSlot.roomName} – ${timeSlot.startTime.substring(0, 5)}-${timeSlot.endTime.substring(0, 5)}` : '';
            case 'currentScore':
              return team?.currentScore || '0';
            case 'rank':
              return team?.rank || '';
            case 'registrationStatus':
              return reg.status || '';
            case 'createdAt':
              return user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '';
            default:
              return '';
          }
        }).map(value => {
          // Escape CSV values that contain commas or quotes
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',');
      }).join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="inscriptions-ace-custom.csv"');
      res.send('\uFEFF' + csv);
    } catch (error) {
      logger.error('Export custom CSV error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'export CSV personnalisé.' });
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
      const allowedFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'composante', 'specialty', 'isAdmin', 'emailVerified'];
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
  // Créer une équipe avec un capitaine (admin uniquement)
  async createTeamWithCaptain(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, captainEmail, timeSlotId } = req.body;

      let captain: User | null = null;
      
      // Si un email de capitaine est fourni, vérifier l'utilisateur
      if (captainEmail) {
        captain = await User.findOne({ where: { email: captainEmail } });
        if (!captain) {
          res.status(404).json({ success: false, message: 'Utilisateur avec cet email non trouvé.' });
          return;
        }

        // Vérifier que l'utilisateur n'a pas déjà une équipe
        if (captain.teamId) {
          res.status(400).json({ success: false, message: 'Cet utilisateur fait déjà partie d\'une équipe.' });
          return;
        }
      }

      // Générer un code d'invitation unique
      const generateInviteCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      };

      let inviteCode = generateInviteCode();
      let existingTeam = await Team.findOne({ where: { inviteCode } });

      while (existingTeam) {
        inviteCode = generateInviteCode();
        existingTeam = await Team.findOne({ where: { inviteCode } });
      }

      // Créer l'équipe
      const team = await Team.create({
        name,
        captainId: captain ? captain.id : null,
        inviteCode,
        timeSlotId: timeSlotId || null,
        isComplete: false,
        currentScore: 0,
        createdByAdmin: true,
      });

      // Ajouter le capitaine à l'équipe (si fourni)
      if (captain) {
        await captain.update({ teamId: team.id });

        // Mettre à jour le statut d'inscription
        await Registration.update(
          { teamId: team.id, status: RegistrationStatus.TEAM_INCOMPLETE },
          { where: { userId: captain.id } }
        );

        logger.info(`Team ${team.id} created by admin with captain ${captain.email}`);
      } else {
        logger.info(`Team ${team.id} created by admin without captain`);
      }

      res.json({
        success: true,
        message: 'Équipe créée avec succès.',
        data: { team, captain }
      });
    } catch (error) {
      logger.error('Create team with captain error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'équipe.' });
    }
  }

  // Ajouter un membre à une équipe via email (admin uniquement)
  async addMemberToTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId, userId, userEmail } = req.body;

      const team = await Team.findByPk(teamId);
      if (!team) {
        res.status(404).json({ success: false, message: 'Équipe non trouvée.' });
        return;
      }

      // Trouver l'utilisateur soit par ID soit par email
      let user: User | null = null;
      if (userEmail) {
        user = await User.findOne({ where: { email: userEmail } });
      } else if (userId) {
        user = await User.findByPk(userId);
      }

      if (!user) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      // Vérifier si l'utilisateur fait déjà partie d'une équipe
      if (user.teamId) {
        res.status(400).json({ success: false, message: 'Cet utilisateur fait déjà partie d\'une équipe.' });
        return;
      }

      // Vérifier si l'équipe est complète
      if (await team.isFull()) {
        res.status(400).json({ success: false, message: 'Cette équipe est déjà complète.' });
        return;
      }

      // Mettre à jour l'utilisateur
      await user.update({ teamId: team.id });

      // If the team has no captain, make this user the captain
      if (!team.captainId) {
        team.captainId = user.id;
        await team.save();
        logger.info(`User ${user.email} automatically assigned as captain of team ${team.name} by admin`);
      }

      // Mettre à jour le statut d'inscription
      const memberCount = await team.getMemberCount();
      const newStatus = memberCount >= 3 ? RegistrationStatus.TEAM_COMPLETE : RegistrationStatus.TEAM_INCOMPLETE;

      await Registration.update(
        { teamId: team.id, status: newStatus },
        { where: { userId: user.id } }
      );

      // Mettre à jour le statut de l'équipe si elle devient complète
      if (memberCount >= 3) {
        await team.update({ isComplete: true });
      }

      // Envoyer l'email de notification
      await emailService.sendAdminAddPlayerEmail(user.email, user.firstName, team.name);

      logger.info(`User ${user.email} added to team ${teamId} by admin`);

      res.json({
        success: true,
        message: 'Membre ajouté à l\'équipe avec succès.',
        data: { user, team }
      });
    } catch (error) {
      logger.error('Add member to team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout du membre.' });
    }
  }
}

export default new AdminController();
