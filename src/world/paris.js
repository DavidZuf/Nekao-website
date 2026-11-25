import * as THREE from 'three';

// Paris at night, seen from the living room window:
// sky, rooftops with lit windows, and the Eiffel Tower with its rotating beacon.
// Everything here is far away and ignores fog.

export const TOWER = { x: 36, z: -220, base: -32, height: 60 };
export const towerTop = () => new THREE.Vector3(TOWER.x, TOWER.base + TOWER.height - 1.5, TOWER.z);

const rand = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function glowTexture() {
  return canvasTexture(128, 128, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.2, 'rgba(255,240,215,0.6)');
    r.addColorStop(1, 'rgba(255,200,150,0)');
    g.fillStyle = r; g.fillRect(0, 0, w, w);
  });
}

function sky(scene) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {},
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `varying vec3 vP;
      void main(){
        float h = vP.y;
        vec3 top = vec3(0.002,0.002,0.007);
        vec3 hor = vec3(0.03,0.016,0.03);
        vec3 low = vec3(0.03,0.02,0.03);
        vec3 c = h > 0. ? mix(hor, top, pow(clamp(h*3.5,0.,1.),0.6)) : mix(hor, low, clamp(-h*8.,0.,1.));
        gl_FragColor = vec4(c,1.);
      }`
  });
  const s = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), mat);
  s.renderOrder = -10;
  scene.add(s);

  const pts = [];
  for (let i = 0; i < 500; i++) {
    const a = rand() * Math.PI * 2, e = 0.08 + rand() * 1.3;
    pts.push(Math.cos(a) * Math.cos(e) * 1100, Math.sin(e) * 1100, Math.sin(a) * Math.cos(e) * 1100);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: '#cfd6ff', size: 1.4, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.55 })));
}

function city(scene) {
  const view = new THREE.Vector3(-2.5, 0, -4);
  const N = 2200;
  const bGeo = new THREE.BoxGeometry(1, 1, 1);
  bGeo.translate(0, 0.5, 0);
  const bMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, fog: false });
  const buildings = new THREE.InstancedMesh(bGeo, bMat, N);
  const wMat = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false });
  const windows = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1.4), wMat, N * 7);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  const col = new THREE.Color();
  let bi = 0, wi = 0;
  const facade = ['#2b2420', '#251f1c', '#30282a', '#1f1c20'];
  while (bi < N) {
    const r = 22 + Math.pow(rand(), 0.7) * 330;
    let x, z;
    if (bi < 950) { // the living room window's view (toward -z)
      const a = (rand() - 0.5) * 1.7;
      x = view.x + Math.sin(a) * r; z = view.z - Math.cos(a) * r;
    } else if (bi < 1650) { // the kitchen window's view (toward +x, the Arc de Triomphe)
      const a = (rand() - 0.5) * 1.9, rr = 22 + Math.pow(rand(), 0.8) * 380;
      x = 5 + Math.cos(a) * rr; z = -3.5 + Math.sin(a) * rr;
    } else { // all around
      const a = rand() * Math.PI * 2;
      x = view.x + Math.sin(a) * r; z = view.z - Math.cos(a) * r;
    }
    if (Math.hypot(x - TOWER.x, z - TOWER.z) < 22) continue;
    if (x > 15 && Math.abs(z + 3.5) < 22) continue; // keep the avenue to the Arc clear
    if (Math.hypot(x - 330, z + 3.5) < 75) continue; // the Étoile around the Arc
    const w = 8 + rand() * 10, d = 8 + rand() * 10;
    const h = 10 + rand() * 8 + (rand() < 0.03 ? 6 : 0);
    const yaw = (bi >= 950 && bi < 1650 ? Math.atan2(5 - x, -3.5 - z) : Math.atan2(view.x - x, view.z - z)) + (rand() - 0.5) * 0.4;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    m.compose(p.set(x, -32, z), q, sc.set(w, h, d));
    buildings.setMatrixAt(bi, m);
    buildings.setColorAt(bi, col.set(facade[bi % 4]));
    // lit windows on the face looking at us
    const rows = Math.floor(h / 3.2), cols = Math.floor(w / 2.2);
    for (let k = 0; k < 7 && wi < N * 7; k++) {
      if (rand() < 0.35) continue;
      const cx = (Math.floor(rand() * cols) - cols / 2 + 0.5) * 2.2;
      const cy = -32 + 2 + Math.floor(rand() * rows) * 3.2;
      const local = new THREE.Vector3(cx, 0, d / 2 + 0.06).applyQuaternion(q);
      m.compose(p.set(x + local.x, cy, z + local.z), q, sc.set(1, 1, 1));
      windows.setMatrixAt(wi, m);
      const warm = rand();
      windows.setColorAt(wi, col.set(warm < 0.75 ? '#ffb85c' : warm < 0.92 ? '#ffd9a0' : '#9fc0ff').multiplyScalar(0.7 + rand() * 0.8));
      wi++;
    }
    bi++;
  }
  windows.count = wi;
  scene.add(buildings, windows);
}

