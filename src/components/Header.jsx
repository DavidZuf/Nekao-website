import { useEffect, useState } from 'react';
import { Link } from '../router.jsx';

const NAV = [
  { to: '/apartment', label: 'The Apartment' },
  { to: '/residents', label: 'Residents' },
  { to: '/about', label: 'About' }
];

export default function Header({ path, center, onBag, bagCount, overlay }) {
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [path]);
  const active = (to) => path === to || path.startsWith(`${to}/`);

  return (
    <>
      <header className={`header ${overlay ? '' : 'header--solid'}`}>
        <Link to="/" className="brand">
          <img src="/logo_cream.png" alt="" />
          <span>NEKAO</span>
        </Link>
        <nav className="header-nav" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={`link ${active(n.to) ? 'is-active' : ''}`}>{n.label}</Link>
          ))}
        </nav>
        <div className="header-center">{center}</div>
        <div className="header-right">
          <button type="button" className="link" onClick={onBag}>Bag ({bagCount})</button>
          <button type="button" className="menu-btn" onClick={() => setMenu(true)} aria-label="Menu">
            <span /><span />
          </button>
        </div>
      </header>

      {menu && (
        <div className="mobile-menu" role="dialog" aria-label="Menu">
          <button type="button" className="close close--light" onClick={() => setMenu(false)} aria-label="Close">×</button>
          <Link to="/">Home</Link>
          {NAV.map((n) => <Link key={n.to} to={n.to}>{n.label}</Link>)}
          <Link to="/help">Help</Link>
        </div>
      )}
    </>
  );
}
