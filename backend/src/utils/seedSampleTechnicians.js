const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../../dev.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

console.log('👷 Seeding 50 sample technicians for matching...');

// Check if we already have many technicians
const existingTechsWithLocation = db.prepare(`
  SELECT COUNT(*) as count FROM Technician
  WHERE currentLatitude IS NOT NULL AND currentLongitude IS NOT NULL
`).get();

if (existingTechsWithLocation.count >= 40) {
  console.log(`✅ Already have ${existingTechsWithLocation.count} technicians with location data.`);
  db.close();
  process.exit(0);
}

// Get all services grouped by keywords for skill mapping
const services = db.prepare('SELECT id, name, category FROM Service').all();

// Helper function to find service IDs by keywords
function findServiceIdsByKeywords(keywords) {
  return services
    .filter(s => keywords.some(keyword => s.name.includes(keyword) || s.category?.includes(keyword)))
    .map(s => s.id);
}

// Define skill categories and their related service keywords
const skillCategories = {
  '전기': ['콘센트', '스위치', 'LED', '조명', '형광등', '멀티탭', '전등', '천장등', '간접조명', '전기', '배선', '차단기'],
  '배관/수도': ['수도', '세면대', '변기', '싱크대', '배수', '급수', '누수', '코킹', '욕조', '샤워'],
  '에어컨': ['에어컨'],
  '도배': ['벽지', '장판', '도배'],
  '목공': ['문틀', '방문', '서랍', '방충망', '잠금', '블라인드'],
  '샷시/유리': ['창문', '샷시', '유리', '방충망'],
  '보일러': ['보일러', '난방'],
  '타일': ['타일', '욕실'],
  '전자제품': ['세탁', '냉장', '가전'],
  '종합수리': [] // Will get all services
};

// Get service IDs for each skill category
const skillServiceMap = {};
for (const [skillName, keywords] of Object.entries(skillCategories)) {
  if (skillName === '종합수리') {
    // 종합수리 gets top services from multiple categories
    skillServiceMap[skillName] = findServiceIdsByKeywords(['전기', '배수', '수도', '문', '보일러']);
  } else {
    skillServiceMap[skillName] = findServiceIdsByKeywords(keywords);
  }
}

