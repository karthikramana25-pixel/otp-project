import React, { useState, useEffect } from "react";
import "./style.css";

function App() {

  const [step, setStep] = useState("login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);

  const [token, setToken] = useState("");
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);

  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");
  const [showStory, setShowStory] = useState(false);

  const text = {
    en: {
      title: "SK ORGANICS",
      tagline: "Fresh • Natural • Healthy",
      mobile: "Enter mobile number",
      send: "Send OTP",
      story: "Our Farmer Story",
      register: "Register",
      forgot: "Forgot password?"
    },
    ta: {
      title: "எஸ்.கே ஆர்கானிக்ஸ்",
      tagline: "சுத்தம் • இயற்கை • ஆரோக்கியம்",
      mobile: "மொபைல் எண்ணை உள்ளிடவும்",
      send: "OTP அனுப்பவும்",
      story: "விவசாயி கதை",
      register: "பதிவு செய்ய",
      forgot: "கடவுச்சொல் மறந்துவிட்டதா?"
    }
  };

  /* TIMER */
  useEffect(() => {
    if (step === "verify" && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer, step]);

  /* SEND OTP */
  const sendOtp = async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });

    setLoading(false);

    if (!res.ok) {
      setError("Failed to send OTP");
      return;
    }

    setTimer(60);
    setStep("verify");
  };

  /* VERIFY OTP */
  const verifyOtp = async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message);
      return;
    }

    setToken(data.token);
    setStep("dashboard");
  };

  /* REGISTER */
  const register = async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message);
      return;
    }

    alert("Registered successfully");
    setStep("login");
  };

  /* EMAIL OTP */
  const sendEmailOtp = async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/send-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    setLoading(false);

    if (!res.ok) {
      setError("Failed to send email OTP");
      return;
    }

    alert("OTP sent to your email");
  };

  /* PROFILE */
  const loadProfile = async () => {
    const res = await fetch("/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setProfile(data);
    setStep("profile");
  };

  /* ADMIN */
  const loadUsers = async () => {
    const res = await fetch("/admin/users", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setUsers(data);
    setStep("admin");
  };

  return (
    <div
      className={dark ? "bg dark" : "bg"}
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/farm.jpg)`
      }}
    >

      {/* TOP BAR */}
      <div className="top-bar">
        <button onClick={() => setDark(!dark)}>🌙</button>
        <button onClick={() => setLang(lang === "en" ? "ta" : "en")}>
          {lang === "en" ? "தமிழ்" : "English"}
        </button>
      </div>

      {/* FLOATING FRUITS */}
      <div className="floating">
        <img src="/images/apple.png" alt="apple" />
        <img src="/images/banana.png" alt="banana" />
      </div>

      <div className="overlay">
        <div className="login-card">

          {/* LEFT IMAGE */}
          <div className="left">
            <img
              src="/images/orange.png"
              alt="Organic"
            />
          </div>

          {/* RIGHT */}
          <div className="right">

            <h2>{text[lang].title}</h2>
            <p>{text[lang].tagline}</p>

            {/* LOGIN */}
            {step === "login" && (
              <>
                <input
                  placeholder={text[lang].mobile}
                  onChange={e => setPhone(e.target.value)}
                />

                <button className="pulse" onClick={sendOtp}>
                  {loading ? "Sending..." : text[lang].send}
                </button>

                <p className="link" onClick={() => setStep("register")}>
                  {text[lang].register}
                </p>

                <p className="link" onClick={() => setStep("forgot")}>
                  {text[lang].forgot}
                </p>

                <p className="link" onClick={() => setShowStory(true)}>
                  {text[lang].story}
                </p>
              </>
            )}

            {/* VERIFY */}
            {step === "verify" && (
              <>
                <input
                  placeholder="Enter OTP"
                  onChange={e => setOtp(e.target.value)}
                />

                <button onClick={verifyOtp}>
                  {loading ? "Verifying..." : "Verify"}
                </button>

                <p className="timer">
                  Resend OTP in {timer}s
                </p>
              </>
            )}

            {/* REGISTER */}
            {step === "register" && (
              <>
                <input placeholder="Name" onChange={e => setName(e.target.value)} />
                <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
                <input placeholder="Phone" onChange={e => setPhone(e.target.value)} />

                <button onClick={register}>
                  {loading ? "Registering..." : "Register"}
                </button>

                <p className="link" onClick={() => setStep("login")}>
                  Back to login
                </p>
              </>
            )}

            {/* FORGOT */}
            {step === "forgot" && (
              <>
                <input
                  placeholder="Email"
                  onChange={e => setEmail(e.target.value)}
                />

                <button onClick={sendEmailOtp}>
                  {loading ? "Sending..." : "Send Email OTP"}
                </button>

                <p className="link" onClick={() => setStep("login")}>
                  Back to login
                </p>
              </>
            )}

            {/* DASHBOARD */}
            {step === "dashboard" && (
              <>
                <button onClick={loadProfile}>View Profile</button>
                <button onClick={loadUsers}>Admin Dashboard</button>
                <button onClick={() => setStep("login")}>Logout</button>
              </>
            )}

            {/* PROFILE */}
            {step === "profile" && profile && (
              <>
                <p>Name: {profile.name}</p>
                <p>Email: {profile.email}</p>
                <p>Phone: {profile.phone}</p>

                <button onClick={() => setStep("dashboard")}>Back</button>
              </>
            )}

            {/* ADMIN */}
            {step === "admin" && (
              <>
                {users.map(u => (
                  <p key={u.id}>{u.name} - {u.phone}</p>
                ))}
                <button onClick={() => setStep("dashboard")}>Back</button>
              </>
            )}

            {error && <p className="error">{error}</p>}
          </div>
        </div>
      </div>

      {/* STORY */}
      {showStory && (
        <div className="modal">
          <div className="modal-box">
            <h3>🌾 Our Farmers</h3>
            <p>
              We work with indigenous farmers and native cows,
              growing chemical-free food in Tamil Nadu.
            </p>
            <button onClick={() => setShowStory(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
