import { Hono } from 'hono';
import { generateUUID, queryOne, execute, getCurrentTimestamp } from '../utils/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';

const auth = new Hono();

/**
 * POST /api/auth/register
 * Register a new user
 */
auth.post('/register', async (c) => {
  try {
    const { email, password, name, phone, userType = 'GENERAL' } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const db = c.env.DB;
    const jwtSecret = c.env.JWT_SECRET;

    // Check if user already exists
    const existingUser = await queryOne(
      db,
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = generateUUID();
    const timestamp = getCurrentTimestamp();

    await execute(
      db,
      `INSERT INTO users (id, email, password, name, phone, user_type, status, provider, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, email, hashedPassword, name, phone || '', userType, 'ACTIVE', 'local', timestamp, timestamp]
    );

    // Generate token
    const token = generateToken(
      {
        id: userId,
        type: 'user',
        userType: userType,
      },
      jwtSecret
    );

    return c.json({
      message: 'User registered successfully',
      data: {
        user: {
          id: userId,
          email,
          name,
          phone: phone || '',
          userType,
        },
        token,
      },
    }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
auth.post('/login', async (c) => {
  try {
    const { email, password, isTechnician = false } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    const db = c.env.DB;
    const jwtSecret = c.env.JWT_SECRET;

    let user;
    if (isTechnician) {
      user = await queryOne(
        db,
        'SELECT * FROM technicians WHERE email = ?',
        [email]
      );
    } else {
      user = await queryOne(
        db,
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
    }

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Generate token
    const token = generateToken(
      {
        id: user.id,
        type: isTechnician ? 'technician' : 'user',
        userType: isTechnician ? 'technician' : user.user_type,
      },
      jwtSecret
    );

    return c.json({
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          userType: isTechnician ? 'technician' : user.user_type,
          profilePhoto: user.profile_photo,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
auth.get('/me', authenticate(process.env.JWT_SECRET), async (c) => {
  const user = c.get('user');
  return c.json({ data: user });
});

export default auth;
