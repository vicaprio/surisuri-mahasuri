import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 */
export function generateToken(payload, secret) {
  return jwt.sign(payload, secret, {
    expiresIn: '7d'
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

/**
 * Decode JWT token without verification
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}
