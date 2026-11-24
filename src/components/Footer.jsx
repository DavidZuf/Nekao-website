import { useState } from 'react';
import { Link } from '../router.jsx';

export default function Footer() {
  const [joined, setJoined] = useState(false);
  return (
    <footer className="footer">
      <div className="footer-news">
        <h2>Next drop, first</h2>
        <p>One email when the door opens again. Nothing else.</p>
        {joined ? (
          <p className="footer-thanks">You're on the list. [Connect the newsletter: Shopify or Klaviyo]</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setJoined(true); }}>
            <input type="email" required placeholder="Email address" aria-label="Email address" />
            <button type="submit" className="btn btn--light">Join</button>
          </form>
        )}
      </div>
      <div className="footer-cols">
        <div>
          <span className="eyebrow">Shop</span>
          <Link to="/shop">All tees</Link>
          <Link to="/apartment">The Apartment</Link>
        </div>
        <div>
          <span className="eyebrow">Help</span>
          <Link to="/help#size-guide">Size guide</Link>
          <Link to="/help#shipping">Shipping</Link>
          <Link to="/help#returns">Returns</Link>
          <Link to="/help#contact">Contact</Link>
        </div>
        <div>
          <span className="eyebrow">NEKAO</span>
          <Link to="/about">About</Link>
          <a href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram [add handle]</a>
        </div>
      </div>
      <p className="footer-legal">© {new Date().getFullYear()} NEKAO</p>
    </footer>
  );
}