// 50명의 샘플 기사님 데이터 (서울 전역)
const sampleTechnicians = [
  // === 전기 전문가 (8명) ===
  {
    id: crypto.randomUUID(),
    email: 'elec1@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '김전기',
    phone: '010-1001-0001',
    bio: '20년 경력의 전기 전문가입니다. 누전, 콘센트 교체 등 모든 전기 작업 가능합니다.',
    currentLatitude: 37.5172, // 강남구
    currentLongitude: 127.0473,
    serviceArea: '강남구, 서초구',
    status: 'ONLINE',
    rating: 4.9,
    reviewCount: 234,
    acceptanceRate: 98.5,
    ontimeRate: 99.0,
    complaintRate: 0.5,
    completedJobs: 267,
    skills: ['전기']
  },
  {
    id: crypto.randomUUID(),
    email: 'elec2@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '이전선',
    phone: '010-1001-0002',
    bio: '전기 안전 점검 및 수리 전문가입니다.',
    currentLatitude: 37.5145, // 송파구
    currentLongitude: 127.1059,
    serviceArea: '송파구, 강동구',
    status: 'AVAILABLE',
    rating: 4.7,
    reviewCount: 156,
    acceptanceRate: 95.0,
    ontimeRate: 96.5,
    complaintRate: 1.8,
    completedJobs: 178,
    skills: ['전기']
  },
  {
    id: crypto.randomUUID(),
    email: 'elec3@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '박누전',
    phone: '010-1001-0003',
    bio: '누전 차단기 및 배선 전문가입니다.',
    currentLatitude: 37.5665, // 마포구
    currentLongitude: 126.9780,
    serviceArea: '마포구, 용산구',
    status: 'ONLINE',
    rating: 4.8,
    reviewCount: 189,
    acceptanceRate: 96.8,
    ontimeRate: 98.0,
    complaintRate: 1.2,
    completedJobs: 201,
    skills: ['전기']
  },
  {
    id: crypto.randomUUID(),
    email: 'elec4@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '최콘센트',
    phone: '010-1001-0004',
    bio: '콘센트, 스위치 교체 및 신설 전문가입니다.',
    currentLatitude: 37.5443, // 성동구
    currentLongitude: 127.0557,
    serviceArea: '성동구, 광진구',
    status: 'AVAILABLE',
    rating: 4.6,
    reviewCount: 98,
    acceptanceRate: 93.5,
    ontimeRate: 95.0,
    complaintRate: 2.5,
    completedJobs: 112,
    skills: ['전기']
  },
  {
    id: crypto.randomUUID(),
    email: 'elec5@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '정조명',
    phone: '010-1001-0005',
    bio: '조명 설치 및 LED 교체 전문가입니다.',
    currentLatitude: 37.5794, // 종로구
    currentLongitude: 126.9770,
    serviceArea: '종로구, 중구',
    status: 'ONLINE',
    rating: 4.8,
    reviewCount: 167,
    acceptanceRate: 97.2,
    ontimeRate: 97.8,
    complaintRate: 1.0,
    completedJobs: 183,
    skills: ['전기']
  },
  {
    id: crypto.randomUUID(),
    email: 'elec6@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '강전압',
    phone: '010-1001-0006',
    bio: '전압 안정화 및 분전반 작업 전문가입니다.',
    currentLatitude: 37.4979, // 서초구
    currentLongitude: 127.0276,
    serviceArea: '서초구, 강남구',
    status: 'AVAILABLE',
    rating: 4.9,
    reviewCount: 211,
    acceptanceRate: 98.0,
    ontimeRate: 99.5,
    complaintRate: 0.3,
    completedJobs: 228,
    skills: ['전기']
  },
  {
    id: crypto.randomUUID(),
    email: 'elec7@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '신배선',
    phone: '010-1001-0007',
    bio: '전기 배선 및 리모델링 전문가입니다.',
    currentLatitude: 37.5267, // 강동구
    currentLongitude: 127.1240,
    serviceArea: '강동구, 하남',
    status: 'ONLINE',
    rating: 4.7,
    reviewCount: 142,
    acceptanceRate: 94.8,
    ontimeRate: 96.0,
    complaintRate: 2.0,
    completedJobs: 159,
    skills: ['전기']
  },
  {
    id: crypto.randomUUID(),
    email: 'elec8@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '윤스위치',
    phone: '010-1001-0008',
    bio: '스마트홈 전기 설비 전문가입니다.',
    currentLatitude: 37.5214, // 영등포구
    currentLongitude: 126.9085,
    serviceArea: '영등포구, 구로구',
    status: 'AVAILABLE',
    rating: 4.8,
    reviewCount: 176,
    acceptanceRate: 96.5,
    ontimeRate: 97.2,
    complaintRate: 1.5,
    completedJobs: 192,
    skills: ['전기']
  },

  // === 배관/수도 전문가 (8명) ===
  {
    id: crypto.randomUUID(),
    email: 'plumb1@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '김배관',
    phone: '010-2001-0001',
    bio: '18년 경력의 배관 전문가입니다. 누수 수리, 배관 교체 전문입니다.',
    currentLatitude: 37.4979,
    currentLongitude: 127.0276,
    serviceArea: '강남구, 서초구',
    status: 'ONLINE',
    rating: 4.9,
    reviewCount: 245,
    acceptanceRate: 99.0,
    ontimeRate: 98.5,
    complaintRate: 0.5,
    completedJobs: 278,
    skills: ['배관/수도']
  },
  {
    id: crypto.randomUUID(),
    email: 'plumb2@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '이수도',
    phone: '010-2001-0002',
    bio: '수도 배관 및 밸브 교체 전문가입니다.',
    currentLatitude: 37.5133,
    currentLongitude: 127.1054,
    serviceArea: '송파구',
    status: 'AVAILABLE',
    rating: 4.7,
    reviewCount: 167,
    acceptanceRate: 94.5,
    ontimeRate: 96.0,
    complaintRate: 2.0,
    completedJobs: 189,
    skills: ['배관/수도']
  },
  {
    id: crypto.randomUUID(),
    email: 'plumb3@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '박누수',
    phone: '010-2001-0003',
    bio: '누수 탐지 및 긴급 수리 전문가입니다.',
    currentLatitude: 37.5665,
    currentLongitude: 126.9018,
    serviceArea: '마포구, 서대문구',
    status: 'ONLINE',
    rating: 4.8,
    reviewCount: 201,
    acceptanceRate: 97.0,
    ontimeRate: 98.0,
    complaintRate: 1.0,
    completedJobs: 223,
    skills: ['배관/수도']
  },
  {
    id: crypto.randomUUID(),
    email: 'plumb4@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '최하수',
    phone: '010-2001-0004',
    bio: '하수구 막힘 및 배수 전문가입니다.',
    currentLatitude: 37.5443,
    currentLongitude: 127.0557,
    serviceArea: '성동구, 광진구',
    status: 'AVAILABLE',
    rating: 4.6,
    reviewCount: 134,
    acceptanceRate: 92.5,
    ontimeRate: 94.5,
    complaintRate: 3.0,
    completedJobs: 156,
    skills: ['배관/수도']
  },
  {
    id: crypto.randomUUID(),
    email: 'plumb5@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '정급수',
    phone: '010-2001-0005',
    bio: '급수 및 온수 배관 전문가입니다.',
    currentLatitude: 37.5172,
    currentLongitude: 127.0473,
    serviceArea: '강남구',
    status: 'ONLINE',
    rating: 4.9,
    reviewCount: 188,
    acceptanceRate: 98.5,
    ontimeRate: 99.0,
    complaintRate: 0.8,
    completedJobs: 205,
    skills: ['배관/수도']
  },
  {
    id: crypto.randomUUID(),
    email: 'plumb6@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '강밸브',
    phone: '010-2001-0006',
    bio: '밸브 교체 및 수압 조절 전문가입니다.',
    currentLatitude: 37.5794,
    currentLongitude: 126.9770,
    serviceArea: '종로구, 중구',
    status: 'AVAILABLE',
    rating: 4.7,
    reviewCount: 145,
    acceptanceRate: 95.0,
    ontimeRate: 96.5,
    complaintRate: 1.8,
    completedJobs: 167,
    skills: ['배관/수도']
  },
  {
    id: crypto.randomUUID(),
    email: 'plumb7@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '신싱크',
    phone: '010-2001-0007',
    bio: '싱크대 및 세면대 배관 전문가입니다.',
    currentLatitude: 37.4874,
    currentLongitude: 127.0347,
    serviceArea: '서초구',
    status: 'ONLINE',
    rating: 4.8,
    reviewCount: 179,
    acceptanceRate: 96.8,
    ontimeRate: 97.5,
    complaintRate: 1.2,
    completedJobs: 196,
    skills: ['배관/수도']
  },
  {
    id: crypto.randomUUID(),
    email: 'plumb8@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '윤파이프',
    phone: '010-2001-0008',
    bio: '파이프 교체 및 연결 전문가입니다.',
    currentLatitude: 37.5267,
    currentLongitude: 127.1240,
    serviceArea: '강동구',
    status: 'AVAILABLE',
    rating: 4.6,
    reviewCount: 121,
    acceptanceRate: 93.0,
    ontimeRate: 95.0,
    complaintRate: 2.5,
    completedJobs: 139,
    skills: ['배관/수도']
  },

  // === 에어컨 전문가 (6명) ===
  {
    id: crypto.randomUUID(),
    email: 'ac1@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '김냉난',
    phone: '010-3001-0001',
    bio: '15년 경력의 에어컨 설치 및 수리 전문가입니다.',
    currentLatitude: 37.5133,
    currentLongitude: 127.0364,
    serviceArea: '강남구, 서초구',
    status: 'ONLINE',
    rating: 4.8,
    reviewCount: 198,
    acceptanceRate: 96.5,
    ontimeRate: 97.0,
    complaintRate: 1.5,
    completedJobs: 215,
    skills: ['에어컨']
  },
  {
    id: crypto.randomUUID(),
    email: 'ac2@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '이시스템',
    phone: '010-3001-0002',
    bio: '시스템 에어컨 전문가입니다.',
    currentLatitude: 37.5145,
    currentLongitude: 127.1059,
    serviceArea: '송파구, 강동구',
    status: 'AVAILABLE',
    rating: 4.9,
    reviewCount: 223,
    acceptanceRate: 98.0,
    ontimeRate: 98.5,
    complaintRate: 0.8,
    completedJobs: 241,
    skills: ['에어컨']
  },
  {
    id: crypto.randomUUID(),
    email: 'ac3@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '박실외기',
    phone: '010-3001-0003',
    bio: '실외기 설치 및 이전 전문가입니다.',
    currentLatitude: 37.5665,
    currentLongitude: 126.9780,
    serviceArea: '마포구, 용산구',
    status: 'ONLINE',
    rating: 4.7,
    reviewCount: 156,
    acceptanceRate: 94.5,
    ontimeRate: 96.0,
    complaintRate: 2.0,
    completedJobs: 172,
    skills: ['에어컨']
  },
  {
    id: crypto.randomUUID(),
    email: 'ac4@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '최냉매',
    phone: '010-3001-0004',
    bio: '냉매 충전 및 가스 누출 수리 전문가입니다.',
    currentLatitude: 37.5794,
    currentLongitude: 126.9770,
    serviceArea: '종로구, 중구, 용산구',
    status: 'AVAILABLE',
    rating: 4.8,
    reviewCount: 187,
    acceptanceRate: 97.0,
    ontimeRate: 97.5,
    complaintRate: 1.2,
    completedJobs: 203,
    skills: ['에어컨']
  },
  {
    id: crypto.randomUUID(),
    email: 'ac5@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '정청소',
    phone: '010-3001-0005',
    bio: '에어컨 청소 및 필터 교체 전문가입니다.',
    currentLatitude: 37.4979,
    currentLongitude: 127.0276,
    serviceArea: '강남구, 서초구, 송파구',
    status: 'ONLINE',
    rating: 4.6,
    reviewCount: 134,
    acceptanceRate: 93.5,
    ontimeRate: 95.5,
    complaintRate: 2.5,
    completedJobs: 149,
    skills: ['에어컨']
  },
  {
    id: crypto.randomUUID(),
    email: 'ac6@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '강이전',
    phone: '010-3001-0006',
    bio: '에어컨 이전 설치 전문가입니다.',
    currentLatitude: 37.5214,
    currentLongitude: 126.9085,
    serviceArea: '영등포구, 구로구, 금천구',
    status: 'AVAILABLE',
    rating: 4.7,
    reviewCount: 161,
    acceptanceRate: 95.0,
    ontimeRate: 96.5,
    complaintRate: 1.8,
    completedJobs: 178,
    skills: ['에어컨']
  },

  // === 도배 전문가 (5명) ===
  {
    id: crypto.randomUUID(),
    email: 'wall1@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '김벽지',
    phone: '010-4001-0001',
    bio: '20년 경력의 도배 전문가입니다. 깔끔한 시공을 약속합니다.',
    currentLatitude: 37.5172,
    currentLongitude: 127.0473,
    serviceArea: '강남구, 서초구',
    status: 'ONLINE',
    rating: 4.9,
    reviewCount: 267,
    acceptanceRate: 98.5,
    ontimeRate: 99.0,
    complaintRate: 0.5,
    completedJobs: 289,
    skills: ['도배']
  },
  {
    id: crypto.randomUUID(),
    email: 'wall2@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '이합지',
    phone: '010-4001-0002',
    bio: '합지 및 실크벽지 전문가입니다.',
    currentLatitude: 37.5145,
    currentLongitude: 127.1059,
    serviceArea: '송파구',
    status: 'AVAILABLE',
    rating: 4.8,
    reviewCount: 201,
    acceptanceRate: 96.5,
    ontimeRate: 97.5,
    complaintRate: 1.2,
    completedJobs: 223,
    skills: ['도배']
  },
  {
    id: crypto.randomUUID(),
    email: 'wall3@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '박실크',
    phone: '010-4001-0003',
    bio: '실크벽지 및 디자인 벽지 전문가입니다.',
    currentLatitude: 37.5665,
    currentLongitude: 126.9780,
    serviceArea: '마포구, 용산구, 서대문구',
    status: 'ONLINE',
    rating: 4.7,
    reviewCount: 178,
    acceptanceRate: 95.0,
    ontimeRate: 96.0,
    complaintRate: 1.8,
    completedJobs: 195,
    skills: ['도배']
  },
  {
    id: crypto.randomUUID(),
    email: 'wall4@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '최장판',
    phone: '010-4001-0004',
    bio: '벽지 및 장판 시공 전문가입니다.',
    currentLatitude: 37.5443,
    currentLongitude: 127.0557,
    serviceArea: '성동구, 광진구',
    status: 'AVAILABLE',
    rating: 4.8,
    reviewCount: 189,
    acceptanceRate: 97.0,
    ontimeRate: 97.5,
    complaintRate: 1.0,
    completedJobs: 207,
    skills: ['도배']
  },
  {
    id: crypto.randomUUID(),
    email: 'wall5@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '정리폼',
    phone: '010-4001-0005',
    bio: '전체 리모델링 도배 전문가입니다.',
    currentLatitude: 37.4979,
    currentLongitude: 127.0276,
    serviceArea: '강남구, 서초구, 송파구',
    status: 'ONLINE',
    rating: 4.9,
    reviewCount: 234,
    acceptanceRate: 98.0,
    ontimeRate: 98.5,
    complaintRate: 0.8,
    completedJobs: 256,
    skills: ['도배']
  },

  // === 목공 전문가 (5명) ===
  {
    id: crypto.randomUUID(),
    email: 'wood1@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '김목수',
    phone: '010-5001-0001',
    bio: '25년 경력의 목공 전문가입니다.',
    currentLatitude: 37.5172,
    currentLongitude: 127.0473,
    serviceArea: '강남구, 서초구',
    status: 'ONLINE',
    rating: 4.9,
    reviewCount: 312,
    acceptanceRate: 99.0,
    ontimeRate: 98.5,
    complaintRate: 0.3,
    completedJobs: 345,
    skills: ['목공']
  },
  {
    id: crypto.randomUUID(),
    email: 'wood2@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '이마루',
    phone: '010-5001-0002',
    bio: '마루 및 바닥재 시공 전문가입니다.',
    currentLatitude: 37.5145,
    currentLongitude: 127.1059,
    serviceArea: '송파구, 강동구',
    status: 'AVAILABLE',
    rating: 4.8,
    reviewCount: 223,
    acceptanceRate: 97.0,
    ontimeRate: 97.5,
    complaintRate: 1.0,
    completedJobs: 241,
    skills: ['목공']
  },
  {
    id: crypto.randomUUID(),
    email: 'wood3@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '박가구',
    phone: '010-5001-0003',
    bio: '맞춤 가구 제작 및 수리 전문가입니다.',
    currentLatitude: 37.5665,
    currentLongitude: 126.9780,
    serviceArea: '마포구, 용산구',
    status: 'ONLINE',
    rating: 4.7,
    reviewCount: 189,
    acceptanceRate: 94.5,
    ontimeRate: 96.0,
    complaintRate: 2.0,
    completedJobs: 207,
    skills: ['목공']
  },
  {
    id: crypto.randomUUID(),
    email: 'wood4@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '최문짝',
    phone: '010-5001-0004',
    bio: '문짝 교체 및 가구 수리 전문가입니다.',
    currentLatitude: 37.5794,
    currentLongitude: 126.9770,
    serviceArea: '종로구, 중구',
    status: 'AVAILABLE',
    rating: 4.6,
    reviewCount: 145,
    acceptanceRate: 92.5,
    ontimeRate: 94.5,
    complaintRate: 2.5,
    completedJobs: 163,
    skills: ['목공']
  },
  {
    id: crypto.randomUUID(),
    email: 'wood5@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '정붙박이',
    phone: '010-5001-0005',
    bio: '붙박이장 및 시스템가구 전문가입니다.',
    currentLatitude: 37.4979,
    currentLongitude: 127.0276,
    serviceArea: '서초구, 강남구',
    status: 'ONLINE',
    rating: 4.8,
    reviewCount: 201,
    acceptanceRate: 96.5,
    ontimeRate: 97.0,
    complaintRate: 1.5,
    completedJobs: 218,
    skills: ['목공']
  },

  // === 샷시/유리 전문가 (4명) ===
  {
    id: crypto.randomUUID(),
    email: 'window1@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '김샷시',
    phone: '010-6001-0001',
    bio: '샷시 교체 및 시스템창호 전문가입니다.',
    currentLatitude: 37.5172,
    currentLongitude: 127.0473,
    serviceArea: '강남구, 서초구, 송파구',
    status: 'ONLINE',
    rating: 4.8,
    reviewCount: 178,
    acceptanceRate: 96.0,
    ontimeRate: 97.0,
    complaintRate: 1.5,
    completedJobs: 195,
    skills: ['샷시/유리']
  },
  {
    id: crypto.randomUUID(),
    email: 'window2@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '이유리',
    phone: '010-6001-0002',
    bio: '유리 교체 및 이중창 시공 전문가입니다.',
    currentLatitude: 37.5665,
    currentLongitude: 126.9780,
    serviceArea: '마포구, 용산구',
    status: 'AVAILABLE',
    rating: 4.7,
    reviewCount: 156,
    acceptanceRate: 94.5,
    ontimeRate: 95.5,
    complaintRate: 2.0,
    completedJobs: 172,
    skills: ['샷시/유리']
  },
  {
    id: crypto.randomUUID(),
    email: 'window3@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '박방음',
    phone: '010-6001-0003',
    bio: '방음창 및 단열창 전문가입니다.',
    currentLatitude: 37.5443,
    currentLongitude: 127.0557,
    serviceArea: '성동구, 광진구, 중랑구',
    status: 'ONLINE',
    rating: 4.9,
    reviewCount: 211,
    acceptanceRate: 98.0,
    ontimeRate: 98.5,
    complaintRate: 0.8,
    completedJobs: 228,
    skills: ['샷시/유리']
  },
  {
    id: crypto.randomUUID(),
    email: 'window4@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '최이중창',
    phone: '010-6001-0004',
    bio: '이중창 시공 및 결로 방지 전문가입니다.',
    currentLatitude: 37.5794,
    currentLongitude: 126.9770,
    serviceArea: '종로구, 중구, 용산구',
    status: 'AVAILABLE',
    rating: 4.6,
    reviewCount: 134,
    acceptanceRate: 93.0,
    ontimeRate: 94.5,
    complaintRate: 2.5,
    completedJobs: 149,
    skills: ['샷시/유리']
  },

  // === 보일러 전문가 (4명) ===
  {
    id: crypto.randomUUID(),
    email: 'boiler1@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '김난방',
    phone: '010-7001-0001',
    bio: '보일러 설치 및 수리 전문가입니다.',
    currentLatitude: 37.5172,
    currentLongitude: 127.0473,
    serviceArea: '강남구, 서초구',
    status: 'ONLINE',
    rating: 4.9,
    reviewCount: 245,
    acceptanceRate: 98.5,
    ontimeRate: 99.0,
    complaintRate: 0.5,
    completedJobs: 267,
    skills: ['보일러']
  },
  {
    id: crypto.randomUUID(),
    email: 'boiler2@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '이온수',
    phone: '010-7001-0002',
    bio: '온수 보일러 및 난방 전문가입니다.',
    currentLatitude: 37.5145,
    currentLongitude: 127.1059,
    serviceArea: '송파구, 강동구',
    status: 'AVAILABLE',
    rating: 4.7,
    reviewCount: 178,
    acceptanceRate: 95.0,
    ontimeRate: 96.5,
    complaintRate: 1.8,
    completedJobs: 195,
    skills: ['보일러']
  },
  {
    id: crypto.randomUUID(),
    email: 'boiler3@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '박동파',
    phone: '010-7001-0003',
    bio: '동파 방지 및 배관 청소 전문가입니다.',
    currentLatitude: 37.5665,
    currentLongitude: 126.9780,
    serviceArea: '마포구, 용산구, 서대문구',
    status: 'ONLINE',
    rating: 4.8,
    reviewCount: 201,
    acceptanceRate: 97.0,
    ontimeRate: 97.5,
    complaintRate: 1.2,
    completedJobs: 218,
    skills: ['보일러']
  },
  {
    id: crypto.randomUUID(),
    email: 'boiler4@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '최콘덴싱',
    phone: '010-7001-0004',
    bio: '콘덴싱 보일러 전문가입니다.',
    currentLatitude: 37.5794,
    currentLongitude: 126.9770,
    serviceArea: '종로구, 중구',
    status: 'AVAILABLE',
    rating: 4.8,
    reviewCount: 189,
    acceptanceRate: 96.5,
    ontimeRate: 97.0,
    complaintRate: 1.5,
    completedJobs: 205,
    skills: ['보일러']
  },

  // === 타일 전문가 (4명) ===
  {
    id: crypto.randomUUID(),
    email: 'tile1@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '김타일',
    phone: '010-8001-0001',
    bio: '타일 시공 및 줄눈 전문가입니다.',
    currentLatitude: 37.5172,
    currentLongitude: 127.0473,
    serviceArea: '강남구, 서초구',
    status: 'ONLINE',
    rating: 4.8,
    reviewCount: 189,
    acceptanceRate: 96.5,
    ontimeRate: 97.5,
    complaintRate: 1.2,
    completedJobs: 207,
    skills: ['타일']
  },
  {
    id: crypto.randomUUID(),
    email: 'tile2@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '이욕실',
    phone: '010-8001-0002',
    bio: '욕실 타일 리모델링 전문가입니다.',
    currentLatitude: 37.5145,
    currentLongitude: 127.1059,
    serviceArea: '송파구, 강동구',
    status: 'AVAILABLE',
    rating: 4.7,
    reviewCount: 167,
    acceptanceRate: 94.5,
    ontimeRate: 96.0,
    complaintRate: 1.8,
    completedJobs: 183,
    skills: ['타일']
  },
  {
    id: crypto.randomUUID(),
    email: 'tile3@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '박줄눈',
    phone: '010-8001-0003',
    bio: '줄눈 시공 및 보수 전문가입니다.',
    currentLatitude: 37.5665,
    currentLongitude: 126.9780,
    serviceArea: '마포구, 용산구',
    status: 'ONLINE',
    rating: 4.6,
    reviewCount: 145,
    acceptanceRate: 93.0,
    ontimeRate: 94.5,
    complaintRate: 2.5,
    completedJobs: 161,
    skills: ['타일']
  },
  {
    id: crypto.randomUUID(),
    email: 'tile4@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '최바닥',
    phone: '010-8001-0004',
    bio: '바닥 타일 및 현관 타일 전문가입니다.',
    currentLatitude: 37.4979,
    currentLongitude: 127.0276,
    serviceArea: '서초구, 강남구',
    status: 'AVAILABLE',
    rating: 4.9,
    reviewCount: 223,
    acceptanceRate: 98.0,
    ontimeRate: 98.5,
    complaintRate: 0.8,
    completedJobs: 241,
    skills: ['타일']
  },

  // === 전자제품 전문가 (3명) ===
  {
    id: crypto.randomUUID(),
    email: 'elec_appliance1@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '김가전',
    phone: '010-9001-0001',
    bio: '가전제품 수리 및 설치 전문가입니다.',
    currentLatitude: 37.5172,
    currentLongitude: 127.0473,
    serviceArea: '강남구, 서초구, 송파구',
    status: 'ONLINE',
    rating: 4.8,
    reviewCount: 201,
    acceptanceRate: 96.5,
    ontimeRate: 97.5,
    complaintRate: 1.2,
    completedJobs: 218,
    skills: ['전자제품']
  },
  {
    id: crypto.randomUUID(),
    email: 'elec_appliance2@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '이세탁기',
    phone: '010-9001-0002',
    bio: '세탁기, 건조기 수리 전문가입니다.',
    currentLatitude: 37.5665,
    currentLongitude: 126.9780,
    serviceArea: '마포구, 용산구',
    status: 'AVAILABLE',
    rating: 4.7,
    reviewCount: 167,
    acceptanceRate: 94.5,
    ontimeRate: 96.0,
    complaintRate: 1.8,
    completedJobs: 183,
    skills: ['전자제품']
  },
  {
    id: crypto.randomUUID(),
    email: 'elec_appliance3@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '박냉장고',
    phone: '010-9001-0003',
    bio: '냉장고, 김치냉장고 수리 전문가입니다.',
    currentLatitude: 37.5443,
    currentLongitude: 127.0557,
    serviceArea: '성동구, 광진구',
    status: 'ONLINE',
    rating: 4.9,
    reviewCount: 234,
    acceptanceRate: 98.0,
    ontimeRate: 98.5,
    complaintRate: 0.8,
    completedJobs: 251,
    skills: ['전자제품']
  },

  // === 종합수리 전문가 (3명) ===
  {
    id: crypto.randomUUID(),
    email: 'general1@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '김만능',
    phone: '010-9999-0001',
    bio: '모든 종류의 집수리가 가능한 종합 전문가입니다.',
    currentLatitude: 37.5172,
    currentLongitude: 127.0473,
    serviceArea: '강남구, 서초구, 송파구',
    status: 'ONLINE',
    rating: 4.8,
    reviewCount: 312,
    acceptanceRate: 97.0,
    ontimeRate: 97.5,
    complaintRate: 1.2,
    completedJobs: 345,
    skills: ['종합수리', '전기', '배관/수도']
  },
  {
    id: crypto.randomUUID(),
    email: 'general2@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '이올라운드',
    phone: '010-9999-0002',
    bio: '긴급 수리 및 종합 관리 전문가입니다.',
    currentLatitude: 37.5665,
    currentLongitude: 126.9780,
    serviceArea: '마포구, 용산구, 서대문구',
    status: 'AVAILABLE',
    rating: 4.7,
    reviewCount: 223,
    acceptanceRate: 95.0,
    ontimeRate: 96.0,
    complaintRate: 1.8,
    completedJobs: 245,
    skills: ['종합수리', '목공', '전기']
  },
  {
    id: crypto.randomUUID(),
    email: 'general3@mahasuri.com',
    password: bcrypt.hashSync('password123', 10),
    name: '박종합',
    phone: '010-9999-0003',
    bio: '아파트 종합 수리 전문가입니다.',
    currentLatitude: 37.5443,
    currentLongitude: 127.0557,
    serviceArea: '성동구, 광진구, 중랑구',
    status: 'ONLINE',
    rating: 4.6,
    reviewCount: 189,
    acceptanceRate: 92.5,
    ontimeRate: 94.5,
    complaintRate: 2.5,
    completedJobs: 207,
    skills: ['종합수리', '배관/수도', '목공']
  }
];

