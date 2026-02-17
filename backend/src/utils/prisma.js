// Using better-sqlite3 wrapper instead of Prisma due to libssl issues
const prisma = require('./db');

module.exports = prisma;
