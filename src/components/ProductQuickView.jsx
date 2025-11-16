import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

function ProductQuickView({ product, onClose }) {
  const { addToCart, addToWishlist, removeFromWishlist, removeFromCart, wishlist, cart, addNotification } = useContext(AppContext);

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const isInCart = (productId) => {
    return cart.some(item => item.product.id === productId);
  };

  const handleAddToCart = () => {
    if (isInCart(product.id)) {
      removeFromCart(product.id);
      addNotification(`${product.name} removed from cart!`, 'success');
    } else {
      addToCart(product);
      addNotification(`${product.name} added to cart!`, 'success');
    }
    onClose();
  };

  const handleAddToWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      addNotification(`${product.name} removed from wishlist!`, 'success');
    } else {
      addToWishlist(product);
      addNotification(`${product.name} added to wishlist!`, 'success');
    }
  };

  return (
    <div className="quick-view-overlay" onClick={onClose}>
      <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="quick-view-content">
          <div className="quick-view-image">
            <img
              src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.jpg'}
              alt={product.name}
              className="quick-view-main-image"
              onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/images/placeholder.jpg';}}
            />
          </div>
          <div className="quick-view-details">
            <h2>{product.name}</h2>
            <div className="product-price">₹{product.price}</div>
            <div className="product-description">
              <p>{product.description}</p>
            </div>
            <div className="quick-view-actions">
              <button className="btn btn-brand" onClick={handleAddToCart}>
                {isInCart(product.id) ? 'Remove from Cart' : 'Add to Cart'}
              </button>
              <button
                className={`btn outline ${isInWishlist(product.id) ? 'wishlist-active' : ''}`}
                onClick={handleAddToWishlist}
                title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <svg width='18' height='18' viewBox='0 0 24 24' fill={isInWishlist(product.id) ? '#e74c3c' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d='M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z' />
                </svg>
                <span>{isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductQuickView;
