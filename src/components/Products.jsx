import React, { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { fetchProducts } from '../services/api';
import ProductQuickView from './ProductQuickView';
import LoadingSpinner from './LoadingSpinner';

function Products() {
  const { addToCart, addToWishlist, removeFromWishlist, removeFromCart, wishlist, cart, addNotification } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [sweetsHovered, setSweetsHovered] = useState(false);
  const [nutsHovered, setNutsHovered] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const isInCart = (productId) => {
    return cart.some(item => item.product.id === productId);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = products.slice();
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (priceRange.min !== '') {
      filtered = filtered.filter(product => product.price >= parseInt(priceRange.min));
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(product => product.price <= parseInt(priceRange.max));
    }
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, priceRange]);

  if (error) return <p>{error}</p>;
  const categories = ['All', 'Premium', 'Sweets', 'Nuts'];

  const renderProducts = (category) => {
    const categoryProducts = filteredProducts.filter(p => p.category === category);



    return categoryProducts.map((product) => (
      <article key={product.id} className='product-card' aria-labelledby={`${category.toLowerCase()}-${product.id}`}>
        <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`} className="product-thumb-link" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.jpg'} alt={product.name} className='product-image' onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/images/placeholder.jpg';}} />
        </Link>
        <Link to={`/product/${product.id}`} id={`${category.toLowerCase()}-${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>{product.name}</h3>
        </Link>
        <div className='product-price'>₹{product.price}</div>
        <div className='product-actions'>
          <button className='btn' style={{ fontSize: '12px', padding: '6px 12px', width: '60px' }} onClick={() => {
            if (isInCart(product.id)) {
              removeFromCart(product.id);
              addNotification(`${product.name} removed from cart!`, 'success');
            } else {
              addToCart(product);
              addNotification(`${product.name} added to cart!`, 'success');
            }
          }}>{isInCart(product.id) ? 'Remove from cart' : 'Add to cart'}</button>
          <button
            className={isInWishlist(product.id) ? 'wishlist-active' : ''}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
            onClick={() => {
              if (isInWishlist(product.id)) {
                removeFromWishlist(product.id);
                addNotification(`${product.name} removed from wishlist!`, 'success');
              } else {
                addToWishlist(product);
                addNotification(`${product.name} added to wishlist!`, 'success');
              }
            }}
            aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg width='18' height='18' viewBox='0 0 24 24' fill={isInWishlist(product.id) ? 'red' : 'black'} aria-hidden="true">
              <path d='M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z'/>
            </svg>
          </button>
          <button className='btn secondary' style={{ fontSize: '12px', padding: '6px 12px', width: '60px' }} onClick={() => setQuickViewProduct(product)}>Quick View</button>
        </div>
      </article>
    ));
  };

  return (
    <>
      <section id='products' className='container'>
        

        <div className='products-layout'>
          <aside className='filters-sidebar'>
            <div className='filters'>
              <div className='filter-group'>
                <label className='filter-label'>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M3 7h18M3 12h18M3 17h18'/>
                  </svg>
                  Category
                </label>
                <select
                  className='filter-select'
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className='filter-group'>
                <label className='filter-label'>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <circle cx='12' cy='12' r='3'/>
                    <path d='M12 1v6m0 6v6m11-7h-6m-6 0H1'/>
                  </svg>
                  Price Range
                </label>
                <div className='price-inputs'>
                  <input
                    type='number'
                    placeholder='Min ₹'
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  />
                  <span className='price-separator'>to</span>
                  <input
                    type='number'
                    placeholder='Max ₹'
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  />
                </div>
              </div>

              <div className='search-bar'>
                <div className='search-input-wrapper'>
                  <svg className='search-icon' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <circle cx='11' cy='11' r='8'></circle>
                    <path d='m21 21-4.35-4.35'></path>
                  </svg>
                  <input
                    type='text'
                    placeholder='Search chocolates, sweets, nuts...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search products"
                  />
                  {searchQuery && (
                    <button
                      className='clear-search-btn'
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <line x1='18' y1='6' x2='6' y2='18'></line>
                        <line x1='6' y1='6' x2='18' y2='18'></line>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <button
                className='btn reset-btn'
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setPriceRange({ min: '', max: '' });
                }}
                style={{ width: '100%', marginTop: '15px' }}
              >
                Reset Filters
              </button>
            </div>
          </aside>

          <main className='products-main' style={{ position: 'relative' }}>
            {(selectedCategory === 'All' || selectedCategory === 'Premium') && (
              <section className='product-section'>
                <h1
                  style={{
                    textAlign: 'center',
                    color: '#e1a95f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onClick={() => setSelectedCategory('Premium')}
                >
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor' style={{color: '#FFD700'}}>
                    <path d='M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z'/>
                  </svg>
                  Premium Collections
                </h1>
                <h3>Premium Chocolates</h3>
                <div className='products-grid' aria-live="polite">
                  {renderProducts('Premium')}
                </div>
              </section>
            )}

            {(selectedCategory === 'All' || selectedCategory === 'Sweets') && (
              <section className='product-section'>
                <h1
                  style={{
                    textAlign: 'center',
                    color: '#e1a95f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    transform: sweetsHovered ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onMouseEnter={() => setSweetsHovered(true)}
                  onMouseLeave={() => setSweetsHovered(false)}
                  onClick={() => setSelectedCategory('Sweets')}
                >
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor' style={{color: '#FFD700'}}>
                    <path d='M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z'/>
                  </svg>
                  Traditional Sweets
                </h1>
                <h3>Delicious Indian Sweets</h3>
                <div className='products-grid'>
                  {renderProducts('Sweets')}
                </div>
              </section>
            )}

            {(selectedCategory === 'All' || selectedCategory === 'Nuts') && (
              <section className='product-section'>
                <h1
                  style={{
                    textAlign: 'center',
                    color: '#e1a95f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    transform: nutsHovered ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onMouseEnter={() => setNutsHovered(true)}
                  onMouseLeave={() => setNutsHovered(false)}
                  onClick={() => setSelectedCategory('Nuts')}
                >
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor' style={{color: '#FFD700'}}>
                    <path d='M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z'/>
                  </svg>
                  Nutritious Nuts Collection
                </h1>
                <h3>Healthy Nuts</h3>
                <div className='products-grid'>
                  {renderProducts('Nuts')}
                </div>
              </section>
            )}

            {loading && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                <LoadingSpinner message="Loading products..." />
              </div>
            )}
          </main>
        </div>
      </section>

      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
    

export default Products;