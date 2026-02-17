# 홈케어X - AI 기반 정찰제 집수리 플랫폼

투명한 집수리 플랫폼으로, 사진 기반 AI 견적 산출과 2시간 SLA 보장 기사님 매칭을 제공합니다.

## 🚀 빠른 시작

### 백엔드 실행

```bash
cd backend
npm install
node scripts/init-db.js  # 데이터베이스 초기화
node scripts/seed.js      # 테스트 데이터 생성
npm run dev               # 서버 시작 (http://localhost:3001)
```

### 프론트엔드 실행

```bash
cd web
npm install
npm run dev               # 앱 시작 (http://localhost:5173)
```

## 📝 테스트 계정

> ⚠️ **로컬 개발 환경 전용** - 프로덕션에서는 사용하지 마세요!

| 구분 | Email | Password |
|------|-------|----------|
| 일반 사용자 | user@test.com | `password123` |
| 기업 사용자 | company@test.com | `password123` |
| 기사님 (전기) | tech1@test.com | `password123` |
| 기사님 (배관) | tech2@test.com | `password123` |

**보안 참고사항:**
- 이 계정들은 로컬 개발 환경(`localhost`)에서만 사용하세요
- 프로덕션 배포 시 별도의 계정을 생성하세요
- 실제 서비스에서는 강력한 비밀번호를 사용하세요

## ✨ 주요 기능

- ✅ **AI 견적 산출** - 사진 업로드 기반
- ✅ **2시간 SLA 매칭** - 자동 기사님 배정
- ✅ **정찰제 서비스** - 36개 사전 정의된 서비스
- ✅ **디지털 보증서** - 자동 발행
- ✅ **B2B 지원** - 건물/유닛 관리
- ✅ **실시간 대시보드** - 기사님용
- ✅ **이미지 업로드** - 다중 이미지 업로드 및 관리

## 🏗️ 기술 스택

**Frontend**: React 19, Tailwind CSS, React Router, Axios  
**Backend**: Node.js, Express, SQLite, JWT  
**Database**: 10개 테이블, 36개 서비스 데이터

## 📊 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입

### 서비스
- `GET /api/services` - 서비스 목록
- `GET /api/services/:id` - 서비스 상세

### 견적 요청
- `POST /api/service-requests` - 견적 요청 생성
- `GET /api/service-requests` - 내 요청 목록
- `GET /api/service-requests/:id` - 요청 상세
- `POST /api/service-requests/:id/cancel` - 요청 취소

### 파일 업로드
- `POST /api/upload/single` - 단일 이미지 업로드 (최대 5MB)
- `POST /api/upload/multiple` - 다중 이미지 업로드 (최대 5개, 각 5MB)
- 지원 형식: jpeg, jpg, png, gif, webp

자세한 내용은 http://localhost:3001 참조

## 🔐 보안 가이드

### 프로덕션 배포 시 주의사항

1. **환경 변수 설정**
   - `.env` 파일을 절대 커밋하지 마세요
   - Cloudflare Pages 환경 변수에서 설정하세요

2. **테스트 계정 삭제**
   - 프로덕션 DB에서 테스트 계정을 제거하세요
   - 실제 사용자만 접근 가능하도록 설정하세요

3. **비밀번호 정책**
   - 최소 8자 이상
   - 영문, 숫자, 특수문자 조합
   - bcrypt로 해싱 (이미 적용됨)

4. **API 키 보호**
   - JWT Secret은 강력한 랜덤 문자열 사용
   - 환경 변수로만 관리

---

Made with ❤️ by Claude Code
