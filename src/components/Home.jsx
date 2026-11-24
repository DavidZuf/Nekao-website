import { lazy, Suspense, useState } from 'react';
import { PRODUCTS, MODELS, ROOMS } from '../data.js';
import { Link, navigate } from '../router.jsx';
import ProductCard from './ProductCard.jsx';
import Footer from './Footer.jsx';

// The live living room, seen through the peephole. Click to go in.
const World = lazy(() => import('../world/World.jsx'));
const PEEP_VIEW = [-0.8, -0.1, 0.4]; // x, z, yaw: Daisy and Gigi on the sofa

export default function Home() {
  const [entering, setEntering] = useState(false);
  const enter = () => {
    if (entering) return;
    setEntering(true);
    setTimeout(() => navigate('/apartment/living'), 650);
  };
  return (
    <main className="page">
      <section className="peep-hero">
        <button
          type="button"
          className={`peep ${entering ? 'is-entering' : ''}`}
          onClick={enter}
          aria-label="Look inside the apartment"
        >
          <Suspense fallback={null}>
            <World preview={PEEP_VIEW} active={false} />
          </Suspense>
        </button>
      </section>

      <section className="section" id="drop">
        <div className="shop-head">
          <div>
            <p className="eyebrow">Drop 01</p>
            <h2 className="section-title">The tees</h2>
          </div>
          <Link to="/shop" className="link">Shop all →</Link>
        </div>
        <div className="shop-grid">
          {Object.values(PRODUCTS).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="section">
        <div className="shop-head">
          <div>
            <p className="eyebrow">Apt. 01</p>
            <h2 className="section-title">The residents</h2>
          </div>
          <Link to="/apartment" className="link">Enter →</Link>
        </div>
        <div className="residents">
          {MODELS.map((m) => {
            const room = ROOMS.find((r) => r.id === m.room);
            return (
              <Link key={m.id} to={`/apartment/${room.id}`} className="resident">
                <div className="resident-visual">
                  {m.cutout
                    ? <img src={m.cutout.src} alt="" />
                    : <span className="resident-placeholder" style={{ background: PRODUCTS[m.product].swatch }}>[Photo]</span>}
                </div>
                <span className="card-name">{m.name}</span>
                <span className="card-meta">{room.name} · wearing {PRODUCTS[m.product].color.toLowerCase()}</span>
              </Link>
            );
          })}
        </div>
      </section>
      <Footer />
    </main>
  );
}
