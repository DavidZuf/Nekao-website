import { useRef, useState } from 'react';
import { wornBy, nameOf } from '../data.js';
import { Link } from '../router.jsx';
import LookVisual from './LookVisual.jsx';

// The wardrobe: one row per tee. On desktop, the resident wearing it
// floats next to the cursor; on phones each row has its own picture.
export default function ProductIndex({ products }) {
  const [hover, setHover] = useState(null);
  const float = useRef(null);
  const move = (e) => {
    if (float.current) float.current.style.transform = `translate(${e.clientX + 28}px, ${e.clientY - 160}px)`;
  };

  return (
    <div className="wardrobe" onMouseMove={move} onMouseLeave={() => setHover(null)}>
      <ol>
        {products.map((p, i) => {
          const worn = wornBy(p.id);
          return (
            <li key={p.id}>
              <Link to={`/shop/${p.id}`} className="rail" onMouseEnter={() => setHover(p)}>
                <span className="rail-thumb"><LookVisual product={p} teeSize={70} /></span>
                <span className="rail-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="rail-name">{p.name.replace(/^\[Tee name\] — /, '')}</span>
                <span className="rail-who">
                  {worn.length > 0 && <>on {worn.map((w, j) => <span key={w.model.id}>{j > 0 && ' & '}<span className="hand">{nameOf(w.model)}</span></span>)}</>}
                </span>
                <span className="rail-color">{p.color}</span>
                <span className="rail-price">{p.price}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      <div ref={float} className={`rail-float ${hover ? 'is-on' : ''}`} aria-hidden="true">
        {hover && <LookVisual product={hover} />}
      </div>
    </div>
  );
}
