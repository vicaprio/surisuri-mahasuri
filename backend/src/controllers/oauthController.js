const axios = require('axios');
const prisma = require('../utils/prisma');
const { generateToken } = require('../utils/jwt');

// Kakao OAuth
exports.kakaoAuth = async (req, res) => {
  try {
    const { code, accountType = 'user' } = req.body;

    console.log('Kakao OAuth request received');
    console.log('Code:', code ? `${code.substring(0, 20)}...` : 'missing');
    console.log('Redirect URI:', process.env.KAKAO_REDIRECT_URI);

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_CLIENT_ID,
          client_secret: process.env.KAKAO_CLIENT_SECRET,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('Kakao token exchange successful');

    const { access_token } = tokenResponse.data;

    // Get user info from Kakao
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const kakaoUser = userResponse.data;
    const providerId = String(kakaoUser.id);
    const email = kakaoUser.kakao_account?.email || `kakao_${providerId}@kakao.local`;
    const name = kakaoUser.kakao_account?.profile?.nickname || '카카오 사용자';
    const profilePhoto = kakaoUser.kakao_account?.profile?.profile_image_url || null;

    console.log('Account type:', accountType);

    let user;
    let isTechnician = accountType === 'technician';

    if (isTechnician) {
      // Handle technician account
      console.log('Looking for technician with provider: kakao, providerId:', providerId);

      user = await prisma.technician.findFirst({
        where: {
          provider: 'kakao',
          providerId,
        },
      });

      console.log('Found existing technician:', user ? { id: user.id, email: user.email } : 'null');

      if (user && !user.id) {
        console.log('Found corrupted technician record (null id), will create new one');
        user = null;
      }

      if (!user) {
        // Check if email already exists
        const existingTech = await prisma.technician.findUnique({
          where: { email },
        });

        if (existingTech && existingTech.provider !== 'kakao') {
          console.log('Email already exists with different provider:', existingTech.provider);
          return res.status(400).json({
            error: '이미 다른 방법으로 가입된 이메일입니다.',
          });
        }

        let finalEmail = email;
        if (existingTech) {
          finalEmail = `kakao_${providerId}_${Date.now()}@kakao.local`;
          console.log('Using alternate email due to existing record:', finalEmail);
        }

        console.log('Creating new technician with email:', finalEmail);

        user = await prisma.technician.create({
          data: {
            email: finalEmail,
            name,
            phone: '',
            provider: 'kakao',
            providerId,
            profilePhoto,
            status: 'OFFLINE',
          },
        });

        console.log('Technician created:', { id: user.id, email: user.email });
      }
    } else {
      // Handle regular user account
      console.log('Looking for user with provider: kakao, providerId:', providerId);

      user = await prisma.user.findFirst({
        where: {
          provider: 'kakao',
          providerId,
        },
      });

      console.log('Found existing user:', user ? { id: user.id, email: user.email } : 'null');

      if (user && !user.id) {
        console.log('Found corrupted user record (null id), will create new one');
        user = null;
      }

      if (!user) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser && existingUser.provider !== 'kakao') {
          console.log('Email already exists with different provider:', existingUser.provider);
          return res.status(400).json({
            error: '이미 다른 방법으로 가입된 이메일입니다.',
          });
        }

        let finalEmail = email;
        if (existingUser) {
          finalEmail = `kakao_${providerId}_${Date.now()}@kakao.local`;
          console.log('Using alternate email due to existing record:', finalEmail);
        }

        console.log('Creating new user with email:', finalEmail);

        user = await prisma.user.create({
          data: {
            email: finalEmail,
            name,
            phone: '',
            provider: 'kakao',
            providerId,
            profilePhoto,
            userType: 'GENERAL',
            status: 'ACTIVE',
          },
        });

        console.log('User created:', { id: user.id, email: user.email });
      }
    }

    console.log('Final account:', { id: user.id, email: user.email, provider: user.provider, type: isTechnician ? 'technician' : 'user' });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      type: isTechnician ? 'technician' : 'user',
      userType: user.userType || 'technician',
    });

    const responseData = {
      message: 'Kakao login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          userType: isTechnician ? 'technician' : user.userType,
          role: isTechnician ? 'technician' : 'user',
          profilePhoto: user.profilePhoto,
        },
        token,
      },
    };

    console.log('Sending Kakao OAuth response:', JSON.stringify(responseData, null, 2));

    res.json(responseData);
  } catch (error) {
    console.error('Kakao OAuth error:', error.response?.data || error);

    // Return appropriate error status
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error_description ||
                        error.response?.data?.error ||
                        'Kakao 로그인에 실패했습니다.';

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.response?.data
    });
  }
};

