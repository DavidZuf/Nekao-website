import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ROOMS, PRODUCTS, residentsIn, roomView, nameOf } from '../data.js';
import { Link } from '../router.jsx';

const World = lazy(() => import('../world/World.jsx'));

// The apartment on phones: no walking. Swipe from room to room; each room
// shows who lives there and what they're wearing.
export default function RoomSwipe({ startRoom = 'hall', onRoom, onShowTee }) {
  const [index, setIndex] = useState(() => Math.max(0, ROOMS.findIndex((r) => r.id === startRoom)));
  const [shown, setShown] = useState(index); // the room the camera shows (changes mid-fade)
  const [fade, setFade] = useState(false);
  const touch = useRef(null);
  const room = ROOMS[index];

  useEffect(() => {
    onRoom?.(room);
    window.history.replaceState({}, '', `/apartment/${room.id}`);
    if (index === shown) return;
    setFade(true);
    const t = setTimeout(() => { setShown(index); setFade(false); }, 300);
    return () => clearTimeout(t);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (d) => setIndex((i) => (i + d + ROOMS.length) % ROOMS.length);
  const onStart = (e) => { touch.current = e.touches[0].clientX; };
  const onEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  return (
    <main className="swipe" onTouchStart={onStart} onTouchEnd={onEnd}>
      <p className="swipe-loading">Opening the door…</p>
      <Suspense fallback={null}>
        <World preview={roomView(ROOMS[shown])} active={false} />
      </Suspense>
      <div className={`travel-fade ${fade ? 'is-on' : ''}`} />

      <div className="swipe-sheet">
        <div className="swipe-top">
          <button type="button" onClick={() => go(-1)} aria-label="Previous room">‹</button>
          <h1>{room.name}</h1>
          <button type="button" onClick={() => go(1)} aria-label="Next room">›</button>
        </div>
        <div className="swipe-dots">
          {ROOMS.map((r, i) => (
            <button key={r.id} type="button" className={i === index ? 'is-on' : ''} onClick={() => setIndex(i)} aria-label={r.name} />
          ))}
        </div>

        {residentsIn(room.id).map((m) => {
          const tee = PRODUCTS[m.product];
          return (
            <div key={m.id} className="swipe-who">
              <Link to={`/residents/${m.id}`} className="swipe-face">
                {m.cutout ? <img src={m.cutout.src} alt="" /> : <span style={{ background: tee.swatch }} />}
              </Link>
              <div className="swipe-info">
                <Link to={`/residents/${m.id}`} className="swipe-name hand">{nameOf(m)}</Link>
                <p>“{m.lines[0]}”</p>
              </div>
              <button type="button" className="swipe-shop" onClick={() => onShowTee(tee.id)}>
                Shop the look<small>{tee.price}</small>
              </button>
            </div>
          );
        })}

        <a href={`/apartment/${room.id}?walk`} className="swipe-walk">Walk around instead</a>
      </div>
    </main>
  );
}
