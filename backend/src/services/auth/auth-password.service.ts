import { Op } from 'sequelize';
import { User } from '../../models/User';
import { generateToken } from '../../utils/crypto';
import { logger } from '../../utils/logger';
import emailService from '../email.service';

type PasswordResult =
  | { success: true }
  | { success: false; error: string };

class AuthPasswordService {
  async requestReset(email: string): Promise<PasswordResult> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // For security, don't reveal if user exists
      return { success: true };
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send email
    await emailService.sendPasswordResetEmail(email, resetToken, user.firstName);
    logger.info(`Password reset requested for: ${email}`);

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string): Promise<PasswordResult> {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return { success: false, error: 'Le lien de réinitialisation est invalide ou a expiré.' };
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    logger.info(`Password reset completed for: ${user.email}`);
    return { success: true };
  }
}

export default new AuthPasswordService();

