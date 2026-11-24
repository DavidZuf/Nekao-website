import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { glowTexture } from './paris.js';
import { wash } from './atmosphere.js';

// The NEKAO kitchen, built after the art-direction reference:
// black & white marble, matte black cabinets with gold details, a waterfall
// marble island, leopard stools / bench / rug, illuminated shelves, and the
// Arc de Triomphe at night through the window.
// Room footprint (unchanged): x 2 → 8, z -7 → 0. Door to the living room at
// x = 2, z -4 → -2.6. Entering, you face +x: cabinets on the left (z = -7),
// island on the right, window on the back wall (x = 8).

const H = 2.8;
const WIN = { z0: -5.5, z1: -1.7, y0: 0.6, y1: 2.45 };
export const ARC = { x: 330, z: -3.5, base: -32 };

export const KITCHEN_BLOCKERS = [
  [2.0, -7.0, 7.95, -6.22], // cabinets + oven tower
  [3.3, -1.98, 6.7, -0.82], // island
  [3.68, -2.55, 4.12, -2.25], // Vera
  [4.38, -2.57, 4.82, -2.13], // stool 1
  [5.38, -2.57, 5.82, -2.13], // stool 2
  [7.38, -5.45, 7.95, -1.75], // window bench
  [6.4, -0.45, 7.95, 0] // shelving
];

const rnd = (() => { let s = 11; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

// white Calacatta-style marble with dark dramatic veins
function marbleTexture(repeat, seed = 0) {
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#ece6e3'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { // soft clouds
      const x = rnd() * w, y = rnd() * h, r = 80 + rnd() * 220;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(210,200,200,0.18)'); gr.addColorStop(1, 'rgba(210,200,200,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const vein = (width, alpha, color) => {
      let x = rnd() * w, y = rnd() < 0.5 ? 0 : rnd() * h;
      const ang0 = rnd() * Math.PI;
      g.strokeStyle = color; g.globalAlpha = alpha; g.lineWidth = width; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y);
      let a = ang0;
      for (let k = 0; k < 60; k++) {
        a += (rnd() - 0.5) * 0.9;
        x += Math.cos(a) * 28; y += Math.sin(a) * 28 + 6;
        g.lineTo(x, y);
        if (rnd() < 0.08) g.lineWidth = Math.max(0.6, width * (0.4 + rnd()));
      }
      g.stroke(); g.globalAlpha = 1;
    };
    g.filter = 'blur(1.5px)';
    for (let i = 0; i < 18; i++) vein(1 + rnd() * 1.5, 0.35, '#8a8282');
    g.filter = 'blur(0.6px)';
    g.filter = 'blur(1.2px)';
    for (let i = 0; i < 5 + seed; i++) vein(3 + rnd() * 5, 0.6, '#2c2628');
    for (let i = 0; i < 10; i++) vein(1.2 + rnd() * 1.6, 0.45, '#4a4244');
    g.filter = 'none';
  }, repeat);
}

function leopardTexture(repeat) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#b9864f'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = rnd() * w, y = rnd() * h, r = 16 + rnd() * 14;
      g.fillStyle = '#d29a5c'; g.beginPath(); g.ellipse(x, y, r * 0.9, r * 0.7, rnd() * 3, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#2a170c';
      const n = 3 + Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + rnd() * 0.6;
        g.beginPath(); g.ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r, 7 + rnd() * 5, 4 + rnd() * 3, a + Math.PI / 2, 0, Math.PI * 2); g.fill();
      }
    }
    for (let i = 0; i < 60; i++) { g.fillStyle = '#2a170c'; g.beginPath(); g.arc(rnd() * w, rnd() * h, 3 + rnd() * 3, 0, Math.PI * 2); g.fill(); }
  }, repeat);
}

