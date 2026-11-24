import * as THREE from 'three';
import { ROOMS } from '../data.js';
import { buildLivingRoom, LIVING_BLOCKERS } from './livingRoom.js';
import { buildKitchen, KITCHEN_BLOCKERS } from './kitchen.js';
import { dust } from './atmosphere.js';

// Placeholder apartment, built from simple shapes.
// Replace with the real scan (Gaussian splat or mesh) when it exists.

const H = 2.8; // ceiling height
const T = 0.12; // wall thickness

// Openings between rooms (walkable). [x0, z0, x1, z1]
export const DOORS = [
  [-0.45, -0.4, 0.45, 0.4], // hall ↔ living
  [1.6, -3.75, 2.4, -2.85], // living ↔ kitchen
  [1.6, 1.55, 2.4, 2.45], // hall ↔ bedroom
  [-4.95, -0.4, -4.05, 0.4] // living ↔ balcony
];
// Gaps in walls (full width of the opening)
const GAPS = {
  x: [[2, -4, -2.6], [2, 1.3, 2.7]], // wall at x = …, gap from z to z
  z: [[0, -0.7, 0.7], [0, -5.2, -3.8]] // wall at z = …, gap from x to x
};

// Furniture you can't walk through. [x0, z0, x1, z1]
export const BLOCKERS = [
  ...LIVING_BLOCKERS,
  ...KITCHEN_BLOCKERS,
  [5.6, 3.0, 7.9, 5.9], // bedroom: bed
  [2.1, 5.3, 3.4, 5.9] // bedroom: wardrobe
];

const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts });
const M = {
  wall: mat('#5c3433'),
  wallDark: mat('#4a2a2b'),
  floor: mat('#2a1819', { roughness: 0.22 }),
  tile: mat('#8f8a82', { roughness: 0.4 }),
  ceiling: mat('#1d0f12'),
  sofa: mat('#d8cfbf', { roughness: 1 }),
  wood: mat('#3b2c22', { roughness: 0.7 }),
  stone: mat('#cfc6b6', { roughness: 0.35 }),
  linen: mat('#e9e2d4', { roughness: 1 }),
  metal: mat('#111111', { roughness: 0.4, metalness: 0.6 }),
  plant: mat('#2f4a37'),
  window: new THREE.MeshBasicMaterial({ color: '#1d3557' }),
  frame: mat('#141210')
};

function box(scene, [x0, z0, x1, z1], y0, y1, material, cast = true) {
  const g = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x1 - x0), y1 - y0, Math.abs(z1 - z0)), material);
  g.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  g.castShadow = cast;
  g.receiveShadow = true;
  scene.add(g);
  return g;
}

function wallSegments(scene, axis, at, from, to, material, height = H) {
  const gaps = (GAPS[axis] || []).filter((g) => Math.abs(g[0] - at) < 1e-6 && g[2] > from && g[1] < to).sort((a, b) => a[1] - b[1]);
  let cur = from;
  const seg = (a, b) => {
    if (b - a < 0.01) return;
    if (axis === 'x') box(scene, [at - T / 2, a, at + T / 2, b], 0, height, material, false);
    else box(scene, [a, at - T / 2, b, at + T / 2], 0, height, material, false);
  };
  gaps.forEach(([, g0, g1]) => {
    seg(cur, g0);
    // lintel above the opening
    if (axis === 'x') box(scene, [at - T / 2, g0, at + T / 2, g1], 2.2, height, material, false);
    else box(scene, [g0, at - T / 2, g1, at + T / 2], 2.2, height, material, false);
    cur = g1;
  });
  seg(cur, to);
}

