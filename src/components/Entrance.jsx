export default function Entrance({ onEnter, onShop }) {
  return (
    <main className="entrance">
      <div className="entrance-copy">
        <p className="eyebrow">Drop 01 — now open</p>
        <h1>The<br />Apartment</h1>
        <p className="lead">
          Our tees don't live on hangers. They live here. Ring the bell, walk through the rooms,
          and meet the residents.
        </p>
        <div className="entrance-actions">
          <button type="button" className="btn btn--light" onClick={onEnter}>
            Ring the doorbell
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <button type="button" className="btn btn--ghost" onClick={onShop}>Skip to shop</button>
        </div>
      </div>

      <div className="door-scene" aria-hidden="true">
        <div className="door-frame">
          <button type="button" className="door" onClick={onEnter} tabIndex={-1}>
            <span className="peephole" />
            <img src="./logo_dark.png" alt="" />
            <span className="apt">APT. 01</span>
          </button>
        </div>
        <button type="button" className="bell" onClick={onEnter} tabIndex={-1}><span /></button>
        <div className="mat">COME IN</div>
      </div>
      <div className="entrance-floor" />
    </main>
  );
}
