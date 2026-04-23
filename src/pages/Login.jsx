import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");


    // ======================================================================================================================== //

    try {
      const loginResponse = await fetch('http://localhost:5000/api/login', {    // <--- calls the /login route on your login_routes.js file in the backend to authenticate the user
        method: 'POST',                                                         // <--- Uses POST method to send the email and password to the server for authentication
        headers: { 'Content-Type': 'application/json' },                        // <--- Sets the content type to JSON so route can understand the incoming data
        body: JSON.stringify({ email, password })                               // <--- Converts the email and password into a JSON string to be sent in the body of the request
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {                                                   // <--- If the response is successful 
        const { user } = loginData;                                             // <--- Destructures the user data from the response for easier access
        localStorage.setItem('user_id', user.id);                               // <--- Stores the user ID in localStorage 
        localStorage.setItem('user_name', user.full_name);                      // <--- Stores the user's full name in localStorage 
        localStorage.setItem('user_email', user.email);                         // <--- Stores the user's email in localStorage
        localStorage.setItem('user_balance', user.balance);                     // <--- Stores the user's balance in localStorage

        //                                                                                            [ ADMIN CHECK ]

        const adminFlag = user.is_admin === 1 || user.is_admin === true;        // <--- Checks if admin flag is set to true (1) in the user data returned from the server
        localStorage.setItem('is_admin', adminFlag ? 'true' : 'false');         // <--- Stores the admin flag in localStorage 

        if (adminFlag) {                                                        // <--- If the user is an admin...
          navigate("/admin");                                                   // <--- Redirects to the admin dashboard                  
        } else {                                                                // <--- If the user is not an admin...
          navigate("/home");                                                    // <--- Redirects to the user homepage
        }
      } else {
        setErrorMessage(loginData.error || "Invalid Credentials");              // <--- if database is working but email/password is wrong then show error message from server, otherwise show generic error message
      } 
    } catch (err) {
      setErrorMessage("Error: Backend server is not responding.");              // <--- shows if there is a database connection error or if the server is not running at all
      }
  };

  // ======================================================================================================================== //
  
//                                                  [LOGIN IN PAGE]]

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

  // ======================================================================================================================== //