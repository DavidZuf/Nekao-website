import { useState } from 'react';
import { PRODUCTS, SIZES, wornBy } from '../data.js';
import { Link } from '../router.jsx';
import TeeVisual from './TeeVisual.jsx';
import ProductCard from './ProductCard.jsx';
import Footer from './Footer.jsx';

export default function ProductPage({ product, onAdd }) {
  const [size, setSize] = useState('M');
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <main className="page">
        <section className="section section--top">
          <h1 className="page-title">Not here</h1>
          <p className="lead">That tee isn't in the apartment. <Link to="/shop" className="inline-link">See all tees</Link></p>
        </section>
        <Footer />
      </main>
    );
  }

  const worn = wornBy(product.id);
  const more = Object.values(PRODUCTS).filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <main className="page">
      <section className="section section--top">
        <p className="crumbs"><Link to="/shop">Shop</Link> / {product.name}</p>
        <div className="pdp">
          <div className="pdp-visual" style={{ background: product.swatch === '#141412' ? '#24211d' : '#1a1816' }}>
            <TeeVisual product={product} size={320} />
            <span className="photo-note">[Product photos: front, back, on the model]</span>
          </div>

          <div className="pdp-info">
            <p className="eyebrow">Drop 01</p>
            <h1>{product.name}</h1>
            <p className="pdp-price">{product.price}</p>
            <p className="pdp-color">{product.color}</p>

            <div className="sizes">
              <span className="eyebrow">Size: {size}</span>
              <div className="size-row size-row--light">
                {SIZES.map((s) => (
                  <button key={s} type="button" className={s === size ? 'is-active' : ''} onClick={() => { setSize(s); setAdded(false); }}>{s}</button>
                ))}
              </div>
              <Link to="/help#size-guide" className="inline-link">Size guide</Link>
            </div>

            <button type="button" className="btn btn--light btn--wide" onClick={() => { onAdd(product, size); setAdded(true); }}>
              {added ? 'Added ✓ — add another' : 'Add to bag'}
            </button>

            <p className="pdp-details">{product.details}</p>

            {worn.map(({ model, room }) => (
              <Link key={model.id} to={`/apartment/${room.id}`} className="pdp-worn">
                {model.cutout ? <img src={model.cutout.src} alt="" /> : <span className="pdp-worn-dot" style={{ background: product.swatch }} />}
                <span>Worn by {model.name} in the {room.name.toLowerCase()}<small>Go meet them →</small></span>
              </Link>
            ))}

            <details className="pdp-more">
              <summary>Shipping & returns</summary>
              <p>[Shipping times and costs.] [Returns window and how to send back.]</p>
            </details>
            <details className="pdp-more">
              <summary>Care</summary>
              <p>[Wash cold, inside out. Don't tumble dry.]</p>
            </details>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">More from the drop</h2>
        <div className="shop-grid">
          {more.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
      <Footer />
    </main>
  );
}
