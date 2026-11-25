import { useEffect, useState } from 'react';
import { SIZES } from '../data.js';
import { Link } from '../router.jsx';
import LookVisual from './LookVisual.jsx';

// Quick view used inside the apartment, so you can buy without leaving.
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

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={product.name}>
        <div className="drawer-top">
          <span className="drawer-where">{roomName ? `Worn in the ${roomName}` : 'NEKAO'}</span>
          <button type="button" className="close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="drawer-look"><LookVisual product={product} teeSize={200} roomName={roomName} /></div>
        <h2 className="drawer-name">{product.name.replace(/^\[Tee name\] — /, '')}</h2>
        <p className="tag-price">{product.price}</p>
        <div className="tag-sizes">
          <span>Size</span>
          <div>
            {SIZES.map((s) => (
              <button key={s} type="button" className={s === size ? 'is-active' : ''} onClick={() => setSize(s)}>{s}</button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="tag-add"
          onClick={() => { onAdd(product, size); setAdded(true); }}
        >
          {added ? `Added, size ${size}. Add another?` : 'Add to bag'}
        </button>
        <p className="details">{product.details}</p>
        <Link to={`/shop/${product.id}`} className="drawer-more" onClick={onClose}>Size guide, fabric & shipping →</Link>
      </aside>
    </>
  );
}
