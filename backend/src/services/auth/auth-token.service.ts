import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { User } from '../../models/User';
import { UserPayload } from '../../types';

class AuthTokenService {
  generateToken(user: User): string {
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      composante: user.composante,
      teamId: user.teamId,
      isAdmin: user.isAdmin,
    };

    // @ts-ignore - Type issue avec jsonwebtoken en mode strict
    return jwt.sign(payload, config.jwtSecret!, {
      expiresIn: config.jwtExpiresIn,
    });
  }

  verifyToken(token: string): UserPayload {
    try {
      const decoded = jwt.verify(token, config.jwtSecret!) as UserPayload;
      return decoded;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  generateRefreshToken(user: User): string {
    const payload = { id: user.id, type: 'refresh' };

    // @ts-ignore - Type issue avec jsonwebtoken en mode strict
    return jwt.sign(payload, config.jwtSecret!, { expiresIn: '30d' });
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

export default new AuthTokenService();

