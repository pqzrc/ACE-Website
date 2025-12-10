import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Team } from '../models/Team';
import { TimeSlot } from '../models/TimeSlot';
import { User } from '../models/User';
import { logger } from '../utils/logger';

// Helper pour calculer le statut de l'événement (standalone function)
function getEventInfo() {
  const EVENT_START = process.env.EVENT_START_TIME || '2025-12-11T13:00:00Z';
  const EVENT_END = process.env.EVENT_END_TIME || '2025-12-11T17:00:00Z';
  const RESULTS_RELEASE = process.env.RESULTS_RELEASE_TIME || EVENT_END;

  const now = Date.now();
  const startTime = new Date(EVENT_START).getTime();
  const endTime = new Date(EVENT_END).getTime();
  const releaseTime = new Date(RESULTS_RELEASE).getTime();

  let eventStatus: 'before' | 'during' | 'after' = 'before';
  if (now >= startTime && now < endTime) {
    eventStatus = 'during';
  } else if (now >= endTime) {
    eventStatus = 'after';
  }

  return {
    eventStart: EVENT_START,
    eventEnd: EVENT_END,
    resultsRelease: RESULTS_RELEASE,
    eventStatus,
    resultsAvailable: now >= releaseTime,
  };
}

export class PublicController {
  // Obtenir le classement public (sans authentification)
  // Inclut la config de l'événement pour éviter un appel séparé
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const eventInfo = getEventInfo();

      // Si les résultats ne sont pas encore disponibles, renvoyer la config uniquement
      if (!eventInfo.resultsAvailable) {
        res.json({
          success: true,
          data: {
            teams: [],
            locked: true,
            ...eventInfo,
          },
        });
        return;
      }

      const teams = await Team.findAll({
        attributes: ['id', 'name', 'currentScore', 'rank', 'timeSlotId', 'captainId'],
        include: [
          {
            model: TimeSlot,
            as: 'timeSlot',
            attributes: ['id', 'roomName', 'startTime', 'endTime'],
          },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'username', 'firstName', 'lastName', 'teamId'],
          },
        ],
        order: [['currentScore', 'DESC'], ['rank', 'ASC']],
      });

      res.json({
        success: true,
        data: {
          teams,
          locked: false,
          ...eventInfo,
        },
      });
    } catch (error) {
      logger.error('Get public leaderboard error:', error);
      logger.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du classement.'
      });
    }
  }

  // Obtenir les noms des salles (public)
  async getRoomNames(req: Request, res: Response): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      const roomsFile = path.join(__dirname, '../../data/rooms.json');

      if (!fs.existsSync(roomsFile)) {
        // Si le fichier n'existe pas, renvoyer les valeurs par défaut
        const defaultRooms = {
          "1": "Salle 1",
          "2": "Salle 2",
          "3": "Salle 3",
          "4": "Salle 4"
        };
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
}

export default new PublicController();
