-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password VARCHAR(255), -- optional (future use)
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- OTP TABLE (SMS + EMAIL)
-- =========================
CREATE TABLE otps (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(150) NOT NULL, 
  -- phone OR email
  otp VARCHAR(6) NOT NULL,
  purpose VARCHAR(50), 
  -- login | forgot_password | email_verify
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- INDEXES (Performance)
-- =========================
CREATE INDEX idx_otps_identifier 
ON otps(identifier);

CREATE INDEX idx_users_phone 
ON users(phone);

CREATE INDEX idx_users_email 
ON users(email);
