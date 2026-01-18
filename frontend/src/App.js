import React, { useState, useEffect } from "react";
import "./style.css";

function App() {

  const [step, setStep] = useState("login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);

  const [cart, setCart] = useState([]);

  /* PRODUCTS */
  const products = [
    {
      id: 1,
      name: "A2 Cow Milk",
      price: 80,
      desc: "Fresh native cow milk - 1 litre",
      img: "/images/milk.jpg"
    },
    {
      id: 2,
      name: "Millets Rice",
      price: 120,
      desc: "Healthy millets rice - 1 kg",
      img: "/images/rice.jpg"
    },
    {
      id: 3,
      name: "Raw Honey",
      price: 450,
      desc: "Forest raw honey - 1 kg",
      img: "/images/honey.jpg"
    },
    {
      id: 4,
      name: "Coconut Oil",
      price: 300,
      desc: "Cold pressed coconut oil - 1 kg",
      img: "/images/coconut.jpg"
    },
    {
      id: 5,
      name: "Groundnut Oil",
      price: 280,
      desc: "Wood pressed groundnut oil - 1 kg",
      img: "/images/groundnut.jpg"
    }
  ];

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

    setStep("products");
  };

  /* CART */
  const addToCart = (p) => {
    setCart([...cart, p]);
  };

  const removeItem = (i) => {
    setCart(cart.filter((_, idx) => idx !== i));
  };

  const total = cart.reduce((s, i) => s + i.price, 0);

  return (
    <div className="page">

      {/* LOGIN */}
      {step === "login" && (
        <div className="card">
          <h2>Login with OTP</h2>

          <input
            placeholder="Mobile number"
            onChange={e => setPhone(e.target.value)}
          />

          <button onClick={sendOtp}>
            {loading ? "Sending..." : "Send OTP"}
          </button>

          {error && <p className="error">{error}</p>}
        </div>
      )}

      {/* VERIFY */}
      {step === "verify" && (
        <div className="card">
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

          {error && <p className="error">{error}</p>}
        </div>
      )}

      {/* PRODUCTS */}
      {step === "products" && (
        <>
          <h2 className="title">🛒 Our Products</h2>

          <div className="products">
            {products.map(p => (
              <div className="product" key={p.id}>
                <img src={p.img} alt={p.name} />
                <h4>{p.name}</h4>
                <p>{p.desc}</p>
                <b>₹ {p.price}</b>

                <button onClick={() => addToCart(p)}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          <div className="cart-bar">
            <p>Items: {cart.length}</p>
            <p>Total: ₹ {total}</p>

            <button onClick={() => setStep("checkout")}>
              Checkout
            </button>
          </div>
        </>
      )}

      {/* CHECKOUT */}
      {step === "checkout" && (
        <div className="card">
          <h2>🧾 Checkout</h2>

          {cart.map((c, i) => (
            <div className="row" key={i}>
              <span>{c.name}</span>
              <span>₹ {c.price}</span>
              <button onClick={() => removeItem(i)}>❌</button>
            </div>
          ))}

          <h3>Total: ₹ {total}</h3>

          <button onClick={() => alert("Order placed!")}>
            Place Order
          </button>

          <button onClick={() => setStep("products")}>
            Back
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