// Naver OAuth
exports.naverAuth = async (req, res) => {
  try {
    const { code, state, accountType = 'user' } = req.body;

    console.log('Naver OAuth request received');
    console.log('Code:', code ? `${code.substring(0, 20)}...` : 'missing');
    console.log('State:', state);

    // Exchange code for access token
    const tokenResponse = await axios.get(
      'https://nid.naver.com/oauth2.0/token',
      {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.NAVER_CLIENT_ID,
          client_secret: process.env.NAVER_CLIENT_SECRET,
          code,
          state,
        },
      }
    );

    console.log('Naver token exchange successful');

    const { access_token } = tokenResponse.data;

    // Get user info from Naver
    const userResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const naverUser = userResponse.data.response;
    const providerId = naverUser.id;
    const email = naverUser.email || `naver_${providerId}@naver.local`;
    const name = naverUser.name || naverUser.nickname || '네이버 사용자';
    const phone = naverUser.mobile?.replace(/-/g, '') || '';
    const profilePhoto = naverUser.profile_image || null;

    console.log('Account type:', accountType);

    let user;
    let isTechnician = accountType === 'technician';

    if (isTechnician) {
      console.log('Looking for technician with provider: naver, providerId:', providerId);

      user = await prisma.technician.findFirst({
        where: {
          provider: 'naver',
          providerId,
        },
      });

      console.log('Found existing technician:', user ? { id: user.id, email: user.email } : 'null');

      if (user && !user.id) {
        console.log('Found corrupted technician record (null id), will create new one');
        user = null;
      }

      if (!user) {
        const existingTech = await prisma.technician.findUnique({
          where: { email },
        });

        if (existingTech && existingTech.provider !== 'naver') {
          console.log('Email already exists with different provider:', existingTech.provider);
          return res.status(400).json({
            error: '이미 다른 방법으로 가입된 이메일입니다.',
          });
        }

        let finalEmail = email;
        if (existingTech) {
          finalEmail = `naver_${providerId}_${Date.now()}@naver.local`;
          console.log('Using alternate email due to existing record:', finalEmail);
        }

        console.log('Creating new technician with email:', finalEmail);

        user = await prisma.technician.create({
          data: {
            email: finalEmail,
            name,
            phone,
            provider: 'naver',
            providerId,
            profilePhoto,
            status: 'OFFLINE',
          },
        });

        console.log('Technician created:', { id: user.id, email: user.email });
      }
    } else {
      console.log('Looking for user with provider: naver, providerId:', providerId);

      user = await prisma.user.findFirst({
        where: {
          provider: 'naver',
          providerId,
        },
      });

      console.log('Found existing user:', user ? { id: user.id, email: user.email } : 'null');

      if (user && !user.id) {
        console.log('Found corrupted user record (null id), will create new one');
        user = null;
      }

      if (!user) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser && existingUser.provider !== 'naver') {
          console.log('Email already exists with different provider:', existingUser.provider);
          return res.status(400).json({
            error: '이미 다른 방법으로 가입된 이메일입니다.',
          });
        }

        let finalEmail = email;
        if (existingUser) {
          finalEmail = `naver_${providerId}_${Date.now()}@naver.local`;
          console.log('Using alternate email due to existing record:', finalEmail);
        }

        console.log('Creating new user with email:', finalEmail);

        user = await prisma.user.create({
          data: {
            email: finalEmail,
            name,
            phone,
            provider: 'naver',
            providerId,
            profilePhoto,
            userType: 'GENERAL',
            status: 'ACTIVE',
          },
        });

        console.log('User created:', { id: user.id, email: user.email });
      }
    }

    console.log('Final account:', { id: user.id, email: user.email, provider: user.provider, type: isTechnician ? 'technician' : 'user' });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      type: isTechnician ? 'technician' : 'user',
      userType: user.userType || 'technician',
    });

    const responseData = {
      message: 'Naver login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          userType: isTechnician ? 'technician' : user.userType,
          role: isTechnician ? 'technician' : 'user',
          profilePhoto: user.profilePhoto,
        },
        token,
      },
    };

    console.log('Sending Naver OAuth response:', JSON.stringify(responseData, null, 2));

    res.json(responseData);
  } catch (error) {
    console.error('Naver OAuth error:', error.response?.data || error);

    // Return appropriate error status
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error_description ||
                        error.response?.data?.error ||
                        '네이버 로그인에 실패했습니다.';

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.response?.data
    });
  }
};

