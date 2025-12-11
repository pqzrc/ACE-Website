import { Op } from 'sequelize';
import { User } from '../../models/User';
import { logger } from '../../utils/logger';

type ProfileResult =
  | { success: true; user: User }
  | { success: false; error: string };

class AuthProfileService {
  async getProfile(userId: string): Promise<ProfileResult> {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verificationToken'] },
      include: ['team'],
    });

    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé.' };
    }

    return { success: true, user };
  }

  async updatePhoneNumber(userId: string, phoneNumber: string): Promise<ProfileResult> {
    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé.' };
    }

    if (!phoneNumber) {
      return { success: false, error: 'Numéro de téléphone requis.' };
    }

    // Check if phone number already exists (for another user)
    const existingPhone = await User.findOne({
      where: {
        phoneNumber,
        id: { [Op.ne]: userId }
      }
    });

    if (existingPhone) {
      return { success: false, error: 'Ce numéro de téléphone est déjà utilisé par un autre utilisateur.' };
    }

    // Update phone number
    user.phoneNumber = phoneNumber;
    await user.save();

    logger.info(`User ${user.email} updated phone number`);
    return { success: true, user };
  }
}

export default new AuthProfileService();

