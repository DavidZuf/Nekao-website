import { PRODUCTS, ROOMS, MODELS } from '../data.js';

const whereWorn = (id) =>
  [...new Set(MODELS.filter((m) => m.product === id).map((m) => ROOMS.find((r) => r.id === m.room).name))];

export default function Shop({ onOpen, onTour }) {
  return (
    <main className="shop">
      <div className="shop-head">
        <h1>All the tees</h1>
        <button type="button" className="btn btn--ghost" onClick={onTour}>Back to the apartment</button>
      </div>
      <div className="shop-grid">
        {Object.values(PRODUCTS).map((p) => (
          <button key={p.id} type="button" className="card" onClick={() => onOpen(p.id)}>
            <div className="card-visual">
              <svg width="160" height="146" viewBox="0 0 200 180" aria-hidden="true">
                <path d="M50 20 L150 20 L190 60 L162 84 L148 70 L148 170 L52 170 L52 70 L38 84 L10 60 Z" fill={p.swatch} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              </svg>
              <img src={p.logo === 'dark' ? './logo_dark.png' : './logo_cream.png'} alt="" />
            </div>
            <span className="card-name">{p.name}</span>
            <span className="card-meta">{p.price} · seen in: {whereWorn(p.id).join(', ')}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
