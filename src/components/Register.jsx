import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function Register() {
  const { register, addNotification } = useContext(AppContext);
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await register(form);
    setLoading(false);
    if (res.ok) {
      if (addNotification) addNotification("Registered! Please login.", "success");
      navigate("/login");
    } else {
      setError(res.message || "Registration failed");
    }
  };

  const strength = form.password.length >= 8 ? "strong" : form.password.length >= 5 ? "fair" : form.password.length > 0 ? "weak" : "";

  return (
    <div className="auth-shell">
      <div className="auth-duo-card">
        {/* Left decorative box */}
        <div className="auth-deco-box">
          <img src="/images/placeholder1.png" alt="Cozy Crave" className="auth-mini-logo" />
          <h2 className="auth-deco-title">Cozy Crave</h2>
          <p className="auth-deco-sub">Your favourite treats,<br />delivered with love.</p>
          <div className="auth-deco-dots">
            <span /><span /><span />
          </div>
        </div>

        {/* Right form box */}
        <div className="auth-form-box">
          <div className="auth-form-top">
            <h3>Create account</h3>
            <p>Join thousands of happy customers</p>
          </div>

          <form onSubmit={submit} className="auth-slim-form">
            <div className={`auth-slim-field ${focused === "name" ? "active" : ""} ${form.username ? "filled" : ""}`}>
              <label>Name</label>
              <div className="auth-slim-row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                  placeholder="Your full name"
                  required
                  id="register-name"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className={`auth-slim-field ${focused === "email" ? "active" : ""} ${form.email ? "filled" : ""}`}>
              <label>Email</label>
              <div className="auth-slim-row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  placeholder="your@email.com"
                  required
                  id="register-email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={`auth-slim-field ${focused === "password" ? "active" : ""} ${form.password ? "filled" : ""}`}>
              <label>Password</label>
              <div className="auth-slim-row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  placeholder="••••••••"
                  required
                  id="register-password"
                  autoComplete="new-password"
                />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {strength && (
                <div className="auth-strength-row">
                  <div className={`auth-strength-bar s-${strength}`}>
                    <span className={strength === "weak" || strength === "fair" || strength === "strong" ? "lit" : ""} />
                    <span className={strength === "fair" || strength === "strong" ? "lit" : ""} />
                    <span className={strength === "strong" ? "lit" : ""} />
                  </div>
                  <span className={`auth-strength-label s-${strength}`}>{strength}</span>
                </div>
              )}
            </div>

            {error && <div className="auth-slim-error">{error}</div>}

            <button className="auth-slim-btn" type="submit" disabled={loading} id="register-submit">
              {loading ? "Creating…" : "Create Account"}
            </button>
          </form>

          <p className="auth-switch-text">
            Have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;