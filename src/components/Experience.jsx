import { useCallback, useEffect, useRef, useState } from 'react';
import World from '../world/World.jsx';
import FlightPlayer from './FlightPlayer.jsx';
import Cutscene from './Cutscene.jsx';
import { ROOMS, PRODUCTS } from '../data.js';

// Puts it all together:
//  intro  → the continuous flight plays from the door to the hall
//  roam   → you walk around in 3D (arrows / WASD, drag to look)
//  talk   → cinematic with a model (press E when close)
//  travel → fast travel: the flight takes you to another room
export default function Experience({ onRoom, onShowTee, drawerOpen }) {
  const world = useRef(null);
  const [phase, setPhase] = useState('intro');
  const [travel, setTravel] = useState({ from: 0, to: ROOMS[0].stop, room: ROOMS[0], label: 'Apt. 01' });
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

  const arrive = useCallback(() => {
    world.current?.teleport(travel.room.id);
    setPhase('roam');
  }, [travel]);

  const fastTravel = useCallback((room) => {
    setMapOpen(false);
    const here = world.current?.currentRoom();
    if (here?.id === room.id) return;
    // fly forward from where you are; going backwards replays the last stretch
    const from = here && here.stop < room.stop ? here.stop : Math.max(0, room.stop - 4);
    setTravel({ from, to: room.stop, room, label: `→ ${room.name}` });
    setPhase('travel');
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
      <World ref={world} active={phase === 'roam' || phase === 'talk'} onRoom={onRoom} onNearby={setNearby} />

      {phase === 'roam' && (
        <>
          {nearby && (
            <button type="button" className="prompt" onClick={() => act(nearby)}>
              <kbd>E</kbd> {nearby.thing ? nearby.label : `Talk to ${nearby.name}`}
            </button>
          )}

          <button type="button" className="map-btn" onClick={() => setMapOpen(true)}>
            <kbd>M</kbd> Map · fast travel
          </button>

          {help && (
            <div className="controls-help">
              <div><kbd>↑</kbd><kbd>↓</kbd> walk · <kbd>←</kbd><kbd>→</kbd> turn · <kbd>A</kbd><kbd>D</kbd> step aside</div>
              <div>Drag to look · <kbd>Shift</kbd> run · <kbd>E</kbd> talk · <kbd>M</kbd> map</div>
              <button type="button" className="link" onClick={() => setHelp(false)}>Got it</button>
            </div>
          )}

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
            <h2>Fast travel</h2>
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
          <p className="map-note">Pick a room: the drone flies you there.</p>
        </div>
      )}

      {(phase === 'intro' || phase === 'travel') && (
        <FlightPlayer from={travel.from} to={travel.to} label={travel.label} onDone={arrive} />
      )}

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
