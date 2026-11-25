import { lazy, Suspense, useState } from 'react';
import { PRODUCTS } from '../data.js';
import { Link, navigate } from '../router.jsx';
import ProductIndex from './ProductIndex.jsx';
import { ResidentGrid } from './ResidentPage.jsx';
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
        <div className="wardrobe-head">
          <h2 className="section-title">The wardrobe</h2>
          <Link to="/shop" className="inline-link">Everything →</Link>
        </div>
        <ProductIndex products={Object.values(PRODUCTS)} />
      </section>

      <section className="section">
        <div className="wardrobe-head">
          <h2 className="section-title">The residents</h2>
          <Link to="/residents" className="inline-link">Meet them →</Link>
        </div>
        <ResidentGrid />
      </section>
      <Footer />
    </main>
  );
}
