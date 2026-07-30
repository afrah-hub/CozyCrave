import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import PaymentForm from "../components/PaymentForm";

function OrderPlacement() {
  const { user, cart, checkout, confirmOrderPayment, addNotification } = useContext(AppContext);
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    phone: "",
  });

  const [paymentData, setPaymentData] = useState(null);
  const [isPlacing, setIsPlacing] = useState(false);

  const validCart = cart.filter(item => item && item.product && (item.product.id || item.product.Id));
  const total = validCart.reduce((s, i) => {
    const price = i.product.price ?? i.product.Price ?? 0;
    return s + (price * i.qty);
  }, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInitiatePayment = async () => {
    if (!user) {
      addNotification("Please login to place an order", "error");
      return;
    }
    if (validCart.length === 0) {
      addNotification("Your cart is empty", "warning");
      return;
    }

    const requiredFields = ["name", "street", "city", "state", "pincode", "country", "phone"];
    if (requiredFields.some(f => !formData[f])) {
      addNotification("Please fill in all address and contact fields", "error");
      return;
    }

    setIsPlacing(true);
    try {
      const orderRes = await checkout({
        name: formData.name,
        address: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        phone: formData.phone
      });

      if (orderRes.paymentError) {
        addNotification(orderRes.paymentError, "warning");
      }

      if (!orderRes.payment || !orderRes.payment.clientSecret) {
        if (!orderRes.paymentError) {
          addNotification("Order created but payment system is currently unavailable. Please check your orders.", "error");
        }
        setIsPlacing(false);
        return;
      }

      setPaymentData({
        ...orderRes.payment,
        orderId: orderRes.order?.id || orderRes.order?.Id
      });
    } catch (err) {
      console.error("Order initiation failed", err);
      const errorMsg = err?.response?.data || err.message;
      addNotification(`Failed to initiate order: ${typeof errorMsg === 'string' ? errorMsg : 'Unknown error'}`, "error");
    } finally {
      setIsPlacing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      setIsPlacing(true);
      const orderId = paymentData.orderId || paymentData.order?.id;
      await confirmOrderPayment(orderId, paymentIntentId);
      setSuccess(true);
    } catch (err) {
      console.error("Payment confirmation failed", err);
    } finally {
      setIsPlacing(false);
    }
  };

  if (success) {
    return (
      <main className="container order-placement-page">
        <div className="order-success glass-card animate-fade-in">
          <div className="success-icon-wrap">✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for your purchase. Your order is being processed and will be shipped soon.</p>
          <div className="success-actions">
            <button className="btn primary" onClick={() => navigate("/orders")}>
              View My Orders
            </button>
            <button className="btn secondary" onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container order-placement-page">
      <div className="checkout-header animate-fade-in">
        <h2>Checkout</h2>

        <div className="checkout-stepper">
          <div className={`step ${!paymentData ? 'active' : 'completed'}`}>
            <div className="step-number">{!paymentData ? '1' : '✓'}</div>
            <span>Shipping</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${paymentData ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Payment</span>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-number">3</div>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      <div className="order-placement-grid">
        <div className="checkout-main-section">
          <div className="address-section glass-card animate-fade-in">
            <div className="section-title">
              <span>01</span>
              <h3>Shipping Information</h3>
            </div>

            <div className="address-form">
              <div className="form-group">
                <label>Recipient Name</label>
                <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} disabled={!!paymentData} required />
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input type="text" name="street" placeholder="House No, Street, Landmark" value={formData.street} onChange={handleInputChange} disabled={!!paymentData} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} disabled={!!paymentData} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} disabled={!!paymentData} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Pincode</label>
                  <input type="text" name="pincode" placeholder="6-digit ZIP" value={formData.pincode} onChange={handleInputChange} disabled={!!paymentData} required />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} disabled={!!paymentData} required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" name="phone" placeholder="10-digit Mobile" value={formData.phone} onChange={handleInputChange} disabled={!!paymentData} required />
              </div>

              {!paymentData && (
                <button className="btn primary full-width" style={{ marginTop: '20px', padding: '16px' }} onClick={handleInitiatePayment} disabled={isPlacing}>
                  {isPlacing ? "Initializing Secure Checkout..." : "Proceed to Payment"}
                </button>
              )}
            </div>
          </div>

          {paymentData && (
            <div className="payment-section glass-card animate-fade-in">
              <div className="section-title">
                <span>02</span>
                <h3>Secure Payment</h3>

              </div>

              <div className="payment-container">
                <PaymentForm
                  onPaymentSuccess={handlePaymentSuccess}
                  amount={total.toFixed(2)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="order-summary-section">
          <div className="glass-card sticky-summary animate-fade-in">
            <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>
            <div className="order-items">
              {validCart.map((item, index) => (
                <div key={`order-item-${index}`} className="order-item">
                  <img
                    src={item.product.images && item.product.images[0] ? item.product.images[0] : '/images/placeholder.jpg'}
                    alt={item.product.name}
                    className="order-item-image"
                  />
                  <div className="order-item-details">
                    <strong>{item.product.name || item.product.Name}</strong>
                    <p>Qty: {item.qty} × ₹{item.product.price ?? item.product.Price}</p>
                  </div>
                  <div className="order-item-total">
                    ₹{((item.product.price ?? item.product.Price ?? 0) * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-total-breakdown">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping & Handling</span>
                <span className="free">FREE</span>
              </div>
              <div className="total-row grand-total">
                <strong>Order Total</strong>
                <strong>₹{total.toFixed(2)}</strong>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '15px', textAlign: 'center' }}>
              🔒 Secure SSL Encrypted Checkout
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default OrderPlacement;
