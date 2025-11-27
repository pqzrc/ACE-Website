import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { CTFdUser, CTFdTeam, CTFdScore } from '../types';

class CTFdService {
  private client: AxiosInstance;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !!config.ctfdApiUrl && !!config.ctfdApiToken;
    
    if (!this.isEnabled) {
      logger.warn('CTFd integration disabled: missing configuration');
    }

    this.client = axios.create({
      baseURL: config.ctfdApiUrl,
      headers: {
        'Authorization': `Token ${config.ctfdApiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  // Créer un utilisateur dans CTFd
  async createUser(name: string, email: string, password: string): Promise<CTFdUser | null> {
    if (!this.isEnabled) return null;

    try {
      const response = await this.client.post('/api/v1/users', {
        name,
        email,
        password,
        type: 'user',
        verified: true,
        hidden: false,
      });

      logger.info(`CTFd user created: ${email}`);
      return response.data.data;
    } catch (error: any) {
      logger.error('Failed to create CTFd user:', error.response?.data || error.message);
      return null;
    }
  }

  // Créer une équipe dans CTFd
  async createTeam(teamName: string, password: string, captainId: number): Promise<CTFdTeam | null> {
    if (!this.isEnabled) return null;

    try {
      const response = await this.client.post('/api/v1/teams', {
        name: teamName,
        password,
        captain_id: captainId,
      });

      logger.info(`CTFd team created: ${teamName}`);
      return response.data.data;
    } catch (error: any) {
      logger.error('Failed to create CTFd team:', error.response?.data || error.message);
      return null;
    }
  }

  // Ajouter un utilisateur à une équipe CTFd
  async addUserToTeam(userId: number, teamId: number): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      await this.client.patch(`/api/v1/users/${userId}`, {
        team_id: teamId,
      });

      logger.info(`User ${userId} added to CTFd team ${teamId}`);
      return true;
    } catch (error: any) {
      logger.error('Failed to add user to CTFd team:', error.response?.data || error.message);
      return false;
    }
  }

  // Récupérer le scoreboard
  async getScoreboard(): Promise<CTFdScore[]> {
    if (!this.isEnabled) return [];

    try {
      const response = await this.client.get('/api/v1/scoreboard');
      return response.data.data || [];
    } catch (error: any) {
      logger.error('Failed to get CTFd scoreboard:', error.response?.data || error.message);
      return [];
    }
  }

  // Récupérer les challenges résolus par une équipe
  async getTeamSolves(teamId: number): Promise<any[]> {
    if (!this.isEnabled) return [];

    try {
      const response = await this.client.get(`/api/v1/teams/${teamId}/solves`);
      return response.data.data || [];
    } catch (error: any) {
      logger.error('Failed to get team solves:', error.response?.data || error.message);
      return [];
    }
  }

  // Récupérer le score d'une équipe
  async getTeamScore(teamId: number): Promise<number> {
    if (!this.isEnabled) return 0;

    try {
      const response = await this.client.get(`/api/v1/teams/${teamId}`);
      return response.data.data?.score || 0;
    } catch (error: any) {
      logger.error('Failed to get team score:', error.response?.data || error.message);
      return 0;
    }
  }

  // Vérifier si CTFd est accessible
  async healthCheck(): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      await this.client.get('/api/v1/');
      return true;
    } catch (error) {
      logger.error('CTFd health check failed:', error);
      return false;
    }
  }

  // Synchroniser les scores de toutes les équipes
  async syncAllScores(teams: Array<{ id: string; ctfdTeamId: number | null }>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const scoreboard = await this.getScoreboard();

      for (const team of teams) {
        if (!team.ctfdTeamId) continue;

        const scoreData = scoreboard.find((s) => s.team_id === team.ctfdTeamId);
        if (scoreData) {
          const { Team } = require('../models/Team');
          await Team.update(
            { 
              currentScore: scoreData.score,
              rank: scoreData.pos,
            },
            { where: { id: team.id } }
          );
        }
      }

      logger.info('Scores synchronized from CTFd');
    } catch (error) {
      logger.error('Failed to sync scores:', error);
    }
  }

  /**
   * Synchroniser toutes les équipes vers CTFd
   */
  async syncTeams(): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('CTFd integration is not enabled');
    }

    try {
      const { Team } = require('../models/Team');
      const { User } = require('../models/User');

      const teams = await Team.findAll();

      const results = {
        success: 0,
        failed: 0,
        teams: [] as any[],
      };

      for (const team of teams) {
        try {
          // Charger le capitaine
          const captain = await User.findByPk(team.captainId);

          // Créer ou mettre à jour le capitaine dans CTFd
          let captainId = captain?.ctfdUserId;
          if (!captainId && captain) {
            const ctfdUser = await this.createUser(
              captain.username,
              captain.email,
              'ChangeMe123!'
            );
            if (ctfdUser) {
              captainId = ctfdUser.id;
              await captain.update({ ctfdUserId: captainId });
            }
          }

          // Créer l'équipe si elle n'existe pas
          let teamId = team.ctfdTeamId;
          if (!teamId && captainId) {
            const ctfdTeam = await this.createTeam(
              team.name,
              'TeamPassword123!',
              captainId
            );
            if (ctfdTeam) {
              teamId = ctfdTeam.id;
              await team.update({ ctfdTeamId: teamId });
            }
          }

          // Charger et ajouter les membres
          if (teamId) {
            const members = await User.findAll({
              where: { teamId: team.id },
            });

            for (const user of members) {
              // Skip captain (already added)
              if (user.id === team.captainId) continue;

              if (!user.ctfdUserId) {
                const ctfdUser = await this.createUser(
                  user.username,
                  user.email,
                  'ChangeMe123!'
                );
                if (ctfdUser) {
                  await user.update({ ctfdUserId: ctfdUser.id });
                  await this.addUserToTeam(ctfdUser.id, teamId);
                }
              } else {
                await this.addUserToTeam(user.ctfdUserId, teamId);
              }
            }
          }

          results.success++;
          results.teams.push({
            name: team.name,
            ctfdTeamId: teamId,
            status: 'synced',
          });
        } catch (error: any) {
          results.failed++;
          results.teams.push({
            name: team.name,
            status: 'failed',
            error: error.message,
          });
          logger.error(`Failed to sync team ${team.name}:`, error);
        }
      }

      logger.info(`Teams sync completed: ${results.success} success, ${results.failed} failed`);
      return results;
    } catch (error) {
      logger.error('Failed to sync teams:', error);
      throw error;
    }
  }

  /**
   * Créer une session SSO dans CTFd après authentification
   * @param token JWT token de l'utilisateur
   * @param email Email de l'utilisateur
   * @returns URL de redirection vers CTFd ou null si erreur
   */
  async createSSOSession(token: string, email: string): Promise<string | null> {
    if (!config.ctfdUrl) {
      logger.warn('CTFD_URL not configured, skipping SSO session creation');
      return null;
    }

    try {
      const response = await axios.post(
        `${config.ctfdUrl}/sso/authenticate`,
        {
          token,
          email,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        }
      );

      if (response.data.success && response.data.data?.redirect_url) {
        logger.info(`SSO session created for CTFd: ${email}`);
        return response.data.data.redirect_url;
      }

      logger.warn('CTFd SSO response missing redirect_url');
      return null;
    } catch (error: any) {
      // Ne pas bloquer le login si CTFd est indisponible
      logger.error('Failed to create CTFd SSO session:', error.response?.data || error.message);
      return null;
    }
  }
}

export default new CTFdService();

