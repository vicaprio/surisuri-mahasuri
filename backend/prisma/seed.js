require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// 50개 정찰제 서비스 데이터
const services = [
  // 전기/조명 (ELECTRICAL) - 10개
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

  // 배관/수도 (PLUMBING) - 10개
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

  // 도배/장판 (WALLPAPER) - 10개
  { code: 'WP-001', name: '벽지 부분 보수', category: 'WALLPAPER', difficulty: 'A', duration: 45, price: 50000 },
  { code: 'WP-002', name: '장판 부분 보수', category: 'WALLPAPER', difficulty: 'A', duration: 45, price: 50000 },
  { code: 'WP-003', name: '방 1개 도배', category: 'WALLPAPER', difficulty: 'C', duration: 240, price: 350000 },
  { code: 'WP-004', name: '방 1개 장판', category: 'WALLPAPER', difficulty: 'C', duration: 180, price: 300000 },
  { code: 'WP-005', name: '거실 도배', category: 'WALLPAPER', difficulty: 'C', duration: 360, price: 500000 },
  { code: 'WP-006', name: '현관 타일 보수', category: 'WALLPAPER', difficulty: 'B', duration: 120, price: 150000 },
  { code: 'WP-007', name: '벽 페인트 칠', category: 'WALLPAPER', difficulty: 'B', duration: 180, price: 200000 },
  { code: 'WP-008', name: '몰딩 설치', category: 'WALLPAPER', difficulty: 'B', duration: 90, price: 120000 },
  { code: 'WP-009', name: '벽지 전체 교체', category: 'WALLPAPER', difficulty: 'C', duration: 360, price: 800000, slaAvailable: false },
  { code: 'WP-010', name: '장판 전체 교체', category: 'WALLPAPER', difficulty: 'C', duration: 300, price: 700000, slaAvailable: false },

  // 에어컨 (AIRCON) - 10개
  { code: 'AC-001', name: '에어컨 필터 청소', category: 'AIRCON', difficulty: 'A', duration: 30, price: 40000 },
  { code: 'AC-002', name: '에어컨 기본 청소', category: 'AIRCON', difficulty: 'B', duration: 90, price: 80000 },
  { code: 'AC-003', name: '에어컨 분해 청소', category: 'AIRCON', difficulty: 'C', duration: 180, price: 150000 },
  { code: 'AC-004', name: '벽걸이 에어컨 설치', category: 'AIRCON', difficulty: 'C', duration: 120, price: 120000 },
  { code: 'AC-005', name: '스탠드 에어컨 설치', category: 'AIRCON', difficulty: 'C', duration: 90, price: 100000 },
  { code: 'AC-006', name: '에어컨 실외기 청소', category: 'AIRCON', difficulty: 'B', duration: 60, price: 60000 },
  { code: 'AC-007', name: '에어컨 가스 충전', category: 'AIRCON', difficulty: 'B', duration: 60, price: 80000 },
  { code: 'AC-008', name: '에어컨 이전 설치', category: 'AIRCON', difficulty: 'C', duration: 180, price: 200000 },
  { code: 'AC-009', name: '에어컨 배수 호스 교체', category: 'AIRCON', difficulty: 'A', duration: 45, price: 50000 },
  { code: 'AC-010', name: '에어컨 점검 및 수리', category: 'AIRCON', difficulty: 'B', duration: 90, price: 100000 },

  // 목공/가구 (CARPENTRY) - 5개
  { code: 'CA-001', name: '문틀 수리', category: 'CARPENTRY', difficulty: 'B', duration: 90, price: 90000 },
  { code: 'CA-002', name: '방문 교체', category: 'CARPENTRY', difficulty: 'C', duration: 120, price: 180000 },
  { code: 'CA-003', name: '싱크대 서랍 수리', category: 'CARPENTRY', difficulty: 'B', duration: 60, price: 70000 },
  { code: 'CA-004', name: '붙박이장 선반 수리', category: 'CARPENTRY', difficulty: 'B', duration: 75, price: 80000 },
  { code: 'CA-005', name: '가구 조립', category: 'CARPENTRY', difficulty: 'B', duration: 90, price: 85000 },

  // 기타수리 (GENERAL) - 5개
  { code: 'GE-001', name: '방충망 교체', category: 'GENERAL', difficulty: 'A', duration: 30, price: 40000 },
  { code: 'GE-002', name: '현관문 잠금장치 교체', category: 'GENERAL', difficulty: 'B', duration: 60, price: 70000 },
  { code: 'GE-003', name: '블라인드 설치', category: 'GENERAL', difficulty: 'A', duration: 45, price: 50000 },
  { code: 'GE-004', name: '커튼 레일 설치', category: 'GENERAL', difficulty: 'A', duration: 45, price: 50000 },
  { code: 'GE-005', name: '벽 선반 설치', category: 'GENERAL', difficulty: 'B', duration: 60, price: 60000 },
];

