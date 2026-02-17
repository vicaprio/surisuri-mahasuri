# 배포 가이드

홈케어X 플랫폼을 프로덕션 환경에 배포하는 방법을 안내합니다.

## 목차
1. [백엔드 배포 (Railway)](#1-백엔드-배포-railway)
2. [프론트엔드 배포 (Cloudflare Pages)](#2-프론트엔드-배포-cloudflare-pages)
3. [OAuth 설정](#3-oauth-설정)
4. [환경 변수 설정](#4-환경-변수-설정)

---

## 1. 백엔드 배포 (Railway)

### 1.1 Railway 계정 생성
1. [Railway](https://railway.app/) 접속
2. "Start a New Project" 또는 "Login with GitHub" 클릭
3. GitHub 계정으로 로그인

### 1.2 새 프로젝트 생성
1. Railway 대시보드에서 "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. 이 저장소 선택: `vicaprio/surisuri-mahasuri`
4. "Deploy Now" 클릭

### 1.3 백엔드 설정
1. 배포된 서비스를 클릭
2. Settings 탭으로 이동
3. **Root Directory** 설정: `backend`
4. **Start Command** 확인: `npm start` (자동 감지됨)
5. **Build Command** 확인: `npm install` (자동 감지됨)

### 1.4 환경 변수 설정
Settings > Variables 섹션에서 다음 환경 변수를 추가:

```bash
# 필수 환경 변수
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-recommended
DATABASE_URL=file:./dev.db

# Kakao OAuth (선택사항)
KAKAO_CLIENT_ID=your-kakao-rest-api-key
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_REDIRECT_URI=https://your-domain.pages.dev/oauth/kakao/callback

# Naver OAuth (선택사항)
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
NAVER_REDIRECT_URI=https://your-domain.pages.dev/oauth/naver/callback

# Google OAuth (선택사항)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.pages.dev/oauth/google/callback
```

### 1.5 데이터베이스 초기화
Railway Shell에서 다음 명령어 실행:

```bash
node scripts/init-db.js
node scripts/seed.js
```

또는 Railway의 "Shell" 탭에서 실행 가능합니다.

### 1.6 도메인 확인
1. Settings 탭에서 "Generate Domain" 클릭
2. 생성된 도메인 복사 (예: `surisuri-mahasuri-production.up.railway.app`)
3. 이 URL이 백엔드 API URL입니다

---

## 2. 프론트엔드 배포 (Cloudflare Pages)

### 2.1 Cloudflare Pages 설정 확인
현재 설정이 올바른지 확인:

- **Build command**: `npm run build:cloudflare`
- **Build output directory**: `web/dist`
- **Root directory**: (비워두기)

### 2.2 환경 변수 설정
Settings > Environment variables에서 **Production** 환경에 다음 변수 추가:

```bash
# 필수: Railway에서 생성된 백엔드 URL
VITE_API_URL=https://your-backend.up.railway.app/api

# OAuth (선택사항)
VITE_KAKAO_CLIENT_ID=your-kakao-javascript-key
VITE_NAVER_CLIENT_ID=your-naver-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 2.3 재배포
환경 변수 추가 후:
1. Deployments 탭으로 이동
2. 최신 배포를 찾아 "Retry deployment" 클릭
3. 또는 GitHub에 새로 커밋하면 자동 배포됨

### 2.4 도메인 확인
배포 완료 후 도메인 확인 (예: `https://surisuri-mahasuri.pages.dev`)

---

## 3. OAuth 설정

프로덕션 도메인으로 OAuth 리다이렉트 URI를 업데이트해야 합니다.

### 3.1 Cloudflare Pages 도메인 확인
예시: `https://surisuri-mahasuri.pages.dev`

### 3.2 카카오 개발자 센터
1. [카카오 개발자 센터](https://developers.kakao.com/) 접속
2. 앱 설정 > 플랫폼 > Web 플랫폼에 추가:
   ```
   https://surisuri-mahasuri.pages.dev
   ```
3. 제품 설정 > 카카오 로그인 > Redirect URI에 추가:
   ```
   https://surisuri-mahasuri.pages.dev/oauth/kakao/callback
   ```

### 3.3 네이버 개발자 센터
1. [네이버 개발자 센터](https://developers.naver.com/) 접속
2. 애플리케이션 설정에서 Callback URL 추가:
   ```
   https://surisuri-mahasuri.pages.dev/oauth/naver/callback
   ```

### 3.4 Google Cloud Console
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

## 4. 환경 변수 설정 요약

### Railway (백엔드)
```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=file:./dev.db
KAKAO_CLIENT_ID=xxx
KAKAO_CLIENT_SECRET=xxx
KAKAO_REDIRECT_URI=https://surisuri-mahasuri.pages.dev/oauth/kakao/callback
NAVER_CLIENT_ID=xxx
NAVER_CLIENT_SECRET=xxx
NAVER_REDIRECT_URI=https://surisuri-mahasuri.pages.dev/oauth/naver/callback
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://surisuri-mahasuri.pages.dev/oauth/google/callback
```

### Cloudflare Pages (프론트엔드)
```bash
VITE_API_URL=https://your-backend.up.railway.app/api
VITE_KAKAO_CLIENT_ID=xxx
VITE_NAVER_CLIENT_ID=xxx
VITE_GOOGLE_CLIENT_ID=xxx
```

---

## 5. 배포 확인

### 5.1 백엔드 Health Check
브라우저에서 접속:
```
https://your-backend.up.railway.app/health
```

응답:
```json
{
  "status": "OK",
  "timestamp": "2024-02-17T...",
  "uptime": 123.456
}
```

### 5.2 프론트엔드 확인
브라우저에서 접속:
```
https://surisuri-mahasuri.pages.dev
```

홈 페이지가 정상적으로 로드되어야 합니다.

### 5.3 API 연결 확인
프론트엔드에서 로그인 시도하여 백엔드와 연결 확인

---

## 6. 문제 해결

### CORS 오류
백엔드의 CORS 설정이 `.pages.dev` 도메인을 허용하는지 확인
- `backend/src/index.js`의 CORS 설정 확인

### OAuth 실패
1. OAuth 콜백 URL이 정확히 등록되었는지 확인
2. 클라이언트 ID/Secret이 환경 변수에 올바르게 설정되었는지 확인
3. 브라우저 개발자 도구 > Network 탭에서 오류 확인

### 데이터베이스 오류
Railway Shell에서 데이터베이스 재초기화:
```bash
rm dev.db
node scripts/init-db.js
node scripts/seed.js
```

---

## 7. 다음 단계

### 커스텀 도메인 설정 (선택사항)
1. Cloudflare Pages에서 Custom domains 추가
2. DNS 레코드 설정
3. OAuth 리다이렉트 URI를 커스텀 도메인으로 업데이트

### 모니터링 설정
- Railway: 자동 로그 수집 및 메트릭 제공
- Cloudflare Pages: Analytics 활성화

### 백업 설정
- Railway: 데이터베이스 정기 백업 설정
- GitHub: 코드 자동 백업

---

배포 완료! 🎉
