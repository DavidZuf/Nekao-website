import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildParis, towerTop, TOWER, glowTexture } from './paris.js';
import { wash } from './atmosphere.js';
import { leopardTexture } from './kitchen.js';

// The NEKAO living room, built after the art-direction reference:
// curved pink sofa in front of a panoramic window on Paris, faceted coffee
// table, arc lamp, pedestals, the NEKAO logo sculpture, pink LED coves.
// Room footprint: x -7 → 2, z -7 → 0 (window on the back wall, z = -7).

const H = 2.8;
const WIN = { x0: -5.4, x1: 0.4, y0: 0.62, y1: 2.6 };
const CENTER = new THREE.Vector3(-2.5, 1.1, -4);

// Things you can't walk through (added to the apartment's blockers)
export const LIVING_BLOCKERS = [
  [-4.55, -6.45, -0.45, -5.1], // sofa
  [-3.3, -4.7, -1.7, -3.1], // coffee table
  [-5.15, -5.15, -4.65, -4.65], // lamp base
  [-6.65, -5.95, -5.95, -5.25], // red sphere pedestal
  [-0.3, -6.85, 0.3, -6.25], // plant pedestal
  [0.45, -5.85, 1.35, -4.95], // sculpture pedestal
  [-1.95, -5.1, -1.0, -4.75] // Gigi's boots
];

