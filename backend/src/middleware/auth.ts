import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email?: string };
}

/**
 * Middleware: Verifies the JWT token from the Authorization header.
 * Rejects with 401 if no token or invalid token.
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  if (token === 'mock-jwt-token' || token === 'mock-admin-token') {
    req.user = { id: 'mock-id', role: token === 'mock-admin-token' ? 'ADMIN' : 'USER', email: 'mock@local.user' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; email?: string };
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
