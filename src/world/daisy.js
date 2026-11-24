import * as THREE from 'three';
import { glowTexture } from './paris.js';

// Daisy — the living room resident, built after David's fashion illustration:
// blonde waves, oversized square sunglasses, pink lips, black ribbon choker,
// white boxy NEKAO tee over sunflower-print mesh sleeves, cream wide-leg
// trousers, yellow pointed heels, a cigarette in her raised right hand and
// her left hand in her pocket.
// Origin = between her feet, she faces +z.

const tex = (w, h, draw) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

// the tee print: sun, martini glass, NEKAO lettering
const printTexture = () => tex(512, 512, (g, w) => {
  g.clearRect(0, 0, w, w);
  g.strokeStyle = '#f2b51c'; g.lineWidth = 9; g.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    g.beginPath(); g.moveTo(256 + Math.cos(a) * 150, 270 + Math.sin(a) * 150); g.lineTo(256 + Math.cos(a) * 190, 270 + Math.sin(a) * 190); g.stroke();
  }
  g.fillStyle = '#f6c42a'; g.beginPath(); g.arc(256, 270, 128, 0, Math.PI * 2); g.fill();
  // martini glass
  g.fillStyle = '#e8237a';
  g.beginPath(); g.moveTo(150, 90); g.lineTo(330, 90); g.lineTo(240, 200); g.closePath(); g.fill();
  g.fillRect(234, 196, 12, 120);
  g.beginPath(); g.ellipse(240, 322, 52, 11, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#e8237a'; g.lineWidth = 6; g.beginPath(); g.moveTo(205, 70); g.lineTo(255, 150); g.stroke();
  g.fillStyle = '#c4122f'; g.beginPath(); g.arc(255, 150, 9, 0, Math.PI * 2); g.fill();
  // VOGUE / PARIS by the glass
  g.textAlign = 'left';
  g.font = 'bold 54px Georgia, serif'; g.lineWidth = 4; g.strokeStyle = '#e8237a';
  g.fillStyle = '#ee6a1e'; g.strokeText('VOGUE', 250, 132); g.fillText('VOGUE', 250, 132);
  g.font = 'bold 34px Georgia, serif'; g.fillStyle = '#ee6a1e'; g.fillText('PARIS', 268, 172);
  // JACQUEMUS curving under the sun
  g.font = 'bold 50px Georgia, serif'; g.fillStyle = '#e8237a'; g.textAlign = 'center';
  const word = 'JACQUEMUS', R = 175;
  for (let i = 0; i < word.length; i++) {
    const ang = Math.PI / 2 + (4 - i) * 0.13;
    g.save(); g.translate(256 + Math.cos(ang) * R, 262 + Math.sin(ang) * R); g.rotate(ang - Math.PI / 2); g.fillText(word[i], 0, 0); g.restore();
  }
});

// sheer black mesh with sunflowers + yellow gingham cuff
const sleeveTexture = () => tex(256, 512, (g, w, h) => {
  g.fillStyle = '#2a2622'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(214,170,60,0.35)';
  for (let y = 0; y < h; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < w; x += 8) g.fillRect(x, y, 3, 3);
  const flower = (cx, cy, r) => {
    g.fillStyle = '#f2b31b';
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      g.beginPath(); g.ellipse(cx + Math.cos(a) * r * 0.75, cy + Math.sin(a) * r * 0.75, r * 0.42, r * 0.17, a, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = '#6b3d12'; g.beginPath(); g.arc(cx, cy, r * 0.42, 0, Math.PI * 2); g.fill();
  };
  flower(70, 90, 46); flower(190, 210, 40); flower(80, 330, 44); flower(200, 430, 36);
  // gingham patch with 'Daisy' near the top (upper arm)
  g.fillStyle = '#e9c64a'; g.fillRect(0, 0, w, 60);
  g.fillStyle = 'rgba(60,40,10,0.45)';
  for (let x = 0; x < w; x += 14) g.fillRect(x, 0, 7, 60);
  g.fillStyle = '#3b2410'; g.font = 'italic 34px Georgia, serif'; g.textAlign = 'center'; g.fillText('Daisy', w / 2, 42);
  // gingham cuff at the bottom of the texture (wrist)
  g.fillStyle = '#e9c64a'; g.fillRect(0, h - 70, w, 70);
  g.fillStyle = 'rgba(60,40,10,0.55)';
  for (let x = 0; x < w; x += 16) g.fillRect(x, h - 70, 8, 70);
  for (let y = h - 70; y < h; y += 16) g.fillRect(0, y, w, 8);
});

function limb(parent, a, b, r0, r1, material, seg = 16) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(r1, r0, len, seg, 1, false);
  const m = new THREE.Mesh(geo, material);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.castShadow = true;
  parent.add(m);
  const j = new THREE.Mesh(new THREE.SphereGeometry(r0, seg, 10), material);
  j.position.copy(a); j.castShadow = true; parent.add(j);
  return m;
}

