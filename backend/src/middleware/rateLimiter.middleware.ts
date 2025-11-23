import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

/**
 * Whitelist of hostnames/services that should bypass rate limiting
 */
/**
 * Check if a request should skip rate limiting
 */
const skipWhitelisted = (req: Request): boolean => {
  // IMPORTANT: Only trust Docker internal IPs when running in Docker environment
  // In production with reverse proxy (Nginx), req.ip will be the real client IP
  // NOT the Docker internal IP, so this is safe

  const clientIp = req.ip ||
    req.socket.remoteAddress ||
    '';

  // Only check Docker internal IPs if we're actually in a Docker environment
  // This prevents attackers from spoofing X-Forwarded-For headers in production
  const isDockerEnvironment = process.env.DOCKER_ENV === 'true' || process.env.NODE_ENV === 'development';

  if (isDockerEnvironment) {
    // Docker bridge networks typically use 172.x.x.x or 10.x.x.x ranges
    const isDockerInternal =
      clientIp.startsWith('172.') ||
      clientIp.startsWith('10.') ||
      clientIp.includes('::ffff:172.') || // IPv6-mapped IPv4
      clientIp.includes('::ffff:10.');

    if (isDockerInternal) {
      return true;
    }
  }

  return false;
};

/**
 * Rate limiter for auth routes
 * Uses email-based limiting instead of IP for event scenarios
 * where many users share the same IP (campus WiFi)
 */
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 100 requests per IP per window (very high for shared WiFi)

  // Key generator: use email if available, fallback to IP
  keyGenerator: (req: Request): string => {
    // Pour login/register, utiliser l'email comme clé
    const email = req.body?.email;
    if (email) {
      return `email:${email.toLowerCase()}`;
    }

    // Fallback: IP address
    return req.ip ||
      req.socket.remoteAddress ||
      (req.get('x-forwarded-for')?.split(',')[0]?.trim()) ||
      'unknown';
  },

  message: {
    success: false,
    message: 'Trop de tentatives avec cet email. Réessayez dans 10 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipWhitelisted,
});

/**
 * Strict rate limiter for login attempts (per email)
 * Prevents brute force attacks on specific accounts
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per email per window

  keyGenerator: (req: Request): string => {
    const email = req.body?.email;
    return email ? `login:${email.toLowerCase()}` : `login-ip:${req.ip || 'unknown'}`;
  },

  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipWhitelisted,
});

/**
 * General API rate limiter
 * Very permissive for event scenarios with shared WiFi
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per IP per window (for shared campus WiFi)
  message: {
    success: false,
    message: 'Trop de requêtes. Réessayez plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipWhitelisted,
});

