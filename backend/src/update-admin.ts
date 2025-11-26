
import { User } from './models/User';
import { connectDatabase } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const updateAdminProfile = async () => {
    try {
        await connectDatabase();

        const adminEmail = 'admin@ace-escapegame.com';
        const user = await User.findOne({ where: { email: adminEmail } });

        if (user) {
            user.username = 'AdminACE';
            user.composante = 'ACE Staff';
            await user.save();
            console.log(`✅ Admin profile updated: username=${user.username}, composante=${user.composante}`);
        } else {
            console.log('⚠️ Admin user not found, creating it...');
            // const hashedPassword = await User.hashPassword('Admin123Pass'); // Hook handles hashing
            const newAdmin = await User.create({
                email: adminEmail,
                password: 'Admin123Pass',
                firstName: 'Admin',
                lastName: 'ACE',
                username: 'AdminACE',
                composante: 'ACE Staff',
                isAdmin: true,
                emailVerified: true
            });
            console.log(`✅ Admin user created: ${newAdmin.email}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error updating admin profile:', error);
        process.exit(1);
    }
};

updateAdminProfile();
