import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function Wishlist() {
  const { wishlist, addToCart, removeFromWishlist } = useContext(AppContext);

  return (
    <main className="wishlist-page container">
      <h2>Your Wishlist</h2>
      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
          <p>Your wishlist is empty.</p>
          <p className="muted">Save your favorite treats for later!</p>
          <Link to="/products" className="btn" style={{ marginTop: '1rem' }}>
            Discover Products
          </Link>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--muted)' }}>
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist
          </div>
          <div className="products-grid">
            {wishlist.map((product) => (
              <article key={product.id} className="product-card">
                <Link to={`/product/${product.id}`} className="product-thumb-link">
                  <img src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.jpg'} alt={product.name} className="product-image" onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/images/placeholder.jpg';}} />
                </Link>
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3>{product.name}</h3>
                </Link>
                <p className="product-price">₹{product.price}</p>
                <div className="product-actions">
                  <button className="btn" onClick={() => addToCart(product)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="m1 1 4 4h15l-1 5H6"/>
                    </svg>
                    Add to Cart
                  </button>
                  <button className="btn outline" onClick={() => removeFromWishlist(product.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default Wishlist;
