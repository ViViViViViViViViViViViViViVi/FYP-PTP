import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";
export const secretKey = 'your_super_secret_key';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const loginResponse = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const loginData = await loginResponse.json();

      // SUCCESSFUL LOGIN
      
      if (loginResponse.ok) {
        const { user, token } = loginData;
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('user_name', user.full_name);
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_balance', user.balance);
        localStorage.setItem('token', token);

        // ADMIN CHECK
        const adminFlag = user.is_admin === 1 || user.is_admin === true;
        localStorage.setItem('is_admin', adminFlag ? 'true' : 'false');

        if (adminFlag) {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        setErrorMessage(loginData.error || "Invalid Credentials");
      } 
    } catch (err) {
      setErrorMessage("Error: Backend server is not responding.");
    }
  };


  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="text"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="login-btn">Login</button>

          <p className="signup-text">
            Don’t have an account? <a href="/create-account">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}
