const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const { randomUUID } = require('crypto');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

console.log('🌱 Starting seed...\n');

// Helper functions
const uuid = () => randomUUID();
const hashPassword = (password) => bcrypt.hashSync(password, 10);

// Services data
const services = [
  // Electrical
  { code: 'EL-001', name: '콘센트 교체', category: 'ELECTRICAL', difficulty: 'A', duration: 30, price: 35000 },
  { code: 'EL-002', name: '스위치 교체', category: 'ELECTRICAL', difficulty: 'A', duration: 30, price: 35000 },
  { code: 'EL-003', name: 'LED 조명 교체', category: 'ELECTRICAL', difficulty: 'A', duration: 45, price: 45000 },
  { code: 'EL-004', name: '형광등 교체', category: 'ELECTRICAL', difficulty: 'A', duration: 30, price: 35000 },
  { code: 'EL-005', name: '멀티탭 설치', category: 'ELECTRICAL', difficulty: 'A', duration: 30, price: 30000 },
  { code: 'EL-006', name: '전등 설치', category: 'ELECTRICAL', difficulty: 'B', duration: 60, price: 55000 },
  { code: 'EL-007', name: '천장등 설치', category: 'ELECTRICAL', difficulty: 'B', duration: 75, price: 70000 },
  { code: 'EL-008', name: '간접조명 설치', category: 'ELECTRICAL', difficulty: 'C', duration: 120, price: 120000 },
  { code: 'EL-009', name: '전기차단기 교체', category: 'ELECTRICAL', difficulty: 'C', duration: 90, price: 95000 },
  { code: 'EL-010', name: '전기배선 점검/수리', category: 'ELECTRICAL', difficulty: 'C', duration: 120, price: 130000 },

  // Plumbing
  { code: 'PL-001', name: '수도꼭지 교체', category: 'PLUMBING', difficulty: 'A', duration: 45, price: 50000 },
  { code: 'PL-002', name: '세면대 배수구 청소', category: 'PLUMBING', difficulty: 'A', duration: 30, price: 40000 },
  { code: 'PL-003', name: '변기 막힘 해소', category: 'PLUMBING', difficulty: 'B', duration: 60, price: 65000 },
  { code: 'PL-004', name: '싱크대 배수관 교체', category: 'PLUMBING', difficulty: 'B', duration: 75, price: 80000 },
  { code: 'PL-005', name: '세면대 설치', category: 'PLUMBING', difficulty: 'C', duration: 120, price: 150000 },
  { code: 'PL-006', name: '싱크대 설치', category: 'PLUMBING', difficulty: 'C', duration: 120, price: 180000 },
  { code: 'PL-007', name: '급수/배수관 누수 수리', category: 'PLUMBING', difficulty: 'B', duration: 90, price: 90000 },
  { code: 'PL-008', name: '변기 교체', category: 'PLUMBING', difficulty: 'C', duration: 120, price: 200000 },
  { code: 'PL-009', name: '욕조/샤워부스 코킹', category: 'PLUMBING', difficulty: 'B', duration: 60, price: 70000 },
  { code: 'PL-010', name: '보일러 점검', category: 'PLUMBING', difficulty: 'B', duration: 60, price: 75000 },

  // Wallpaper
  { code: 'WP-001', name: '벽지 부분 보수', category: 'WALLPAPER', difficulty: 'A', duration: 45, price: 50000 },
  { code: 'WP-002', name: '장판 부분 보수', category: 'WALLPAPER', difficulty: 'A', duration: 45, price: 50000 },
  { code: 'WP-003', name: '방 1개 도배', category: 'WALLPAPER', difficulty: 'C', duration: 240, price: 350000, slaAvailable: false },
  { code: 'WP-004', name: '방 1개 장판', category: 'WALLPAPER', difficulty: 'C', duration: 180, price: 300000, slaAvailable: false },
  { code: 'WP-005', name: '거실 도배', category: 'WALLPAPER', difficulty: 'C', duration: 360, price: 500000, slaAvailable: false },

  // Aircon
  { code: 'AC-001', name: '에어컨 필터 청소', category: 'AIRCON', difficulty: 'A', duration: 30, price: 40000 },
  { code: 'AC-002', name: '에어컨 기본 청소', category: 'AIRCON', difficulty: 'B', duration: 90, price: 80000 },
  { code: 'AC-003', name: '에어컨 분해 청소', category: 'AIRCON', difficulty: 'C', duration: 180, price: 150000 },
  { code: 'AC-004', name: '벽걸이 에어컨 설치', category: 'AIRCON', difficulty: 'C', duration: 120, price: 120000 },
  { code: 'AC-005', name: '스탠드 에어컨 설치', category: 'AIRCON', difficulty: 'C', duration: 90, price: 100000 },

  // Carpentry
  { code: 'CA-001', name: '문틀 수리', category: 'CARPENTRY', difficulty: 'B', duration: 90, price: 90000 },
  { code: 'CA-002', name: '방문 교체', category: 'CARPENTRY', difficulty: 'C', duration: 120, price: 180000 },
  { code: 'CA-003', name: '싱크대 서랍 수리', category: 'CARPENTRY', difficulty: 'B', duration: 60, price: 70000 },

  // General
  { code: 'GE-001', name: '방충망 교체', category: 'GENERAL', difficulty: 'A', duration: 30, price: 40000 },
  { code: 'GE-002', name: '현관문 잠금장치 교체', category: 'GENERAL', difficulty: 'B', duration: 60, price: 70000 },
  { code: 'GE-003', name: '블라인드 설치', category: 'GENERAL', difficulty: 'A', duration: 45, price: 50000 },
];

