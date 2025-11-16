import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function Profile() {
  const { user, logout, wishlist } = useContext(AppContext);

  if (!user) {
    return (
      <main className="container">
        <h1>My Profile</h1>
        <p>User not logged in</p>
      </main>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <main className="container">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          color: 'var(--text)',
          margin: '0 0 0.5rem',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-800))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem', margin: '0' }}>
          Manage your account and preferences
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>        <div className="profile-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  display: 'block',
                  objectFit: 'cover',
                  border: '4px solid var(--primary)',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
            ) : (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--brand)',
                color: 'white',
                fontSize: '3rem',
                boxShadow: 'var(--shadow-md)'
              }}>
                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text)', fontSize: '1.5rem' }}>
              {user.name || user.username}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary)">
                <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/>
              </svg>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Email</div>
                <div style={{ fontWeight: '500', color: 'var(--text)' }}>{user.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary)">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"/>
              </svg>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Member Since</div>
                <div style={{ fontWeight: '500', color: 'var(--text)' }}>
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h2 style={{
            margin: '0 0 2rem',
            textAlign: 'center',
            color: 'var(--text)',
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            Quick Actions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary)">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13l1.1-5M7 13h10m0 0l1.1 5M17 13l1.1-5M17 13H7m10 0l1.1 5M17 13l1.1-5"/>
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Orders</div>
                <div style={{ fontWeight: '600', color: 'var(--text)' }}>
                  {user.orders ? user.orders.length : 0} order{user.orders && user.orders.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--danger)">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Wishlist</div>
                <div style={{ fontWeight: '600', color: 'var(--text)' }}>
                  {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <Link to="/cart" style={{ textDecoration: 'none' }}>
                <button className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="m1 1 4 4h15l-1 5H6"/>
                  </svg>
                  View Cart
                </button>
              </Link>

              <button className="btn secondary" onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;
