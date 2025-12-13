import { Op } from 'sequelize';
import { User } from '../../models/User';
import { Registration, RegistrationStatus } from '../../models/Registration';
import { generateToken } from '../../utils/crypto';
import { logger } from '../../utils/logger';
import emailService from '../email.service';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  composante?: string;
  specialty?: string;
}

type RegisterResult =
  | { success: true; user: User }
  | { success: false; error: string };

type VerifyResult =
  | { success: true }
  | { success: false; error: string };

class AuthRegistrationService {
  async register(input: RegisterInput): Promise<RegisterResult> {
    const { email, password, firstName, lastName, username, phoneNumber, composante, specialty } = input;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !username || !phoneNumber) {
      return { success: false, error: 'Veuillez remplir tous les champs obligatoires (incluant le numéro de téléphone)' };
    }

    // Check if user already exists (case-insensitive email)
    const existingUser = await User.findOne({
      where: { email: { [Op.iLike]: email } }
    });
    if (existingUser) {
      return { success: false, error: 'Un compte avec cet email existe déjà.' };
    }

    // Check if username already exists (case-insensitive)
    const existingUsername = await User.findOne({
      where: { username: { [Op.iLike]: username } }
    });
    if (existingUsername) {
      return { success: false, error: 'Ce nom d\'utilisateur est déjà pris.' };
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({
      where: { phoneNumber }
    });
    if (existingPhone) {
      return { success: false, error: 'Ce numéro de téléphone est déjà utilisé.' };
    }

    // Generate verification token
    const verificationToken = generateToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      username,
      phoneNumber,
      composante,
      specialty,
      verificationToken,
      verificationTokenExpiry,
      emailVerified: false,
      isAdmin: false,
    });

    // Create registration record
    await Registration.create({
      userId: user.id,
      status: RegistrationStatus.PENDING,
    });

    // Send verification email in background
    emailService.sendVerificationEmail(email, verificationToken, firstName).catch(() => {
      logger.warn(`Failed to send verification email to ${email}. User can still verify manually.`);
    });

    logger.info(`New user registered: ${email}`);
    return { success: true, user };
  }

  async verifyEmail(token: string): Promise<VerifyResult> {
    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) {
      return { success: false, error: 'Token invalide ou expiré.' };
    }

    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      return { success: false, error: 'Token expiré. Demandez un nouveau lien de vérification.' };
    }

    // Update user
    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    // Update registration status
    await Registration.update(
      { status: RegistrationStatus.VERIFIED, verifiedAt: new Date() },
      { where: { userId: user.id } }
    );

    // Send account confirmed email in background
    emailService.sendAccountConfirmedEmail(user.email, user.firstName).catch(() => {
      logger.warn(`Failed to send account confirmed email to ${user.email}.`);
    });

    logger.info(`Email verified for user: ${user.email}`);
    return { success: true };
  }

  async resendVerification(email: string): Promise<VerifyResult> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé.' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email déjà vérifié.' };
    }

    // Generate new token
    const verificationToken = generateToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send email
    await emailService.sendVerificationEmail(email, verificationToken, user.firstName);

    return { success: true };
  }
}

export default new AuthRegistrationService();

