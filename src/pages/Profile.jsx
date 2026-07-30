import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import LogoutConfirmModal from "../components/LogoutConfirmModal";
import { changePasswordApi } from "../services/api";

function Profile() {
  const { user, updateUser, logout, wishlist, orders, addNotification } = useContext(AppContext);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  // Name editing
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(user?.name || user?.username || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Password change
  const [showPwForm, setShowPwForm] = React.useState(false);
  const [pwForm, setPwForm] = React.useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = React.useState("");
  const [pwLoading, setPwLoading] = React.useState(false);
  const [showPw, setShowPw] = React.useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    if (user?.role?.toLowerCase() === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <main className="container">
        <h1>My Profile</h1>
        <p>User not logged in</p>
      </main>
    );
  }

  const handleLogout = () => setShowLogoutModal(true);

  const handleEdit = () => {
    setEditName(user.name || user.username);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(user.name || user.username);
  };

  const handleSave = async () => {
    if (!editName.trim()) { addNotification("Name cannot be empty", "error"); return; }
    setIsSubmitting(true);
    try {
      const res = await updateUser({ name: editName });
      if (res && res.ok === false) { addNotification(res.message, "error"); }
      else { addNotification("Profile updated successfully", "success"); setIsEditing(false); }
    } catch { addNotification("Failed to update profile", "error"); }
    finally { setIsSubmitting(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    if (!pwForm.current) { setPwError("Current password is required."); return; }
    if (pwForm.next.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    setPwLoading(true);
    try {
      await changePasswordApi(pwForm.current, pwForm.next);
      addNotification("Password changed successfully!", "success");
      setShowPwForm(false);
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      const msg = err?.response?.data?.message
        || (typeof err?.response?.data === 'string' ? err.response.data : null)
        || "Failed to change password";
      setPwError(msg);
    } finally { setPwLoading(false); }
  };

  const togglePw = (field) => setShowPw(s => ({ ...s, [field]: !s[field] }));

  const EyeBtn = ({ field }) => (
    <button type="button" onClick={() => togglePw(field)} tabIndex={-1}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 }}>
      {showPw[field]
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
    </button>
  );

  return (
    <main className="container">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-800))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem', margin: '0' }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── Card 1: Account Info + Change Password ── */}
        <div className="profile-card">
          {/* Avatar + name */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1rem', display: 'block', objectFit: 'cover', border: '4px solid var(--primary)', boxShadow: 'var(--shadow-md)' }} />
            ) : (
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand)', color: 'white', fontSize: '3rem', boxShadow: 'var(--shadow-md)' }}>
                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            {isEditing ? (
              <div style={{ marginBottom: '1rem' }}>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={isSubmitting} autoFocus
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--primary)', fontSize: '1.2rem', textAlign: 'center', marginBottom: '1rem', background: 'var(--surface)', color: 'var(--text)' }}
                  placeholder="Enter your name" />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button onClick={handleSave} disabled={isSubmitting} className="btn" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>{isSubmitting ? 'Saving...' : 'Save'}</button>
                  <button onClick={handleCancel} disabled={isSubmitting} className="btn secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {user.name || user.username}
                <button onClick={handleEdit} title="Edit Name"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: 'var(--primary)', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </h3>
            )}
          </div>

          {/* Info rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary)"><path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" /></svg>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Email</div>
                <div style={{ fontWeight: '500', color: 'var(--text)' }}>{user.email}</div>
              </div>
            </div>

            {/* Member Since */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary)"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" /></svg>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Member Since</div>
                <div style={{ fontWeight: '500', color: 'var(--text)' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.07)', margin: '0.25rem 0' }} />

            {/* Password row with Reset button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Password</div>
                <div style={{ fontWeight: '500', color: 'var(--text)' }}>••••••••</div>
              </div>
              <button
                onClick={() => { setShowPwForm(s => !s); setPwError(""); setPwForm({ current: "", next: "", confirm: "" }); }}
                className="btn"
                style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}
              >
                {showPwForm ? (
                  <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel</>
                ) : (
                  <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Reset</>
                )}
              </button>
            </div>

            {/* Inline password change form */}
            {showPwForm && (
              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '11px', padding: '14px', background: 'var(--surface-secondary)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                {[
                  { field: 'current', label: 'Current Password',     placeholder: 'Enter current password' },
                  { field: 'next',    label: 'New Password',         placeholder: 'At least 6 characters' },
                  { field: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                ].map(({ field, label, placeholder }) => (
                  <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: '10px', padding: '8px 12px', background: '#fff' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <input
                        type={showPw[field] ? 'text' : 'password'}
                        value={pwForm[field]}
                        onChange={e => setPwForm(s => ({ ...s, [field]: e.target.value }))}
                        placeholder={placeholder}
                        required
                        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.87rem', color: 'var(--text)', fontFamily: 'var(--font-family)', minWidth: 0 }}
                      />
                      <EyeBtn field={field} />
                    </div>
                  </div>
                ))}

                {pwError && (
                  <div style={{ fontSize: '0.79rem', color: 'var(--danger)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '8px', padding: '7px 11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {pwError}
                  </div>
                )}

                <button type="submit" disabled={pwLoading} className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '0.87rem', padding: '9px' }}>
                  {pwLoading ? (
                    <><svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg> Saving…</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Save New Password</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Card 2: Quick Actions ── */}
        <div className="profile-card">
          <h2 style={{ margin: '0 0 2rem', textAlign: 'center', color: 'var(--text)', fontSize: '1.5rem', fontWeight: '700' }}>Quick Actions</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary)"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13l1.1-5M7 13h10m0 0l1.1 5M17 13l1.1-5M17 13H7m10 0l1.1 5M17 13l1.1-5" /></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Orders</div>
                <div style={{ fontWeight: '600', color: 'var(--text)' }}>{orders ? orders.length : 0} order{orders && orders.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--danger)"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" /></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Wishlist</div>
                <div style={{ fontWeight: '600', color: 'var(--text)' }}>{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <Link to="/cart" style={{ textDecoration: 'none' }}>
                <button className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="m1 1 4 4h15l-1 5H6"/></svg>
                  View Cart
                </button>
              </Link>
              <button className="btn secondary" onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </button>
            </div>
          </div>
        </div>

      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={() => { logout(); setShowLogoutModal(false); }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </main>
  );
}

export default Profile;