export function buildKitchen(scene, renderer) {
  const envRT = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04);
  const env = envRT.texture;

  const M = {
    burgundy: new THREE.MeshStandardMaterial({ color: '#3e0e17', roughness: 0.85 }),
    floor: new THREE.MeshPhysicalMaterial({ map: marbleTexture([2, 2.3], 2), color: '#9a8f8f', roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.04, envMap: env, envMapIntensity: 0.12 }),
    marble: new THREE.MeshPhysicalMaterial({ map: marbleTexture([1, 1], 4), color: '#a89f9f', roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.3, envMap: env, envMapIntensity: 0.15 }),
    black: new THREE.MeshStandardMaterial({ color: '#141113', roughness: 0.6, envMap: env, envMapIntensity: 0.2 }),
    gold: new THREE.MeshStandardMaterial({ color: '#c99545', roughness: 0.32, metalness: 1, envMap: env, envMapIntensity: 0.12 }),
    copper: new THREE.MeshStandardMaterial({ color: '#b8683c', roughness: 0.3, metalness: 1, envMap: env, envMapIntensity: 0.15 }),
    darkGlass: new THREE.MeshPhysicalMaterial({ color: '#09090b', roughness: 0.06, metalness: 0.2, clearcoat: 1, envMap: env, envMapIntensity: 0.25 }),
    leopard: new THREE.MeshStandardMaterial({ map: leopardTexture([1, 1]), roughness: 0.9 }),
    glass: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.28, depthWrite: false, envMap: env, envMapIntensity: 0.25 })
  };
  const warmLED = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffb36b').multiplyScalar(1.5) });
  const pinkLED = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff2a6d').multiplyScalar(2.4) });

  const box = ([x0, z0, x1, z1], y0, y1, mat, { cast = true, receive = true } = {}) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.castShadow = cast; m.receiveShadow = receive;
    scene.add(m);
    return m;
  };
  const put = (mesh, x, y, z, cast = true) => { mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = true; scene.add(mesh); return mesh; };
  const lathe = (pts, mat, seg = 32) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), mat);

  // ---------- shell: marble floor, burgundy walls, window wall ----------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 7), M.floor);
  floor.rotation.x = -Math.PI / 2;
  put(floor, 5, 0.001, -3.5, false);

  const panel = (w, h, x, y, z, ry) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.burgundy); p.rotation.y = ry; put(p, x, y, z, false); };
  panel(5.86, H, 5, H / 2, -6.925, 0); // behind the cabinets
  panel(5.86, H, 5, H / 2, -0.075, Math.PI); // right wall
  panel(2.93, H, 2.075, H / 2, -5.465, Math.PI / 2); // entry wall, left of the door
  panel(2.53, H, 2.075, H / 2, -1.335, Math.PI / 2); // entry wall, right of the door
  panel(1.4, 0.6, 2.075, 2.5, -3.3, Math.PI / 2); // above the door

  const T = 0.14, xW = 8;
  const wallPiece = (z0, z1, y0, y1) => box([xW - T / 2, z0, xW + T / 2, z1], y0, y1, M.burgundy);
  wallPiece(-7, WIN.z0, 0, H);
  wallPiece(WIN.z1, 0, 0, H);
  wallPiece(WIN.z0, WIN.z1, 0, WIN.y0);
  wallPiece(WIN.z0, WIN.z1, WIN.y1, H);
  const frame = (z0, z1, y0, y1) => box([xW - 0.08, z0, xW + 0.04, z1], y0, y1, M.black);
  frame(WIN.z0, WIN.z1, WIN.y0, WIN.y0 + 0.06);
  frame(WIN.z0, WIN.z1, WIN.y1 - 0.06, WIN.y1);
  frame(WIN.z0, WIN.z0 + 0.06, WIN.y0, WIN.y1);
  frame(WIN.z1 - 0.06, WIN.z1, WIN.y0, WIN.y1);
  const glassPane = new THREE.Mesh(new THREE.PlaneGeometry(WIN.z1 - WIN.z0, WIN.y1 - WIN.y0), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.015, depthWrite: false }));
  glassPane.rotation.y = -Math.PI / 2;
  put(glassPane, xW - 0.02, (WIN.y0 + WIN.y1) / 2, (WIN.z0 + WIN.z1) / 2, false);

  // ---------- left wall: black cabinets, marble counter & backsplash ----------
  box([2.1, -6.93, 6.7, -6.32], 0.08, 0.88, M.black); // base units
  box([2.12, -6.9, 6.68, -6.38], 0, 0.08, new THREE.MeshStandardMaterial({ color: '#070607' })); // recessed plinth
  for (let x = 2.1 + 0.575; x < 6.7; x += 0.575) box([x - 0.003, -6.32, x + 0.003, -6.315], 0.1, 0.86, M.gold, { cast: false }); // gold seams
  box([2.2, -6.315, 6.6, -6.31], 0.82, 0.835, M.gold, { cast: false }); // gold handle rail
  box([2.08, -6.95, 6.72, -6.26], 0.88, 0.92, M.marble); // countertop
  const splash = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.63), M.marble);
  put(splash, 4.4, 1.235, -6.918, false);
  box([2.1, -6.93, 6.7, -6.56], 1.55, 2.45, M.black); // upper units
  for (let x = 2.1 + 0.575; x < 6.7; x += 0.575) box([x - 0.003, -6.56, x + 0.003, -6.555], 1.57, 2.43, M.gold, { cast: false });
  box([2.15, -6.62, 6.65, -6.6], 1.54, 1.552, warmLED, { cast: false }); // under-cabinet LED
  box([2.1, -6.9, 7.9, -6.88], H - 0.035, H - 0.02, pinkLED, { cast: false }); // magenta cove
  // sink + gold faucet
  box([3.35, -6.82, 3.95, -6.42], 0.921, 0.925, new THREE.MeshStandardMaterial({ color: '#0b0a0b', roughness: 0.3 }), { cast: false });
  const spout = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CubicBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.42, 0), new THREE.Vector3(0, 0.42, 0.22), new THREE.Vector3(0, 0.3, 0.24)), 24, 0.012, 10), M.gold);
  put(spout, 3.65, 0.92, -6.85);
  // cooktop + copper pot
  box([4.55, -6.85, 5.35, -6.4], 0.921, 0.926, M.darkGlass, { cast: false });
  // copper pot: the lid comes off (press E) and it boils over
  const POT = { x: 4.95, y: 0.926, z: -6.62 };
  put(lathe([[0, 0], [0.13, 0], [0.135, 0.02], [0.135, 0.15], [0.128, 0.15], [0.125, 0.03], [0, 0.03]], M.copper), POT.x, POT.y, POT.z);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.126, 32), new THREE.MeshStandardMaterial({ color: '#cfd8dc', roughness: 0.15, envMap: env, envMapIntensity: 0.3 }));
  water.rotation.x = -Math.PI / 2;
  put(water, POT.x, POT.y + 0.12, POT.z, false);
  const lid = new THREE.Group();
  lid.add(lathe([[0, 0.012], [0.14, 0], [0.14, 0.008], [0.06, 0.022], [0, 0.026]], M.copper));
  const knob = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 8, 20), M.copper);
  knob.position.y = 0.045;
  lid.add(knob);
  lid.traverse((o) => { o.castShadow = true; });
  lid.position.set(POT.x, POT.y + 0.15, POT.z);
  scene.add(lid);
  // foam bubbles
  const FOAM = 220;
  const foam = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ color: '#fbf8f2', roughness: 0.35, emissive: '#fff4e6', emissiveIntensity: 0.12 }), FOAM);
  foam.frustumCulled = false;
  foam.castShadow = true;
  scene.add(foam);
  const bub = Array.from({ length: FOAM }, (_, i) => ({ a: rnd() * Math.PI * 2, delay: 0.3 + (i / FOAM) * 9 + rnd() * 0.6, reach: 0.02 + Math.pow(rnd(), 0.7) * 0.34, size: 0.012 + rnd() * 0.02, ph: rnd() * 6.28 }));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.125, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), foam.material);
  dome.position.set(POT.x, POT.y + 0.14, POT.z);
  dome.scale.setScalar(0.001);
  scene.add(dome);
  const steam = [];
  for (let i = 0; i < 10; i++) {
    const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: '#f1ece6', transparent: true, opacity: 0, depthWrite: false }));
    p.userData.phase = i / 10;
    scene.add(p);
    steam.push(p);
  }
  const pot = { open: false, t0: 0, now: 0 };
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  const tmpM = new THREE.Matrix4();
  for (let i = 0; i < FOAM; i++) foam.setMatrixAt(i, hide);
  const updatePot = (t) => {
    pot.now = t;
    const age = pot.open ? t - pot.t0 : -1;
    // lid: lifts, slides to the side of the hob and settles tilted
    const k = pot.open ? Math.min(1, age / 0.9) : 0;
    const e = k * k * (3 - 2 * k);
    lid.position.set(POT.x + e * 0.3, POT.y + 0.15 + Math.sin(e * Math.PI) * 0.14 - e * 0.143, POT.z + e * 0.06);
    lid.rotation.z = -e * 0.0 + Math.sin(e * Math.PI) * 0.5;
    // foam dome swells, bubbles pour over the rim and spread on the hob
    dome.scale.setScalar(pot.open ? Math.max(0.001, Math.min(1, (age - 0.4) / 2.5)) * (1 + Math.sin(t * 9) * 0.03) : 0.001);
    for (let i = 0; i < FOAM; i++) {
      const b = bub[i];
      const a = age - b.delay;
      if (!pot.open || a < 0) { foam.setMatrixAt(i, hide); continue; }
      const f = Math.min(1, a / 3.2), ease = 1 - Math.pow(1 - f, 2);
      const r = 0.09 + ease * (0.05 + b.reach);
      const over = Math.max(0, r - 0.136);
      const y = over <= 0 ? POT.y + 0.15 + Math.sin(b.ph) * 0.02 : Math.max(POT.y + 0.004 + b.size * 0.6, POT.y + 0.15 - over * 3.2);
      const wob = 1 + Math.sin(t * 7 + b.ph) * 0.12;
      const sz = b.size * Math.min(1, a * 3) * wob;
      // keep the spill on the counter (flatten against the backsplash)
      const z = Math.min(POT.z + 0.31, Math.max(POT.z - 0.26, POT.z + Math.sin(b.a) * r)); // stay on the counter
      tmpM.makeScale(sz, sz * (over > 0.05 ? 0.7 : 1), sz).setPosition(POT.x + Math.cos(b.a) * r * 1.5, y, z);
      foam.setMatrixAt(i, tmpM);
    }
    foam.instanceMatrix.needsUpdate = true;
    steam.forEach((p) => {
      const f = (t * 0.35 + p.userData.phase) % 1;
      p.position.set(POT.x + Math.sin(f * 6 + p.userData.phase * 9) * 0.05, POT.y + 0.2 + f * 0.6, POT.z + Math.cos(f * 5) * 0.03);
      const sc = 0.06 + f * 0.22;
      p.scale.set(sc, sc * 1.2, 1);
      p.material.opacity = pot.open ? Math.sin(f * Math.PI) * 0.3 * Math.min(1, age) : 0;
    });
  };
  const things = [{
    id: 'pot', pos: [POT.x, POT.z], reach: 1.5,
    label: () => (pot.open ? 'Put the lid back. Quick.' : 'Open the pot?'),
    use: () => {
      pot.open = !pot.open;
      pot.t0 = pot.now;
      return pot.open ? 'You had to open it. It\'s boiling over. Everywhere.' : 'Lid back on. We never speak of this.';
    }
  }];
  // calla lilies in a black vase
  const vaseBlack = new THREE.MeshPhysicalMaterial({ color: '#050405', roughness: 0.15, clearcoat: 1, envMap: env, envMapIntensity: 0.25 });
  put(lathe([[0, 0], [0.07, 0], [0.11, 0.1], [0.08, 0.24], [0.05, 0.3], [0.055, 0.32]], vaseBlack), 2.55, 0.92, -6.6);
  const stem = new THREE.MeshStandardMaterial({ color: '#2f4a22' });
  const calla = new THREE.MeshStandardMaterial({ color: '#d4145a', emissive: '#7a0a30', emissiveIntensity: 0.4, roughness: 0.5, side: THREE.DoubleSide });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2, tilt = 0.25 + (i % 2) * 0.15;
    const len = 0.32 + (i % 3) * 0.05;
    const sx = 2.55 + Math.sin(a) * Math.sin(tilt) * len, sz = -6.6 + Math.cos(a) * Math.sin(tilt) * len, sy = 1.22 + Math.cos(tilt) * len * 0.6;
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.006, len, 5), stem);
    st.position.set((2.55 + sx) / 2, (1.2 + sy) / 2, (-6.6 + sz) / 2);
    st.lookAt(sx, sy, sz); st.rotateX(Math.PI / 2);
    scene.add(st);
    const flower = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.13, 16, 1, true), calla);
    flower.position.set(sx, sy + 0.03, sz);
    flower.rotation.set(Math.cos(a) * tilt * 1.6, 0, -Math.sin(a) * tilt * 1.6);
    scene.add(flower);
  }
  // oven tower with two ovens
  box([6.75, -6.93, 7.95, -6.3], 0, 2.45, M.black);
  [[0.95, 1.5], [1.6, 2.15]].forEach(([y0, y1]) => {
    box([6.85, -6.3, 7.85, -6.28], y0, y1, M.darkGlass, { cast: false });
    box([6.95, -6.28, 7.75, -6.26], y1 - 0.06, y1 - 0.045, M.gold, { cast: false });
  });

  // ---------- window bench (leopard) + pink bolster ----------
  box([7.4, -5.42, 7.93, -1.78], 0, 0.38, new THREE.MeshStandardMaterial({ color: '#2a0b12', roughness: 0.7 }));
  const cushion = new THREE.Mesh(new RoundedBoxGeometry(0.53, 0.12, 3.6, 4, 0.04), new THREE.MeshStandardMaterial({ map: leopardTexture([0.6, 3.5]), roughness: 0.9 }));
  put(cushion, 7.665, 0.44, -3.6);
  const bolster = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.45, 24), new THREE.MeshPhysicalMaterial({ color: '#c8104a', roughness: 0.75, sheen: 1, sheenColor: new THREE.Color('#ff7aa8') }));
  bolster.rotation.z = Math.PI / 2;
  put(bolster, 7.66, 0.61, -5.2);

  // ---------- waterfall marble island ----------
  box([3.45, -1.85, 6.55, -0.95], 0, 0.86, M.black);
  box([3.35, -1.95, 6.65, -0.85], 0.86, 0.94, M.marble); // marble top
  box([3.35, -1.95, 3.43, -0.85], 0, 0.94, M.marble); // waterfall end facing you
  box([6.57, -1.95, 6.65, -0.85], 0, 0.94, M.marble); // far waterfall end
  box([3.5, -1.94, 6.5, -1.925], 0.835, 0.845, warmLED, { cast: false }); // glow under the overhang

  // ---------- leopard stools with gold legs ----------
  const stoolTop = new THREE.MeshStandardMaterial({ map: leopardTexture([0.9, 0.5]), roughness: 0.9 });
  [4.6, 5.6].forEach((x) => {
    const z = -2.35;
    put(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.02, 32), M.gold), x, 0.01, z);
    put(new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.7, 12), M.gold), x, 0.37, z);
    put(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.011, 8, 40), M.gold), x, 0.3, z).rotation.x = Math.PI / 2;
    put(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.03, 24), M.gold), x, 0.71, z);
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.11, 32), stoolTop);
    put(seat, x, 0.78, z);
  });

  // ---------- leopard round rug ----------
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.25, 64), new THREE.MeshStandardMaterial({ map: leopardTexture([2.2, 2.2]), roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  put(rug, 4.9, 0.004, -3.95, false);
  const rugCenter = new THREE.Mesh(new THREE.CircleGeometry(0.88, 64), new THREE.MeshStandardMaterial({ color: '#1e1013', roughness: 1 }));
  rugCenter.rotation.x = -Math.PI / 2;
  put(rugCenter, 4.9, 0.006, -3.95, false);

  // ---------- island styling ----------
  // champagne bucket + bottle + coupes
  put(lathe([[0, 0], [0.09, 0], [0.11, 0.2], [0.115, 0.21], [0, 0.21]], M.gold), 5.15, 0.94, -1.45);
  const bottleMat = new THREE.MeshPhysicalMaterial({ color: '#0e2416', roughness: 0.1, clearcoat: 1, envMap: env, envMapIntensity: 0.25 });
  const bottle = put(lathe([[0, 0], [0.04, 0], [0.04, 0.2], [0.015, 0.27], [0.013, 0.33], [0, 0.33]], bottleMat), 5.15, 1.0, -1.45);
  bottle.rotation.z = 0.25;
  put(new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.06, 12), M.gold), 5.15 - 0.075, 1.31, -1.45).rotation.z = 0.25;
  const coupe = (x, z) => {
    put(lathe([[0, 0], [0.04, 0], [0.004, 0.01], [0.004, 0.11], [0.05, 0.13], [0.058, 0.155], [0.055, 0.157], [0.002, 0.125]], M.glass, 24), x, 0.94, z, false);
    const wine = new THREE.Mesh(new THREE.CircleGeometry(0.048, 24), new THREE.MeshStandardMaterial({ color: '#e8b54a', emissive: '#a06a10', emissiveIntensity: 0.5, roughness: 0.2 }));
    wine.rotation.x = -Math.PI / 2;
    put(wine, x, 0.94 + 0.145, z, false);
  };
  coupe(4.72, -1.62); coupe(4.92, -1.7);
  // gold mushroom lamp
  put(lathe([[0, 0], [0.08, 0], [0.08, 0.012], [0.012, 0.02], [0.012, 0.34], [0, 0.34]], M.gold), 5.95, 0.94, -1.35);
  put(lathe([[0, 0], [0.17, 0], [0.16, 0.05], [0.11, 0.1], [0.04, 0.125], [0, 0.13]], M.gold), 5.95, 1.27, -1.35);
  const lampGlow = new THREE.Mesh(new THREE.CircleGeometry(0.16, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd2a0').multiplyScalar(1.4), side: THREE.DoubleSide }));
  lampGlow.rotation.x = Math.PI / 2;
  put(lampGlow, 5.95, 1.268, -1.35, false);
  const lampLight = new THREE.PointLight('#ffb070', 0.9, 2.2, 1.8);
  lampLight.position.set(5.95, 1.24, -1.35);
  scene.add(lampLight);
  // pink blossom in a black vase
  put(lathe([[0, 0], [0.06, 0], [0.09, 0.12], [0.07, 0.26], [0.035, 0.32], [0.04, 0.34]], vaseBlack), 5.55, 0.94, -1.1);
  const twig = new THREE.MeshStandardMaterial({ color: '#3a1a14', roughness: 1 });
  const blossom = new THREE.MeshStandardMaterial({ color: '#ff2d6f', emissive: '#ff1a5c', emissiveIntensity: 0.45, roughness: 0.6 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2, tilt = 0.3 + (i % 3) * 0.12, len = 0.42 + (i % 4) * 0.08;
    const base = new THREE.Vector3(5.55, 1.27, -1.1);
    const end = base.clone().add(new THREE.Vector3(Math.sin(a) * Math.sin(tilt), Math.cos(tilt), Math.cos(a) * Math.sin(tilt)).multiplyScalar(len));
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, len, 4), twig);
    st.position.copy(base).lerp(end, 0.5); st.lookAt(end); st.rotateX(Math.PI / 2);
    scene.add(st);
    for (let k = 2; k <= 6; k++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), blossom);
      b.position.copy(base).lerp(end, k / 6).add(new THREE.Vector3((rnd() - 0.5) * 0.04, (rnd() - 0.5) * 0.03, (rnd() - 0.5) * 0.04));
      scene.add(b);
    }
  }
  // gold ashtray with a lit cigarette
  put(lathe([[0, 0], [0.11, 0], [0.12, 0.03], [0.1, 0.035], [0.09, 0.015], [0, 0.015]], M.gold), 4.1, 0.94, -1.45);
  const cig = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.085, 10), new THREE.MeshStandardMaterial({ color: '#f6f2ea', roughness: 0.8 }));
  cig.rotation.z = Math.PI / 2 - 0.12; cig.rotation.y = 0.5;
  put(cig, 4.1, 0.985, -1.44, false);
  const ember = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: '#ff6a1a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  const tipPos = new THREE.Vector3(4.1 - 0.037, 0.99, -1.44 + 0.02);
  ember.position.copy(tipPos); ember.scale.setScalar(0.03);
  scene.add(ember);
  const puffs = [];
  for (let i = 0; i < 14; i++) {
    const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: '#ddd6d0', transparent: true, opacity: 0, depthWrite: false }));
    p.userData.phase = i / 14;
    scene.add(p);
    puffs.push(p);
  }

  // ---------- illuminated shelving (right wall, by the window) ----------
  const sx0 = 6.45, sx1 = 7.95, sz0 = -0.42, sz1 = -0.08;
  const shelfBack = new THREE.Mesh(new THREE.PlaneGeometry(sx1 - sx0, 1.5), M.marble);
  shelfBack.rotation.y = Math.PI;
  put(shelfBack, (sx0 + sx1) / 2, 1.65, -0.085, false);
  box([sx0, sz0, sx0 + 0.04, sz1], 0.9, 2.45, M.black);
  box([sx1 - 0.04, sz0, sx1, sz1], 0.9, 2.45, M.black);
  box([sx0, sz0, sx1, sz1], 0, 0.9, M.black); // low cabinet
  box([sx0, sz0, sx1, sz1], 0.9, 0.93, M.marble);
  [1.32, 1.82, 2.32].forEach((y) => {
    box([sx0, sz0, sx1, sz1], y, y + 0.03, M.black);
    box([sx0 + 0.05, sz0 + 0.01, sx1 - 0.05, sz0 + 0.025], y - 0.012, y - 0.004, warmLED, { cast: false });
  });
  // shelf 1 (on the marble counter): NEKAO logo sculpture
  const logoTex = new THREE.TextureLoader().load('/logo_cream.png');
  logoTex.colorSpace = THREE.SRGBColorSpace;
  box([7.05, -0.32, 7.35, -0.16], 0.93, 1.03, new THREE.MeshStandardMaterial({ color: '#e8e2de', roughness: 0.3 }));
  const sculptMat = new THREE.MeshStandardMaterial({ map: logoTex, color: '#efe7e2', roughness: 0.35, metalness: 0.2, alphaTest: 0.5, side: THREE.DoubleSide, envMap: env, envMapIntensity: 0.2 });
  for (let i = 0; i < 10; i++) {
    const sl = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), sculptMat);
    sl.rotation.y = Math.PI + 0.35;
    put(sl, 7.2 + (i - 4.5) * 0.002, 1.19, -0.24 + (i - 4.5) * 0.004, true);
  }
  // shelf 2: coupes + decanter
  [6.7, 6.85, 7.0].forEach((x) => {
    put(lathe([[0, 0], [0.035, 0], [0.004, 0.01], [0.004, 0.09], [0.045, 0.11], [0.05, 0.13], [0.002, 0.105]], M.glass, 20), x, 1.35, -0.25, false);
  });
  put(new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.17, 0.11, 3, 0.02), M.glass), 7.45, 1.435, -0.25, false);
  put(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.13, 0.09), new THREE.MeshStandardMaterial({ color: '#c47a20', emissive: '#6a3a08', emissiveIntensity: 0.6, transparent: true, opacity: 0.85 })), 7.45, 1.42, -0.25, false);
  put(new THREE.Mesh(new THREE.OctahedronGeometry(0.04), M.glass), 7.45, 1.56, -0.25, false);
  // shelf 3: books + copper sphere
  ['#7a1428', '#1d1a1c', '#a8323e', '#2c2226'].forEach((c, i) => {
    box([6.6 + i * 0.05, -0.32, 6.645 + i * 0.05, -0.12], 1.85, 2.08 - (i % 2) * 0.03, new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }));
  });
  put(new THREE.Mesh(new THREE.SphereGeometry(0.13, 40, 28), M.copper), 7.3, 1.98, -0.24);
  // trailing plant on top
  const leaf = new THREE.MeshStandardMaterial({ color: '#3b5a25', roughness: 0.9 });
  put(lathe([[0, 0], [0.08, 0], [0.1, 0.14], [0, 0.14]], M.black), 7.7, 2.35, -0.25);
  for (let i = 0; i < 9; i++) {
    const pts = [];
    const a = (i / 9) * Math.PI * 2;
    for (let k = 0; k <= 8; k++) pts.push(new THREE.Vector3(7.7 + Math.sin(a) * (0.06 + k * 0.012), 2.48 - k * 0.09 * (0.6 + (i % 3) * 0.25), -0.25 + Math.cos(a) * 0.06 - (k > 2 ? 0.05 : 0)));
    put(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.004, 4), leaf), 0, 0, 0, false);
    pts.forEach((p, k) => {
      if (k % 2) return;
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 4), leaf);
      l.scale.set(1, 0.4, 0.7); l.position.copy(p); l.rotation.set(rnd(), rnd(), rnd());
      scene.add(l);
    });
  }

  // ---------- lights ----------
  { const l = new THREE.PointLight('#ffb36b', 3.6, 3.6, 1.5); l.position.set(4.4, 1.42, -6.5); scene.add(l); } // under-cabinet glow
  { const l = new THREE.PointLight('#ff2a6d', 1.4, 6, 1.5); l.position.set(4.8, 2.6, -6.3); scene.add(l); } // magenta cove
  { const l = new THREE.PointLight('#ffa060', 0.5, 1.4, 1.8); l.position.set(5, 0.75, -2.05); scene.add(l); } // island glow
  { const l = new THREE.PointLight('#ffb36b', 1.8, 2.2, 1.6); l.position.set(7.2, 1.9, -0.45); scene.add(l); }
  const ceiling = new THREE.SpotLight('#ffb27a', 9, 7, 1.0, 0.85, 1.4);
  ceiling.position.set(5, H - 0.05, -3.5);
  ceiling.target.position.set(5, 0, -3.5);
  ceiling.castShadow = true;
  ceiling.shadow.mapSize.set(1024, 1024);
  scene.add(ceiling, ceiling.target);
  put(new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe0c0').multiplyScalar(3) })), 5, H - 0.06, -3.5, false);

  // light spill: magenta cove on the ceiling, warm glow on the marble floor
  wash(scene, [2.1, H - 0.006, -6.6], [7.9, H - 0.006, -6.6], [2.1, H - 0.006, -4.6], [7.9, H - 0.006, -4.6], '#ff2a6d', 0.28);
  wash(scene, [2.1, H - 0.01, -6.915], [7.9, H - 0.01, -6.915], [2.1, 2.45, -6.915], [7.9, 2.45, -6.915], '#ff2a6d', 0.4);
  wash(scene, [3.5, 0.008, -1.96], [6.5, 0.008, -1.96], [3.5, 0.008, -2.9], [6.5, 0.008, -2.9], '#ffa55a', 0.3);
  wash(scene, [2.15, 0.008, -6.3], [6.7, 0.008, -6.3], [2.15, 0.008, -5.5], [6.7, 0.008, -5.5], '#ffa55a', 0.2);
  wash(scene, [6.5, 0.94, -0.42], [7.9, 0.94, -0.42], [6.5, 0.94, -0.75], [7.9, 0.94, -0.75], '#ffa55a', 0.2);

  // ---------- outside: Arc de Triomphe + avenue + traffic ----------
  const traffic = buildArcView(scene);

  return {
    things,
    update(t) {
      updatePot(t);
      ember.material.opacity = 0.75 + Math.sin(t * 4.7) * 0.15 + Math.sin(t * 1.7) * 0.1;
      puffs.forEach((p) => {
        const f = (t * 0.17 + p.userData.phase) % 1;
        p.position.set(tipPos.x + Math.sin(f * 6 + p.userData.phase * 8) * 0.04 * (0.3 + f), tipPos.y + 0.01 + f * 0.55, tipPos.z + Math.cos(f * 4) * 0.02);
        const s = 0.025 + f * 0.15;
        p.scale.set(s, s * 1.3, 1);
        p.material.opacity = Math.sin(f * Math.PI) * 0.2;
      });
      lampLight.intensity = 0.9 + Math.sin(t * 0.8) * 0.04;
      traffic(t);
    }
  };
}

