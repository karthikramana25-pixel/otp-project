const { Pool } = require("pg");

module.exports = new Pool({
  host: "db",
  user: "postgres",
  password: "postgres",
  database: "otpdb"
});
