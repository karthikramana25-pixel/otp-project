CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150),
  phone VARCHAR(15) UNIQUE
);

CREATE TABLE otps (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(15),
  otp VARCHAR(6),
  expires_at TIMESTAMP
);