// ---------------------------------------------------------------
function buildArcView(scene) {
  const { x: AX, z: AZ, base } = ARC;
  // the arch: extruded front with the great vault
  const W = 45, Hh = 50, D = 22, aw = 14.6, ah = 29;
  const shape = new THREE.Shape();
  shape.moveTo(-W / 2, 0); shape.lineTo(-aw / 2, 0); shape.lineTo(-aw / 2, ah - aw / 2);
  shape.absarc(0, ah - aw / 2, aw / 2, Math.PI, 0, true);
  shape.lineTo(aw / 2, 0); shape.lineTo(W / 2, 0); shape.lineTo(W / 2, Hh); shape.lineTo(-W / 2, Hh); shape.lineTo(-W / 2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: false, curveSegments: 24 });
  const facade = (() => {
    const c = document.createElement('canvas'); c.width = 450; c.height = 500;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 500, 0, 0);
    gr.addColorStop(0, '#ffd48a'); gr.addColorStop(0.55, '#f0b25a'); gr.addColorStop(1, '#c98a3a');
    g.fillStyle = gr; g.fillRect(0, 0, 450, 500);
    g.fillStyle = 'rgba(120,70,20,0.45)';
    [[30, 0.79], [0, 0.73], [0, 0.6]].forEach(([inset, f], i) => g.fillRect(0, 500 * (1 - f) - (i === 0 ? 8 : 4), 450, i === 0 ? 10 : 5)); // cornices
    g.fillStyle = 'rgba(150,90,30,0.35)'; g.fillRect(0, 500 * 0.2, 450, 500 * 0.06); // frieze
    g.fillStyle = 'rgba(110,60,15,0.4)';
    [[30, 300, 110, 120], [310, 300, 110, 120], [40, 160, 90, 70], [320, 160, 90, 70]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h)); // relief groups
    g.fillStyle = 'rgba(255,240,200,0.35)';
    for (let x = 10; x < 450; x += 18) g.fillRect(x, 500 * 0.02, 8, 500 * 0.08); // attic shields
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  facade.repeat.set(1 / W, 1 / Hh);
  facade.offset.set(0.5, 0);
  const arcMat = new THREE.MeshBasicMaterial({ map: facade, color: new THREE.Color('#ffffff').multiplyScalar(1.25), fog: false });
  const arc = new THREE.Mesh(geo, arcMat);
  arc.rotation.y = Math.PI / 2; // front faces the kitchen (-x)
  arc.position.set(AX, base, AZ);
  scene.add(arc);
  const vault = new THREE.Mesh(new THREE.PlaneGeometry(aw, ah), new THREE.MeshBasicMaterial({ color: '#2a1a12', fog: false }));
  vault.rotation.y = -Math.PI / 2;
  vault.position.set(AX + D * 0.5, base + ah / 2, AZ);
  scene.add(vault);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: '#ffb04a', transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  halo.scale.set(120, 90, 1);
  halo.position.set(AX - 5, base + 26, AZ);
  scene.add(halo);

  // the avenue and the roundabout
  const road = new THREE.Mesh(new THREE.PlaneGeometry(AX - 15, 26), new THREE.MeshBasicMaterial({ color: '#17110f', fog: false }));
  road.rotation.x = -Math.PI / 2;
  road.position.set((AX + 15) / 2 - 20, base + 0.05, AZ);
  scene.add(road);
  const ring = new THREE.Mesh(new THREE.RingGeometry(40, 62, 64), new THREE.MeshBasicMaterial({ color: '#17110f', fog: false }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(AX, base + 0.06, AZ);
  scene.add(ring);
  // street lamps along the avenue (static warm points)
  const lampPts = [];
  for (let x = 25; x < AX - 30; x += 9) { lampPts.push(x, base + 6, AZ - 15, x, base + 6, AZ + 15); }
  for (let a = 0; a < Math.PI * 2; a += 0.18) lampPts.push(AX + Math.cos(a) * 64, base + 6, AZ + Math.sin(a) * 64);
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lampPts, 3));
  scene.add(new THREE.Points(lg, new THREE.PointsMaterial({ color: new THREE.Color('#ffc066').multiplyScalar(1.6), size: 2.2, map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })));

  // traffic: white headlights coming toward us, red tail lights going away,
  // and cars circling the Étoile
  const N = 150, ringN = 70;
  const pos = new Float32Array((N + ringN) * 3);
  const col = new Float32Array((N + ringN) * 3);
  const cars = [];
  for (let i = 0; i < N; i++) {
    const toward = i % 2 === 0;
    cars.push({ type: 'av', toward, lane: (toward ? 1 : -1) * (3 + (i % 3) * 2.6), off: rnd() * (AX - 40), speed: 9 + rnd() * 6 });
    const c = toward ? new THREE.Color('#fff2d8').multiplyScalar(2.2) : new THREE.Color('#ff2a1a').multiplyScalar(2.0);
    col.set([c.r, c.g, c.b], i * 3);
  }
  for (let i = 0; i < ringN; i++) {
    cars.push({ type: 'ring', r: 45 + (i % 4) * 4, a0: rnd() * Math.PI * 2, speed: 0.08 + rnd() * 0.05 });
    const c = i % 2 ? new THREE.Color('#fff2d8').multiplyScalar(2) : new THREE.Color('#ff3a20').multiplyScalar(1.8);
    col.set([c.r, c.g, c.b], (N + i) * 3);
  }
  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  tg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const tm = new THREE.PointsMaterial({ size: 1.6, vertexColors: true, map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const points = new THREE.Points(tg, tm);
  points.frustumCulled = false;
  scene.add(points);
  const len = AX - 40;

  return (t) => {
    cars.forEach((c, i) => {
      if (c.type === 'av') {
        const d = (c.off + c.speed * t) % len;
        const x = c.toward ? AX - 45 - d : 25 + d;
        pos[i * 3] = x; pos[i * 3 + 1] = base + 0.8; pos[i * 3 + 2] = AZ + c.lane;
      } else {
        const a = c.a0 + c.speed * t;
        pos[i * 3] = AX + Math.cos(a) * c.r; pos[i * 3 + 1] = base + 0.8; pos[i * 3 + 2] = AZ + Math.sin(a) * c.r;
      }
    });
    tg.attributes.position.needsUpdate = true;
  };
}