const add = (scene, mesh, x, y, z, { cast = true, receive = true } = {}) => {
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  scene.add(mesh);
  return mesh;
};

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildLivingRoom(scene, wallMat) {
  // ---------- back wall with the panoramic window ----------
  const T = 0.14, zW = -7;
  const wallPiece = (x0, x1, y0, y1) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, T), wallMat);
    add(scene, m, (x0 + x1) / 2, (y0 + y1) / 2, zW);
  };
  wallPiece(-7, WIN.x0, 0, H);
  wallPiece(WIN.x1, 2, 0, H);
  wallPiece(WIN.x0, WIN.x1, 0, WIN.y0);
  wallPiece(WIN.x0, WIN.x1, WIN.y1, H);

  const frameMat = new THREE.MeshStandardMaterial({ color: '#0d0b0c', roughness: 0.4, metalness: 0.5 });
  const fw = 0.07;
  const frame = (x0, x1, y0, y1) => add(scene, new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, 0.12), frameMat), (x0 + x1) / 2, (y0 + y1) / 2, zW + 0.02);
  frame(WIN.x0, WIN.x1, WIN.y0, WIN.y0 + fw);
  frame(WIN.x0, WIN.x1, WIN.y1 - fw, WIN.y1);
  frame(WIN.x0, WIN.x0 + fw, WIN.y0, WIN.y1);
  frame(WIN.x1 - fw, WIN.x1, WIN.y0, WIN.y1);
  const mid = (WIN.x0 + WIN.x1) / 2;
  frame(mid - fw / 2, mid + fw / 2, WIN.y0, WIN.y1);
  // glass: faint reflection, lets light through, casts no shadow
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(WIN.x1 - WIN.x0, WIN.y1 - WIN.y0),
    new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.06, depthWrite: false })
  );
  add(scene, glass, mid, (WIN.y0 + WIN.y1) / 2, zW + 0.03, { cast: false, receive: false });

  // ---------- pink LED coves ----------
  const led = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff2a6d').multiplyScalar(2.4) });
  const strip = (x0, z0, x1, z1, y) => add(scene, new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.03, Math.abs(x1 - x0)), 0.03, Math.max(0.03, Math.abs(z1 - z0))), led), (x0 + x1) / 2, y, (z0 + z1) / 2, { cast: false, receive: false });
  strip(-6.92, -6.9, -6.92, -0.1, H - 0.04); // left wall, ceiling
  strip(1.92, -6.9, 1.92, -0.1, H - 0.04); // right wall, ceiling
  strip(-6.9, -6.92, WIN.x0 - 0.1, -6.92, H - 0.04);
  strip(WIN.x1 + 0.1, -6.92, 1.9, -6.92, H - 0.04);
  strip(-6.92, -6.9, -6.92, -0.1, 0.03); // floor lines
  strip(1.92, -6.9, 1.92, -4.1, 0.03);
  strip(1.92, -2.5, 1.92, -0.1, 0.03);
  const pink = (x, y, z, i = 0.45) => { const l = new THREE.PointLight('#ff2a6d', i, 6, 1.8); l.position.set(x, y, z); scene.add(l); };
  pink(-6.6, 2.5, -5.2); pink(-6.6, 2.5, -1.8); pink(1.6, 2.5, -5.4); pink(1.6, 2.5, -1.6);
  pink(-6.6, 0.15, -3.5, 0.3); pink(1.6, 0.15, -3.0, 0.3);
  // even spill of the LED strips onto walls, ceiling and floor
  const PK = '#ff2a6d';
  [[-6.925, 1], [1.925, -1]].forEach(([x, dir]) => {
    wash(scene, [x, H - 0.02, -6.9], [x, H - 0.02, -0.1], [x, 1.5, -6.9], [x, 1.5, -0.1], PK, 0.3); // wall, from the ceiling strip
    wash(scene, [x, H - 0.006, -6.9], [x, H - 0.006, -0.1], [x + dir * 1.7, H - 0.006, -6.9], [x + dir * 1.7, H - 0.006, -0.1], PK, 0.26); // ceiling
    wash(scene, [x, 0.03, -6.9], [x, 0.03, -0.1], [x, 0.85, -6.9], [x, 0.85, -0.1], PK, 0.22); // wall, from the floor strip
    wash(scene, [x, 0.008, -6.9], [x, 0.008, -0.1], [x + dir * 1.5, 0.008, -6.9], [x + dir * 1.5, 0.008, -0.1], PK, 0.2); // floor reflection
  });

  // ---------- leopard rug under the sofa and table, thin black border ----------
  const border = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.6), new THREE.MeshStandardMaterial({ color: '#0e0809', roughness: 0.9 }));
  border.rotation.x = -Math.PI / 2;
  add(scene, border, -2.5, 0.004, -4.65, { cast: false });
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 3.4), new THREE.MeshStandardMaterial({ map: leopardTexture([1.8, 1.45]), color: '#a08672', roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  add(scene, rug, -2.5, 0.006, -4.65, { cast: false });

  // ---------- curved pink sofa ----------
  const velvet = new THREE.MeshPhysicalMaterial({ color: '#b8104a', roughness: 0.78, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color('#ff7aa8') });
  add(scene, new THREE.Mesh(new RoundedBoxGeometry(3.5, 0.4, 0.95, 5, 0.17), velvet), -2.5, 0.24, -5.7);
  add(scene, new THREE.Mesh(new RoundedBoxGeometry(3.3, 0.12, 0.8, 3, 0.05), new THREE.MeshStandardMaterial({ color: '#5a0f24', roughness: 0.8 })), -2.5, 0.05, -5.75);
  // rounded, wavy shell back (extruded outline with a big bevel = pillowy)
  const outline = new THREE.Shape();
  outline.moveTo(-1.62, 0.0);
  outline.lineTo(-1.62, 0.32);
  outline.bezierCurveTo(-1.62, 0.62, -1.25, 0.68, -0.85, 0.6);
  outline.bezierCurveTo(-0.45, 0.52, -0.2, 0.44, 0.15, 0.5);
  outline.bezierCurveTo(0.55, 0.57, 0.95, 0.72, 1.3, 0.6);
  outline.bezierCurveTo(1.6, 0.5, 1.62, 0.4, 1.62, 0.3);
  outline.lineTo(1.62, 0.0);
  outline.lineTo(-1.62, 0.0);
  const shellGeo = new THREE.ExtrudeGeometry(outline, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.16, bevelSegments: 10, curveSegments: 40 });
  add(scene, new THREE.Mesh(shellGeo, velvet), -2.5, 0.28, -6.38);
  // rolled arms that curl forward
  const armGeo = new RoundedBoxGeometry(0.42, 0.56, 1.05, 6, 0.2);
  add(scene, new THREE.Mesh(armGeo, velvet), -4.2, 0.36, -5.72).rotation.y = 0.12;
  add(scene, new THREE.Mesh(armGeo, velvet), -0.8, 0.36, -5.72).rotation.y = -0.12;
  const bolster = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.42, 24), velvet);
  bolster.rotation.z = Math.PI / 2;
  add(scene, bolster, -1.25, 0.6, -5.85);

  // ---------- faceted coffee table ----------
  const tableMat = new THREE.MeshStandardMaterial({ color: '#a8746a', roughness: 0.55, flatShading: true });
  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.12, 0.44, 4, 1), tableMat);
  table.rotation.y = Math.PI / 4 + 0.08;
  add(scene, table, -2.5, 0.22, -3.9);
  const book = (y, c, w = 0.42) => add(scene, new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.3), new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 })), -2.95, y, -3.95);
  book(0.47, '#2a1416'); book(0.53, '#3b1d1f', 0.36);
  const vase = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.07, 0], [0.09, 0.08], [0.085, 0.2], [0.05, 0.28], [0.045, 0.3]].map(([r, y]) => new THREE.Vector2(r, y)), 24), new THREE.MeshStandardMaterial({ color: '#4d201f', roughness: 0.5 }));
  add(scene, vase, -2.55, 0.44, -4.08);
  const twig = new THREE.MeshStandardMaterial({ color: '#3a1a14', roughness: 1 });
  const blossom = new THREE.MeshStandardMaterial({ color: '#ff3a78', emissive: '#ff1a5c', emissiveIntensity: 0.4, roughness: 0.6 });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2, tilt = 0.25 + (i % 3) * 0.12, len = 0.35 + (i % 4) * 0.08;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, len, 4), twig);
    stem.position.set(-2.55 + Math.sin(a) * Math.sin(tilt) * len / 2, 0.72 + Math.cos(tilt) * len / 2, -4.08 + Math.cos(a) * Math.sin(tilt) * len / 2);
    stem.rotation.set(Math.cos(a) * tilt, 0, -Math.sin(a) * tilt);
    scene.add(stem);
    for (let k = 1; k <= 3; k++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), blossom);
      const f = k / 3;
      b.position.set(-2.55 + Math.sin(a) * Math.sin(tilt) * len * f, 0.72 + Math.cos(tilt) * len * f, -4.08 + Math.cos(a) * Math.sin(tilt) * len * f);
      scene.add(b);
    }
  }
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 20), new THREE.MeshStandardMaterial({ color: '#ffe2c4', emissive: '#ffbf80', emissiveIntensity: 2.2 }));
  add(scene, orb, -2.1, 0.55, -3.8, { cast: false });
  const orbLight = new THREE.PointLight('#ffb070', 1.0, 3, 2);
  orbLight.position.set(-2.1, 0.6, -3.8);
  scene.add(orbLight);

  // ---------- arc floor lamp ----------
  const bronze = new THREE.MeshStandardMaterial({ color: '#7a3f2a', roughness: 0.35, metalness: 0.7 });
  add(scene, new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.5, 32), new THREE.MeshStandardMaterial({ color: '#5a2c22', roughness: 0.6 })), -4.9, 0.25, -4.9);
  const arc = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-4.9, 0.5, -4.9), new THREE.Vector3(-4.95, 3.5, -5.25), new THREE.Vector3(-3.35, 2.2, -5.35));
  add(scene, new THREE.Mesh(new THREE.TubeGeometry(arc, 60, 0.022, 8, false), bronze), 0, 0, 0);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.2, 40, 1, true), new THREE.MeshStandardMaterial({ color: '#8a4a32', roughness: 0.35, metalness: 0.6, side: THREE.DoubleSide }));
  add(scene, shade, -3.35, 2.1, -5.35);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a8').multiplyScalar(3) }));
  add(scene, bulb, -3.35, 2.0, -5.35, { cast: false });
  const lampLight = new THREE.SpotLight('#ffc48a', 9, 6, 0.95, 0.6, 1.6);
  lampLight.position.set(-3.35, 1.98, -5.35);
  lampLight.target.position.set(-3.1, 0, -5.2);
  scene.add(lampLight, lampLight.target);

  // ---------- pedestals ----------
  const plaster = new THREE.MeshStandardMaterial({ color: '#c99a86', roughness: 0.7 });
  add(scene, new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.1, 0.62), plaster), -6.3, 0.55, -5.6);
  add(scene, new THREE.Mesh(new THREE.SphereGeometry(0.27, 48, 32), new THREE.MeshPhysicalMaterial({ color: '#8c0b1e', roughness: 0.12, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.05 })), -6.3, 1.37, -5.6);
  add(scene, new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.72, 0.56), plaster), 0.0, 0.36, -6.55);
  const leafGeo = new THREE.IcosahedronGeometry(0.44, 4);
  const pos = leafGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    v.multiplyScalar(1 + (Math.sin(v.x * 40) * Math.cos(v.y * 37) * Math.sin(v.z * 43)) * 0.06);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  leafGeo.computeVertexNormals();
  add(scene, new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({ color: '#3d4a26', roughness: 1 })), 0.0, 1.16, -6.55);

  // ---------- NEKAO logo sculpture ----------
  add(scene, new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.95, 0.9), plaster), 0.9, 0.475, -5.4);
  add(scene, new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.08, 40), new THREE.MeshStandardMaterial({ color: '#e2c3ad', roughness: 0.5 })), 0.9, 0.99, -5.4);
  const logoTex = new THREE.TextureLoader().load('/logo_cream.png');
  logoTex.colorSpace = THREE.SRGBColorSpace;
  const sculptMat = new THREE.MeshStandardMaterial({ map: logoTex, color: '#f3dcc8', roughness: 0.45, alphaTest: 0.5, side: THREE.DoubleSide });
  const sculptDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: logoTex, alphaTest: 0.5 });
  const sculpture = new THREE.Group();
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), sculptMat);
    s.position.z = (i - 7.5) * 0.007;
    s.castShadow = true;
    s.customDepthMaterial = sculptDepth;
    sculpture.add(s);
  }
  sculpture.position.set(0.9, 1.6, -5.4);
  sculpture.rotation.y = -0.6;
  scene.add(sculpture);

  // ---------- wall banner (right wall) ----------
  const bannerTex = canvasTex(150, 300, (g, w, h) => {
    g.fillStyle = '#d98c8f'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a1418'; g.beginPath(); g.arc(w / 2, h * 0.3, w * 0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c2184f'; g.beginPath(); g.arc(w / 2, h, w * 0.55, Math.PI, 0); g.fill();
  });
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.5), new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.9 }));
  banner.rotation.y = -Math.PI / 2;
  add(scene, banner, 1.92, 1.6, -6.35, { cast: false });
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 8), bronze);
  rod.rotation.x = Math.PI / 2;
  add(scene, rod, 1.9, 2.37, -6.35, { cast: false });

  // ---------- warm ceiling downlight ----------
  const down = new THREE.SpotLight('#ffb27a', 14, 7, 0.9, 0.8, 1.5);
  down.position.set(-2.5, H - 0.05, -3.4);
  down.target.position.set(-2.5, 0, -3.9);
  down.castShadow = true;
  down.shadow.mapSize.set(1024, 1024);
  scene.add(down, down.target);
  const downBulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe0c0').multiplyScalar(3) }));
  add(scene, downBulb, -2.5, H - 0.04, -3.4, { cast: false });
  const ceilWarm = new THREE.PointLight('#ff9a5a', 2.2, 2.6, 1.6);
  ceilWarm.position.set(-2.5, H - 0.35, -3.4);
  scene.add(ceilWarm);

  // ---------- Paris + the Eiffel Tower beacon ----------
  const beacon = buildParis(scene);

  // The beam entering the room: a shadow-casting spotlight placed far out
  // on the line to the tower top, so its light comes from the tower's
  // direction. A soft vertical band (the beam's width) slides across it as
  // the beacon turns, so the light sweeps through the room.
  const top = towerTop();
  const toTower = top.clone().sub(CENTER).normalize();
  const band = canvasTex(512, 8, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, '#000'); gr.addColorStop(0.32, '#000');
    gr.addColorStop(0.42, '#555'); gr.addColorStop(0.5, '#fff'); gr.addColorStop(0.58, '#555');
    gr.addColorStop(0.68, '#000'); gr.addColorStop(1, '#000');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  band.wrapS = band.wrapT = THREE.ClampToEdgeWrapping;
  const beam = new THREE.SpotLight('#fff3e2', 0, 0, 0.17, 0.25, 0);
  beam.position.copy(CENTER).addScaledVector(toTower, 60);
  beam.target.position.copy(CENTER);
  beam.map = band;
  beam.castShadow = true;
  beam.shadow.mapSize.set(2048, 2048);
  beam.shadow.camera.near = 45;
  beam.shadow.camera.far = 75;
  beam.shadow.bias = -0.0002;
  beam.shadow.normalBias = 0.04;
  scene.add(beam, beam.target);

  // light bouncing off the lit surfaces (fills the ceiling, sofa front)
  const bounce = new THREE.PointLight('#ffe6d6', 0, 8, 1.3);
  bounce.position.set(-2.5, 1.0, -2.6);
  scene.add(bounce);

  // a faint shaft of light in the air, inside the window
  const shaftTex = canvasTex(256, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.35, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-in';
    const gv = g.createLinearGradient(0, 0, 0, h);
    gv.addColorStop(0, 'rgba(0,0,0,0)'); gv.addColorStop(0.3, 'rgba(0,0,0,1)'); gv.addColorStop(0.7, 'rgba(0,0,0,1)'); gv.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gv; g.fillRect(0, 0, w, h);
  });
  const shaftMat = new THREE.MeshBasicMaterial({ color: '#fff1dc', map: shaftTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const shaftGroup = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.9), shaftMat);
    s.rotation.y = Math.PI / 2; // plane runs along the beam
    s.position.x = (i - 2) * 0.14;
    shaftGroup.add(s);
  }
  // orient the shaft along the incoming light direction
  shaftGroup.position.set(mid, (WIN.y0 + WIN.y1) / 2 - 0.2, zW + 2.1);
  shaftGroup.lookAt(shaftGroup.position.clone().addScaledVector(toTower, -1));
  scene.add(shaftGroup);

  // beacon timing
  const towerToRoom = Math.atan2(CENTER.x - TOWER.x, CENTER.z - TOWER.z); // beam yaw that points at us
  const PERIOD = 22; // seconds per full turn (two beams → a pass every 11 s)
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  return {
    update(t) {
      const yaw = towerToRoom - 1.9 + (t / PERIOD) * Math.PI * 2;
      beacon.group.rotation.y = yaw;
      const d1 = wrap(yaw - towerToRoom), d2 = wrap(yaw + Math.PI - towerToRoom);
      const d = Math.abs(d1) < Math.abs(d2) ? d1 : d2;
      const e = Math.exp(-Math.pow(d / 0.075, 2)); // how much the beam faces us
      const k = THREE.MathUtils.clamp(d / 0.16, -1, 1); // where the beam's band is, -1 → 1
      beam.intensity = e * 2.8;
      band.offset.x = k * 0.6;
      // the light it throws back travels across the room with the beam
      bounce.intensity = e * 3.6;
      bounce.position.x = mid - k * 3.4;
      shaftMat.opacity = e * 0.05;
      shaftGroup.position.x = mid - THREE.MathUtils.clamp(d / 0.16, -1, 1) * 3.2;
      beacon.flare.scale.setScalar(6 + e * 38);
      beacon.flare.material.opacity = 0.55 + e * 0.45;
    }
  };
}
