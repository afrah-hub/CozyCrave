import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
function OrderPlacement() {
  const { user, cart, checkout, addNotification } = useContext(AppContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const validCart = cart.filter(item => item && item.product && item.product.id);
  const total = validCart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };
  const handlePlaceOrder = async () => {
    if (!user) {
      addNotification("Please login to place an order", "error");
      return;
    }
    if (validCart.length === 0) {
      addNotification("Your cart is empty", "warning");
      return;
    }
    if (!address.street || !address.city || !address.state || !address.zip || !address.country) {
      addNotification("Please fill in all address fields", "error");
      return;
    }
    setIsPlacing(true)
    try {
      await checkout(address);
      setOrderPlaced(true);
    } catch {
      addNotification("Failed to place order. Please try again.", "error");
    } finally {
      setIsPlacing(false);
    }
  };
  const handleContinueShopping = () => {
    navigate("/products");
  };

  

  if (orderPlaced) {
    return (
      <main className="container order-placement-page">
        <div className="order-success">
          <div className="success-icon">✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Your order has been placed and will be delivered soon.</p>
          <button className="btn" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container order-placement-page">
      <h2>Place Your Order</h2>

      <div className="order-placement-grid">
        <div className="user-info-section">
          <h3>User Information</h3>
          <div className="user-details">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email || "Not provided"}</p>
          </div>
        </div>

        <div className="address-section">
          <h3>Shipping Address</h3>
          <form className="address-form">
            <div className="form-group">
              <label htmlFor="street">Street Address</label>
              <input
                type="text"
                id="street"
                name="street"
                value={address.street}
                onChange={handleAddressChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zip">ZIP Code</label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={address.zip}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={address.country}
                  onChange={handleAddressChange}
                  required
                />
              </div>
            </div>
          </form>
        </div>

        <div className="order-summary-section">
          <h3>Order Summary</h3>
          <div className="order-items">
            {validCart.map((item, index) => (
              <div key={`order-item-${index}`} className="order-item">
                <img
                  src={item.product.images && item.product.images[0] ? item.product.images[0] : '/images/placeholder.jpg'}
                  alt={item.product.name}
                  className="order-item-image"
                />
                <div className="order-item-details">
                  <strong>{item.product.name}</strong>
                  <p className="muted">₹{item.product.price} each</p>
                  <p>Quantity: {item.qty}</p>
                  <p className="subtotal">Subtotal: ₹{(item.product.price * item.qty).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Total: ₹{total.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="order-actions">
        <button className="btn secondary" onClick={() => navigate("/cart")}>
          Back to Cart
        </button>
        <button
          className="btn"
          onClick={handlePlaceOrder}
          disabled={isPlacing}
        >
          {isPlacing ? "Placing Order..." : "Confirm and Place Order"}
        </button>
      </div>
    </main>
  );
}

export default OrderPlacement;
