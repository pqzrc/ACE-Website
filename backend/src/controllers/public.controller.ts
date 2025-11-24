import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Team } from '../models/Team';
import { logger } from '../utils/logger';

export class PublicController {
  // Obtenir le classement public (sans authentification)
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const teams = await Team.findAll({
        attributes: ['id', 'name', 'currentScore', 'rank', 'roomNumber'],
        order: [['currentScore', 'DESC'], ['rank', 'ASC']],
      });

      // Charger les noms des salles
      const fs = require('fs');
      const path = require('path');
      const roomsFile = path.join(__dirname, '../../data/rooms.json');
      let roomNames = {};

      if (fs.existsSync(roomsFile)) {
        try {
          roomNames = JSON.parse(fs.readFileSync(roomsFile, 'utf8'));
        } catch (e) {
          logger.error('Error reading rooms file:', e);
        }
      }

      res.json({
        success: true,
        data: { teams, roomNames },
      });
    } catch (error) {
      logger.error('Get public leaderboard error:', error);
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
