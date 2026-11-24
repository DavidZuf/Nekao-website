import { useEffect, useRef } from 'react';
import { FLIGHT } from '../data.js';

// Plays the continuous flight between two timestamps (seconds),
// then hands back to the 3D apartment. Used for the intro and fast travel.
export default function FlightPlayer({ from, to, label, onDone }) {
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const v = ref.current;
    done.current = false;
    let raf;
    const finish = () => { if (!done.current) { done.current = true; onDone(); } };
    const watch = () => {
      if (v.currentTime >= to - 0.02) { v.pause(); finish(); return; }
      raf = requestAnimationFrame(watch);
    };
    const start = () => {
      v.currentTime = from;
      v.play().then(() => { raf = requestAnimationFrame(watch); }).catch(finish);
    };
    if (v.readyState >= 1) start();
    else v.addEventListener('loadedmetadata', start, { once: true });
    v.addEventListener('error', finish, { once: true });
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') finish(); };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); };
  }, [from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flight">
      <video ref={ref} src={FLIGHT.src} poster={FLIGHT.poster} muted playsInline preload="auto" />
      <div className="bar bar--top" />
      <div className="bar bar--bottom" />
      <div className="flight-label">{label}</div>
      <button type="button" className="btn btn--ghost flight-skip" onClick={() => { if (!done.current) { done.current = true; onDone(); } }}>
        Skip ›
      </button>
    </div>
  );
}
