import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import brandLogo from "/images/placeholder1.png";
import { fetchProducts } from "../services/api";
function Header() {
  const { user, logout, cart, wishlist, addToCart } = useContext(AppContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); 
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await fetchProducts();
        setAllProducts(products);
      } catch (error) {
        console.error('Failed to load products for search:', error);
      }
    };
    loadProducts();
  }, []);
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6); 
      setSearchResults(filtered);
      setShowDropdown(true);
      setSelectedIndex(-1);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  }, [searchQuery, allProducts]);
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
      setShowDropdown(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (!showDropdown || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
      scrollResultIntoView(selectedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
      scrollResultIntoView(selectedIndex - 1);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        navigateToProduct(searchResults[selectedIndex]);
      } else {
        handleSearch(e);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const scrollResultIntoView = (index) => {
    const container = resultsRef.current;
    if (!container) return;
    const item = container.querySelector(`#search-result-${index}`);
    if (item) item.scrollIntoView({ block: 'nearest' });
  };

  const navigateToProduct = (product) => {
    navigate(`/product/${product.id}`);
    setSearchQuery("");
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsUserDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowDropdown(false);
  };

  const addToCartFromSearch = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setSearchQuery("");
    setShowDropdown(false);
  };

  return (
    <header className={`site-header ${isScrolled ? "sticky" : ""}`}>
      <div className="container">
        <div className="header-inner">
          <Link to="/" className="brand" onClick={closeMenu} aria-label="Home">
            <img src={brandLogo} alt="Cozy Crave Logo" className="brand-logo" />
            <span className="brand-text">Cozy Crave</span>
          </Link>

          <div className="search-container" role="search" aria-label="Product search">
            <form className="search-form" onSubmit={handleSearch}>
              <input
                ref={inputRef}
                id="header-search"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                onKeyDown={handleInputKeyDown}
                aria-autocomplete="list"
                aria-controls="search-dropdown"
                aria-expanded={showDropdown}
                aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
              />
              {searchQuery && (
                <button type="button" className="clear-btn" onClick={clearSearch} aria-label="Clear search">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
              <button type="submit" className="search-btn" aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </form>

            {showDropdown && searchResults.length > 0 && (
              <div id="search-dropdown" className="search-dropdown" ref={resultsRef} role="listbox">
                {searchResults.map((product, idx) => (
                  <div
                    id={`search-result-${idx}`}
                    key={product.id}
                    role="option"
                    aria-selected={selectedIndex === idx}
                    className={`search-result-item ${selectedIndex === idx ? 'active' : ''}`}
                    onClick={() => navigateToProduct(product)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <img
                      src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.jpg'}
                      alt={product.name}
                      className="search-result-image"
                    />
                    <div className="search-result-info">
                      <h4>{product.name}</h4>
                      <p>₹{product.price}</p>
                    </div>
                    <button
                      className="search-add-to-cart"
                      onClick={(e) => addToCartFromSearch(e, product)}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <nav className={`main-nav ${isMenuOpen ? "open" : ""}`} aria-label="Main navigation">
            <ul>
              <li><Link to="/" onClick={closeMenu} className="nav-link">Home</Link></li>
              <li><Link to="/products" onClick={closeMenu} className="nav-link">Products</Link></li>
              {!user ? (
                <>
                  <li><Link to="/login" onClick={closeMenu} className="nav-link">Login</Link></li>
                  <li><Link to="/register" onClick={closeMenu} className="nav-link">Register</Link></li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/cart" onClick={closeMenu} className="icon-btn" aria-label="Cart">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="m1 1 4 4h15l-1 5H6"></path>
                      </svg>
                      {cart.length > 0 && <span className="badge">{cart.length}</span>}
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" onClick={closeMenu} className="icon-btn" aria-label="Wishlist">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
                    </Link>
                  </li>
                  <li className="user-dropdown">
                    <button className="user-btn" onClick={toggleUserDropdown} aria-haspopup="true" aria-expanded={isUserDropdownOpen}>
                      <div className="user-avatar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                      <span className="user-name">{user.username || user.name || "User"}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`dropdown-arrow ${isUserDropdownOpen ? "open" : ""}`}>
                        <polyline points="6,9 12,15 18,9"></polyline>
                      </svg>
                    </button>
                    {isUserDropdownOpen && (
                      <ul className="dropdown-menu" role="menu">
                        <li><button
                          className="dropdown-item"
                          onClick={() => {
                            if (user && user.role === 'admin') {
                              navigate('/admin');
                            } else {
                              navigate('/profile');
                            }
                            closeMenu();
                          }}
                        >Profile</button></li>
                        <li><Link to="/orders" onClick={closeMenu} className="dropdown-item">Orders</Link></li>

                        <li><button className="dropdown-item logout-btn" onClick={() => { logout(); closeMenu(); }}>Logout</button></li>
                      </ul>
                    )}
                  </li>
                </>
              )}
            </ul>
          </nav>

          <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu" aria-expanded={isMenuOpen}>
            <div className="hamburger">
              <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
              <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
              <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;