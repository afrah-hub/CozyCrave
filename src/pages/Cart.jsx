import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function Cart() {
  const { cart, updateCartQty, removeFromCart } = useContext(AppContext);
  const [animatingItems, setAnimatingItems] = useState(new Set());

  const validCart = cart.filter(item => item && item.product && item.product.id);
  const total = validCart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const handleQtyChange = (productId, newQty) => {
    setAnimatingItems(prev => new Set(prev).add(productId));
    updateCartQty(productId, newQty);
    setTimeout(() => {
      setAnimatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }, 300);
  };

  const handleRemove = (productId) => {
    setAnimatingItems(prev => new Set(prev).add(productId));
    setTimeout(() => removeFromCart(productId), 150);
  };

  const clearCart = () => {
    validCart.forEach(item => {
      setAnimatingItems(prev => new Set(prev).add(item.product.id));
    });
    setTimeout(() => {
      validCart.forEach(item => removeFromCart(item.product.id));
    }, 150);
  };

  return (
    <main className="cart-page container">
      <h2>Your Shopping Cart</h2>
      {validCart.length === 0 ? (
        <div className="empty-cart">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
          <p>Your cart is empty.</p>
          <p className="muted">Add some delicious treats to get started!</p>
          <Link to="/products" className="btn" style={{ marginTop: '1rem' }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {validCart.map((item, index) => (
              <div key={`cart-item-${index}`} className={`cart-item ${animatingItems.has(item.product.id) ? 'animating' : ''}`}>
                <img src={item.product.images && item.product.images[0] ? item.product.images[0] : '/images/placeholder.jpg'} alt={item.product.name} className="cart-image" onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/images/placeholder.jpg';}} />
                <div className="item-details">
                  <strong>{item.product.name}</strong>
                  <p className="muted">₹{item.product.price} each</p>
                  <p className="subtotal">Subtotal: ₹{(item.product.price * item.qty).toFixed(2)}</p>
                </div>
                <div className="cart-controls">
                  <div className="quantity-controls">
                    <button className="qty-btn" onClick={() => handleQtyChange(item.product.id, item.qty - 1)} disabled={item.qty <= 1}>-</button>
                    <span className="qty-display">{item.qty}</span>
                    <button className="qty-btn" onClick={() => handleQtyChange(item.product.id, item.qty + 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => handleRemove(item.product.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-total">
            <strong>Total: ₹{total.toFixed(2)}</strong>
          </div>
          <div className="checkout-actions">
            <button className="btn clear-cart-btn" onClick={clearCart}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Clear Cart
            </button>
            <Link to="/order-placement" className="btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="m1 1 4 4h15l-1 5H6"/>
              </svg>
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

export default Cart;

