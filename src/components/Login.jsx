import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function Login() {
  const { login, user } = useContext(AppContext);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if user is already logged in and we haven't started a login attempt
    if (user && !loading) {
      if (user.role?.toLowerCase() === "admin") navigate("/admin");
      else navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only on mount — handles already-logged-in users visiting /login

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login({
      identifier: (form.identifier || "").trim().toLowerCase(),
      password: form.password,
    });
    setLoading(false);
    if (res.ok) {
      // Read fresh user from context isn't needed — login sets it.
      // Navigate based on role stored in the login response indirectly via context.
      // We check the cookie user for role since context might not have updated yet.
      const Cookies = (await import("js-cookie")).default;
      try {
        const u = JSON.parse(Cookies.get("cc_user") || "null");
        if (u?.role?.toLowerCase() === "admin") navigate("/admin");
        else navigate("/");
      } catch {
        navigate("/");
      }
    } else {
      setError(res.message || "Login failed");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-duo-card">
        {/* Left decorative box */}
        <div className="auth-deco-box">
          <img src="/images/placeholder1.png" alt="Cozy Crave" className="auth-mini-logo" />
          <h2 className="auth-deco-title">Cozy Crave</h2>
          <p className="auth-deco-sub">Wrap in Cozy.<br />Indulge in Crave.</p>
          <div className="auth-deco-dots">
            <span /><span /><span />
          </div>
        </div>

        {/* Right form box */}
        <div className="auth-form-box">
          <div className="auth-form-top">
            <h3>Welcome back</h3>
            <p>Sign in to continue</p>
          </div>

          <form onSubmit={submit} className="auth-slim-form">
            <div className={`auth-slim-field ${focused === "email" ? "active" : ""} ${form.identifier ? "filled" : ""}`}>
              <label>Email</label>
              <div className="auth-slim-row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  value={form.identifier}
                  onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  placeholder="your@email.com"
                  required
                  id="login-email"
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
                  id="login-password"
                  autoComplete="current-password"
                />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && <div className="auth-slim-error">{error}</div>}

            <button className="auth-slim-btn" type="submit" disabled={loading} id="login-submit">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="auth-switch-text">
            No account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;