import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import "./CartWishlist.css";

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
    setTimeout(() => removeFromCart(productId), 300);
  };

  const clearCart = () => {
    validCart.forEach(item => {
      setAnimatingItems(prev => new Set(prev).add(item.product.id));
    });
    setTimeout(() => {
      validCart.forEach(item => removeFromCart(item.product.id));
    }, 300);
  };

  return (
    <div className="cart-wishlist-container">
      <h1 className="modern-title animate-fade-in">Your Shopping Cart</h1>
      
      {validCart.length === 0 ? (
        <div className="glass-pane animate-fade-in" style={{ textAlign: 'center' }}>
          <div className="empty-modern">
            <div className="empty-icon">🛒</div>
            <h2 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Your cart is empty</h2>
            <p className="muted" style={{ marginBottom: '2rem' }}>Add some delicious treats to get started!</p>
            <Link to="/products" className="checkout-btn" style={{ maxWidth: '250px', margin: '0 auto' }}>
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-pane animate-fade-in">
          <div className="cart-layout">
            <div className="cart-items-list">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Items ({validCart.length})</h2>
                <button onClick={clearCart} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                  Clear All
                </button>
              </div>
              
              {validCart.map((item, index) => (
                <div 
                  key={`cart-item-${item.product.id}`} 
                  className={`modern-cart-item ${animatingItems.has(item.product.id) ? 'removing' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="item-img-wrapper">
                    <img 
                      src={item.product.images && item.product.images[0] ? item.product.images[0] : '/images/placeholder.jpg'} 
                      alt={item.product.name} 
                      onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/images/placeholder.jpg';}} 
                    />
                  </div>
                  
                  <div className="item-info">
                    <h3>{item.product.name}</h3>
                    <div className="price-tag">₹{item.product.price}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '4px' }}>
                      Subtotal: ₹{(item.product.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="cart-item-actions">
                    <div className="qty-pill">
                      <button 
                        className="qty-pill-btn" 
                        onClick={() => handleQtyChange(item.product.id, item.qty - 1)} 
                        disabled={item.qty <= 1}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/></svg>
                      </button>
                      <span className="qty-pill-val">{item.qty}</span>
                      <button 
                        className="qty-pill-btn" 
                        onClick={() => handleQtyChange(item.product.id, item.qty + 1)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                      </button>
                    </div>
                    
                    <button className="remove-icon-btn" onClick={() => handleRemove(item.product.id)} title="Remove Item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              
              <Link to="/order-placement" className="checkout-btn" style={{ marginTop: '1.25rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Checkout Now
              </Link>
              
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted)', marginTop: '1rem' }}>
                Secure SSL Encrypted Checkout
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;

