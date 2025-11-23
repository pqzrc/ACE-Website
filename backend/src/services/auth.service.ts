import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/User';
import { UserPayload } from '../types';

class AuthService {
  /**
   * Generate JWT token for user
   */
  generateToken(user: User): string {
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      affiliation: user.affiliation,
      teamId: user.teamId,
      isAdmin: user.isAdmin,
    };

    // @ts-ignore - Type issue avec jsonwebtoken en mode strict
    return jwt.sign(payload, config.jwtSecret!, {
      expiresIn: config.jwtExpiresIn,
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): UserPayload {
    try {
      const decoded = jwt.verify(token, config.jwtSecret!) as UserPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(user: User): string {
    const payload = {
      id: user.id,
      type: 'refresh',
    };

    // @ts-ignore - Type issue avec jsonwebtoken en mode strict
    return jwt.sign(payload, config.jwtSecret!, {
      expiresIn: '30d',
    });
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7);
  }
}

export default new AuthService();

