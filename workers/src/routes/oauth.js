import { Hono } from 'hono';
import { generateUUID, queryOne, execute, getCurrentTimestamp } from '../utils/db.js';
import { generateToken } from '../utils/jwt.js';

const oauth = new Hono();

/**
 * POST /api/oauth/kakao
 * Kakao OAuth login
 */
oauth.post('/kakao', async (c) => {
  try {
    const { code, accountType = 'user' } = await c.req.json();

    if (!code) {
      return c.json({ error: 'Missing authorization code' }, 400);
    }

    const db = c.env.DB;
    const jwtSecret = c.env.JWT_SECRET;
    const kakaoClientId = c.env.KAKAO_CLIENT_ID;
    const kakaoClientSecret = c.env.KAKAO_CLIENT_SECRET;

    // Exchange code for access token
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: kakaoClientId,
        client_secret: kakaoClientSecret,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Kakao
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const kakaoUser = await userResponse.json();
    const providerId = String(kakaoUser.id);
    const email = kakaoUser.kakao_account?.email || `kakao_${providerId}@kakao.local`;
    const name = kakaoUser.kakao_account?.profile?.nickname || '카카오 사용자';
    const profilePhoto = kakaoUser.kakao_account?.profile?.profile_image_url || null;

    const isTechnician = accountType === 'technician';
    const tableName = isTechnician ? 'technicians' : 'users';

    // Find or create user
    let user = await queryOne(
      db,
      `SELECT * FROM ${tableName} WHERE provider = ? AND provider_id = ?`,
      ['kakao', providerId]
    );

    if (!user) {
      // Check if email already exists
      const existingUser = await queryOne(
        db,
        `SELECT id FROM ${tableName} WHERE email = ?`,
        [email]
      );

      let finalEmail = email;
      if (existingUser) {
        finalEmail = `kakao_${providerId}_${Date.now()}@kakao.local`;
      }

      const userId = generateUUID();
      const timestamp = getCurrentTimestamp();

      if (isTechnician) {
        await execute(
          db,
          `INSERT INTO technicians (id, email, name, phone, provider, provider_id, profile_photo, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, finalEmail, name, '', 'kakao', providerId, profilePhoto, 'OFFLINE', timestamp, timestamp]
        );
      } else {
        await execute(
          db,
          `INSERT INTO users (id, email, name, phone, provider, provider_id, profile_photo, user_type, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, finalEmail, name, '', 'kakao', providerId, profilePhoto, 'GENERAL', 'ACTIVE', timestamp, timestamp]
        );
      }

      user = await queryOne(
        db,
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [userId]
      );
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
      message: 'Kakao login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone || '',
          userType: isTechnician ? 'technician' : user.user_type,
          role: isTechnician ? 'technician' : 'user',
          profilePhoto: user.profile_photo,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Kakao OAuth error:', error);
    return c.json({ error: 'Kakao login failed', details: error.message }, 500);
  }
});

/**
 * POST /api/oauth/naver
 * Naver OAuth login
 */
oauth.post('/naver', async (c) => {
  try {
    const { code, state, accountType = 'user' } = await c.req.json();

    if (!code) {
      return c.json({ error: 'Missing authorization code' }, 400);
    }

    const db = c.env.DB;
    const jwtSecret = c.env.JWT_SECRET;
    const naverClientId = c.env.NAVER_CLIENT_ID;
    const naverClientSecret = c.env.NAVER_CLIENT_SECRET;

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${naverClientId}&client_secret=${naverClientSecret}&code=${code}&state=${state}`
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Naver
    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();
    const naverUser = userData.response;
    const providerId = naverUser.id;
    const email = naverUser.email || `naver_${providerId}@naver.local`;
    const name = naverUser.name || naverUser.nickname || '네이버 사용자';
    const phone = naverUser.mobile?.replace(/-/g, '') || '';
    const profilePhoto = naverUser.profile_image || null;

    const isTechnician = accountType === 'technician';
    const tableName = isTechnician ? 'technicians' : 'users';

    // Find or create user
    let user = await queryOne(
      db,
      `SELECT * FROM ${tableName} WHERE provider = ? AND provider_id = ?`,
      ['naver', providerId]
    );

    if (!user) {
      const existingUser = await queryOne(
        db,
        `SELECT id FROM ${tableName} WHERE email = ?`,
        [email]
      );

      let finalEmail = email;
      if (existingUser) {
        finalEmail = `naver_${providerId}_${Date.now()}@naver.local`;
      }

      const userId = generateUUID();
      const timestamp = getCurrentTimestamp();

      if (isTechnician) {
        await execute(
          db,
          `INSERT INTO technicians (id, email, name, phone, provider, provider_id, profile_photo, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, finalEmail, name, phone, 'naver', providerId, profilePhoto, 'OFFLINE', timestamp, timestamp]
        );
      } else {
        await execute(
          db,
          `INSERT INTO users (id, email, name, phone, provider, provider_id, profile_photo, user_type, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, finalEmail, name, phone, 'naver', providerId, profilePhoto, 'GENERAL', 'ACTIVE', timestamp, timestamp]
        );
      }

      user = await queryOne(
        db,
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [userId]
      );
    }

    const token = generateToken(
      {
        id: user.id,
        type: isTechnician ? 'technician' : 'user',
        userType: isTechnician ? 'technician' : user.user_type,
      },
      jwtSecret
    );

    return c.json({
      message: 'Naver login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone || '',
          userType: isTechnician ? 'technician' : user.user_type,
          role: isTechnician ? 'technician' : 'user',
          profilePhoto: user.profile_photo,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Naver OAuth error:', error);
    return c.json({ error: 'Naver login failed', details: error.message }, 500);
  }
});

/**
 * POST /api/oauth/google
 * Google OAuth login
 */
oauth.post('/google', async (c) => {
  try {
    const { code, accountType = 'user' } = await c.req.json();

    if (!code) {
      return c.json({ error: 'Missing authorization code' }, 400);
    }

    const db = c.env.DB;
    const jwtSecret = c.env.JWT_SECRET;
    const googleClientId = c.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = c.env.GOOGLE_CLIENT_SECRET;

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const googleUser = await userResponse.json();
    const providerId = googleUser.id;
    const email = googleUser.email;
    const name = googleUser.name || '구글 사용자';
    const profilePhoto = googleUser.picture || null;

    const isTechnician = accountType === 'technician';
    const tableName = isTechnician ? 'technicians' : 'users';

    // Find or create user
    let user = await queryOne(
      db,
      `SELECT * FROM ${tableName} WHERE provider = ? AND provider_id = ?`,
      ['google', providerId]
    );

    if (!user) {
      const existingUser = await queryOne(
        db,
        `SELECT id FROM ${tableName} WHERE email = ?`,
        [email]
      );

      let finalEmail = email;
      if (existingUser) {
        finalEmail = `google_${providerId}_${Date.now()}@gmail.local`;
      }

      const userId = generateUUID();
      const timestamp = getCurrentTimestamp();

      if (isTechnician) {
        await execute(
          db,
          `INSERT INTO technicians (id, email, name, phone, provider, provider_id, profile_photo, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, finalEmail, name, '', 'google', providerId, profilePhoto, 'OFFLINE', timestamp, timestamp]
        );
      } else {
        await execute(
          db,
          `INSERT INTO users (id, email, name, phone, provider, provider_id, profile_photo, user_type, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, finalEmail, name, '', 'google', providerId, profilePhoto, 'GENERAL', 'ACTIVE', timestamp, timestamp]
        );
      }

      user = await queryOne(
        db,
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [userId]
      );
    }

    const token = generateToken(
      {
        id: user.id,
        type: isTechnician ? 'technician' : 'user',
        userType: isTechnician ? 'technician' : user.user_type,
      },
      jwtSecret
    );

    return c.json({
      message: 'Google login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone || '',
          userType: isTechnician ? 'technician' : user.user_type,
          role: isTechnician ? 'technician' : 'user',
          profilePhoto: user.profile_photo,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return c.json({ error: 'Google login failed', details: error.message }, 500);
  }
});

export default oauth;
