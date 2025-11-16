import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { fetchProductById } from '../services/api';


function ProductView() {
  const { id } = useParams();
  const { addToCart, addToWishlist, removeFromCart, removeFromWishlist, wishlist, cart, addNotification } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const isInCart = (productId) => {
    return cart.some(item => item.product.id === productId);
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        setError('Failed to load product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) return <p>Loading product...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Product not found</p>;

  const handleAddToCart = () => {
    if (isInCart(product.id)) {
      removeFromCart(product.id);
      addNotification(`${product.name} removed from cart!`, 'success');
    } else {
      addToCart(product, quantity);
      addNotification(`${product.name} (${quantity}) added to cart!`, 'success');
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  return (
    <div className="product-view container">
      <div className="product-view-grid">
        <div className="product-images">
          <div className="main-image">
            <img
              src={product.images && product.images[selectedImage] ? product.images[selectedImage] : '/images/placeholder.jpg'}
              alt={product.name}
              className="product-main-image"
              onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/images/placeholder.jpg';}}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-images">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                  onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/images/placeholder.jpg';}}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-details">
          <h1 className="product-title">{product.name}</h1>
          <div className="product-price">₹{product.price}</div>
          <div className="product-category">Category: {product.category}</div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="quantity-selector">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity-value">{quantity}</span>
              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange(1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="product-actions">
            <button className="btn primary" onClick={handleAddToCart}>
              {isInCart(product.id) ? 'Remove from Cart' : 'Add to Cart'}
            </button>
            <button
              className={`btn outline ${isInWishlist(product.id) ? 'wishlist-active' : ''}`}
              onClick={() => {
                if (isInWishlist(product.id)) {
                  removeFromWishlist(product.id);
                  addNotification(`${product.name} removed from wishlist!`, 'success');
                } else {
                  addToWishlist(product);
                  addNotification(`${product.name} added to wishlist!`, 'success');
                }
              }}
            >
              <svg width='18' height='18' viewBox='0 0 24 24' fill={isInWishlist(product.id) ? 'red' : 'currentColor'}>
                <path d='M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z'/>
              </svg>
              {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductView;

