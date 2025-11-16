import { Link } from "react-router-dom";
import background from "../assets/background.jpg";

function Hero() {
  return (
    <section id="hero" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="hero-inner container">
        <div className="hero-content">
          <h2 className="hero-title">
            Wrap in <span className="highlight">Cozy</span>.<br />
            Indulge in <span className="highlight">Crave</span>.
          </h2>
          <p className="hero-sub">
            Discover your favorite comfort treats made with love and flavor.
            Premium chocolates, traditional sweets & healthy nuts.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="hero-cta primary">
              <span>Shop Now</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;
