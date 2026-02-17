/**
 * D1 Database utilities
 */

/**
 * Generate UUID v4
 */
export function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Execute a database query
 */
export async function query(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      return await stmt.bind(...params).all();
    }
    return await stmt.all();
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a single row query
 */
export async function queryOne(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      return await stmt.bind(...params).first();
    }
    return await stmt.first();
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute an insert/update/delete query
 */
export async function execute(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      return await stmt.bind(...params).run();
    }
    return await stmt.run();
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

/**
 * Get current timestamp in seconds
 */
export function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Convert timestamp to ISO string
 */
export function timestampToISO(timestamp) {
  return new Date(timestamp * 1000).toISOString();
}
