import React, { useState } from "react";

function App() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("login");

  const sendOtp = async () => {
    await fetch("/send-otp", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ phone })
    });
    setStep("verify");
  };

  const verifyOtp = async () => {
    const res = await fetch("/verify-otp", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ phone, otp })
    });
    alert(await res.text());
  };

  return (
    <div style={{width:"300px",margin:"100px auto"}}>
      <h2>Login with OTP</h2>

      {step==="login" && (
        <>
          <input
            placeholder="Enter mobile"
            onChange={e=>setPhone(e.target.value)}
          /><br/><br/>
          <button onClick={sendOtp}>Send OTP</button>
          <p>Don’t have account? Register</p>
        </>
      )}

      {step==="verify" && (
        <>
          <input
            placeholder="Enter OTP"
            onChange={e=>setOtp(e.target.value)}
          /><br/><br/>
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}
    </div>
  );
}

export default App;