function tower(scene) {
  const { x, z, base, height: H } = TOWER;
  const lattice = canvasTexture(64, 64, (g, w) => {
    g.fillStyle = '#8a5a2a'; g.fillRect(0, 0, w, w);
    g.strokeStyle = '#fff'; g.lineWidth = 12;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, w); g.moveTo(w, 0); g.lineTo(0, w);
    g.rect(0, 0, w, w); g.stroke();
  });
  lattice.wrapS = lattice.wrapT = THREE.RepeatWrapping;
  lattice.repeat.set(3, 14);
  const gold = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffb347').multiplyScalar(1.5), map: lattice, side: THREE.DoubleSide, fog: false });
  const prof = [[0.2, 0], [0.165, 0.06], [0.12, 0.17], [0.085, 0.2], [0.07, 0.36], [0.045, 0.45], [0.03, 0.62], [0.018, 0.8], [0.01, 0.92], [0.004, 0.97]]
    .map(([r, y]) => new THREE.Vector2(r * H, y * H));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 4), gold);
  body.rotation.y = Math.PI / 4;
  body.position.set(x, base, z);
  scene.add(body);
  const solid = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffc46b').multiplyScalar(2.2), fog: false });
  [[0.18, 0.15], [0.36, 0.085], [0.84, 0.03]].forEach(([y, r]) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(r * H * 2, 0.5, r * H * 2), solid);
    p.position.set(x, base + y * H, z);
    p.rotation.y = Math.PI / 4 * 0;
    scene.add(p);
  });
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.06 * H, 6), solid);
  ant.position.set(x, base + 0.99 * H, z);
  scene.add(ant);
  // soft glow around the tower
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: '#ff9a3c', transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  halo.scale.set(H * 0.8, H * 1.2, 1);
  halo.position.set(x, base + H * 0.55, z);
  scene.add(halo);
}

// The rotating beacon: two opposite beams turning slowly, plus a flare.
function beacon(scene) {
  const fade = canvasTexture(4, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, h, 0, 0);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,0.45)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const geo = new THREE.CylinderGeometry(11, 0.35, 700, 24, 1, true);
  geo.translate(0, 350, 0);
  geo.rotateX(Math.PI / 2);
  // pink neon: a soft pink cone around a bright thin core
  const mat = new THREE.MeshBasicMaterial({ color: '#ff3a7a', alphaMap: fade, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  const coreGeo = new THREE.CylinderGeometry(1.1, 0.12, 700, 12, 1, true);
  coreGeo.translate(0, 350, 0);
  coreGeo.rotateX(Math.PI / 2);
  const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff4f8b').multiplyScalar(2.2), alphaMap: fade, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  const group = new THREE.Group();
  group.position.copy(towerTop());
  const a = new THREE.Mesh(geo, mat);
  const b = new THREE.Mesh(geo, mat);
  b.rotation.y = Math.PI;
  a.rotation.x = b.rotation.x = -0.015;
  const ca = new THREE.Mesh(coreGeo, coreMat);
  const cb = new THREE.Mesh(coreGeo, coreMat);
  cb.rotation.y = Math.PI;
  ca.rotation.x = cb.rotation.x = -0.015;
  group.add(a, b, ca, cb);
  scene.add(group);
  const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: '#ff8fb8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  flare.position.copy(towerTop());
  scene.add(flare);
  return { group, flare, mat };
}

export function buildParis(scene) {
  sky(scene);
  city(scene);
  tower(scene);
  return beacon(scene);
}
