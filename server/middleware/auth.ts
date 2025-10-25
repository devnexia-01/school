import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable must be set');
}

const JWT_SECRET = process.env.SESSION_SECRET;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId: string | null;
  };
  tenantId?: string | null;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const sessionToken = req.cookies?.auth_token;
    if (!sessionToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
      const payload = jwt.verify(sessionToken, JWT_SECRET) as any;
      req.user = payload;
      req.tenantId = payload.tenantId;
      return next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload;
    req.tenantId = payload.tenantId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export function tenantIsolation(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Super admin must specify tenantId via query/body parameter
  if (req.user.role === 'super_admin') {
    const tenantId = req.query.tenantId as string || req.body.tenantId as string;
    if (!tenantId) {
      // For super admin viewing their dashboard, use their own tenantId if they have one
      if (req.user.tenantId) {
        req.tenantId = req.user.tenantId;
        return next();
      }
      return res.status(400).json({ error: 'Super admin must specify tenantId parameter' });
    }
    req.tenantId = tenantId;
    return next();
  }

  // All other users must have a tenantId
  if (!req.user.tenantId) {
    return res.status(403).json({ error: 'No tenant access' });
  }

  req.tenantId = req.user.tenantId;
  next();
}

export function generateToken(user: { id: string; email: string; role: string; tenantId: string | null }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}
