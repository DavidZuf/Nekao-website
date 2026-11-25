import { useCallback, useEffect, useRef, useState } from 'react';
import World from '../world/World.jsx';
import Cutscene from './Cutscene.jsx';
import KeyHint from './KeyHint.jsx';
import { ROOMS, PRODUCTS, MODELS, nameOf } from '../data.js';
import { takeFrame } from '../handoff.js';

// Puts it all together:
//  roam   → you walk around in 3D (arrows / WASD, drag to look)
//  talk   → cinematic with a model (press E when close)
//  travel → fast travel: a quick fade to another room
// David, the doorman: nobody gets into the living room without saying hi.
const DAVID = MODELS.find((m) => m.id === 'david');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Experience({ startRoom = 'hall', onRoom, onShowTee, drawerOpen }) {
  const world = useRef(null);
  // every visit starts un-greeted: David always wants his hello
  const [greeted, setGreeted] = useState(() => !DAVID);
  const greetedRef = useRef(greeted);
  greetedRef.current = greeted;
  const peeked = useRef(false); // came in through the peephole
  const talkingRef = useRef(null);
  const [cine, setCine] = useState(null); // David's line while the camera takes you back
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
    if (peek && Date.now() - peek.at < 4000) {
      world.current?.place(peek);
      peeked.current = true;
      if (DAVID) setPhase('cine'); // the film starts now: no walking until it's over
    }
    else world.current?.teleport(startRoom);
  }, [startRoom]);

  const say = useCallback((msg, ms = 3800) => {
    setToast(msg); clearTimeout(say.timer); say.timer = setTimeout(() => setToast(null), ms);
  }, []);

  // film moments lock the controls
  useEffect(() => { world.current?.setLocked(phase === 'cine'); }, [phase]);

  // the doorway stays shut until you've said hi to David
  useEffect(() => { world.current?.setGate(!greeted); }, [greeted]);

  // Through the peephole you land in the living room... for a second.
  // Then David calls you out and the camera takes you back to him.
  useEffect(() => {
    if (!ready || !peeked.current || greetedRef.current || !DAVID) return undefined;
    let off = false;
    const t = setTimeout(async () => {
      if (off) return;
      setPhase('cine');
      setCine(DAVID.intercept);
      await wait(900);
      await world.current?.glideTo({ x: 0, z: -0.8, yaw: Math.PI, pitch: 0 }, 1.3); // turn round to the door
      await world.current?.glideTo({ x: 0.3, z: 2.1, yaw: 0.82, pitch: 0.02 }, 1.7); // back through it, to him
      window.history.replaceState({}, '', '/apartment/hall');
      setCine(null);
      talk({ ...DAVID, lines: [DAVID.greeting, ...DAVID.lines] });
    }, 1000);
    return () => { off = true; clearTimeout(t); };
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const fastTravel = useCallback((room) => {
    setMapOpen(false);
    if (!greetedRef.current && room.id !== 'hall') { say('David: say hi first.'); room = ROOMS.find((r) => r.id === 'hall'); }
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
    talkingRef.current = model;
    setTalkReady(false);
    setPhase('talk');
    setHelp(false);
    await world.current?.talkTo(model.id);
    setTalkReady(true);
  }, []);

  const endTalk = useCallback(async () => {
    setTalkReady(false);
    await world.current?.endTalk();
    const firstHello = talkingRef.current?.id === 'david' && !greetedRef.current;
    talkingRef.current = null;
    setTalking(null);
    if (firstHello) {
      setGreeted(true);
      if (peeked.current) {
        // the end of the film: he steps aside and the camera walks you in
        setPhase('cine');
        say('David steps aside. Go on in.', 3000);
        await world.current?.glideTo({ x: 0, z: 1.0, yaw: 0, pitch: 0 }, 1.4); // to the doorway
        await world.current?.glideTo({ x: -0.8, z: -0.4, yaw: 0.4, pitch: 0 }, 1.8); // into the living room
        window.history.replaceState({}, '', '/apartment/living');
      } else {
        say('David steps aside. Go on in.');
      }
    }
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
      <World ref={world} active={phase === 'roam' || phase === 'talk' || phase === 'cine'} onRoom={onRoom} onNearby={setNearby} onPick={(m) => phase === 'roam' && !drawerOpen && talk(m)} onReady={() => setReady(true)} onGate={() => say('David: say hi first.')} />
      {still && <img className={`handoff ${ready ? 'is-gone' : ''}`} src={still} alt="" />}

      {phase === 'roam' && (
        <>
          {nearby && (
            <div className="prompt-float" key={nearby.id}>
              {!nearby.thing && <span className="prompt-name hand">{nameOf(nearby)}</span>}
              <div className="prompt-acts">
                <button type="button" className="prompt-act" onClick={() => act(nearby)}>
                  <kbd>E</kbd>{nearby.thing ? nearby.label : 'say hi'}
                </button>
                {!nearby.thing && (
                  <>
                    <i className="prompt-dot" aria-hidden="true" />
                    <button type="button" className="prompt-act prompt-act--shop" onClick={() => onShowTee(nearby.product, nearby.id)}>
                      shop the look · {PRODUCTS[nearby.product].price}
                    </button>
                  </>
                )}
              </div>
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

      {phase === 'cine' && cine && (
        <div className="cutscene is-ready">
          <div className="bar bar--top" />
          <div className="bar bar--bottom" />
          <div className="subtitle">
            <div className="speaker hand">{nameOf(DAVID)}</div>
            <p>{cine}</p>
          </div>
        </div>
      )}

      {phase === 'talk' && talking && (
        <Cutscene
          model={talking}
          product={PRODUCTS[talking.product]}
          ready={talkReady}
          onShowTee={() => onShowTee(talking.product, talking.id)}
          onClose={endTalk}
        />
      )}
    </main>
  );
}
