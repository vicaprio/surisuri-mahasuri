const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../dev.db');
const db = new Database(dbPath);

const tablesToCheck = ['TechnicianSkill', 'ServiceRequestMatch', 'ServiceRequest'];

tablesToCheck.forEach(tableName => {
  console.log(`\n🔍 ${tableName} table structure:`);
  try {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    columns.forEach(col => {
      console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });

    // Show sample data
    const sampleData = db.prepare(`SELECT * FROM ${tableName} LIMIT 2`).all();
    if (sampleData.length > 0) {
      console.log(`  Sample data count: ${sampleData.length}`);
    } else {
      console.log(`  (No data yet)`);
    }
  } catch (error) {
    console.log(`  Error: ${error.message}`);
  }
});

db.close();
