const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '../../dev.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('📊 Creating matching tables...');

// Read and execute SQL schema
const schemaSQL = fs.readFileSync(path.join(__dirname, 'initMatchingTables.sql'), 'utf8');
const statements = schemaSQL.split(';').filter(s => s.trim());

statements.forEach(statement => {
  if (statement.trim()) {
    db.prepare(statement).run();
  }
});

console.log('✅ Matching tables created successfully');

// Check if we already have technicians
const existingTechnicians = db.prepare('SELECT COUNT(*) as count FROM Technician').get();

if (existingTechnicians.count > 0) {
  console.log(`ℹ️  Already have ${existingTechnicians.count} technicians. Skipping seed.`);
  process.exit(0);
}

console.log('👷 Seeding sample technicians...');

// Sample technician data (서울 강남 지역)
const sampleTechnicians = [
  {
    id: crypto.randomUUID(),
    user_id: 'tech-user-1',
    specialties: JSON.stringify(['ELECTRICAL', 'PLUMBING']),
    rating: 4.8,
    total_reviews: 127,
    completed_jobs: 145,
    latitude: 37.4979, // 강남역 근처
    longitude: 127.0276,
    max_distance: 15.0,
    is_available: 1,
    response_rate: 95.5
  },
  {
    id: crypto.randomUUID(),
    user_id: 'tech-user-2',
    specialties: JSON.stringify(['WALLPAPER', 'CARPENTRY']),
    rating: 4.9,
    total_reviews: 203,
    completed_jobs: 220,
    latitude: 37.5172, // 선릉역 근처
    longitude: 127.0473,
    max_distance: 10.0,
    is_available: 1,
    response_rate: 98.2
  },
  {
    id: crypto.randomUUID(),
    user_id: 'tech-user-3',
    specialties: JSON.stringify(['AIRCON']),
    rating: 4.7,
    total_reviews: 89,
    completed_jobs: 95,
    latitude: 37.5133, // 역삼역 근처
    longitude: 127.0364,
    max_distance: 12.0,
    is_available: 1,
    response_rate: 92.0
  },
  {
    id: crypto.randomUUID(),
    user_id: 'tech-user-4',
    specialties: JSON.stringify(['PLUMBING', 'GENERAL']),
    rating: 4.6,
    total_reviews: 56,
    completed_jobs: 62,
    latitude: 37.4874, // 양재역 근처
    longitude: 127.0347,
    max_distance: 20.0,
    is_available: 1,
    response_rate: 88.5
  },
  {
    id: crypto.randomUUID(),
    user_id: 'tech-user-5',
    specialties: JSON.stringify(['ELECTRICAL', 'AIRCON', 'GENERAL']),
    rating: 4.9,
    total_reviews: 178,
    completed_jobs: 192,
    latitude: 37.5095, // 강남구청역 근처
    longitude: 127.0626,
    max_distance: 10.0,
    is_available: 1,
    response_rate: 96.8
  }
];

const insertStmt = db.prepare(`
  INSERT INTO Technician (
    id, user_id, specialties, rating, total_reviews, completed_jobs,
    latitude, longitude, max_distance, is_available, response_rate
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

sampleTechnicians.forEach(tech => {
  insertStmt.run(
    tech.id,
    tech.user_id,
    tech.specialties,
    tech.rating,
    tech.total_reviews,
    tech.completed_jobs,
    tech.latitude,
    tech.longitude,
    tech.max_distance,
    tech.is_available,
    tech.response_rate
  );
});

console.log(`✅ Seeded ${sampleTechnicians.length} sample technicians`);
console.log('🎉 Database setup complete!');

db.close();
