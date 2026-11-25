import { MODELS, ROOMS, PRODUCTS, nameOf } from '../data.js';
import { Link } from '../router.jsx';
import Footer from './Footer.jsx';

const teeName = (p) => p.name.replace(/^\[Tee name\] — /, '');

function Portrait({ model }) {
  return (
    <div className="portrait">
      {model.cutout
        ? <img src={model.cutout.src} alt={model.name} />
        : <span className="portrait-empty">[Artwork coming]</span>}
    </div>
  );
}

// All residents: /residents
export function Residents() {
  return (
    <main className="page">
      <section className="section section--top">
        <div className="wardrobe-head">
          <h1>The residents</h1>
          <p>Everyone who lives in the apartment, and what they're wearing.</p>
        </div>
        <ResidentGrid />
      </section>
      <Footer />
    </main>
  );
}

export function ResidentGrid({ except }) {
  return (
    <div className="residents">
      {MODELS.filter((m) => m.id !== except).map((m) => {
        const room = ROOMS.find((r) => r.id === m.room);
        return (
          <Link key={m.id} to={`/residents/${m.id}`} className="resident">
            <Portrait model={m} />
            <span className="resident-name hand">{nameOf(m)}</span>
            <span className="resident-meta">{room.name} · {teeName(PRODUCTS[m.product])}</span>
          </Link>
        );
      })}
    </div>
  );
}

// One resident: /residents/daisy
export default function ResidentPage({ model }) {
  if (!model) return <Residents />;
  const room = ROOMS.find((r) => r.id === model.room);
  const tee = PRODUCTS[model.product];

  return (
    <main className="page">
      <section className="res">
        <Portrait model={model} />
        <div className="res-text">
          <Link to="/residents" className="res-back">The residents</Link>
          <h1 className="hand">{nameOf(model)}</h1>
          <p className="res-room">Lives in the {room.name.toLowerCase()}</p>
          <div className="res-lines">
            {model.lines.map((l) => <blockquote key={l}>“{l}”</blockquote>)}
          </div>
          <div className="res-wearing">
            <span>Wearing</span>
            <strong>{teeName(tee)}</strong>
            <em>{tee.price}</em>
          </div>
          <div className="res-actions">
            <Link to={`/shop/${tee.id}`} className="btn btn--light">Shop the look</Link>
            <Link to={`/apartment/${room.id}`} className="btn btn--ghost">Go to the {room.name.toLowerCase()}</Link>
          </div>
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">The neighbours</h2>
        <ResidentGrid except={model.id} />
      </section>
      <Footer />
    </main>
  );
}
