import { useEffect, useState } from 'react';

const KEYS = {
  up: ['ArrowUp', 'KeyW'],
  left: ['ArrowLeft', 'KeyA'],
  down: ['ArrowDown', 'KeyS'],
  right: ['ArrowRight', 'KeyD']
};

// Four keycaps in the corner that light up as you press them, so it's
// obvious the keyboard walks you around.
export default function KeyHint() {
  const [down, setDown] = useState({});
  const [used, setUsed] = useState(false);

  useEffect(() => {
    const set = (on) => (e) => {
      const k = Object.keys(KEYS).find((n) => KEYS[n].includes(e.code));
      if (!k) return;
      setDown((d) => ({ ...d, [k]: on }));
      if (on) setUsed(true);
    };
    const kd = set(true), ku = set(false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  const cap = (k, glyph) => <span className={`keycap keycap--${k} ${down[k] ? 'is-down' : ''}`}>{glyph}</span>;
  return (
    <div className={`keyhint ${used ? 'is-used' : ''}`} aria-hidden="true">
      <div className="keycaps">
        {cap('up', '↑')}{cap('left', '←')}{cap('down', '↓')}{cap('right', '→')}
      </div>
      <p>walk with the arrows<br /><span>drag to look · click someone to meet them</span></p>
    </div>
  );
}
