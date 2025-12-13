// Re-export from new modular services for backward compatibility
import { authTokenService } from './auth';

class AuthService {
  generateToken = authTokenService.generateToken.bind(authTokenService);
  verifyToken = authTokenService.verifyToken.bind(authTokenService);
  generateRefreshToken = authTokenService.generateRefreshToken.bind(authTokenService);
  extractTokenFromHeader = authTokenService.extractTokenFromHeader.bind(authTokenService);
}

export default new AuthService();
