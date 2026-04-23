import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "../css/create_account.css";

export default function Create_Account() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    securityQuestion: "What was your first pet's name?",
    securityAnswer: "",
    tradingKnowledge: 1,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
        ...prev, 
        [name]: type === "checkbox" ? checked : value 
    }));
  };

  const nextStep = (e) => { e.preventDefault(); setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  const handleFinish = async (e) => {
    e.preventDefault();
    if (!agreed) return alert("You must agree to the terms to proceed.");
    
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Success: " + result.message);
        navigate("/login");
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) { 
      alert("Backend server not running!"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="create-account-page"> 
      <div className="create-box">
        {/* Back Button */}
        {step > 1 && <button onClick={prevStep} className="back-btn">← Back</button>}

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <>
            <h2 className="form-title">Create Account</h2>
            <form onSubmit={nextStep}>
              <div className="input-row">
                <div className="input-group">
                  <label>First Name</label>
                  <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
              <button type="submit" className="create-btn">Continue</button>
            </form>
          </>
        )}

        {/* Step 2: Security */}
        {step === 2 && (
          <div className="step-content">
            <h2 className="welcome-text">Welcome, {formData.firstName || "User"}!</h2>
            <p className="sub-text">Please set a security question.</p>
            <form onSubmit={nextStep}>
              <div className="input-group">
                <label>Security Question</label>
                <select name="securityQuestion" className="security-select" value={formData.securityQuestion} onChange={handleChange}>
                  <option>What was your first pet's name?</option>
                  <option>What city were you born in?</option>
                  <option>What was your first car?</option>
                </select>
              </div>
              <div className="input-group">
                <label>Your Answer</label>
                <input name="securityAnswer" type="text" value={formData.securityAnswer} onChange={handleChange} required />
              </div>
              <button type="submit" className="create-btn">Next Step</button>
            </form>
          </div>
        )}

        {/* Step 3: Experience */}
        {step === 3 && (
          <div className="step-content">
            <h2 className="form-title">Experience</h2>
            <p className="sub-text">Rate your trading knowledge</p>
            <form onSubmit={nextStep}>
              <div className="knowledge-container">
                <div className="knowledge-labels">
                  <span>Beginner</span>
                  <span>Advanced</span>
                </div>
                <input name="tradingKnowledge" type="range" min="1" max="5" value={formData.tradingKnowledge} onChange={handleChange} className="knowledge-slider" />
                <div className="knowledge-score">{formData.tradingKnowledge} / 5</div>
              </div>
              <button type="submit" className="create-btn">Next</button>
            </form>
          </div>
        )}

        {/* Step 4: Final Disclaimer */}
        {step === 4 && (
          <div className="step-content">
            <h2 className="form-title">Almost Done</h2>
            <p className="sub-text">
                This website is for <b>educational purposes only</b>. No real financial risk is involved. 
                By proceeding, you confirm that you are at least 18 years of age.
            </p>
            <form onSubmit={handleFinish}>
              <div className="input-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
                  I agree to the terms and confirm I am 18+.
                </label>
              </div>
              <button type="submit" className="create-btn" disabled={loading}>
                {loading ? "Creating..." : "Finish & Create Account"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}