const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");

const SECRET = process.env.JWT_SECRET || "mysecret";
const ADMIN_PHONE = "919999999999"; // change to your number

const app = express();
app.use(cors());
app.use(express.json());

/* ================= AWS SNS ================= */
AWS.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: "us-east-1"
});

const sns = new AWS.SNS();

/* ================= MAIL ================= */
const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

/* ================= UTIL ================= */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ================= SEND SMS OTP ================= */
app.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    const otp = generateOTP();
    const expires = new Date(Date.now() + 5 * 60000);

    await db.query(
      `INSERT INTO otps(identifier,otp,purpose,expires_at)
       VALUES($1,$2,'login',$3)`,
      [phone, otp, expires]
    );

    await sns.publish({
      Message: `Your SK Organics OTP is ${otp}`,
      PhoneNumber: `+91${phone}`
    }).promise();

    res.json({ message: "OTP sent to your mobile" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "SMS failed" });
  }
});

/* ================= VERIFY OTP ================= */
app.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  const result = await db.query(
    `SELECT * FROM otps
     WHERE identifier=$1 AND purpose='login'
     ORDER BY id DESC LIMIT 1`,
    [phone]
  );

  if (!result.rows.length)
    return res.status(400).json({ message: "OTP not found" });

  const record = result.rows[0];

  if (record.otp !== otp)
    return res.status(401).json({ message: "Invalid OTP" });

  if (new Date() > record.expires_at)
    return res.status(401).json({ message: "OTP expired" });

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

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  const { name, email, phone } = req.body;

  const exist = await db.query(
    "SELECT * FROM users WHERE phone=$1 OR email=$2",
    [phone, email]
  );

  if (exist.rows.length)
    return res.status(400).json({ message: "User already exists" });

  await db.query(
    "INSERT INTO users(name,email,phone,role) VALUES($1,$2,$3,'user')",
    [name, email, phone]
  );

  res.json({ message: "User registered" });
});

/* ================= EMAIL OTP ================= */
app.post("/send-email-otp", async (req,res)=>{
  const { email } = req.body;

  const otp = generateOTP();
  const expires = new Date(Date.now() + 5*60000);

  await db.query(
    `INSERT INTO otps(identifier,otp,purpose,expires_at)
     VALUES($1,$2,'forgot',$3)`,
    [email, otp, expires]
  );

  await mailer.sendMail({
    to: email,
    subject: "Password reset OTP",
    text: `Your OTP is ${otp}`
  });

  res.json({message:"OTP sent to email"});
});

/* ================= PROFILE ================= */
app.get("/profile", auth, async (req,res)=>{
  const user = await db.query(
    "SELECT name,email,phone,role FROM users WHERE phone=$1",
    [req.user.phone]
  );

  res.json(user.rows[0]);
});

/* ================= ADMIN ================= */
app.get("/admin/users", auth, async (req,res)=>{
  if(req.user.phone !== ADMIN_PHONE)
    return res.sendStatus(403);

  const users = await db.query(
    "SELECT id,name,email,phone,role FROM users"
  );

  res.json(users.rows);
});

/* ================= START ================= */
app.listen(4000, () =>
  console.log("Backend running on port 4000")
);
