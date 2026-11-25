import * as THREE from 'three';

// A pink neon sign: handwritten text with a glow, drawn on a canvas.
// Redraws once the handwriting font has loaded.
export function neonSign(text, { width = 1.8, height = 0.63, px = 200 } = {}) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = Math.round(1024 * (height / width));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const draw = () => {
    const g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    g.font = `${px}px "Mrs Saint Delafield", cursive`; g.textAlign = 'center'; g.textBaseline = 'middle';
    [[40, 'rgba(255,42,109,0.55)'], [18, 'rgba(255,90,140,0.9)'], [4, '#ffe0ea']].forEach(([blur, col]) => {
      g.shadowColor = '#ff2a6d'; g.shadowBlur = blur; g.fillStyle = col;
      g.fillText(text, c.width / 2, c.height / 2 + px * 0.05);
    });
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.load(`${px}px "Mrs Saint Delafield"`).then(draw).catch(() => {});
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, color: new THREE.Color('#ffffff').multiplyScalar(1.6) })
  );
}
