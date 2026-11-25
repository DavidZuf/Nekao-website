import { useCallback, useEffect, useRef, useState } from 'react';
import World from '../world/World.jsx';
import Cutscene from './Cutscene.jsx';
import KeyHint from './KeyHint.jsx';
import { ROOMS, PRODUCTS } from '../data.js';
import { takeFrame } from '../handoff.js';

// Puts it all together:
//  roam   → you walk around in 3D (arrows / WASD, drag to look)
//  talk   → cinematic with a model (press E when close)
//  travel → fast travel: a quick fade to another room
export default function Experience({ startRoom = 'hall', onRoom, onShowTee, drawerOpen }) {
  const world = useRef(null);
  const [phase, setPhase] = useState('roam');
  const [fade, setFade] = useState(false);
  const [still] = useState(takeFrame); // last peephole frame, if we came from there
  const [ready, setReady] = useState(false);
  const [nearby, setNearby] = useState(null);
  const [talking, setTalking] = useState(null);
  const [talkReady, setTalkReady] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [help, setHelp] = useState(true);
  const [toast, setToast] = useState(null);
  const act = useCallback((n) => {
    if (!n) return;
    if (n.thing) {
      const msg = world.current?.use(n.id);
      if (msg) { setToast(msg); clearTimeout(act.timer); act.timer = setTimeout(() => setToast(null), 4200); }
    } else talk(n);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // land in the room from the URL (/apartment/kitchen), the hall by default
  // coming through the peephole: start exactly where it was looking
  useEffect(() => {
    let peek = null;
    try { peek = JSON.parse(sessionStorage.getItem('nekao-peek') || 'null'); } catch { /* ignore */ }
    // (it expires on its own after a few seconds, so a reload starts normally)
    if (peek && Date.now() - peek.at < 4000) world.current?.place(peek);
    else world.current?.teleport(startRoom);
  }, [startRoom]);

  const fastTravel = useCallback((room) => {
    setMapOpen(false);
    if (world.current?.currentRoom()?.id === room.id) return;
    setPhase('travel');
    setFade(true);
    setTimeout(() => {
      world.current?.teleport(room.id);
      window.history.replaceState({}, '', `/apartment/${room.id}`);
      setFade(false);
      setPhase('roam');
    }, 450);
  }, []);

  const talk = useCallback(async (model) => {
    if (!model) return;
    setTalking(model);
    setTalkReady(false);
    setPhase('talk');
    setHelp(false);
    await world.current?.talkTo(model.id);
    setTalkReady(true);
  }, []);

  const endTalk = useCallback(async () => {
    setTalkReady(false);
    await world.current?.endTalk();
    setTalking(null);
    setPhase('roam');
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (drawerOpen || phase !== 'roam') return;
      if ((e.key === 'e' || e.key === 'E') && nearby) act(nearby);
      if (e.key === 'm' || e.key === 'M') setMapOpen((o) => !o);
      if (e.key === 'h' || e.key === 'H') setHelp((o) => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, nearby, talk, drawerOpen]);

  const pad = (k) => ({
    onPointerDown: (e) => { e.preventDefault(); world.current?.press(k, true); },
    onPointerUp: () => world.current?.press(k, false),
    onPointerLeave: () => world.current?.press(k, false)
  });

  return (
    <main className="experience">
      <World ref={world} active={phase === 'roam' || phase === 'talk'} onRoom={onRoom} onNearby={setNearby} onPick={(m) => phase === 'roam' && !drawerOpen && talk(m)} onReady={() => setReady(true)} />
      {still && <img className={`handoff ${ready ? 'is-gone' : ''}`} src={still} alt="" />}

      {phase === 'roam' && (
        <>
          {nearby && (
            <div className="prompt-row">
              <button type="button" className="prompt" onClick={() => act(nearby)}>
                {nearby.thing ? nearby.label : `Talk to ${nearby.name}`}
              </button>
              {!nearby.thing && (
                <button type="button" className="prompt prompt--shop" onClick={() => onShowTee(nearby.product)}>
                  Shop the look · {PRODUCTS[nearby.product].price}
                </button>
              )}
            </div>
          )}

          <button type="button" className="map-btn" onClick={() => setMapOpen(true)}>Rooms</button>

          <KeyHint />

          <div className="dpad" aria-hidden="true">
            <button type="button" className="dpad-up" {...pad('f')}>▲</button>
            <button type="button" className="dpad-left" {...pad('tl')}>◀</button>
            <button type="button" className="dpad-down" {...pad('b')}>▼</button>
            <button type="button" className="dpad-right" {...pad('tr')}>▶</button>
          </div>
        </>
      )}

      {toast && <div className="toast">{toast}</div>}

      {mapOpen && (
        <div className="map" role="dialog" aria-label="Floor plan">
          <div className="map-head">
            <h2>Rooms</h2>
            <button type="button" className="close close--light" onClick={() => setMapOpen(false)} aria-label="Close">×</button>
          </div>
          <div className="map-plan">
            {ROOMS.map((r) => {
              const [x0, z0, x1, z1] = r.rect;
              return (
                <button
                  key={r.id}
                  type="button"
                  className={`map-room ${world.current?.currentRoom()?.id === r.id ? 'is-here' : ''}`}
                  style={{ left: `${((x0 + 7) / 15) * 100}%`, top: `${((z0 + 7) / 13) * 100}%`, width: `${((x1 - x0) / 15) * 100}%`, height: `${((z1 - z0) / 13) * 100}%` }}
                  onClick={() => fastTravel(r)}
                >
                  {r.name}
                </button>
              );
            })}
          </div>
          <p className="map-note">Pick a room to go there.</p>
        </div>
      )}

      <div className={`travel-fade ${fade ? 'is-on' : ''}`} />

      {phase === 'talk' && talking && (
        <Cutscene
          model={talking}
          product={PRODUCTS[talking.product]}
          ready={talkReady}
          onShowTee={() => onShowTee(talking.product)}
          onClose={endTalk}
        />
      )}
    </main>
  );
}
