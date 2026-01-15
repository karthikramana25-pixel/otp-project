import React, { useState } from "react";

function App() {
  const [step, setStep] = useState("login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  /* SEND OTP */
  const sendOtp = async () => {
    await fetch("/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    setStep("verify");
  };

  /* VERIFY OTP */
  const verifyOtp = async () => {
    const res = await fetch("/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp })
    });

    const data = await res.json();
    alert(data.message);
  };

  /* REGISTER */
  const registerUser = async () => {
    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) setStep("login");
  };

  return (
    <div style={{ width: "300px", margin: "100px auto" }}>
      {step === "login" && (
        <>
          <h2>Login with OTP</h2>
          <input
            placeholder="Enter mobile"
            onChange={e => setPhone(e.target.value)}
          /><br /><br />

          <button onClick={sendOtp}>Send OTP</button>

          <p style={{cursor:"pointer",color:"blue"}}
             onClick={() => setStep("register")}>
            Don’t have account? Register
          </p>
        </>
      )}

      {step === "verify" && (
        <>
          <h2>Verify OTP</h2>
          <input
            placeholder="Enter OTP"
            onChange={e => setOtp(e.target.value)}
          /><br /><br />

          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}

      {step === "register" && (
        <>
          <h2>Register</h2>

          <input
            placeholder="Name"
            onChange={e => setName(e.target.value)}
          /><br /><br />

          <input
            placeholder="Email"
            onChange={e => setEmail(e.target.value)}
          /><br /><br />

          <input
            placeholder="Phone"
            onChange={e => setPhone(e.target.value)}
          /><br /><br />

          <button onClick={registerUser}>Register</button>

          <p style={{cursor:"pointer",color:"blue"}}
             onClick={() => setStep("login")}>
            Back to login
          </p>
        </>
      )}
    </div>
  );
}

export default App;
