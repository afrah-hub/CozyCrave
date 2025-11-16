import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
function Register() {
  const { register } = useContext(AppContext);
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await register(form);
    setLoading(false);
    if (res.ok) {
      navigate("/");
    } else {
      setError(res.message || "Registration failed");
    }
  };
  return (
    <main className="auth-page container">
      <div className="auth-card animated-card">
        <div className="auth-header">
          <div className="auth-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{color: "#e1a95f"}}>
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <h2>Join Cozy Crave</h2>
          <p className="muted">Create your account to start shopping</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          <div className="input-group">
            <label>
              Username
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"/>
                </svg>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  placeholder="Choose a username"
                />
              </div>
            </label>
          </div>
          <div className="input-group">
            <label>
              Email
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V8L12 13L20 8V18ZM20 6L12 11L4 6V6H20V6Z"/>
                </svg>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="Enter your email"
                />
              </div>
            </label>
          </div>
          <div className="input-group">
            <label>
              Password
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17C10.89 17 10 16.1 10 15C10 13.89 10.89 13 12 13C13.11 13 14 13.89 14 15C14 16.1 13.11 17 12 17ZM18 8C19.11 8 20 8.9 20 10V20C20 21.1 19.11 22 18 22H6C4.89 22 4 21.1 4 20V10C4 8.9 4.89 8 6 8H7V6C7 3.24 9.24 1 12 1C14.76 1 17 3.24 17 6V8H18ZM12 3C10.34 3 9 4.34 9 6V8H15V6C15 4.34 13.66 3 12 3Z"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="Create a password"  />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"} >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    {showPassword ? (
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"/>
                    ) : (
                      <path d="M12 7C13.66 7 15 8.34 15 10C15 10.78 14.79 11.5 14.41 12.09L16.45 14.14C17.42 13.09 18.17 11.89 18.73 10.91C16.27 6.61 13.14 4.5 12 4.5C11.27 4.5 10.59 4.64 9.96 4.89L11.5 6.43C11.78 6.57 12.05 6.69 12.34 6.81L12 7ZM3.27 2.5L2 3.77L4.73 6.5C3.08 7.8 1.78 9.5 1.27 10.91C3.73 15.21 6.86 17.32 12 17.32C12.73 17.32 13.41 17.18 14.04 16.93L16.09 18.98L17.36 17.71L3.27 2.5ZM7.53 9.47L9.06 11C9.04 11.17 9 11.33 9 11.5C9 12.88 10.12 14 11.5 14C11.67 14 11.83 13.96 12 13.94L13.53 15.47C13.04 15.72 12.54 15.88 12 15.88C9.79 15.88 8 14.09 8 11.88C8 11.34 8.16 10.84 8.41 10.35L7.53 9.47Z"/>
                    )}
                  </svg>
                </button>
              </div>
            </label>
          </div>
          {error && <div className="error-message animated-error">{error}</div>}
          <div className="form-actions">
            <button className="btn auth-btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.3"/>
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
        <div className="auth-footer">
          <p className="auth-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;