export function buildDaisy() {
  const group = new THREE.Group();
  const body = new THREE.Group(); // children[0] (breathes)
  group.add(body);
  const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
  const mesh = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; body.add(m); return m; };

  const skin = new THREE.MeshStandardMaterial({ color: '#f1cfbb', roughness: 0.55 });
  const cream = new THREE.MeshStandardMaterial({ color: '#eee0c2', roughness: 0.92, side: THREE.DoubleSide });
  const white = new THREE.MeshStandardMaterial({ color: '#f5f1ea', roughness: 0.95 });
  const sleeveMat = new THREE.MeshStandardMaterial({ map: sleeveTexture(), roughness: 0.8 });
  const yellow = new THREE.MeshPhysicalMaterial({ color: '#f0b51e', roughness: 0.25, clearcoat: 0.8 });
  const black = new THREE.MeshPhysicalMaterial({ color: '#0d0b0c', roughness: 0.2, clearcoat: 1 });
  const blonde = new THREE.MeshStandardMaterial({ color: '#e2c08a', roughness: 0.6 });
  const blondeDark = new THREE.MeshStandardMaterial({ color: '#c69a5c', roughness: 0.65 });

  // ---------- heels ----------
  const shoe = (x, z, yaw) => {
    const s = new THREE.Group();
    const toe = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 16), yellow);
    toe.rotation.x = Math.PI / 2; toe.position.set(0, 0.03, 0.07); toe.scale.set(1, 1, 0.5);
    const vamp = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), yellow);
    vamp.scale.set(1, 0.6, 1.4); vamp.position.set(0, 0.045, 0.0);
    const heel = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.09, 8), yellow);
    heel.position.set(0, 0.045, -0.06);
    [toe, vamp, heel].forEach((m) => { m.castShadow = true; s.add(m); });
    s.position.set(x, 0, z); s.rotation.y = yaw;
    body.add(s);
  };
  shoe(0.05, 0.0, 0.1);
  shoe(0.2, 0.1, 0.45);

  // ---------- wide-leg trousers (one flared leg each) ----------
  const legProfile = [[0.17, 0], [0.165, 0.05], [0.15, 0.3], [0.13, 0.6], [0.11, 0.85], [0.1, 0.96]].map(([r, y]) => new THREE.Vector2(r, y));
  const legGeo = new THREE.LatheGeometry(legProfile, 28);
  const weightLeg = new THREE.Mesh(legGeo, cream);
  weightLeg.position.set(0.06, 0.05, 0); weightLeg.scale.set(0.92, 1, 0.85); weightLeg.castShadow = true;
  body.add(weightLeg);
  const freeLeg = new THREE.Mesh(legGeo, cream);
  freeLeg.position.set(0.14, 0.05, 0.05); freeLeg.rotation.set(-0.06, 0, 0.11); freeLeg.scale.set(0.9, 1, 0.85); freeLeg.castShadow = true;
  body.add(freeLeg);
  // hips + waistband (high waist), hip pushed out
  const hips = mesh(new THREE.SphereGeometry(0.17, 28, 18), cream, 0.08, 1.02, 0);
  hips.scale.set(1.05, 0.75, 0.75);
  mesh(new THREE.CylinderGeometry(0.135, 0.15, 0.08, 28), cream, 0.07, 1.1, 0).scale.set(1, 1, 0.78);
  // pleat lines
  const pleat = new THREE.MeshStandardMaterial({ color: '#d9c7a3', roughness: 1 });
  [-0.02, 0.15].forEach((x) => mesh(new THREE.BoxGeometry(0.006, 0.55, 0.004), pleat, x, 0.72, 0.125));

  // ---------- boxy tee ----------
  const teeProfile = [[0.14, 0], [0.155, 0.1], [0.165, 0.26], [0.16, 0.33], [0.12, 0.38], [0.055, 0.41]].map(([r, y]) => new THREE.Vector2(r, y));
  const tee = mesh(new THREE.LatheGeometry(teeProfile, 32), white, 0.04, 1.08, 0);
  tee.scale.set(1, 1, 0.72);
  tee.rotation.z = -0.04;
  const print = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshStandardMaterial({ map: printTexture(), transparent: true, roughness: 0.9 }));
  print.position.set(0.035, 1.27, 0.118); print.rotation.z = -0.04;
  body.add(print);
  // short white sleeves over long mesh sleeves
  limb(body, V(0.2, 1.43, 0), V(0.25, 1.31, 0.01), 0.068, 0.06, white);
  limb(body, V(-0.12, 1.43, 0), V(-0.19, 1.31, 0), 0.068, 0.06, white);

  // ---------- arms ----------
  // her right arm (on our left when facing her? she faces +z: her right is -x)
  // right arm raised with the cigarette
  const rShoulder = V(-0.13, 1.4, 0), rElbow = V(-0.27, 1.17, 0.03), rHand = V(-0.25, 1.45, 0.1);
  limb(body, rShoulder, rElbow, 0.045, 0.038, sleeveMat);
  limb(body, rElbow, rHand, 0.038, 0.03, sleeveMat);
  const rh = mesh(new THREE.SphereGeometry(0.035, 16, 12), skin, rHand.x, rHand.y + 0.03, rHand.z);
  rh.scale.set(0.8, 1.2, 0.6);
  // fingers holding the cigarette
  limb(body, V(rHand.x, rHand.y + 0.05, rHand.z), V(rHand.x - 0.03, rHand.y + 0.1, rHand.z + 0.02), 0.009, 0.007, skin, 8);
  limb(body, V(rHand.x + 0.01, rHand.y + 0.05, rHand.z + 0.01), V(rHand.x - 0.01, rHand.y + 0.11, rHand.z + 0.03), 0.009, 0.007, skin, 8);
  // cigarette
  const cigA = V(rHand.x - 0.02, rHand.y + 0.095, rHand.z + 0.025);
  const cigB = V(rHand.x - 0.1, rHand.y + 0.12, rHand.z + 0.035);
  limb(body, cigA, cigB, 0.0045, 0.0045, new THREE.MeshStandardMaterial({ color: '#faf7f0', roughness: 0.8 }), 10);
  limb(body, cigA.clone().lerp(cigB, -0.05), cigA.clone().lerp(cigB, 0.3), 0.0047, 0.0047, new THREE.MeshStandardMaterial({ color: '#e9a96a', roughness: 0.8 }), 10);
  const ember = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff6a1a').multiplyScalar(3) }));
  ember.position.copy(cigB);
  body.add(ember);

  // her left arm, hand in pocket
  const lShoulder = V(0.21, 1.4, 0), lElbow = V(0.33, 1.16, -0.03), lHand = V(0.22, 1.0, 0.05);
  limb(body, lShoulder, lElbow, 0.045, 0.038, sleeveMat);
  limb(body, lElbow, lHand, 0.038, 0.032, sleeveMat);

  // ---------- neck, choker, head ----------
  mesh(new THREE.CylinderGeometry(0.036, 0.042, 0.12, 16), skin, 0.035, 1.53, 0);
  const choker = mesh(new THREE.TorusGeometry(0.041, 0.006, 8, 32), black, 0.035, 1.51, 0);
  choker.rotation.x = Math.PI / 2;
  limb(body, V(0.035, 1.505, 0.04), V(0.06, 1.46, 0.05), 0.004, 0.003, black, 6);
  limb(body, V(0.035, 1.505, 0.04), V(0.015, 1.455, 0.052), 0.004, 0.003, black, 6);
  const head = new THREE.Group();
  head.position.set(0.04, 1.66, 0);
  head.rotation.set(-0.12, 0.15, 0.08); // chin up, slight tilt, like the drawing
  body.add(head);
  const hm = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; head.add(m); return m; };
  hm(new THREE.SphereGeometry(0.095, 32, 24), skin, 0, 0, 0).scale.set(0.88, 1.12, 0.95);
  // lips
  const lipMat = new THREE.MeshStandardMaterial({ color: '#ef8090', roughness: 0.3 });
  hm(new THREE.SphereGeometry(0.02, 16, 10), lipMat, 0, -0.068, 0.078).scale.set(1.3, 0.45, 0.6);
  hm(new THREE.SphereGeometry(0.019, 16, 10), lipMat, 0, -0.08, 0.075).scale.set(1.2, 0.5, 0.6);
  hm(new THREE.SphereGeometry(0.012, 10, 8), skin, 0, -0.03, 0.09).scale.set(0.8, 1, 1); // nose

  // oversized square sunglasses
  const ring = (w, h, r, t) => {
    const sh = new THREE.Shape();
    const rr = (s, W, Hh, R) => { s.moveTo(-W + R, -Hh); s.lineTo(W - R, -Hh); s.quadraticCurveTo(W, -Hh, W, -Hh + R); s.lineTo(W, Hh - R); s.quadraticCurveTo(W, Hh, W - R, Hh); s.lineTo(-W + R, Hh); s.quadraticCurveTo(-W, Hh, -W, Hh - R); s.lineTo(-W, -Hh + R); s.quadraticCurveTo(-W, -Hh, -W + R, -Hh); };
    rr(sh, w, h, r);
    const hole = new THREE.Path();
    rr(hole, w - t, h - t, Math.max(0.004, r - t));
    sh.holes.push(hole);
    return new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.003, bevelSegments: 3, curveSegments: 8 });
  };
  const lens = new THREE.MeshPhysicalMaterial({ color: '#2b1e28', roughness: 0.04, metalness: 0.3, clearcoat: 1, transparent: true, opacity: 0.93 });
  [-1, 1].forEach((sgn) => {
    const f = new THREE.Mesh(ring(0.058, 0.05, 0.02, 0.012), black);
    f.position.set(sgn * 0.062, 0.022, 0.085); f.rotation.y = sgn * 0.18;
    head.add(f);
    const l = new THREE.Mesh(new THREE.PlaneGeometry(0.094, 0.078), lens);
    l.position.set(sgn * 0.062, 0.022, 0.091); l.rotation.y = sgn * 0.18;
    head.add(l);
    const temple = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.012, 0.11), black);
    temple.position.set(sgn * 0.112, 0.03, 0.03);
    head.add(temple);
  });
  hm(new THREE.BoxGeometry(0.02, 0.01, 0.01), black, 0, 0.035, 0.094);

  // hair: a cap plus long wavy strands to the shoulders
  const cap = hm(new THREE.SphereGeometry(0.103, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.62), blonde, 0, 0.012, -0.008);
  cap.scale.set(0.95, 1.12, 1.02);
  cap.rotation.x = -0.25;
  const strands = [];
  const N = 90;
  for (let i = 0; i < N; i++) {
    const layer = i % 3; // 3 layers = volume
    const a = -Math.PI * 0.98 + ((i * 0.618) % 1) * Math.PI * 1.96; // spread around back + sides
    const sx = Math.sin(a) * 0.09, sz = Math.cos(a) * 0.082 - 0.012;
    if (sz > 0.035) continue; // keep the face clear
    const len = 0.22 + ((i * 37) % 12) / 100;
    const out = 1.04 + layer * 0.06;
    const pts = [];
    for (let k = 0; k <= 10; k++) {
      const f = k / 10;
      const wave = Math.sin(f * Math.PI * 2.2 + i * 0.7) * 0.022 * f;
      const flare = 1 + f * (0.45 + layer * 0.12);
      pts.push(new THREE.Vector3(sx * out * flare + wave * Math.cos(a), 0.07 - f * len, sz * out * (1 + f * 0.25) + wave * 0.6));
    }
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.011 + (i % 4) * 0.002, 5, false);
    const s = new THREE.Mesh(geo, i % 5 === 0 ? blondeDark : blonde);
    s.castShadow = true;
    head.add(s);
    strands.push(s);
  }

  // ---------- smoke ----------
  const smokeTex = glowTexture();
  const puffs = [];
  for (let i = 0; i < 14; i++) {
    const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: '#d9d4d0', transparent: true, opacity: 0, depthWrite: false }));
    p.userData.phase = i / 14;
    group.add(p);
    puffs.push(p);
  }
  const emberWorld = new THREE.Vector3();

  group.userData.update = (t) => {
    head.rotation.z = 0.08 + Math.sin(t * 0.7) * 0.025;
    head.rotation.y = 0.15 + Math.sin(t * 0.45) * 0.05;
    ember.material.color.setScalar(1).set('#ff6a1a').multiplyScalar(2.2 + Math.sin(t * 5.3) * 0.6 + Math.sin(t * 2.1) * 0.5);
    emberWorld.copy(cigB);
    puffs.forEach((p) => {
      const f = (t * 0.22 + p.userData.phase) % 1;
      p.position.set(emberWorld.x + Math.sin(f * 7 + p.userData.phase * 9) * 0.03 * (0.3 + f) - f * 0.03, emberWorld.y + f * 0.55, emberWorld.z + Math.cos(f * 5) * 0.02);
      const sz = 0.02 + f * 0.13;
      p.scale.set(sz, sz * 1.3, 1);
      p.material.opacity = Math.sin(f * Math.PI) * 0.22;
    });
  };

  return group;
}