const insertTechStmt = db.prepare(`
  INSERT INTO Technician (
    id, email, password, name, phone, bio,
    currentLatitude, currentLongitude, serviceArea, status,
    rating, reviewCount, acceptanceRate, ontimeRate, complaintRate, completedJobs
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertSkillStmt = db.prepare(`
  INSERT INTO TechnicianSkill (id, technicianId, serviceId, skillLevel)
  VALUES (?, ?, ?, ?)
`);

let addedCount = 0;
let skillsCount = 0;

for (const tech of sampleTechnicians) {
  try {
    insertTechStmt.run(
      tech.id,
      tech.email,
      tech.password,
      tech.name,
      tech.phone,
      tech.bio,
      tech.currentLatitude,
      tech.currentLongitude,
      tech.serviceArea,
      tech.status,
      tech.rating,
      tech.reviewCount,
      tech.acceptanceRate,
      tech.ontimeRate,
      tech.complaintRate,
      tech.completedJobs
    );
    addedCount++;

    // Add skills for this technician
    for (const skillName of tech.skills) {
      const serviceIds = skillServiceMap[skillName] || [];
      for (const serviceId of serviceIds) {
        try {
          insertSkillStmt.run(crypto.randomUUID(), tech.id, serviceId, 3); // skillLevel = 3
          skillsCount++;
        } catch (skillError) {
          // Skip duplicate skills
        }
      }
    }

    console.log(`✅ Added: ${tech.name} (${tech.email}) - ${tech.skills.join(', ')} (${skillServiceMap[tech.skills[0]]?.length || 0} services)`);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.log(`⚠️  Skipped: ${tech.email} (already exists)`);
    } else {
      console.error(`❌ Error adding ${tech.name}:`, error.message);
    }
  }
}

console.log(`\n🎉 Successfully added ${addedCount} technicians with ${skillsCount} skills!`);
console.log('\n📋 Summary by Category:');
console.log('   - 전기: 8명');
console.log('   - 배관/수도: 8명');
console.log('   - 에어컨: 6명');
console.log('   - 도배: 5명');
console.log('   - 목공: 5명');
console.log('   - 샷시/유리: 4명');
console.log('   - 보일러: 4명');
console.log('   - 타일: 4명');
console.log('   - 전자제품: 3명');
console.log('   - 종합수리: 3명');
console.log('\n🔧 You can now test the matching system with diverse technicians!');

db.close();
