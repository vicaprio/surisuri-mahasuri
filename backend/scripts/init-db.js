const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Create database
const dbPath = path.join(__dirname, '..', 'dev.db');
console.log('Creating database at:', dbPath);

// Remove existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database');
}

const db = new Database(dbPath);

// Create tables
console.log('Creating tables...');

const schema = `
CREATE TABLE User (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  userType TEXT DEFAULT 'GENERAL',
  status TEXT DEFAULT 'ACTIVE',
  companyId TEXT,
  provider TEXT DEFAULT 'local',
  providerId TEXT,
  profilePhoto TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE Company (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  businessNumber TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE Building (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  postalCode TEXT,
  companyId TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (companyId) REFERENCES Company(id)
);

CREATE TABLE Unit (
  id TEXT PRIMARY KEY,
  unitNumber TEXT NOT NULL,
  floor INTEGER,
  area REAL,
  buildingId TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (buildingId) REFERENCES Building(id)
);

CREATE TABLE Service (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  estimatedDuration INTEGER NOT NULL,
  basePrice INTEGER NOT NULL,
  slaAvailable INTEGER DEFAULT 1,
  warrantyDays INTEGER DEFAULT 365,
  isActive INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE ServiceRequest (
  id TEXT PRIMARY KEY,
  requestNumber TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL,
  serviceId TEXT,
  category TEXT,
  unitId TEXT,
  requestType TEXT DEFAULT 'ASAP',
  scheduledAt TEXT,
  address TEXT NOT NULL,
  addressDetail TEXT,
  latitude REAL,
  longitude REAL,
  description TEXT,
  photoUrls TEXT,
  estimatedCost INTEGER NOT NULL,
  finalCost INTEGER,
  status TEXT DEFAULT 'REQUESTED',
  technicianId TEXT,
  requestedAt TEXT DEFAULT (datetime('now')),
  assignedAt TEXT,
  arrivedAt TEXT,
  completedAt TEXT,
  slaDeadline TEXT,
  slaViolated INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (serviceId) REFERENCES Service(id),
  FOREIGN KEY (unitId) REFERENCES Unit(id),
  FOREIGN KEY (technicianId) REFERENCES Technician(id)
);

CREATE TABLE ServiceLog (
  id TEXT PRIMARY KEY,
  serviceRequestId TEXT NOT NULL,
  logType TEXT NOT NULL,
  oldStatus TEXT,
  newStatus TEXT,
  content TEXT,
  photoUrls TEXT,
  createdBy TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (serviceRequestId) REFERENCES ServiceRequest(id)
);

CREATE TABLE Warranty (
  id TEXT PRIMARY KEY,
  warrantyNumber TEXT UNIQUE NOT NULL,
  serviceRequestId TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  startDate TEXT DEFAULT (datetime('now')),
  endDate TEXT NOT NULL,
  terms TEXT,
  claimCount INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (serviceRequestId) REFERENCES ServiceRequest(id)
);

CREATE TABLE Technician (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  profilePhoto TEXT,
  bio TEXT,
  currentLatitude REAL,
  currentLongitude REAL,
  serviceArea TEXT,
  status TEXT DEFAULT 'OFFLINE',
  rating REAL DEFAULT 0,
  reviewCount INTEGER DEFAULT 0,
  acceptanceRate REAL DEFAULT 100,
  ontimeRate REAL DEFAULT 100,
  complaintRate REAL DEFAULT 0,
  completedJobs INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE TechnicianSkill (
  id TEXT PRIMARY KEY,
  technicianId TEXT NOT NULL,
  serviceId TEXT NOT NULL,
  skillLevel INTEGER DEFAULT 1,
  certifiedAt TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (technicianId) REFERENCES Technician(id),
  FOREIGN KEY (serviceId) REFERENCES Service(id),
  UNIQUE(technicianId, serviceId)
);

-- Indexes
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_companyId ON User(companyId);
CREATE INDEX idx_company_businessNumber ON Company(businessNumber);
CREATE INDEX idx_building_companyId ON Building(companyId);
CREATE INDEX idx_unit_buildingId ON Unit(buildingId);
CREATE INDEX idx_service_category ON Service(category);
CREATE INDEX idx_service_code ON Service(code);
CREATE INDEX idx_servicerequest_userId ON ServiceRequest(userId);
CREATE INDEX idx_servicerequest_serviceId ON ServiceRequest(serviceId);
CREATE INDEX idx_servicerequest_technicianId ON ServiceRequest(technicianId);
CREATE INDEX idx_servicerequest_status ON ServiceRequest(status);
CREATE INDEX idx_servicerequest_requestedAt ON ServiceRequest(requestedAt);
CREATE INDEX idx_servicelog_serviceRequestId ON ServiceLog(serviceRequestId);
CREATE INDEX idx_servicelog_createdAt ON ServiceLog(createdAt);
CREATE INDEX idx_warranty_serviceRequestId ON Warranty(serviceRequestId);
CREATE INDEX idx_warranty_warrantyNumber ON Warranty(warrantyNumber);
CREATE INDEX idx_warranty_status ON Warranty(status);
CREATE INDEX idx_technician_email ON Technician(email);
CREATE INDEX idx_technician_status ON Technician(status);
CREATE INDEX idx_technicianskill_technicianId ON TechnicianSkill(technicianId);
CREATE INDEX idx_technicianskill_serviceId ON TechnicianSkill(serviceId);
`;

// Execute schema
const statements = schema.split(';').filter(s => s.trim());
for (const statement of statements) {
  if (statement.trim()) {
    db.exec(statement);
  }
}

console.log('✅ Database created successfully!');
console.log('Tables:', db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());

db.close();