// ---------------------------------------------------------------
// Illustrated characters as 2.5D cut-outs of David's drawings: 100%
// faithful to the art. A flat figure that turns toward you (within a
// limit), lit by the room, with live smoke and a glowing ember.
//
// cfg: src, w, h (image px), scale (metres per px),
//      anchor [px, py] = the image point that sits on the group origin
//      (feet for standing, seat contact for sitting), anchorY = its height,
//      tip [px, py] = cigarette tip (optional), turn = max turn toward you
//      (radians, Infinity = always face you), shadow [x, z, r].
// ---------------------------------------------------------------
export function buildCutout(cfg) {
  const { src, w, h, scale, anchor, anchorY = 0, tip, turn = Infinity, shadow = [0, 0, 0.32] } = cfg;
  const W = w * scale, H = h * scale;
  const group = new THREE.Group();
  const body = new THREE.Group(); // children[0] (breathes)
  group.add(body);

  const map = new THREE.TextureLoader().load(src);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const geo = new THREE.PlaneGeometry(W, H);
  // put the anchor pixel at (0, anchorY)
  geo.translate((w / 2 - anchor[0]) * scale, anchorY + (anchor[1] - h / 2) * scale, 0);
  const mat = new THREE.MeshStandardMaterial({
    map, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.95,
    emissive: '#ffffff', emissiveMap: map, emissiveIntensity: 0.42
  });
  const figure = new THREE.Mesh(geo, mat);
  figure.castShadow = true;
  figure.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.5 });
  body.add(figure);

  const sh = new THREE.Mesh(
    new THREE.CircleGeometry(shadow[2], 32),
    new THREE.MeshBasicMaterial({ map: glowTexture(), color: '#000000', transparent: true, opacity: 0.55, depthWrite: false })
  );
  sh.rotation.x = -Math.PI / 2;
  sh.position.set(shadow[0], 0.006, shadow[1]);
  group.add(sh);

  const px = (x, y) => new THREE.Vector3((x - anchor[0]) * scale, anchorY + (anchor[1] - y) * scale, 0.01);
  let ember = null;
  const puffs = [];
  const tipV = tip ? px(tip[0], tip[1]) : null;
  if (tipV) {
    ember = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: '#ff7a2a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    ember.position.copy(tipV);
    ember.scale.setScalar(0.035);
    body.add(ember);
    for (let i = 0; i < 12; i++) {
      const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: '#e2dcd6', transparent: true, opacity: 0, depthWrite: false }));
      p.userData.phase = i / 12;
      body.add(p);
      puffs.push(p);
    }
  }

  const look = new THREE.Vector3();
  let base = null;
  group.userData.update = (t, camera) => {
    if (base === null) base = group.rotation.y;
    if (camera) {
      camera.getWorldPosition(look);
      const want = Math.atan2(look.x - group.position.x, look.z - group.position.z);
      const d = Math.atan2(Math.sin(want - base), Math.cos(want - base));
      group.rotation.y = base + THREE.MathUtils.clamp(d, -turn, turn);
    }
    body.rotation.z = Math.sin(t * 0.6) * 0.006;
    if (ember) ember.material.opacity = 0.75 + Math.sin(t * 5.1) * 0.15 + Math.sin(t * 1.9) * 0.1;
    puffs.forEach((p) => {
      const f = (t * 0.2 + p.userData.phase) % 1;
      p.position.set(tipV.x + Math.sin(f * 6 + p.userData.phase * 8) * 0.035 * (0.3 + f), tipV.y + 0.01 + f * 0.5, tipV.z + 0.02);
      const s2 = 0.025 + f * 0.14;
      p.scale.set(s2, s2 * 1.3, 1);
      p.material.opacity = Math.sin(f * Math.PI) * 0.2;
    });
  };
  return group;
}
