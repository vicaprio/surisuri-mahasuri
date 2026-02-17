const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../dev.db');

try {
  const db = new Database(dbPath);

  // Get all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('📋 Existing tables:');
  tables.forEach(t => console.log(`  - ${t.name}`));

  // Check Technician table structure if it exists
  const hasTechnician = tables.find(t => t.name === 'Technician');
  if (hasTechnician) {
    console.log('\n🔍 Technician table structure:');
    const columns = db.prepare('PRAGMA table_info(Technician)').all();
    columns.forEach(col => {
      console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
  }

  db.close();
} catch (error) {
  if (error.code === 'SQLITE_CANTOPEN') {
    console.log('ℹ️  Database file does not exist yet. Will be created on first run.');
  } else {
    console.error('Error:', error.message);
  }
}
