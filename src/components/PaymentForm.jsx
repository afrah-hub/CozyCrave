import React, { useState, useRef } from 'react';

const PaymentForm = ({ onPaymentSuccess, amount }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  // Formatting helpers
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    // Add spaces every 4 digits
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
    setError(null);
  };

  const handleCardNameChange = (e) => {
    setCardName(e.target.value.toUpperCase());
    setError(null);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setExpiry(val);
    setError(null);
  };

  const handleCvvChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    setCvv(val);
    setError(null);
  };

  const fillTestCredentials = () => {
    setCardNumber('4111 1111 1111 1111');
    setCardName('JOHN DOE');
    setExpiry('12/29');
    setCvv('123');
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple Validation
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length !== 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardName.trim()) {
      setError('Please enter the cardholder name.');
      return;
    }
    if (expiry.length !== 5 || !expiry.includes('/')) {
      setError('Please enter expiry date as MM/YY.');
      return;
    }
    if (cvv.length < 3) {
      setError('Please enter a valid CVV code.');
      return;
    }

    setProcessing(true);
    setProcessingStep(1);

    // Simulate payment authorization stages
    setTimeout(() => {
      setProcessingStep(2);
      setTimeout(() => {
        setProcessingStep(3);
        setTimeout(() => {
          onPaymentSuccess('mock-payment-intent-' + Date.now());
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="payment-form-container">
      {/* Scope style block to keep component self-contained and modular */}
      <style>{`
        .payment-form-container {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          font-family: var(--font-family);
        }

        /* 3D Card Area */
        .card-preview-wrapper {
          perspective: 1000px;
          margin-bottom: 30px;
          width: 100%;
          height: 220px;
        }

        .credit-card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }

        .credit-card.flipped {
          transform: rotateY(180deg);
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 16px;
          padding: 24px;
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 15px 35px rgba(139, 69, 19, 0.25);
          background: linear-gradient(135deg, #3d2314 0%, #8b4513 50%, #c68a4c 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .card-back {
          transform: rotateY(180deg);
          padding: 24px 0;
          justify-content: flex-start;
        }

        /* Card Details Styles */
        .card-chip {
          width: 45px;
          height: 35px;
          background: linear-gradient(135deg, #ffd700 0%, #cca300 100%);
          border-radius: 6px;
          position: relative;
        }
        
        .card-chip::after {
          content: '';
          position: absolute;
          top: 5px;
          left: 5px;
          right: 5px;
          bottom: 5px;
          border: 1px solid rgba(0,0,0,0.15);
          border-radius: 4px;
        }

        .card-logo {
          font-weight: 800;
          font-style: italic;
          font-size: 1.4rem;
          color: rgba(255, 255, 255, 0.95);
          letter-spacing: 1px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        .card-number-display {
          font-size: 1.45rem;
          letter-spacing: 3px;
          font-family: var(--font-mono);
          margin: 20px 0 10px;
          text-shadow: 1px 2px 2px rgba(0,0,0,0.4);
        }

        .card-bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .card-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 4px;
        }

        .card-value {
          font-size: 0.95rem;
          letter-spacing: 1px;
          font-weight: 500;
          text-shadow: 1px 1px 1px rgba(0,0,0,0.2);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 250px;
        }

        /* Card Back specific details */
        .magnetic-strip {
          width: 100%;
          height: 45px;
          background: #111;
          margin-top: 10px;
          margin-bottom: 20px;
        }

        .signature-area {
          margin: 0 24px;
          display: flex;
          flex-direction: column;
        }

        .sig-bar {
          background: rgba(255, 255, 255, 0.8);
          height: 35px;
          border-radius: 4px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 0 12px;
          color: #111;
          font-family: var(--font-mono);
          font-size: 1rem;
          font-style: italic;
          letter-spacing: 1.5px;
        }

        .card-logo-back {
          align-self: flex-end;
          margin-right: 24px;
          margin-top: 25px;
          opacity: 0.5;
          font-weight: 800;
          font-style: italic;
        }

        /* Form Controls */
        .payment-form {
          background: var(--surface);
          border-radius: var(--radius);
          padding: 24px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: var(--shadow);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
        }

        .grid-full {
          grid-column: span 2;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
        }

        .input-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .payment-input {
          padding: 12px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--radius-sm);
          font-size: 0.95rem;
          transition: var(--transition-fast);
          font-family: var(--font-family);
        }

        .payment-input:focus {
          outline: none;
          border-color: var(--primary-700);
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.15);
        }

        .error-message {
          background: #fff5f5;
          border-left: 4px solid var(--danger);
          color: #c53030;
          padding: 12px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 20px;
        }

        /* Helper buttons */
        .form-helper-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .btn-text-link {
          background: none;
          border: none;
          color: var(--primary-700);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .btn-text-link:hover {
          background: rgba(139, 69, 19, 0.08);
          text-decoration: underline;
        }

        /* Simulated processing state overlay */
        .processing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          border-radius: var(--radius);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 10;
          padding: 40px;
          text-align: center;
          backdrop-filter: blur(4px);
        }

        .spinner-ring {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(139, 69, 19, 0.15);
          border-top-color: var(--primary-700);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        .steps-indicator {
          margin-top: 15px;
          font-size: 0.9rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .step-item {
          opacity: 0.4;
          transition: opacity 0.3s;
        }

        .step-item.active {
          opacity: 1;
          font-weight: 600;
          color: var(--primary-700);
        }

        .step-item.done {
          opacity: 0.8;
          color: var(--success);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Credit Card Preview */}
      <div className="card-preview-wrapper" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`credit-card ${isFlipped ? 'flipped' : ''}`}>
          {/* Front Face */}
          <div className="card-face card-front">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-chip"></div>
              <div className="card-logo">CozyCrave</div>
            </div>
            <div className="card-number-display">
              {cardNumber || '•••• •••• •••• ••••'}
            </div>
            <div className="card-bottom-row">
              <div>
                <div className="card-label">Card Holder</div>
                <div className="card-value">{cardName || 'YOUR FULL NAME'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="card-label">Expires</div>
                <div className="card-value">{expiry || 'MM/YY'}</div>
              </div>
            </div>
          </div>

          {/* Back Face */}
          <div className="card-face card-back">
            <div className="magnetic-strip"></div>
            <div className="signature-area">
              <div className="card-label" style={{ marginBottom: '6px', marginLeft: '2px' }}>Security Code (CVV)</div>
              <div className="sig-bar">
                {cvv || '•••'}
              </div>
            </div>
            <div className="card-logo-back">CozyCrave</div>
          </div>
        </div>
      </div>

      {/* Interactive Form */}
      <div style={{ position: 'relative' }}>
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-helper-bar">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amount to pay: <strong>₹{amount}</strong></span>
            <button type="button" className="btn-text-link" onClick={fillTestCredentials}>
              ✨ Auto-Fill Demo Card
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-grid">
            <div className="input-group grid-full">
              <label className="input-label">Cardholder Name</label>
              <input
                type="text"
                className="payment-input"
                placeholder="e.g. JOHN DOE"
                value={cardName}
                onChange={handleCardNameChange}
                onFocus={() => setIsFlipped(false)}
                disabled={processing}
                required
              />
            </div>

            <div className="input-group grid-full">
              <label className="input-label">Card Number</label>
              <input
                type="text"
                className="payment-input"
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={handleCardNumberChange}
                onFocus={() => setIsFlipped(false)}
                disabled={processing}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Expiration Date</label>
              <input
                type="text"
                className="payment-input"
                placeholder="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                onFocus={() => setIsFlipped(false)}
                disabled={processing}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">CVV</label>
              <input
                type="password"
                className="payment-input"
                placeholder="123"
                value={cvv}
                onChange={handleCvvChange}
                onFocus={() => setIsFlipped(true)}
                onBlur={() => setIsFlipped(false)}
                disabled={processing}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn primary full-width"
            style={{ marginTop: '10px', padding: '14px', fontSize: '1.05rem', borderRadius: '12px' }}
            disabled={processing}
          >
            Pay Securely ₹{amount}
          </button>
        </form>

        {/* Processing overlay animation */}
        {processing && (
          <div className="processing-overlay">
            <div className="spinner-ring"></div>
            <h3 style={{ margin: '0 0 10px', color: 'var(--primary-700)' }}>Processing Payment</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>Please do not close this window or click back.</p>
            
            <div className="steps-indicator">
              <div className={`step-item ${processingStep === 1 ? 'active' : ''} ${processingStep > 1 ? 'done' : ''}`}>
                {processingStep > 1 ? '✓' : '•'} Connecting to bank gateways...
              </div>
              <div className={`step-item ${processingStep === 2 ? 'active' : ''} ${processingStep > 2 ? 'done' : ''}`}>
                {processingStep > 2 ? '✓' : '•'} Authorizing transaction...
              </div>
              <div className={`step-item ${processingStep === 3 ? 'active' : ''}`}>
                {processingStep === 3 ? '• Finalizing order status...' : '• Securing receipt...'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;

