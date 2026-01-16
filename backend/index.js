const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const SECRET = process.env.JWT_SECRET || "mysecret";

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yourmail@gmail.com",
    pass: "APP_PASSWORD"
  }
});

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
app.post("/send-email-otp", async (req,res)=>{
  const { email } = req.body;
  const otp = generateOTP();
  const expires = new Date(Date.now() + 5*60000);

  await db.query(
    "INSERT INTO otps(phone,otp,expires_at) VALUES($1,$2,$3)",
    [email, otp, expires]
  );

  await mailer.sendMail({
    to: email,
    subject: "Your OTP",
    text: `Your OTP is ${otp}`
  });

  res.json({message:"Email OTP sent"});
});
app.post("/forgot-password", async (req,res)=>{
  const { email } = req.body;

  const user = await db.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if(!user.rows.length)
    return res.status(404).json({message:"User not found"});

  res.json({message:"OTP sent to email"});
});
app.get("/profile", auth, async (req,res)=>{
  const user = await db.query(
    "SELECT name,email,phone FROM users WHERE phone=$1",
    [req.user.phone]
  );

  res.json(user.rows[0]);
});
app.get("/admin/users", auth, async (req,res)=>{
  if(req.user.phone!=="ADMIN_PHONE")
    return res.sendStatus(403);

  const users = await db.query(
    "SELECT id,name,email,phone FROM users"
  );

  res.json(users.rows);
});


/* ================= START ================= */
app.listen(4000, () =>
  console.log("Backend running on port 4000")
);
