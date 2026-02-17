const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../dev.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Helper to convert snake_case to camelCase
function toCamelCase(obj) {
  if (!obj) return obj;
  const newObj = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj;
}

// Simple query builder
const prisma = {
  user: {
    findUnique: (query) => {
      const stmt = db.prepare('SELECT * FROM User WHERE ' + Object.keys(query.where)[0] + ' = ?');
      return toCamelCase(stmt.get(Object.values(query.where)[0]));
    },
    findFirst: (query) => {
      let sql = 'SELECT * FROM User';
      const params = [];

      if (query.where) {
        const conditions = Object.entries(query.where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' LIMIT 1';
      const stmt = db.prepare(sql);
      return toCamelCase(stmt.get(...params));
    },
    findMany: (query = {}) => {
      let sql = 'SELECT * FROM User';
      const params = [];

      if (query.where) {
        const conditions = Object.entries(query.where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const stmt = db.prepare(sql);
      return stmt.all(...params).map(toCamelCase);
    },
    create: (data) => {
      const { data: userData } = data;

      // Generate UUID if not provided
      if (!userData.id) {
        const crypto = require('crypto');
        userData.id = crypto.randomUUID();
      }

      const keys = Object.keys(userData);
      const values = Object.values(userData);
      const placeholders = keys.map(() => '?').join(', ');

      const stmt = db.prepare(`INSERT INTO User (${keys.join(', ')}) VALUES (${placeholders})`);
      stmt.run(...values);

      return toCamelCase(db.prepare('SELECT * FROM User WHERE id = ?').get(userData.id));
    },
    update: (query) => {
      const { where, data } = query;
      const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
      const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');

      const stmt = db.prepare(`UPDATE User SET ${setClause} WHERE ${whereClause}`);
      stmt.run(...Object.values(data), ...Object.values(where));

      return toCamelCase(db.prepare(`SELECT * FROM User WHERE ${whereClause}`).get(...Object.values(where)));
    }
  },

  technician: {
    findUnique: (query) => {
      const stmt = db.prepare('SELECT * FROM Technician WHERE ' + Object.keys(query.where)[0] + ' = ?');
      return toCamelCase(stmt.get(Object.values(query.where)[0]));
    },
    findMany: (query = {}) => {
      let sql = 'SELECT * FROM Technician';
      const params = [];

      if (query.where) {
        const conditions = Object.entries(query.where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const stmt = db.prepare(sql);
      return stmt.all(...params).map(toCamelCase);
    },
    update: (query) => {
      const { where, data } = query;
      const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
      const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');

      const stmt = db.prepare(`UPDATE Technician SET ${setClause} WHERE ${whereClause}`);
      stmt.run(...Object.values(data), ...Object.values(where));

      return toCamelCase(db.prepare(`SELECT * FROM Technician WHERE ${whereClause}`).get(...Object.values(where)));
    }
  },

  service: {
    findMany: (query = {}) => {
      let sql = 'SELECT * FROM Service';
      const params = [];

      if (query.where) {
        const conditions = Object.entries(query.where).map(([key, value]) => {
          // Convert boolean to number for SQLite
          const sqlValue = typeof value === 'boolean' ? (value ? 1 : 0) : value;
          params.push(sqlValue);
          return `${key} = ?`;
        });
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      if (query.orderBy) {
        const orderClauses = query.orderBy.map(order => {
          const [[key, direction]] = Object.entries(order);
          return `${key} ${direction.toUpperCase()}`;
        });
        sql += ' ORDER BY ' + orderClauses.join(', ');
      }

      const stmt = db.prepare(sql);
      return stmt.all(...params).map(toCamelCase);
    },
    findUnique: (query) => {
      const stmt = db.prepare('SELECT * FROM Service WHERE ' + Object.keys(query.where)[0] + ' = ?');
      return toCamelCase(stmt.get(Object.values(query.where)[0]));
    }
  },

  serviceRequest: {
    create: (data) => {
      const { data: reqData } = data;
      const keys = Object.keys(reqData);
      const values = Object.values(reqData);
      const placeholders = keys.map(() => '?').join(', ');

      const stmt = db.prepare(`INSERT INTO ServiceRequest (${keys.join(', ')}) VALUES (${placeholders})`);
      stmt.run(...values);

      return toCamelCase(db.prepare('SELECT * FROM ServiceRequest WHERE id = ?').get(reqData.id));
    },
    findMany: (query = {}) => {
      let sql = 'SELECT * FROM ServiceRequest';
      const params = [];

      if (query.where) {
        const conditions = Object.entries(query.where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      if (query.orderBy) {
        const [[key, direction]] = Object.entries(query.orderBy);
        sql += ` ORDER BY ${key} ${direction.toUpperCase()}`;
      }

      if (query.skip) sql += ` OFFSET ${query.skip}`;
      if (query.take) sql += ` LIMIT ${query.take}`;

      const stmt = db.prepare(sql);
      return stmt.all(...params).map(toCamelCase);
    },
    findFirst: (query) => {
      let sql = 'SELECT * FROM ServiceRequest';
      const params = [];

      if (query.where) {
        const conditions = Object.entries(query.where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' LIMIT 1';
      const stmt = db.prepare(sql);
      return toCamelCase(stmt.get(...params));
    },
    count: (query = {}) => {
      let sql = 'SELECT COUNT(*) as count FROM ServiceRequest';
      const params = [];

      if (query.where) {
        const conditions = Object.entries(query.where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const stmt = db.prepare(sql);
      return stmt.get(...params).count;
    },
    update: (query) => {
      const { where, data } = query;
      const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
      const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');

      const stmt = db.prepare(`UPDATE ServiceRequest SET ${setClause} WHERE ${whereClause}`);
      stmt.run(...Object.values(data), ...Object.values(where));

      return toCamelCase(db.prepare(`SELECT * FROM ServiceRequest WHERE ${whereClause}`).get(...Object.values(where)));
    }
  },

  serviceLog: {
    create: (data) => {
      const { data: logData } = data;
      const keys = Object.keys(logData);
      const values = Object.values(logData);
      const placeholders = keys.map(() => '?').join(', ');

      const stmt = db.prepare(`INSERT INTO ServiceLog (${keys.join(', ')}) VALUES (${placeholders})`);
      stmt.run(...values);

      return { id: db.prepare('SELECT last_insert_rowid() as id').get().id };
    }
  },

  warranty: {
    create: (data) => {
      const { data: warrantyData } = data;
      const keys = Object.keys(warrantyData);
      const values = Object.values(warrantyData);
      const placeholders = keys.map(() => '?').join(', ');

      const stmt = db.prepare(`INSERT INTO Warranty (${keys.join(', ')}) VALUES (${placeholders})`);
      stmt.run(...values);

      return toCamelCase(db.prepare('SELECT * FROM Warranty WHERE id = ?').get(warrantyData.id));
    }
  },

  serviceRequestMatch: {
    create: (data) => {
      const { data: matchData } = data;
      const keys = Object.keys(matchData);
      const values = Object.values(matchData);
      const placeholders = keys.map(() => '?').join(', ');

      const stmt = db.prepare(`INSERT INTO ServiceRequestMatch (${keys.join(', ')}) VALUES (${placeholders})`);
      stmt.run(...values);

      return toCamelCase(db.prepare('SELECT * FROM ServiceRequestMatch WHERE id = ?').get(matchData.id));
    },
    findMany: (query = {}) => {
      let sql = 'SELECT * FROM ServiceRequestMatch';
      const params = [];

      if (query.where) {
        const conditions = Object.entries(query.where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      if (query.orderBy) {
        const [[key, direction]] = Object.entries(query.orderBy);
        sql += ` ORDER BY ${key} ${direction.toUpperCase()}`;
      }

      const stmt = db.prepare(sql);
      return stmt.all(...params).map(toCamelCase);
    },
    findFirst: (query) => {
      let sql = 'SELECT * FROM ServiceRequestMatch';
      const params = [];

      if (query.where) {
        const conditions = Object.entries(query.where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' LIMIT 1';
      const stmt = db.prepare(sql);
      return toCamelCase(stmt.get(...params));
    },
    update: (query) => {
      const { where, data } = query;
      const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
      const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');

      const stmt = db.prepare(`UPDATE ServiceRequestMatch SET ${setClause} WHERE ${whereClause}`);
      stmt.run(...Object.values(data), ...Object.values(where));

      return toCamelCase(db.prepare(`SELECT * FROM ServiceRequestMatch WHERE ${whereClause}`).get(...Object.values(where)));
    }
  },

  technicianSkill: {
    findMany: (query = {}) => {
      let sql = 'SELECT * FROM TechnicianSkill';
      const params = [];

      if (query.where) {
        const conditions = Object.entries(query.where).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const stmt = db.prepare(sql);
      return stmt.all(...params).map(toCamelCase);
    }
  }
};

// Export raw db for custom queries
prisma.raw = db;

module.exports = prisma;
