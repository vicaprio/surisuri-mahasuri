# OAuth 소셜 로그인 설정 가이드

홈케어X에서 카카오, 네이버, 구글 소셜 로그인을 사용하기 위한 설정 가이드입니다.

## 1. 카카오 로그인 설정

### 1.1 카카오 개발자 센터에서 앱 생성
1. [카카오 개발자 센터](https://developers.kakao.com/) 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 앱 이름, 사업자명 입력 후 저장

### 1.2 플랫폼 설정
1. 앱 설정 > 플랫폼 > Web 플랫폼 등록
2. 사이트 도메인 입력:
   ```
   https://5173-firebase-surisuri-mahasuri-1771240128104.cluster-bqwaigqtxbeautecnatk4o6ynk.cloudworkstations.dev
   ```

### 1.3 Redirect URI 설정
1. 제품 설정 > 카카오 로그인 > Redirect URI 등록
2. Redirect URI 입력:
   ```
   https://5173-firebase-surisuri-mahasuri-1771240128104.cluster-bqwaigqtxbeautecnatk4o6ynk.cloudworkstations.dev/oauth/kakao/callback
   ```

### 1.4 동의항목 설정
1. 제품 설정 > 카카오 로그인 > 동의항목
2. 필수 동의항목 설정:
   - 닉네임
   - 프로필 사진
   - 카카오계정(이메일)

### 1.5 환경 변수 설정
**Backend (.env):**
```bash
KAKAO_CLIENT_ID=your-kakao-rest-api-key
KAKAO_REDIRECT_URI=https://5173-firebase-surisuri-mahasuri-1771240128104.cluster-bqwaigqtxbeautecnatk4o6ynk.cloudworkstations.dev/oauth/kakao/callback
```

**Frontend (web/.env):**
```bash
VITE_KAKAO_CLIENT_ID=your-kakao-javascript-key
```

---

## 2. 네이버 로그인 설정

### 2.1 네이버 개발자 센터에서 앱 생성
1. [네이버 개발자 센터](https://developers.naver.com/) 접속
2. Application > 애플리케이션 등록
3. 애플리케이션 이름 입력
4. 사용 API: 네이버 로그인 선택

### 2.2 서비스 URL 및 Callback URL 설정
**서비스 URL:**
```
https://5173-firebase-surisuri-mahasuri-1771240128104.cluster-bqwaigqtxbeautecnatk4o6ynk.cloudworkstations.dev
```

**Callback URL:**
```
https://5173-firebase-surisuri-mahasuri-1771240128104.cluster-bqwaigqtxbeautecnatk4o6ynk.cloudworkstations.dev/oauth/naver/callback
```

### 2.3 제공 정보 선택
- 회원이름
- 이메일 주소
- 프로필 사진
- 휴대전화번호

### 2.4 환경 변수 설정
**Backend (.env):**
```bash
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
NAVER_REDIRECT_URI=https://5173-firebase-surisuri-mahasuri-1771240128104.cluster-bqwaigqtxbeautecnatk4o6ynk.cloudworkstations.dev/oauth/naver/callback
```

**Frontend (web/.env):**
```bash
VITE_NAVER_CLIENT_ID=your-naver-client-id
```

---

## 3. 구글 로그인 설정

### 3.1 Google Cloud Console에서 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 만들기
3. 프로젝트 이름 입력 후 생성

### 3.2 OAuth 2.0 클라이언트 ID 생성
1. API 및 서비스 > OAuth 동의 화면
2. User Type: 외부 선택
3. 앱 정보 입력 (앱 이름, 사용자 지원 이메일 등)
4. 범위 추가:
   - .../auth/userinfo.email
   - .../auth/userinfo.profile
   - openid

### 3.3 사용자 인증 정보 만들기
1. API 및 서비스 > 사용자 인증 정보
2. 사용자 인증 정보 만들기 > OAuth 클라이언트 ID
3. 애플리케이션 유형: 웹 애플리케이션
4. 승인된 자바스크립트 원본:
   ```
   https://5173-firebase-surisuri-mahasuri-1771240128104.cluster-bqwaigqtxbeautecnatk4o6ynk.cloudworkstations.dev
   ```
5. 승인된 리디렉션 URI:
   ```
   https://5173-firebase-surisuri-mahasuri-1771240128104.cluster-bqwaigqtxbeautecnatk4o6ynk.cloudworkstations.dev/oauth/google/callback
   ```

### 3.4 환경 변수 설정
**Backend (.env):**
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://5173-firebase-surisuri-mahasuri-1771240128104.cluster-bqwaigqtxbeautecnatk4o6ynk.cloudworkstations.dev/oauth/google/callback
```

**Frontend (web/.env):**
```bash
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 4. 서버 재시작

환경 변수 설정 후 백엔드와 프론트엔드 서버를 재시작해야 합니다:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd web
npm run dev
```

---

## 5. 테스트

1. 로그인 페이지로 이동
2. 사용자 타입 선택 (일반 사용자만 소셜 로그인 가능)
3. "카카오로 시작하기", "네이버로 시작하기", "구글로 시작하기" 버튼 클릭
4. 각 플랫폼에서 로그인 및 동의
5. 자동으로 홈케어X에 로그인됨

---

## 주의사항

1. **로컬 개발 환경**: localhost로 개발 시 각 플랫폼의 개발자 센터에서 `http://localhost:5173`도 등록해야 합니다.

2. **프로덕션 환경**: 실제 도메인으로 배포 시 모든 Redirect URI를 프로덕션 도메인으로 변경해야 합니다.

3. **보안**: Client Secret은 절대 프론트엔드에 노출하면 안 됩니다. 반드시 백엔드 환경 변수에만 저장하세요.

4. **이메일 중복**: 이미 일반 로그인으로 가입된 이메일은 소셜 로그인으로 가입할 수 없습니다.

---

## API 엔드포인트

소셜 로그인 API 엔드포인트:

- **카카오**: `POST /api/oauth/kakao`
- **네이버**: `POST /api/oauth/naver`
- **구글**: `POST /api/oauth/google`

요청 예시:
```json
{
  "code": "authorization_code_from_oauth_provider",
  "state": "state_for_naver_only"
}
```

응답 예시:
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "홍길동",
      "userType": "GENERAL",
      "profilePhoto": "https://..."
    },
    "token": "jwt-token"
  }
}
```