export function buildApartment(scene, renderer) {
  // floors + ceilings
  ROOMS.forEach((r) => {
    const [x0, z0, x1, z1] = r.rect;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), M.floor);
    floor.visible = r.id !== 'kitchen'; // the kitchen has its own marble floor
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
    floor.receiveShadow = true;
    scene.add(floor);
    if (!r.outdoor) {
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), M.ceiling);
      ceil.rotation.x = Math.PI / 2;
      ceil.position.set((x0 + x1) / 2, H, (z0 + z1) / 2);
      scene.add(ceil);
    }
  });

  // walls (outer + inner), with openings
  wallSegments(scene, 'z', 4, -2, 2, M.wall); // hall front (door)
  wallSegments(scene, 'x', -2, 0, 4, M.wall); // hall west / balcony east
  wallSegments(scene, 'z', 0, -7, 8, M.wall); // living|hall|balcony and kitchen|bedroom
  wallSegments(scene, 'x', 2, -7, 6, M.wall); // living|kitchen, hall|bedroom
  wallSegments(scene, 'z', -7, 2, 8, M.wallDark); // kitchen back wall (living one has the window)
  wallSegments(scene, 'x', -7, -7, 0, M.wall); // living west
  wallSegments(scene, 'x', 8, 0, 6, M.wall); // east (bedroom); the kitchen builds its own window wall
  wallSegments(scene, 'z', 6, 2, 8, M.wall); // bedroom south

  // front door
  box(scene, [-0.55, 3.86, 0.55, 3.94], 0, 2.15, M.linen);
  box(scene, [0.3, 3.8, 0.42, 3.86], 1.0, 1.06, M.metal);

  // windows (dusk blue) with frames
  const windowOn = (axis, at, a, b, y0 = 0.6, y1 = 2.4, inward = 1) => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(b - a, y1 - y0), M.window);
    if (axis === 'x') { w.rotation.y = inward * Math.PI / 2; w.position.set(at + inward * 0.07, (y0 + y1) / 2, (a + b) / 2); }
    else { w.rotation.y = inward > 0 ? 0 : Math.PI; w.position.set((a + b) / 2, (y0 + y1) / 2, at + inward * 0.07); }
    scene.add(w);
    const mid = (a + b) / 2;
    if (axis === 'x') box(scene, [at + inward * 0.06 - 0.02, mid - 0.03, at + inward * 0.06 + 0.02, mid + 0.03], y0, y1, M.frame, false);
    else box(scene, [mid - 0.03, at + inward * 0.06 - 0.02, mid + 0.03, at + inward * 0.06 + 0.02], y0, y1, M.frame, false);
  };
  windowOn('x', 8, 1, 5, 0.8, 2.4, -1);

  // living room: see livingRoom.js
  const living = buildLivingRoom(scene, M.wall);

  // kitchen: see kitchen.js
  const kitchen = buildKitchen(scene, renderer);

  // bedroom
  box(scene, [5.6, 3.0, 7.9, 5.9], 0, 0.5, M.wood);
  box(scene, [5.65, 3.05, 7.85, 5.85], 0.5, 0.68, M.linen);
  box(scene, [7.6, 3.2, 7.9, 5.7], 0.5, 1.2, M.wood);
  box(scene, [2.1, 5.3, 3.4, 5.9], 0, 2.2, M.wood);
  lamp(scene, 7.6, 2.6);

  // balcony railing + city lights
  const rail = M.metal;
  box(scene, [-7, 2.95, -2, 3.0], 1.0, 1.05, rail);
  box(scene, [-7.05, 0, -7, 3], 1.0, 1.05, rail);
  for (let x = -7; x <= -2; x += 0.25) box(scene, [x, 2.96, x + 0.03, 2.99], 0, 1.0, rail, false);
  for (let z = 0; z <= 3; z += 0.25) box(scene, [-7.04, z, -7.01, z + 0.03], 0, 1.0, rail, false);

  // light
  scene.add(new THREE.HemisphereLight('#8a5a5a', '#1a0a0c', 0.75));
  const moon = new THREE.DirectionalLight('#9fb3d9', 0.6);
  moon.position.set(-12, 10, 10);
  scene.add(moon);
  const warm = (x, z, intensity = 9, color = '#ffd2a1') => {
    const l = new THREE.PointLight(color, intensity, 9, 1.6);
    l.position.set(x, H - 0.25, z);
    scene.add(l);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), new THREE.MeshBasicMaterial({ color }));
    bulb.position.copy(l.position);
    scene.add(bulb);
    return l;
  };
  const key = warm(0, 2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  warm(5, 3, 8, '#ffbf80').distance = 3.4; // stays inside the bedroom (no leak onto the kitchen marble)
  const balc = new THREE.PointLight('#ffb070', 5, 6, 1.6);
  balc.position.set(-4.5, 2.2, 0.4);
  scene.add(balc);
  const motes = dust(scene, [[-6.8, -6.8, 1.8, -0.2], [2.2, -6.2, 7.4, -0.3]]);
  return { things: kitchen.things, update(t) { living.update(t); kitchen.update(t); motes(t); } };
}

function plant(scene, x, z) {
  box(scene, [x - 0.2, z - 0.2, x + 0.2, z + 0.2], 0, 0.45, mat('#8a5a3c'));
  const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), M.plant);
  leaves.position.set(x, 0.95, z);
  leaves.castShadow = true;
  scene.add(leaves);
}

function lamp(scene, x, z) {
  box(scene, [x - 0.02, z - 0.02, x + 0.02, z + 0.02], 0, 1.5, M.metal, false);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.3, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#e8d9b8', emissive: '#e8c48a', emissiveIntensity: 0.6, side: THREE.DoubleSide }));
  shade.position.set(x, 1.6, z);
  scene.add(shade);
  const l = new THREE.PointLight('#ffcf8a', 3, 4, 2);
  l.position.set(x, 1.5, z);
  scene.add(l);
}
