import { Response } from 'express';
import { AuthRequest } from '../types';
import ctfdService from '../services/ctfd.service';
import { Team } from '../models/Team';
import { logger } from '../utils/logger';

export class CTFdController {
  // Synchroniser les scores depuis CTFd
  async syncScores(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { scores } = req.body;

      if (!scores || !Array.isArray(scores)) {
        res.status(400).json({ success: false, message: 'Invalid scores data' });
        return;
      }

      logger.info(`Received ${scores.length} scores from CTFd`);

      // Mettre à jour chaque équipe
      for (const scoreData of scores) {
        const { teamId, score, rank } = scoreData;

        await Team.update(
          {
            currentScore: score,
            rank: rank,
          },
          { where: { id: teamId } }
        );
      }

      logger.info(`Updated ${scores.length} team scores`);

      res.json({
        success: true,
        message: 'Scores synchronisés avec succès.',
      });
    } catch (error) {
      logger.error('Sync scores error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la synchronisation.' });
    }
  }

  // Health check CTFd
  async healthCheck(req: AuthRequest, res: Response): Promise<void> {
    try {
      const isHealthy = await ctfdService.healthCheck();

      res.json({
        success: true,
        data: { healthy: isHealthy },
      });
    } catch (error) {
      logger.error('CTFd health check error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors du health check.' });
    }
  }

  // Obtenir le scoreboard CTFd
  async getScoreboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scoreboard = await ctfdService.getScoreboard();

      res.json({
        success: true,
        data: { scoreboard },
      });
    } catch (error) {
      logger.error('Get scoreboard error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération du scoreboard.' });
    }
  }

  // Synchroniser les équipes vers CTFd
  async syncTeams(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { password } = req.body;

      // Vérifier le mot de passe admin
      if (password !== process.env.ADMIN_PASSWORD) {
        res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
        return;
      }

      const result = await ctfdService.syncTeams();

      res.json({
        success: true,
        message: 'Équipes synchronisées avec succès',
        data: result,
      });
    } catch (error) {
      logger.error('Sync teams error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la synchronisation des équipes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new CTFdController();

