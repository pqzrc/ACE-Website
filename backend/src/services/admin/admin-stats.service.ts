import { Op } from 'sequelize';
import { User } from '../../models/User';
import { Team } from '../../models/Team';
import { Registration } from '../../models/Registration';

export class AdminStatsService {
  async getStats() {
    const [totalRegistrations, verifiedUsers, totalTeams, completeTeams] = await Promise.all([
      User.count(),
      User.count({ where: { emailVerified: true } }),
      Team.count(),
      Team.count({ where: { isComplete: true } }),
    ]);

    const [composanteDistribution, registrationStatus, roomDistribution] = await Promise.all([
      User.findAll({
        attributes: ['composante', [User.sequelize!.fn('COUNT', 'id'), 'count']],
        group: ['composante'],
        raw: true,
      }),
      Registration.findAll({
        attributes: ['status', [Registration.sequelize!.fn('COUNT', 'id'), 'count']],
        group: ['status'],
        raw: true,
      }),
      Team.findAll({
        attributes: ['roomNumber', [Team.sequelize!.fn('COUNT', 'id'), 'teamCount']],
        where: { roomNumber: { [Op.not]: null } },
        group: ['roomNumber'],
        raw: true,
      }),
    ]);

    return {
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
    };
  }

  async getRegistrations(filters: { status?: string; composante?: string; hasTeam?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;

    return Registration.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'composante', 'specialty', 'emailVerified'],
          where: filters.composante ? { composante: filters.composante } : undefined,
        },
        {
          model: Team,
          as: 'team',
          required: filters.hasTeam === 'true',
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async getScores() {
    return Team.findAll({
      attributes: ['id', 'name', 'currentScore', 'rank', 'roomNumber'],
      order: [['currentScore', 'DESC']],
    });
  }
}

export default new AdminStatsService();
