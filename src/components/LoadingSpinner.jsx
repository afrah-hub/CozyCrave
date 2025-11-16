import React from 'react';
const LoadingSpinner = ({ message = 'Loading...', minHeight = '50vh' }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight,
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid var(--primary, #8b4513)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <span style={{
        fontSize: '1.1rem',
        color: 'var(--text-secondary, #666)',
        fontWeight: '500'
      }}>
        {message}
      </span>
    </div>
  );
};

export default LoadingSpinner;