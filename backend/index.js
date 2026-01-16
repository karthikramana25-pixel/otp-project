const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "mysecret";

const app = express();
app.use(cors());
app.use(express.json());

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ================= SEND OTP ================= */
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  const otp = generateOTP();
  const expires = new Date(Date.now() + 5 * 60000);

  await db.query(
    "INSERT INTO otps(phone,otp,expires_at) VALUES($1,$2,$3)",
    [phone, otp, expires]
  );

  console.log("OTP (for testing):", otp);

  res.json({ message: "OTP sent" });
});

/* ================= VERIFY OTP ================= */
app.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  const result = await db.query(
    "SELECT * FROM otps WHERE phone=$1 ORDER BY id DESC LIMIT 1",
    [phone]
  );

  if (!result.rows.length)
    return res.status(400).json({ message: "OTP not found" });

  const record = result.rows[0];

  if (record.otp !== otp)
    return res.status(401).json({ message: "Invalid OTP" });

  if (new Date() > record.expires_at)
    return res.status(401).json({ message: "OTP expired" });

  // ✅ Generate JWT AFTER OTP validation
  const token = jwt.sign(
    { phone },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login success",
    token
  });
});

/* ================= JWT MIDDLEWARE ================= */
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Token missing" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Invalid token" });

    req.user = user;
    next();
  });
}

/* ================= PROTECTED API ================= */
app.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected data",
    phone: req.user.phone
  });
});

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  const { name, email, phone } = req.body;

  const exist = await db.query(
    "SELECT * FROM users WHERE phone=$1",
    [phone]
  );

  if (exist.rows.length)
    return res.status(400).json({ message: "User already exists" });

  await db.query(
    "INSERT INTO users(name,email,phone) VALUES($1,$2,$3)",
    [name, email, phone]
  );

  res.json({ message: "User registered successfully" });
});

/* ================= START ================= */
app.listen(4000, () =>
  console.log("Backend running on port 4000")
);
