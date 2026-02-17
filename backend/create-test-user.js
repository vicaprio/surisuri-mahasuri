const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('test1234', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: '테스트 사용자',
        phone: '01012345678',
        password: hashedPassword,
        provider: 'local',
        userType: 'GENERAL',
        status: 'ACTIVE',
      },
    });

    console.log('테스트 사용자 생성 완료:');
    console.log('이메일: test@example.com');
    console.log('비밀번호: test1234');
    console.log('User ID:', user.id);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('테스트 사용자가 이미 존재합니다.');
    } else {
      console.error('Error:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
