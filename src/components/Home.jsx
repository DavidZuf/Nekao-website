import { PRODUCTS, MODELS, ROOMS } from '../data.js';
import { Link, navigate } from '../router.jsx';
import ProductCard from './ProductCard.jsx';
import Footer from './Footer.jsx';

export default function Home() {
  const enter = () => navigate('/apartment');
  return (
    <main className="page">
      <section className="entrance">
        <div className="entrance-copy">
          <p className="eyebrow">Drop 01 — now open</p>
          <h1>The<br />Apartment</h1>
          <p className="lead">
            Our tees don't live on hangers. They live here. Walk through the rooms,
            meet the residents, and take home what they're wearing.
          </p>
          <div className="entrance-actions">
            <Link to="/apartment" className="btn btn--light">
              Enter the apartment
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <a href="#drop" className="btn btn--ghost">Shop the drop</a>
          </div>
        </div>

        <div className="door-scene" aria-hidden="true">
          <div className="door-frame">
            <button type="button" className="door" onClick={enter} tabIndex={-1}>
              <span className="peephole" />
              <img src="/logo_dark.png" alt="" />
              <span className="apt">APT. 01</span>
            </button>
          </div>
          <button type="button" className="bell" onClick={enter} tabIndex={-1}><span /></button>
          <div className="mat">COME IN</div>
        </div>
        <div className="entrance-floor" />
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