// Google OAuth
exports.googleAuth = async (req, res) => {
  try {
    const { code, accountType = 'user' } = req.body;

    console.log('Google OAuth request received');
    console.log('Code:', code ? `${code.substring(0, 20)}...` : 'missing');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}... (length: ${process.env.GOOGLE_CLIENT_ID.length})` : 'MISSING');
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? `set (length: ${process.env.GOOGLE_CLIENT_SECRET.length})` : 'MISSING');
    console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI || 'MISSING');

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }
    );

    console.log('Google token exchange successful');

    const { access_token } = tokenResponse.data;

    // Get user info from Google
    const userResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const googleUser = userResponse.data;
    const providerId = googleUser.id;
    const email = googleUser.email;
    const name = googleUser.name || '구글 사용자';
    const profilePhoto = googleUser.picture || null;

    console.log('Account type:', accountType);

    let user;
    let isTechnician = accountType === 'technician';

    if (isTechnician) {
      console.log('Looking for technician with provider: google, providerId:', providerId);

      user = await prisma.technician.findFirst({
        where: {
          provider: 'google',
          providerId,
        },
      });

      console.log('Found existing technician:', user ? { id: user.id, email: user.email } : 'null');

      if (user && !user.id) {
        console.log('Found corrupted technician record (null id), will create new one');
        user = null;
      }

      if (!user) {
        const existingTech = await prisma.technician.findUnique({
          where: { email },
        });

        if (existingTech && existingTech.provider !== 'google') {
          console.log('Email already exists with different provider:', existingTech.provider);
          return res.status(400).json({
            error: '이미 다른 방법으로 가입된 이메일입니다.',
          });
        }

        let finalEmail = email;
        if (existingTech) {
          finalEmail = `google_${providerId}_${Date.now()}@gmail.local`;
          console.log('Using alternate email due to existing record:', finalEmail);
        }

        console.log('Creating new technician with email:', finalEmail);

        user = await prisma.technician.create({
          data: {
            email: finalEmail,
            name,
            phone: '',
            provider: 'google',
            providerId,
            profilePhoto,
            status: 'OFFLINE',
          },
        });

        console.log('Technician created:', { id: user.id, email: user.email });
      }
    } else {
      console.log('Looking for user with provider: google, providerId:', providerId);

      user = await prisma.user.findFirst({
        where: {
          provider: 'google',
          providerId,
        },
      });

      console.log('Found existing user:', user ? { id: user.id, email: user.email } : 'null');

      if (user && !user.id) {
        console.log('Found corrupted user record (null id), will create new one');
        user = null;
      }

      if (!user) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser && existingUser.provider !== 'google') {
          console.log('Email already exists with different provider:', existingUser.provider);
          return res.status(400).json({
            error: '이미 다른 방법으로 가입된 이메일입니다.',
          });
        }

        let finalEmail = email;
        if (existingUser) {
          finalEmail = `google_${providerId}_${Date.now()}@gmail.local`;
          console.log('Using alternate email due to existing record:', finalEmail);
        }

        console.log('Creating new user with email:', finalEmail);

        user = await prisma.user.create({
          data: {
            email: finalEmail,
            name,
            phone: '',
            provider: 'google',
            providerId,
            profilePhoto,
            userType: 'GENERAL',
            status: 'ACTIVE',
          },
        });

        console.log('User created:', { id: user.id, email: user.email });
      }
    }

    console.log('Final account:', { id: user.id, email: user.email, provider: user.provider, type: isTechnician ? 'technician' : 'user' });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      type: isTechnician ? 'technician' : 'user',
      userType: user.userType || 'technician',
    });

    const responseData = {
      message: 'Google login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          userType: isTechnician ? 'technician' : user.userType,
          role: isTechnician ? 'technician' : 'user',
          profilePhoto: user.profilePhoto,
        },
        token,
      },
    };

    console.log('Sending Google OAuth response:', JSON.stringify(responseData, null, 2));

    res.json(responseData);
  } catch (error) {
    console.error('Google OAuth error:', error.response?.data || error);

    // Return appropriate error status
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error_description ||
                        error.response?.data?.error ||
                        '구글 로그인에 실패했습니다.';

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.response?.data
    });
  }
};
