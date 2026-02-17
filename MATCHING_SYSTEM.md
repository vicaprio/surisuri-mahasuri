# 🔧 마하수리 자동 매칭 시스템

## 📋 개요

순차적 자동 매칭 방식으로 구현된 전문가 매칭 시스템입니다.

## 🎯 매칭 알고리즘

### 우선순위 점수 계산
각 기사님은 다음 기준으로 점수가 계산됩니다 (최대 450점):

1. **거리 점수** (0-100점)
   - 가까울수록 높은 점수
   - 공식: `(15 - 거리km) / 15 * 100`

2. **평점 점수** (0-100점)
   - 공식: `(평점 / 5) * 100`

3. **수락률 점수** (0-100점)
   - 과거 요청 수락률

4. **정시 도착률 점수** (0-50점)
   - 공식: `정시도착률 * 0.5`

5. **경험 점수** (0-50점)
   - 완료 건수 (최대 50점)

6. **불만 감점** (-점)
   - 공식: `-불만율 * 2`

### 매칭 플로우

```
[고객] AI 견적 완료
   ↓
[시스템] POST /api/matches/auto-match 호출
   ↓
[시스템] 1. 활성 기사님 조회 (ONLINE/AVAILABLE)
         2. 거리 필터링 (15km 이내)
         3. 전문 분야 매칭
         4. 우선순위 점수 계산 및 정렬
   ↓
[시스템] 1순위 기사님에게 매칭 생성 (PENDING)
         - 15분 타이머 시작
   ↓
[기사님] 알림 수신 (실제로는 푸시 알림/SMS)
   ↓
[분기점]
├─ [기사님] 수락 → ✅ 매칭 완료 (ACCEPTED)
│                  → ServiceRequest.technicianId 업데이트
│                  → ServiceRequest.status = 'ASSIGNED'
│
└─ [기사님] 거절/무응답 (15분 초과)
                  → 매칭 상태 = REJECTED/EXPIRED
                  → 2순위 기사님에게 자동 매칭
```

## 🗄️ 데이터베이스 스키마

### ServiceRequestMatch 테이블
```sql
CREATE TABLE ServiceRequestMatch (
  id TEXT PRIMARY KEY,
  service_request_id TEXT NOT NULL,
  technician_id TEXT NOT NULL,
  status TEXT NOT NULL,              -- PENDING, ACCEPTED, REJECTED, EXPIRED
  priority INTEGER DEFAULT 0,         -- 우선순위 점수
  notified_at TEXT NOT NULL,         -- 알림 전송 시간
  responded_at TEXT,                 -- 응답 시간
  expires_at TEXT NOT NULL,          -- 만료 시간 (15분 후)
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### Technician 테이블 (기존)
```sql
-- 주요 필드
currentLatitude REAL          -- 현재 위치 위도
currentLongitude REAL         -- 현재 위치 경도
status TEXT                   -- ONLINE, AVAILABLE, OFFLINE
rating REAL                   -- 평점
acceptanceRate REAL           -- 수락률
ontimeRate REAL              -- 정시 도착률
complaintRate REAL           -- 불만율
completedJobs INTEGER        -- 완료 건수
```

## 🛠️ API 엔드포인트

### 1. 자동 매칭 시작 (고객)
```http
POST /api/matches/auto-match
Authorization: Bearer {token}

Request Body:
{
  "serviceRequestId": "uuid"
}

Response:
{
  "success": true,
  "data": {
    "matchId": "uuid",
    "technicianId": "uuid",
    "technicianName": "김철수",
    "estimatedResponseTime": "15분 이내",
    "backupTechniciansCount": 4
  }
}
```

### 2. 매칭 상태 조회 (고객)
```http
GET /api/matches/service-request/:serviceRequestId
Authorization: Bearer {token}

Response (SEARCHING):
{
  "success": true,
  "data": {
    "status": "SEARCHING",
    "message": "가까운 전문가를 찾고 있습니다..."
  }
}

Response (NOTIFYING):
{
  "success": true,
  "data": {
    "status": "NOTIFYING",
    "match": { ... },
    "technician": {
      "id": "uuid",
      "name": "김철수",
      "rating": 4.8,
      "profilePhoto": "url"
    },
    "expiresAt": "2026-02-17T15:00:00.000Z"
  }
}

