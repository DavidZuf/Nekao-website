import * as THREE from 'three';

// Placeholder resident: a simple figure wearing the tee, logo on the chest.
// In the real version the models are captured in the scan (frozen in place)
// or as 3D scans of the actual people.
export function buildModel({ tee, logo, skin = '#c9a387', hair = '#1d1a17' }) {
  const group = new THREE.Group();
  const body = new THREE.Group(); // children[0]: breathes
  group.add(body);
  const m = (color, rough = 0.8) => new THREE.MeshStandardMaterial({ color, roughness: rough });
  const skinM = m(skin, 0.6);
  const teeM = m(tee, 0.95);
  const pantsM = m('#232220', 0.9);

  const add = (geo, material, x, y, z, rx = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, 0, rz);
    mesh.castShadow = true;
    body.add(mesh);
    return mesh;
  };

  // legs + shoes
  add(new THREE.CapsuleGeometry(0.075, 0.72, 6, 12), pantsM, -0.1, 0.46, 0);
  add(new THREE.CapsuleGeometry(0.075, 0.72, 6, 12), pantsM, 0.1, 0.46, 0);
  add(new THREE.BoxGeometry(0.11, 0.07, 0.26), m('#efe9df', 0.7), -0.1, 0.035, 0.04);
  add(new THREE.BoxGeometry(0.11, 0.07, 0.26), m('#efe9df', 0.7), 0.1, 0.035, 0.04);
  // hips
  add(new THREE.CylinderGeometry(0.17, 0.16, 0.16, 20), pantsM, 0, 0.92, 0);
  // tee: torso + sleeves
  add(new THREE.CylinderGeometry(0.205, 0.185, 0.52, 24), teeM, 0, 1.24, 0);
  add(new THREE.CylinderGeometry(0.075, 0.085, 0.2, 14), teeM, -0.25, 1.4, 0, 0, 0.5);
  add(new THREE.CylinderGeometry(0.075, 0.085, 0.2, 14), teeM, 0.25, 1.4, 0, 0, -0.5);
  // arms
  add(new THREE.CapsuleGeometry(0.048, 0.5, 6, 12), skinM, -0.3, 1.1, 0.02, 0, 0.12);
  add(new THREE.CapsuleGeometry(0.048, 0.5, 6, 12), skinM, 0.3, 1.1, 0.02, 0, -0.12);
  // neck + head + hair
  add(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 12), skinM, 0, 1.53, 0);
  const head = add(new THREE.SphereGeometry(0.115, 24, 20), skinM, 0, 1.66, 0);
  head.scale.set(0.92, 1.08, 0.98);
  const hairMesh = add(new THREE.SphereGeometry(0.12, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m(hair, 1), 0, 1.68, -0.01);
  hairMesh.scale.set(0.95, 0.9, 1);

  // logo on the chest
  const badge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.09, 0.09),
    new THREE.MeshStandardMaterial({ map: logo, transparent: true, roughness: 0.9 })
  );
  badge.position.set(0.08, 1.34, 0.197);
  body.add(badge);

  return group;
}