async function main() {
  console.log('🌱 Starting seed...');

  // 1. 서비스 생성
  console.log('Creating services...');
  for (const service of services) {
    await prisma.service.upsert({
      where: { code: service.code },
      update: {},
      create: {
        code: service.code,
        name: service.name,
        description: `${service.name} 서비스입니다.`,
        category: service.category,
        difficulty: service.difficulty,
        estimatedDuration: service.duration,
        basePrice: service.price,
        slaAvailable: service.slaAvailable !== false,
        warrantyDays: 365,
      },
    });
  }
  console.log(`✅ Created ${services.length} services`);

  // 2. 테스트 사용자 생성
  console.log('Creating test users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password: hashedPassword,
      name: '김일반',
      phone: '010-1234-5678',
      userType: 'GENERAL',
      status: 'ACTIVE',
    },
  });

  // 3. 테스트 회사 및 회사 사용자 생성
  const company = await prisma.company.upsert({
    where: { businessNumber: '123-45-67890' },
    update: {},
    create: {
      name: '테스트 부동산',
      businessNumber: '123-45-67890',
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      email: 'info@test-realty.com',
    },
  });

  const companyUser = await prisma.user.upsert({
    where: { email: 'company@test.com' },
    update: {},
    create: {
      email: 'company@test.com',
      password: hashedPassword,
      name: '박매니저',
      phone: '010-2345-6789',
      userType: 'COMPANY',
      companyId: company.id,
      status: 'ACTIVE',
    },
  });

  // 4. 테스트 건물 및 유닛 생성
  const building = await prisma.building.create({
    data: {
      name: '테스트빌딩',
      address: '서울시 강남구 역삼동 123-45',
      postalCode: '06234',
      companyId: company.id,
    },
  });

  await prisma.unit.createMany({
    data: [
      { unitNumber: '101호', floor: 1, area: 33.0, buildingId: building.id },
      { unitNumber: '102호', floor: 1, area: 33.0, buildingId: building.id },
      { unitNumber: '201호', floor: 2, area: 42.0, buildingId: building.id },
    ],
  });

  console.log('✅ Created test users and company');

  // 5. 테스트 기사님 생성
  console.log('Creating test technicians...');

  const electricalServices = await prisma.service.findMany({
    where: { category: 'ELECTRICAL' },
    take: 5,
  });

  const plumbingServices = await prisma.service.findMany({
    where: { category: 'PLUMBING' },
    take: 5,
  });

  const tech1 = await prisma.technician.upsert({
    where: { email: 'tech1@test.com' },
    update: {},
    create: {
      email: 'tech1@test.com',
      password: hashedPassword,
      name: '이기사',
      phone: '010-3456-7890',
      bio: '전기/조명 전문 기사입니다.',
      currentLatitude: 37.5015,
      currentLongitude: 127.0395,
      status: 'AVAILABLE',
      rating: 4.8,
      reviewCount: 150,
      acceptanceRate: 95,
      ontimeRate: 92,
      complaintRate: 2,
      completedJobs: 145,
    },
  });

  // 기사님 스킬 추가
  for (const service of electricalServices) {
    await prisma.technicianSkill.create({
      data: {
        technicianId: tech1.id,
        serviceId: service.id,
        skillLevel: service.difficulty === 'A' ? 5 : service.difficulty === 'B' ? 4 : 3,
      },
    });
  }

  const tech2 = await prisma.technician.upsert({
    where: { email: 'tech2@test.com' },
    update: {},
    create: {
      email: 'tech2@test.com',
      password: hashedPassword,
      name: '박배관',
      phone: '010-4567-8901',
      bio: '배관/수도 전문 기사입니다.',
      currentLatitude: 37.4979,
      currentLongitude: 127.0276,
      status: 'AVAILABLE',
      rating: 4.9,
      reviewCount: 200,
      acceptanceRate: 98,
      ontimeRate: 96,
      complaintRate: 1,
      completedJobs: 198,
    },
  });

  // 기사님 스킬 추가
  for (const service of plumbingServices) {
    await prisma.technicianSkill.create({
      data: {
        technicianId: tech2.id,
        serviceId: service.id,
        skillLevel: service.difficulty === 'A' ? 5 : service.difficulty === 'B' ? 4 : 3,
      },
    });
  }

  console.log('✅ Created 2 test technicians with skills');

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
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
