import { lazy, Suspense, useRef, useState } from 'react';
import { Link, navigate } from '../router.jsx';
import { ResidentGrid } from './ResidentPage.jsx';
import Footer from './Footer.jsx';
import { giveFrame } from '../handoff.js';

// The live living room, seen through the peephole. Drag to look around,
// click and the peephole opens up into the apartment.
const World = lazy(() => import('../world/World.jsx'));
const PEEP_VIEW = [-0.8, -0.1, 0.4]; // x, z, yaw: Daisy and Gigi on the sofa
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function Home() {
  const hero = useRef(null);
  const world = useRef(null);
  const down = useRef(null);
  const [opening, setOpening] = useState(false);

  const open = () => {
    if (opening) return;
    setOpening(true);
    const el = hero.current;
    const from = el.querySelector('.peep-ring').offsetWidth / 2;
    const to = Math.hypot(el.offsetWidth, el.offsetHeight) / 2 + 40;
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / 900);
      el.style.setProperty('--r', `${from + (to - from) * ease(k)}px`);
      if (k < 1) return requestAnimationFrame(step);
      try { sessionStorage.setItem('nekao-peek', JSON.stringify({ ...world.current?.pose(), at: Date.now() })); } catch { /* ignore */ }
      giveFrame(world.current?.snapshot());
      navigate('/apartment/living');
    };
    requestAnimationFrame(step);
  };

  // a click opens the door; a drag only looks around
  const onDown = (e) => { down.current = { x: e.clientX, y: e.clientY }; };
  const onUp = (e) => {
    const d = down.current;
    down.current = null;
    if (!d || Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 6) return;
    const r = hero.current.querySelector('.peep-ring').getBoundingClientRect();
    if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) <= r.width / 2) open();
  };

  return (
    <main className="page">
      <section
        ref={hero}
        className={`peep-hero ${opening ? 'is-opening' : ''}`}
        onPointerDown={onDown}
        onPointerUp={onUp}
      >
        <div className="peep-view">
          <Suspense fallback={null}>
            <World ref={world} preview={PEEP_VIEW} active={false} />
          </Suspense>
        </div>
        <div className="peep-ring" aria-hidden="true" />
        <button type="button" className="sr-only" onClick={open}>Open the door</button>
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
