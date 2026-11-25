import { useState } from 'react';
import { PRODUCTS, SIZES, wornBy } from '../data.js';
import { Link } from '../router.jsx';
import TeeVisual from './TeeVisual.jsx';
import LookVisual from './LookVisual.jsx';
import ProductIndex from './ProductIndex.jsx';
import Footer from './Footer.jsx';

export default function ProductPage({ product, onAdd }) {
  const [size, setSize] = useState('M');
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <main className="page">
        <section className="section section--top">
          <h1 className="page-title">Not here</h1>
          <p className="lead">That tee isn't in the apartment. <Link to="/shop" className="inline-link">See the wardrobe</Link></p>
        </section>
        <Footer />
      </main>
    );
  }

  const worn = wornBy(product.id);
  const name = product.name.replace(/^\[Tee name\] — /, '');
  const more = Object.values(PRODUCTS).filter((p) => p.id !== product.id);

  return (
    <main className="page">
      <section className="pdp">
        <div className="pdp-gallery">
          <figure className="pdp-shot pdp-shot--look">
            <LookVisual product={product} teeSize={320} />
            {worn[0] && <figcaption>{worn[0].model.name}, {worn[0].room.name.toLowerCase()}</figcaption>}
          </figure>
          <figure className="pdp-shot pdp-shot--flat">
            <TeeVisual product={product} size={300} />
            <figcaption>[Product photo: front]</figcaption>
          </figure>
        </div>

        <aside className="tag-card">
          <img className="tag-logo" src="/logo_dark.png" alt="" />
          <p className="tag-crumb"><Link to="/shop">The wardrobe</Link></p>
          <h1>{name}</h1>
          <p className="tag-price">{product.price}</p>

          <div className="tag-sizes">
            <span>Size</span>
            <div>
              {SIZES.map((s) => (
                <button key={s} type="button" className={s === size ? 'is-active' : ''} onClick={() => { setSize(s); setAdded(false); }}>{s}</button>
              ))}
            </div>
            <Link to="/help#size-guide">Size guide</Link>
          </div>

          <button type="button" className="tag-add" onClick={() => { onAdd(product, size); setAdded(true); }}>
            {added ? `Added, size ${size}. Add another?` : 'Add to bag'}
          </button>

          <dl className="tag-facts">
            <dt>Colour</dt><dd>{product.color}</dd>
            <dt>Fabric & fit</dt><dd>{product.details}</dd>
            <dt>Care</dt><dd>[Wash cold, inside out. Don't tumble dry.]</dd>
            <dt>Shipping</dt><dd>[Times, costs, returns window.] <Link to="/help#shipping">More</Link></dd>
          </dl>

          {worn.map(({ model, room }) => (
            <Link key={model.id} to={`/residents/${model.id}`} className="tag-meet">
              Worn by {model.name}, {room.name.toLowerCase()}. <em>Meet {model.name} →</em>
            </Link>
          ))}
        </aside>
      </section>

      <section className="section">
        <h2 className="section-title">Also in the wardrobe</h2>
        <ProductIndex products={more} />
      </section>
      <Footer />
    </main>
  );
}
