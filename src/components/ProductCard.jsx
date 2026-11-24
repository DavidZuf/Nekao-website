import { Link } from '../router.jsx';
import { wornBy } from '../data.js';
import TeeVisual from './TeeVisual.jsx';

export default function ProductCard({ product }) {
  const worn = wornBy(product.id);
  return (
    <Link to={`/shop/${product.id}`} className="card">
      <div className="card-visual">
        <TeeVisual product={product} />
        {worn[0] && <span className="card-badge">Worn by {worn.map((w) => w.model.name).join(' & ')}</span>}
      </div>
      <span className="card-name">{product.name}</span>
      <span className="card-meta">{product.price} · {product.color}</span>
    </Link>
  );
}
