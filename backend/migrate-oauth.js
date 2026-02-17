const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('Starting OAuth migration...');

try {
  // Add columns to User table
  console.log('Adding columns to User table...');

  try {
    db.exec('ALTER TABLE User ADD COLUMN provider TEXT DEFAULT "local"');
    console.log('✓ Added provider column to User');
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
      console.log('⊘ provider column already exists in User');
    } else {
      throw e;
    }
  }

  try {
    db.exec('ALTER TABLE User ADD COLUMN providerId TEXT');
    console.log('✓ Added providerId column to User');
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
      console.log('⊘ providerId column already exists in User');
    } else {
      throw e;
    }
  }

  try {
    db.exec('ALTER TABLE User ADD COLUMN profilePhoto TEXT');
    console.log('✓ Added profilePhoto column to User');
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
      console.log('⊘ profilePhoto column already exists in User');
    } else {
      throw e;
    }
  }

  // Add columns to Technician table
  console.log('\nAdding columns to Technician table...');

  try {
    db.exec('ALTER TABLE Technician ADD COLUMN provider TEXT DEFAULT "local"');
    console.log('✓ Added provider column to Technician');
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
      console.log('⊘ provider column already exists in Technician');
    } else {
      throw e;
    }
  }

  try {
    db.exec('ALTER TABLE Technician ADD COLUMN providerId TEXT');
    console.log('✓ Added providerId column to Technician');
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
      console.log('⊘ providerId column already exists in Technician');
    } else {
      throw e;
    }
  }

  // Create indexes
  console.log('\nCreating indexes...');

  try {
    db.exec('CREATE INDEX User_provider_providerId_idx ON User(provider, providerId)');
    console.log('✓ Created index on User(provider, providerId)');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('⊘ Index User_provider_providerId_idx already exists');
    } else {
      throw e;
    }
  }

  try {
    db.exec('CREATE INDEX Technician_provider_providerId_idx ON Technician(provider, providerId)');
    console.log('✓ Created index on Technician(provider, providerId)');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('⊘ Index Technician_provider_providerId_idx already exists');
    } else {
      throw e;
    }
  }

  console.log('\n✅ OAuth migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
