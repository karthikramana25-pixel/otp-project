require('dotenv').config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "otpdb"
});

module.exports = pool;