Response (MATCHED):
{
  "success": true,
  "data": {
    "status": "MATCHED",
    "match": { ... },
    "technician": {
      "id": "uuid",
      "name": "김철수",
      "phone": "010-1234-5678",
      "rating": 4.8,
      "profilePhoto": "url"
    },
    "estimatedArrival": "2026-02-17T15:30:00.000Z"
  }
}
```

### 3. 매칭 수락 (기사님)
```http
POST /api/matches/:matchId/accept
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "match-uuid",
    "status": "ACCEPTED",
    "respondedAt": "2026-02-17T14:45:00.000Z"
  }
}
```

### 4. 매칭 거절 (기사님)
```http
POST /api/matches/:matchId/reject
Authorization: Bearer {token}

Request Body:
{
  "reason": "바쁨" // optional
}

Response:
{
  "success": true,
  "message": "Match rejected"
}
```

### 5. 대기중인 매칭 조회 (기사님)
```http
GET /api/matches/technician/pending
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "match-uuid",
      "serviceRequestId": "request-uuid",
      "priority": 385,
      "notifiedAt": "2026-02-17T14:30:00.000Z",
      "expiresAt": "2026-02-17T14:45:00.000Z",
      "serviceRequest": {
        "id": "request-uuid",
        "address": "서울시 강남구 테헤란로 123",
        "description": "싱크대 배수구 누수 수리",
        "estimatedCost": 65000,
        "serviceName": "배관/수도"
      }
    }
  ]
}
```

## 🚀 사용 방법

### 고객 플로우

1. **AI 견적 요청**
   ```javascript
   // AIEstimate.jsx에서 자동 처리
   const response = await serviceRequestAPI.create(requestData);
   ```

2. **자동 매칭 시작**
   ```javascript
   await matchingAPI.startAutoMatch(serviceRequestId);
   navigate('/matching-status', { state: { serviceRequestId } });
   ```

3. **매칭 상태 확인**
   ```javascript
   // MatchingStatus.jsx에서 5초마다 폴링
   const status = await matchingAPI.getMatchStatus(serviceRequestId);
   ```

### 기사님 플로우 (TODO - TechnicianDashboard 업데이트 필요)

1. **대기중인 매칭 조회**
   ```javascript
   const matches = await matchingAPI.getPendingMatches();
   ```

2. **매칭 수락/거절**
   ```javascript
   await matchingAPI.acceptMatch(matchId);
   // or
   await matchingAPI.rejectMatch(matchId, reason);
   ```

## 🧪 테스트 데이터

샘플 기사님 5명이 추가되었습니다:

| 이름 | 이메일 | 위치 | 평점 | 전문분야 |
|------|--------|------|------|----------|
| 김철수 | tech1@mahasuri.com | 강남역 근처 | 4.8 | 전기/배관 |
| 이영희 | tech2@mahasuri.com | 선릉역 근처 | 4.9 | 도배/목공 |
| 박민수 | tech3@mahasuri.com | 역삼역 근처 | 4.7 | 에어컨 |
| 최동욱 | tech4@mahasuri.com | 양재역 근처 | 4.6 | 종합수리 |
| 정수진 | tech5@mahasuri.com | 강남구청역 근처 | 4.9 | 전기/에어컨 |

모든 기사님 비밀번호: `password123`

## 📝 현재 구현 상태

### ✅ 완료된 기능
- [x] 데이터베이스 스키마 (ServiceRequestMatch)
- [x] 매칭 알고리즘 (거리 + 평점 + 경험 기반)
- [x] 자동 매칭 API 엔드포인트
- [x] 매칭 상태 조회 API
- [x] 매칭 수락/거절 API
- [x] 프론트엔드 매칭 상태 페이지
- [x] AI 견적 후 자동 매칭 트리거
- [x] 실시간 폴링 (5초 간격)
- [x] 샘플 기사님 데이터

### 🚧 TODO (향후 개선)
- [ ] TechnicianDashboard에서 대기중인 매칭 표시
- [ ] 15분 타이머 만료 시 자동 에스컬레이션
- [ ] 푸시 알림 (FCM)
- [ ] SMS 알림
- [ ] WebSocket 실시간 통신 (폴링 대체)
- [ ] 매칭 히스토리 추적 및 분석
- [ ] 기사님 선호도 학습 (ML)

## 🔍 디버깅

### 매칭이 시작되지 않는 경우
1. 기사님이 ONLINE 또는 AVAILABLE 상태인지 확인
2. 기사님 위치 정보가 있는지 확인
3. 서비스 요청 위치가 15km 이내인지 확인

### 로그 확인
```bash
# 백엔드 서버 로그에서 매칭 정보 확인
cd backend
npm run dev

# 출력 예시:
# Found 3 eligible technicians
# Top 3 technicians: [...]
# Created match abc-123 for technician 김철수
```

## 📚 참고 자료

- Haversine Formula: 두 좌표 간 거리 계산
- SQLite3 with better-sqlite3
- React 폴링 패턴
- REST API 설계