// Insert services
console.log('Creating services...');
const insertService = db.prepare(`
  INSERT INTO Service (id, code, name, description, category, difficulty, estimatedDuration, basePrice, slaAvailable)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const serviceIds = {};
for (const service of services) {
  const id = uuid();
  serviceIds[service.code] = id;
  insertService.run(
    id,
    service.code,
    service.name,
    `${service.name} 서비스입니다.`,
    service.category,
    service.difficulty,
    service.duration,
    service.price,
    service.slaAvailable !== false ? 1 : 0
  );
}
console.log(`✅ Created ${services.length} services\n`);

// Create users
console.log('Creating test users...');
const hashedPassword = hashPassword('password123');

const userId = uuid();
db.prepare(`
  INSERT INTO User (id, email, password, name, phone, userType, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(userId, 'user@test.com', hashedPassword, '김일반', '010-1234-5678', 'GENERAL', 'ACTIVE');

// Create company
const companyId = uuid();
db.prepare(`
  INSERT INTO Company (id, name, businessNumber, address, phone, email)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(companyId, '테스트 부동산', '123-45-67890', '서울시 강남구 테헤란로 123', '02-1234-5678', 'info@test-realty.com');

const companyUserId = uuid();
db.prepare(`
  INSERT INTO User (id, email, password, name, phone, userType, status, companyId)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(companyUserId, 'company@test.com', hashedPassword, '박매니저', '010-2345-6789', 'COMPANY', 'ACTIVE', companyId);

// Create building
const buildingId = uuid();
db.prepare(`
  INSERT INTO Building (id, name, address, postalCode, companyId)
  VALUES (?, ?, ?, ?, ?)
`).run(buildingId, '테스트빌딩', '서울시 강남구 역삼동 123-45', '06234', companyId);

// Create units
db.prepare(`
  INSERT INTO Unit (id, unitNumber, floor, area, buildingId)
  VALUES (?, ?, ?, ?, ?)
`).run(uuid(), '101호', 1, 33.0, buildingId);
db.prepare(`
  INSERT INTO Unit (id, unitNumber, floor, area, buildingId)
  VALUES (?, ?, ?, ?, ?)
`).run(uuid(), '102호', 1, 33.0, buildingId);

console.log('✅ Created test users and company\n');

// Create technicians
console.log('Creating test technicians...');

const tech1Id = uuid();
db.prepare(`
  INSERT INTO Technician (
    id, email, password, name, phone, bio,
    currentLatitude, currentLongitude, status,
    rating, reviewCount, acceptanceRate, ontimeRate, complaintRate, completedJobs
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  tech1Id, 'tech1@test.com', hashedPassword, '이기사', '010-3456-7890',
  '전기/조명 전문 기사입니다.',
  37.5015, 127.0395, 'AVAILABLE',
  4.8, 150, 95, 92, 2, 145
);

const tech2Id = uuid();
db.prepare(`
  INSERT INTO Technician (
    id, email, password, name, phone, bio,
    currentLatitude, currentLongitude, status,
    rating, reviewCount, acceptanceRate, ontimeRate, complaintRate, completedJobs
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  tech2Id, 'tech2@test.com', hashedPassword, '박배관', '010-4567-8901',
  '배관/수도 전문 기사입니다.',
  37.4979, 127.0276, 'AVAILABLE',
  4.9, 200, 98, 96, 1, 198
);

// Add skills for tech1 (electrical services)
const electricalServices = services.filter(s => s.category === 'ELECTRICAL');
for (const service of electricalServices) {
  const skillLevel = service.difficulty === 'A' ? 5 : service.difficulty === 'B' ? 4 : 3;
  db.prepare(`
    INSERT INTO TechnicianSkill (id, technicianId, serviceId, skillLevel)
    VALUES (?, ?, ?, ?)
  `).run(uuid(), tech1Id, serviceIds[service.code], skillLevel);
}

// Add skills for tech2 (plumbing services)
const plumbingServices = services.filter(s => s.category === 'PLUMBING');
for (const service of plumbingServices) {
  const skillLevel = service.difficulty === 'A' ? 5 : service.difficulty === 'B' ? 4 : 3;
  db.prepare(`
    INSERT INTO TechnicianSkill (id, technicianId, serviceId, skillLevel)
    VALUES (?, ?, ?, ?)
  `).run(uuid(), tech2Id, serviceIds[service.code], skillLevel);
}

console.log('✅ Created 2 test technicians with skills\n');

console.log('');
console.log('🎉 Seed completed successfully!');
console.log('');
console.log('📝 Test accounts:');
console.log('');
console.log('👤 General User:');
console.log('   Email: user@test.com');
console.log('   Password: password123');
console.log('');
console.log('🏢 Company User:');
console.log('   Email: company@test.com');
console.log('   Password: password123');
console.log('');
console.log('🔧 Technician 1 (전기):');
console.log('   Email: tech1@test.com');
console.log('   Password: password123');
console.log('');
console.log('🔧 Technician 2 (배관):');
console.log('   Email: tech2@test.com');
console.log('   Password: password123');
console.log('');

db.close();
