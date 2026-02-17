-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  user_type TEXT DEFAULT 'GENERAL',
  status TEXT DEFAULT 'ACTIVE',
  company_id TEXT,
  provider TEXT DEFAULT 'local',
  provider_id TEXT,
  profile_photo TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  business_number TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_companies_business_number ON companies(business_number);

-- Technicians Table
CREATE TABLE IF NOT EXISTS technicians (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  profile_photo TEXT,
  bio TEXT,
  current_latitude REAL,
  current_longitude REAL,
  service_area TEXT,
  status TEXT DEFAULT 'OFFLINE',
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  acceptance_rate REAL DEFAULT 100,
  ontime_rate REAL DEFAULT 100,
  complaint_rate REAL DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  provider TEXT DEFAULT 'local',
  provider_id TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_technicians_email ON technicians(email);
CREATE INDEX IF NOT EXISTS idx_technicians_status ON technicians(status);
CREATE INDEX IF NOT EXISTS idx_technicians_provider ON technicians(provider, provider_id);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  estimated_duration INTEGER NOT NULL,
  base_price INTEGER NOT NULL,
  sla_available INTEGER DEFAULT 1,
  warranty_days INTEGER DEFAULT 365,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_code ON services(code);

-- Service Requests Table
CREATE TABLE IF NOT EXISTS service_requests (
  id TEXT PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  service_id TEXT,
  request_type TEXT DEFAULT 'ASAP',
  scheduled_at INTEGER,
  address TEXT NOT NULL,
  address_detail TEXT,
  latitude REAL,
  longitude REAL,
  description TEXT,
  photo_urls TEXT,
  estimated_cost INTEGER NOT NULL,
  final_cost INTEGER,
  status TEXT DEFAULT 'REQUESTED',
  technician_id TEXT,
  requested_at INTEGER DEFAULT (strftime('%s', 'now')),
  assigned_at INTEGER,
  arrived_at INTEGER,
  completed_at INTEGER,
  sla_deadline INTEGER,
  sla_violated INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (technician_id) REFERENCES technicians(id)
);

CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_id ON service_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_technician_id ON service_requests(technician_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_requested_at ON service_requests(requested_at);

-- Technician Skills Table
CREATE TABLE IF NOT EXISTS technician_skills (
  id TEXT PRIMARY KEY,
  technician_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  skill_level INTEGER DEFAULT 1,
  certified_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (technician_id) REFERENCES technicians(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  UNIQUE(technician_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_technician_skills_technician_id ON technician_skills(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_skills_service_id ON technician_skills(service_id);

-- Service Logs Table
CREATE TABLE IF NOT EXISTS service_logs (
  id TEXT PRIMARY KEY,
  service_request_id TEXT NOT NULL,
  log_type TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  content TEXT,
  photo_urls TEXT,
  created_by TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id)
);

CREATE INDEX IF NOT EXISTS idx_service_logs_service_request_id ON service_logs(service_request_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_created_at ON service_logs(created_at);

-- Warranties Table
CREATE TABLE IF NOT EXISTS warranties (
  id TEXT PRIMARY KEY,
  warranty_number TEXT UNIQUE NOT NULL,
  service_request_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  start_date INTEGER DEFAULT (strftime('%s', 'now')),
  end_date INTEGER NOT NULL,
  terms TEXT,
  claim_count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id)
);

CREATE INDEX IF NOT EXISTS idx_warranties_service_request_id ON warranties(service_request_id);
CREATE INDEX IF NOT EXISTS idx_warranties_warranty_number ON warranties(warranty_number);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(status);
