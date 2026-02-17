const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUser() {
  try {
    // Find users with null id
    const users = await prisma.$queryRaw`SELECT * FROM User WHERE email = 'bitget20221231@gmail.com'`;
    console.log('Found users:', users);

    // Delete the corrupted user
    if (users.length > 0) {
      await prisma.$executeRaw`DELETE FROM User WHERE email = 'bitget20221231@gmail.com'`;
      console.log('Deleted corrupted user record');
    }

    console.log('Database cleaned. Please try Google login again.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUser();
