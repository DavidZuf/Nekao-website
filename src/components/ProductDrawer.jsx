import { useEffect, useState } from 'react';
import { SIZES } from '../data.js';

export default function ProductDrawer({ product, roomName, onClose, onAdd }) {
  const [size, setSize] = useState('M');
  const [added, setAdded] = useState(false);

  useEffect(() => { setAdded(false); setSize('M'); }, [product?.id]);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!product) return null;
  const logo = product.logo === 'dark' ? './logo_dark.png' : './logo_cream.png';

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={product.name}>
        <div className="drawer-top">
          <span className="eyebrow eyebrow--dark">{roomName ? `Worn in the ${roomName}` : 'NEKAO'}</span>
          <button type="button" className="close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="product-visual" style={{ background: product.swatch === '#141412' ? '#1f1f1c' : '#141412' }}>
          <svg width="220" height="200" viewBox="0 0 200 180" aria-hidden="true">
            <path d="M50 20 L150 20 L190 60 L162 84 L148 70 L148 170 L52 170 L52 70 L38 84 L10 60 Z" fill={product.swatch} stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          </svg>
          <img src={logo} alt="" className="product-logo" />
          <span className="photo-note">[Swap for product photo]</span>
        </div>
        <h2>{product.name}</h2>
        <p className="price">{product.price}</p>
        <div className="sizes">
          <span className="eyebrow eyebrow--dark">Size: {size}</span>
          <div className="size-row">
            {SIZES.map((s) => (
              <button key={s} type="button" className={s === size ? 'is-active' : ''} onClick={() => setSize(s)}>{s}</button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="btn btn--dark"
          onClick={() => { onAdd(product, size); setAdded(true); }}
        >
          {added ? 'Added ✓ — add another' : 'Add to bag'}
        </button>
        <p className="details">{product.details}</p>
      </aside>
    </>
  );
}
