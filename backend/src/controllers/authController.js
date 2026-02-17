const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { generateToken } = require('../utils/jwt');

// 사용자 회원가입
exports.registerUser = async (req, res) => {
  try {
    const { email, password, name, phone, userType, companyId } = req.body;

    // 이메일 중복 확인
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        userType: userType || 'GENERAL',
        companyId: companyId || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        userType: true,
        status: true,
      },
    });

    // JWT 토큰 생성
    const token = generateToken({
      id: user.id,
      type: 'user',
      userType: user.userType,
    });

    res.status(201).json({
      message: 'User registered successfully',
      data: { user, token },
    });
  } catch (error) {
    console.error('Register user error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// 사용자 로그인
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // OAuth 사용자 체크
    if (user.provider && user.provider !== 'local') {
      return res.status(400).json({
        error: `소셜 로그인(${user.provider})으로 가입된 계정입니다.`
      });
    }

    // 비밀번호 확인
    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 활성 계정 확인
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // JWT 토큰 생성
    const token = generateToken({
      id: user.id,
      type: 'user',
      userType: user.userType,
    });

    res.json({
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          userType: user.userType,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login user error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// 기사님 회원가입
exports.registerTechnician = async (req, res) => {
  try {
    const { email, password, name, phone, bio, serviceArea } = req.body;

    // 이메일 중복 확인
    const existing = await prisma.technician.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 기사님 생성
    const technician = await prisma.technician.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        bio,
        serviceArea,
        status: 'OFFLINE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        rating: true,
      },
    });

    // JWT 토큰 생성
    const token = generateToken({
      id: technician.id,
      type: 'technician',
    });

    res.status(201).json({
      message: 'Technician registered successfully',
      data: { technician, token },
    });
  } catch (error) {
    console.error('Register technician error:', error);
    res.status(500).json({ error: 'Failed to register technician' });
  }
};

// 기사님 로그인
exports.loginTechnician = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 기사님 찾기
    const technician = await prisma.technician.findUnique({
      where: { email },
    });

    if (!technician) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // OAuth 사용자 체크
    if (technician.provider && technician.provider !== 'local') {
      return res.status(400).json({
        error: `소셜 로그인(${technician.provider})으로 가입된 계정입니다.`
      });
    }

    // 비밀번호 확인
    if (!technician.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, technician.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // JWT 토큰 생성
    const token = generateToken({
      id: technician.id,
      type: 'technician',
    });

    res.json({
      message: 'Login successful',
      data: {
        technician: {
          id: technician.id,
          email: technician.email,
          name: technician.name,
          phone: technician.phone,
          status: technician.status,
          rating: technician.rating,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login technician error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};
