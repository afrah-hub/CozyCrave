import React from 'react';
import ReactDOM from 'react-dom';
import './LogoutConfirmModal.css';

const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="logout-modal-overlay" onClick={onCancel}>
      <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-header">
          <div className="logout-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
          <h3>Confirm Logout</h3>
        </div>
        <p>Are you sure you want to log out? You will need to sign in again to access your account.</p>
        <div className="logout-modal-actions">
          <button className="logout-btn-cancel" onClick={onCancel}>
            Stay Logged In
          </button>
          <button className="logout-btn-confirm" onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutConfirmModal;
