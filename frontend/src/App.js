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

  /* ================= TIMER ================= */
  useEffect(() => {
    if (step === "verify" && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer, step]);

  /* ================= SEND OTP ================= */
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

  /* ================= VERIFY OTP ================= */
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

  /* ================= REGISTER ================= */
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

  /* ================= SEND EMAIL OTP ================= */
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

  /* ================= PROFILE ================= */
  const loadProfile = async () => {
    const res = await fetch("/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setProfile(data);
    setStep("profile");
  };

  /* ================= ADMIN ================= */
  const loadUsers = async () => {
    const res = await fetch("/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setUsers(data);
    setStep("admin");
  };

  return (
    <div className="page">
      <div className="card">

        <div className="image-box">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e"
            alt="shop"
          />
        </div>

        <div className="form-box">

          {/* LOGIN */}
          {step === "login" && (
            <>
              <h2>Login with OTP</h2>

              <input
                placeholder="Mobile number"
                onChange={e => setPhone(e.target.value)}
              />

              <button onClick={sendOtp}>
                {loading ? "Sending..." : "Send OTP"}
              </button>

              <p className="link" onClick={() => setStep("register")}>
                Register
              </p>

              <p className="link" onClick={() => setStep("forgot")}>
                Forgot password?
              </p>
            </>
          )}

          {/* VERIFY */}
          {step === "verify" && (
            <>
              <h2>Verify OTP</h2>

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
              <h2>Register</h2>

              <input
                placeholder="Name"
                onChange={e => setName(e.target.value)}
              />

              <input
                placeholder="Email"
                onChange={e => setEmail(e.target.value)}
              />

              <input
                placeholder="Phone"
                onChange={e => setPhone(e.target.value)}
              />

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
              <h2>Forgot Password</h2>

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
              <h2>Dashboard</h2>

              <button onClick={loadProfile}>
                View Profile
              </button>

              <button onClick={loadUsers}>
                Admin Dashboard
              </button>

              <button onClick={() => setStep("login")}>
                Logout
              </button>
            </>
          )}

          {/* PROFILE */}
          {step === "profile" && profile && (
            <>
              <h2>My Profile</h2>
              <p>Name: {profile.name}</p>
              <p>Email: {profile.email}</p>
              <p>Phone: {profile.phone}</p>

              <button onClick={() => setStep("dashboard")}>
                Back
              </button>
            </>
          )}

          {/* ADMIN */}
          {step === "admin" && (
            <>
              <h2>Admin Users</h2>

              {users.map(u => (
                <p key={u.id}>
                  {u.name} - {u.phone}
                </p>
              ))}

              <button onClick={() => setStep("dashboard")}>
                Back
              </button>
            </>
          )}

          {/* ERROR */}
          {error && <p className="error">{error}</p>}

        </div>
      </div>
    </div>
  );
}

export default App;
