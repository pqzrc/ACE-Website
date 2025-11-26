import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { config } from '../config/env';

export const createAdminUser = async (): Promise<void> => {
  try {
    const existingAdmin = await User.findOne({ where: { email: config.adminEmail } });

    // Utiliser le hash depuis l'env si disponible, sinon générer un nouveau
    const hashedPassword = process.env.ADMIN_HASH || await bcrypt.hash(config.adminPassword!, 10);

    if (!existingAdmin) {
      await User.create({
        email: config.adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'ACE',
        composante: 'Administration',
        specialty: 'N/A',
        isAdmin: true,
        emailVerified: true,
      }, { hooks: false });

      console.log('✅ Admin user created');
    } else {
      // Mettre à jour le mot de passe seulement si ADMIN_HASH a changé
      if (process.env.ADMIN_HASH && existingAdmin.password !== process.env.ADMIN_HASH) {
        existingAdmin.password = hashedPassword;
        await existingAdmin.save({ hooks: false });
        console.log('✅ Admin password hash updated from env');
      } else {
        console.log('Admin user already exists');
      }
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

