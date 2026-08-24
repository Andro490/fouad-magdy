import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const ALLOW_MOCK_TOKENS = process.env.ALLOW_MOCK_TOKENS === 'true' && process.env.NODE_ENV !== 'production';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email?: string };
}

const getJwtSecret = () => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return JWT_SECRET;
};

/**
 * Middleware: Verifies the JWT token from the Authorization header.
 * Rejects with 401 if no token or invalid token.
 */
const getTokenFromRequest = (req: Request) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookiesHeader = req.headers.cookie;
  if (!cookiesHeader) return null;

  const cookieMap = new Map<string, string>();
  cookiesHeader.split(';').forEach((cookie) => {
    const [key, ...valueParts] = cookie.trim().split('=');
    if (key && valueParts.length) {
      cookieMap.set(key, decodeURIComponent(valueParts.join('=')));
    }
  });

  return cookieMap.get('auth_token') || null;
};

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  if (ALLOW_MOCK_TOKENS && (token === 'mock-jwt-token' || token === 'mock-admin-token')) {
    req.user = { id: 'mock-id', role: token === 'mock-admin-token' ? 'ADMIN' : 'USER', email: 'mock@local.user' };
    return next();
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { id: string; role: string; email?: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * Middleware: Only allows ADMIN role through.
 * Must be used AFTER authenticateToken.
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden. Admins only.' });
  }
  next();
};
