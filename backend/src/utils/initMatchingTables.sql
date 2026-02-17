-- Technician 테이블 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS Technician (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  specialties TEXT NOT NULL, -- JSON array: ["ELECTRICAL", "PLUMBING"]
  rating REAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  max_distance REAL DEFAULT 10.0, -- km
  is_available INTEGER DEFAULT 1, -- SQLite boolean
  response_rate REAL DEFAULT 100.0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES User(id)
);

-- ServiceRequestMatch 테이블 (매칭 정보)
CREATE TABLE IF NOT EXISTS ServiceRequestMatch (
  id TEXT PRIMARY KEY,
  service_request_id TEXT NOT NULL,
  technician_id TEXT NOT NULL,
  status TEXT NOT NULL, -- PENDING, ACCEPTED, REJECTED, EXPIRED
  priority INTEGER DEFAULT 0, -- 우선순위 점수
  notified_at TEXT NOT NULL,
  responded_at TEXT,
  expires_at TEXT NOT NULL, -- 15분 후 만료
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (service_request_id) REFERENCES ServiceRequest(id),
  FOREIGN KEY (technician_id) REFERENCES Technician(id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_match_service_request ON ServiceRequestMatch(service_request_id);
CREATE INDEX IF NOT EXISTS idx_match_technician ON ServiceRequestMatch(technician_id);
CREATE INDEX IF NOT EXISTS idx_match_status ON ServiceRequestMatch(status);
CREATE INDEX IF NOT EXISTS idx_technician_available ON Technician(is_available);
