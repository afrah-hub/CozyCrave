import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import "./CartWishlist.css";

function Wishlist() {
  const { wishlist, addToCart, removeFromWishlist } = useContext(AppContext);

  return (
    <div className="cart-wishlist-container">
      <h1 className="modern-title animate-fade-in">Your Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div className="glass-pane animate-fade-in" style={{ textAlign: 'center' }}>
          <div className="empty-modern">
            <div className="empty-icon">❤️</div>
            <h2 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Your wishlist is empty</h2>
            <p className="muted" style={{ marginBottom: '2rem' }}>Save your favorite items for later!</p>
            <Link to="/products" className="checkout-btn" style={{ maxWidth: '250px', margin: '0 auto' }}>
              Explore Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-pane animate-fade-in">
          <div className="wishlist-grid">
            {wishlist.map((product, index) => (
              <article 
                key={product.id} 
                className="modern-wish-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link to={`/product/${product.id}`} className="wish-img-box">
                  <img 
                    src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.jpg'} 
                    alt={product.name} 
                    onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/images/placeholder.jpg';}} 
                  />
                </Link>
                
                <div className="wish-content">
                  <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3>{product.name}</h3>
                  </Link>
                  <div className="price">₹{product.price}</div>
                  
                  <div className="wish-actions">
                    <button className="add-cart-btn-modern" onClick={() => addToCart(product)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="m1 1 4 4h15l-1 5H6"/>
                      </svg>
                      Add
                    </button>
                    <button className="wish-remove-btn" onClick={() => removeFromWishlist(product.id)} title="Remove from Wishlist">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
