import * as THREE from 'three';
import { glowTexture } from './paris.js';

// Small things that make the rooms feel alive and polished:
// soft light washes next to LED strips, and dust floating in the air.

let gradTex = null;
function gradient() {
  if (gradTex) return gradTex;
  const c = document.createElement('canvas');
  c.width = 4; c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 128); // top (v = 1) bright → bottom dark
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  gr.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 128);
  gradTex = new THREE.CanvasTexture(c);
  return gradTex;
}

// A glow that is bright along the edge a→b and fades out toward c→d.
// Used on walls, ceilings and floors beside LED strips (light spill).
export function wash(scene, a, b, c, d, color, opacity = 0.4) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...d], 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 0, 0, 1, 0], 2));
  geo.setIndex([0, 2, 1, 1, 2, 3]);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    map: gradient(), color, transparent: true, opacity, depthWrite: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false
  }));
  m.renderOrder = 2;
  scene.add(m);
  return m;
}

// Dust motes drifting slowly inside the given boxes [x0, z0, x1, z1].
export function dust(scene, boxes, count = 320, height = 2.6) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const [x0, z0, x1, z1] = boxes[i % boxes.length];
    pos[i * 3] = x0 + Math.random() * (x1 - x0);
    pos[i * 3 + 1] = 0.15 + Math.random() * height;
    pos[i * 3 + 2] = z0 + Math.random() * (z1 - z0);
    seed[i * 3] = Math.random() * 6.28; seed[i * 3 + 1] = 0.2 + Math.random() * 0.5; seed[i * 3 + 2] = pos[i * 3 + 1];
  }
  const base = pos.slice();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    map: glowTexture(), color: '#ffd9c0', size: 0.013, sizeAttenuation: true,
    transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  pts.frustumCulled = false;
  scene.add(pts);
  return (t) => {
    for (let i = 0; i < count; i++) {
      const p = seed[i * 3], s = seed[i * 3 + 1];
      pos[i * 3] = base[i * 3] + Math.sin(t * 0.11 * s + p) * 0.25;
      pos[i * 3 + 1] = 0.15 + ((seed[i * 3 + 2] + t * 0.012 * s) % height);
      pos[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.09 * s + p) * 0.25;
    }
    geo.attributes.position.needsUpdate = true;
  };
}
