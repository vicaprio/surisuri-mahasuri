# Cloudflare 배포 가이드

홈케어X 플랫폼을 Cloudflare 생태계(Workers + Pages)에 배포하는 방법입니다.

## 📋 목차
1. [사전 준비](#1-사전-준비)
2. [백엔드 배포 (Cloudflare Workers)](#2-백엔드-배포-cloudflare-workers)
3. [프론트엔드 배포 (Cloudflare Pages)](#3-프론트엔드-배포-cloudflare-pages)
4. [OAuth 설정](#4-oauth-설정)
5. [테스트 및 확인](#5-테스트-및-확인)

---

## 1. 사전 준비

### 1.1 Cloudflare 계정
- [Cloudflare](https://dash.cloudflare.com/) 가입 (무료 플랜 사용 가능)

### 1.2 Wrangler CLI 설치
```bash
npm install -g wrangler
```

### 1.3 Wrangler 로그인
```bash
wrangler login
```

브라우저가 열리면 Cloudflare 계정으로 로그인하세요.

---

## 2. 백엔드 배포 (Cloudflare Workers)

### 2.1 D1 데이터베이스 생성

```bash
cd workers
wrangler d1 create surisuri-mahasuri-db
```

출력 예시:
```
✅ Successfully created DB 'surisuri-mahasuri-db'

[[d1_databases]]
binding = "DB"
database_name = "surisuri-mahasuri-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2.2 wrangler.toml 업데이트

`workers/wrangler.toml` 파일에서 `database_id`를 위에서 받은 ID로 업데이트:

```toml
[[d1_databases]]
binding = "DB"
database_name = "surisuri-mahasuri-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 여기에 실제 ID 입력
```

### 2.3 데이터베이스 스키마 실행

```bash
# 로컬 개발용 (선택사항)
wrangler d1 execute surisuri-mahasuri-db --file=./schema.sql

# 프로덕션용 (필수)
wrangler d1 execute surisuri-mahasuri-db --remote --file=./schema.sql
```

### 2.4 환경 변수 (Secrets) 설정

```bash
# JWT Secret
wrangler secret put JWT_SECRET
# 입력: 강력한 랜덤 문자열 (최소 32자)

# Kakao OAuth (선택사항)
wrangler secret put KAKAO_CLIENT_ID
wrangler secret put KAKAO_CLIENT_SECRET

# Naver OAuth (선택사항)
wrangler secret put NAVER_CLIENT_ID
wrangler secret put NAVER_CLIENT_SECRET

# Google OAuth (선택사항)
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
```

### 2.5 Workers 배포

```bash
npm run deploy
```

또는

```bash
wrangler deploy
```

### 2.6 배포된 URL 확인

출력 예시:
```
✨ Your worker has been published!
🌍 https://surisuri-mahasuri-api.your-subdomain.workers.dev
```

이 URL이 백엔드 API 주소입니다. **메모해두세요!**

---

## 3. 프론트엔드 배포 (Cloudflare Pages)

### 3.1 GitHub 연동 확인

이미 Cloudflare Pages가 GitHub 저장소와 연동되어 있으므로, 환경 변수만 업데이트하면 됩니다.

### 3.2 환경 변수 설정

Cloudflare Pages 대시보드:
1. Workers & Pages > surisuri-mahasuri > Settings
2. Environment variables 섹션
3. **Production** 탭 선택
4. 다음 변수 추가:

```bash
# 필수: Workers에서 받은 백엔드 URL
VITE_API_URL=https://surisuri-mahasuri-api.your-subdomain.workers.dev/api

# OAuth (선택사항)
VITE_KAKAO_CLIENT_ID=your-kakao-javascript-key
VITE_NAVER_CLIENT_ID=your-naver-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

⚠️ **중요**: `VITE_API_URL`은 반드시 `/api`로 끝나야 합니다!

### 3.3 빌드 설정 확인

Settings > Builds and deployments:
- **Build command**: `npm run build:cloudflare`
- **Build output directory**: `web/dist`
- **Root directory**: (비워두기)

### 3.4 재배포

Deployments 탭에서:
1. 최신 배포의 "..." 메뉴 클릭
2. "Retry deployment" 클릭

또는 GitHub에 새로 커밋하면 자동 배포됩니다.

### 3.5 배포된 URL 확인

예시: `https://surisuri-mahasuri.pages.dev`

---

## 4. OAuth 설정

프로덕션 도메인으로 OAuth 리다이렉트 URI를 업데이트해야 합니다.

### 4.1 도메인 확인
- Frontend: `https://surisuri-mahasuri.pages.dev`
- Backend: `https://surisuri-mahasuri-api.your-subdomain.workers.dev`

### 4.2 카카오 개발자 센터

1. [카카오 개발자 센터](https://developers.kakao.com/) 접속
2. 앱 설정 > 플랫폼 > Web 플랫폼에 추가:
   ```
   https://surisuri-mahasuri.pages.dev
   ```
3. 제품 설정 > 카카오 로그인 > Redirect URI에 추가:
   ```
   https://surisuri-mahasuri.pages.dev/oauth/kakao/callback
   ```

### 4.3 네이버 개발자 센터

1. [네이버 개발자 센터](https://developers.naver.com/) 접속
2. 애플리케이션 설정:
   - **서비스 URL**: `https://surisuri-mahasuri.pages.dev`
   - **Callback URL**: `https://surisuri-mahasuri.pages.dev/oauth/naver/callback`

### 4.4 Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. API 및 서비스 > 사용자 인증 정보
3. OAuth 클라이언트 ID 편집
4. 승인된 자바스크립트 원본 추가:
   ```
   https://surisuri-mahasuri.pages.dev
   ```
5. 승인된 리디렉션 URI 추가:
   ```
   https://surisuri-mahasuri.pages.dev/oauth/google/callback
   ```

---

## 5. 테스트 및 확인

### 5.1 백엔드 Health Check

```bash
curl https://surisuri-mahasuri-api.your-subdomain.workers.dev/health
```

응답:
```json
{
  "status": "OK",
  "timestamp": "2024-02-17T..."
}
```

### 5.2 프론트엔드 확인

브라우저에서 접속:
```
https://surisuri-mahasuri.pages.dev
```

### 5.3 소셜 로그인 테스트

1. 로그인 페이지로 이동
2. 사용자/기사님 타입 선택
3. 소셜 로그인 버튼 클릭
4. 로그인 성공 확인

---

## 6. 데이터 시딩 (선택사항)

샘플 데이터를 추가하려면:

### 6.1 시드 스크립트 생성

`workers/seed.sql` 파일 생성:

```sql
-- 샘플 서비스 추가
INSERT INTO services (id, code, name, description, category, difficulty, estimated_duration, base_price, is_active)
VALUES
  ('service-1', 'ELECTRIC-001', '전기 수리', '일반 전기 수리 서비스', '전기', 'MEDIUM', 60, 50000, 1),
  ('service-2', 'PLUMBING-001', '배관 수리', '일반 배관 수리 서비스', '배관', 'MEDIUM', 90, 70000, 1);

-- 더 많은 데이터 추가...
```

### 6.2 시드 실행

```bash
wrangler d1 execute surisuri-mahasuri-db --remote --file=./seed.sql
```

---

## 7. 모니터링 및 로그

### 7.1 로그 확인

```bash
cd workers
wrangler tail
```

실시간 로그를 볼 수 있습니다.

### 7.2 Cloudflare 대시보드

- Workers & Pages > surisuri-mahasuri-api > Metrics
- 요청 수, 오류율, 응답 시간 등을 확인할 수 있습니다

---

## 8. 비용

### Cloudflare Workers (백엔드)
- **무료 플랜**: 10만 요청/일
- **유료 플랜** ($5/월): 1000만 요청/월

### Cloudflare D1 (데이터베이스)
- **무료 플랜**:
  - 5GB 스토리지
  - 500만 읽기/일
  - 10만 쓰기/일

### Cloudflare Pages (프론트엔드)
- **무료 플랜**: 무제한 요청
- 500 빌드/월

대부분의 소규모 프로젝트는 **완전 무료**로 운영 가능합니다!

---

## 9. 문제 해결

### Workers 배포 실패

```bash
# 로그 확인
wrangler tail

# 로컬에서 테스트
wrangler dev
```

### D1 데이터베이스 초기화

```bash
# 모든 테이블 삭제 (주의!)
wrangler d1 execute surisuri-mahasuri-db --remote --command "DROP TABLE IF EXISTS users"

# 스키마 재실행
wrangler d1 execute surisuri-mahasuri-db --remote --file=./schema.sql
```

### CORS 오류

`workers/src/middleware/cors.js`에서 도메인 패턴 확인

---

## 10. 다음 단계

### 커스텀 도메인 (선택사항)

1. Cloudflare에 도메인 추가
2. Pages에서 Custom domains 설정
3. Workers에서 Routes 설정
4. OAuth 리다이렉트 URI 업데이트

### 추가 기능 구현

아직 구현되지 않은 라우트들:
- Service Requests (견적 요청)
- Technicians (기사님 관리)
- Payments (결제)
- Warranties (보증서)
- Reviews (리뷰)

기존 Express 코드를 참고하여 Hono로 마이그레이션하면 됩니다.

---

배포 완료! 🎉

모든 것이 Cloudflare 생태계 안에서 작동하며, 비용 효율적이고 확장 가능합니다.
