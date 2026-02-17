import { verifyToken } from '../utils/jwt.js';

/**
 * Authentication middleware
 */
export function authenticate(secret) {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token, secret);

    if (!decoded) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // Attach user info to context
    c.set('user', decoded);
    await next();
  };
}

/**
 * Check if user is technician
 */
export function requireTechnician() {
  return async (c, next) => {
    const user = c.get('user');

    if (!user || user.type !== 'technician') {
      return c.json({ error: 'Technician access required' }, 403);
    }

    await next();
  };
}

/**
 * Check if user is regular user
 */
export function requireUser() {
  return async (c, next) => {
    const user = c.get('user');

    if (!user || user.type !== 'user') {
      return c.json({ error: 'User access required' }, 403);
    }

    await next();
  };
}
