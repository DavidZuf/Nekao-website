import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Final "film" look: gentle contrast, vignette, a touch of lens fringing and grain.
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time; varying vec2 vUv;
    void main(){
      vec2 d = vUv - 0.5; float r2 = dot(d, d);
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      c.r = texture2D(tDiffuse, vUv + d * r2 * 0.010).r;
      c.b = texture2D(tDiffuse, vUv - d * r2 * 0.010).b;
      c = mix(c, smoothstep(0.0, 1.0, c), 0.1);
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, 1.08);
      c *= 1.0 - r2 * 0.6;
      float n = fract(sin(dot(vUv * vec2(1280.0, 720.0) + time, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
      c += n * 0.03;
      gl_FragColor = vec4(c, 1.0);
    }`
};
import { ROOMS, MODELS, PRODUCTS } from '../data.js';
import { buildApartment, BLOCKERS, DOORS } from './apartment.js';
import { buildModel } from './model.js';
import { buildDaisy, buildCutout } from './daisy.js';

const EYE = 1.6;
const RADIUS = 0.25;
const TALK_DISTANCE = 2.3;

const inRect = (x, z, [x0, z0, x1, z1], pad = 0) => x >= x0 + pad && x <= x1 - pad && z >= z0 + pad && z <= z1 - pad;
const walkable = (x, z) => {
  if (BLOCKERS.some((b) => inRect(x, z, b, -RADIUS))) return false;
  return ROOMS.some((r) => inRect(x, z, r.rect, RADIUS)) || DOORS.some((d) => inRect(x, z, d));
};
export const roomAt = (x, z) => ROOMS.find((r) => inRect(x, z, r.rect));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// The 3D apartment you walk around in.
// Placeholder geometry: in the real version, the scan of the apartment
// (with the models frozen inside it) replaces buildApartment + buildModel.
// `preview` = [x, z, yaw]: a fixed, gently swaying view with no controls
// (the peephole on the homepage).
const World = forwardRef(function World({ active, preview, onRoom, onNearby, onPick }, ref) {
  const mount = useRef(null);
  const api = useRef({});
  const activeRef = useRef(active);
  activeRef.current = active;
  const previewRef = useRef(preview);
  previewRef.current = preview;

  useEffect(() => {
    const el = mount.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.38;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#07060b');
    const camera = new THREE.PerspectiveCamera(62, el.clientWidth / el.clientHeight, 0.05, 2500);
    camera.rotation.order = 'YXZ';

    const living = buildApartment(scene, renderer);

    // glow on lights, LEDs and the tower
    const pr = renderer.getPixelRatio();
    const target = new THREE.WebGLRenderTarget(el.clientWidth * pr, el.clientHeight * pr, { type: THREE.HalfFloatType, samples: 4 }); // smooth edges
    const composer = new EffectComposer(renderer, target);
    composer.setPixelRatio(pr);
    composer.setSize(el.clientWidth, el.clientHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(el.clientWidth, el.clientHeight), 0.55, 0.55, 0.85);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    const grade = new ShaderPass(GradeShader);
    composer.addPass(grade);
    const loader = new THREE.TextureLoader();
    const models = MODELS.map((m) => {
      const p = PRODUCTS[m.product];
      const group = m.cutout ? buildCutout(m.cutout) : m.kind === 'daisy3d' ? buildDaisy() : buildModel({ ...m, tee: p.swatch, logo: loader.load(p.logo === 'dark' ? '/logo_dark.png' : '/logo_cream.png') });
      group.position.set(m.pos[0], 0, m.pos[1]);
      group.rotation.y = m.face;
      scene.add(group);
      return { data: m, group, baseFace: m.face };
    });

    // ----- player -----
    const player = { x: 0, z: 3.3, yaw: 0, pitch: 0, bob: 0 };
    const keys = new Set();
    const vel = { f: 0, s: 0, t: 0 };
    let mode = 'roam'; // roam | cinematic
    let shot = null; // camera animation for cinematics
    let lastRoom = null;
    let lastNear = null;

    const placeCamera = () => {
      camera.position.set(player.x, EYE + Math.sin(player.bob) * 0.025, player.z);
      camera.rotation.set(player.pitch, player.yaw, 0);
    };
    placeCamera();

    // keyboard: arrows (or WASD) walk and turn. That's all.
    const map = { ArrowUp: 'f', KeyW: 'f', ArrowDown: 'b', KeyS: 'b', ArrowLeft: 'tl', KeyA: 'tl', ArrowRight: 'tr', KeyD: 'tr' };
    const onDown = (e) => {
      if (!activeRef.current || mode !== 'roam') return;
      if (document.querySelector('[role="dialog"]')) return;
      if (map[e.code]) { keys.add(map[e.code]); e.preventDefault(); }
    };
    const onUp = (e) => { if (map[e.code]) keys.delete(map[e.code]); };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);

    // mouse / touch drag to look
    // a click that didn't drag = pick whoever is under the cursor
    let drag = null;
    let travelled = 0;
    const cvs = renderer.domElement;
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const personAt = (e) => {
      const r = cvs.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      ray.far = 9;
      const hit = ray.intersectObjects(models.map((m) => m.group), true)[0];
      return hit && models.find((m) => { let o = hit.object; while (o) { if (o === m.group) return true; o = o.parent; } return false; });
    };
    const pd = (e) => { if (mode === 'roam') { drag = { x: e.clientX, y: e.clientY }; travelled = 0; } };
    const pm = (e) => {
      if (!drag) {
        if (mode === 'roam' && e.target === cvs && !previewRef.current) cvs.style.cursor = personAt(e) ? 'pointer' : '';
        return;
      }
      travelled += Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y);
      player.yaw -= (e.clientX - drag.x) * 0.004;
      player.pitch = THREE.MathUtils.clamp(player.pitch - (e.clientY - drag.y) * 0.003, -0.6, 0.5);
      drag = { x: e.clientX, y: e.clientY };
    };
    const pu = (e) => {
      if (drag && travelled < 6 && mode === 'roam' && e.target === cvs) {
        const m = personAt(e);
        if (m) onPick?.(m.data);
      }
      drag = null;
    };
    cvs.addEventListener('pointerdown', pd);
    window.addEventListener('pointermove', pm);
    window.addEventListener('pointerup', pu);

    const onResize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      composer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // ----- loop -----
    const clock = new THREE.Clock();
    let raf;
    const tmp = new THREE.Vector3();
    const look = new THREE.Vector3();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // idle "breathing" so frozen models don't look like statues
      models.forEach((m, i) => {
        m.group.children[0].scale.y = 1 + Math.sin(t * 1.6 + i) * 0.006;
        m.group.userData.update?.(t, camera);
      });

      const pv = previewRef.current;
      if (pv) {
        [player.x, player.z] = pv;
        player.yaw = pv[2] + Math.sin(t * 0.25) * 0.07;
        player.pitch = -0.04 + Math.sin(t * 0.17) * 0.015;
        placeCamera();
      } else if (!activeRef.current) return;

      if (mode === 'roam' && !pv) {
        // eased movement: speed builds up and settles instead of snapping
        const run = 1;
        const k = 1 - Math.exp(-dt * 9);
        vel.t += (((keys.has('tl') ? 1 : 0) - (keys.has('tr') ? 1 : 0)) - vel.t) * k;
        vel.f += (((keys.has('f') ? 1 : 0) - (keys.has('b') ? 1 : 0)) * run - vel.f) * k;
        vel.s += (((keys.has('sr') ? 1 : 0) - (keys.has('sl') ? 1 : 0)) * run - vel.s) * k;
        player.yaw += vel.t * 1.9 * dt;
        const moving = Math.hypot(vel.f, vel.s);
        if (moving > 0.01) {
          const sp = 2.2 * dt;
          const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
          const dx = (fx * vel.f + -fz * vel.s) * sp;
          const dz = (fz * vel.f + fx * vel.s) * sp;
          if (walkable(player.x + dx, player.z)) player.x += dx; else vel.f *= 0.6;
          if (walkable(player.x, player.z + dz)) player.z += dz; else vel.s *= 0.6;
          player.bob += dt * 8 * moving;
        }
        placeCamera();

        // which room are we in / who is near
        const r = roomAt(player.x, player.z);
        if (r && r.id !== lastRoom) { lastRoom = r.id; onRoom?.(r); }
        let near = null;
        let best = Infinity;
        camera.getWorldDirection(look);
        models.forEach((m) => {
          tmp.set(m.group.position.x - player.x, 0, m.group.position.z - player.z);
          const d = tmp.length();
          if (d < (m.data.reach ?? TALK_DISTANCE) && d < best && tmp.normalize().dot(look.setY(0).normalize()) > 0.65) { best = d; near = m.data; }
        });
        // objects you can use (the pot…)
        (living.things || []).forEach((th) => {
          tmp.set(th.pos[0] - player.x, 0, th.pos[1] - player.z);
          const d = tmp.length();
          if (d < th.reach && d < best && tmp.normalize().dot(look) > 0.6) { best = d; near = { thing: true, id: th.id, label: th.label() }; }
        });
        const key = (n) => (n ? n.id + (n.label || '') : '');
        if (key(near) !== key(lastNear)) { lastNear = near; onNearby?.(near); }
      }

      if (mode === 'cinematic' && shot) {
        shot.t = Math.min(1, (performance.now() - shot.start) / 1000 / shot.dur);
        const k = ease(shot.t);
        camera.position.lerpVectors(shot.fromPos, shot.toPos, k);
        camera.quaternion.slerpQuaternions(shot.fromQ, shot.toQ, k);
        if (shot.model) {
          const g = shot.model.group;
          g.rotation.y += (shot.faceTo - g.rotation.y) * Math.min(1, dt * 4);
        }
        if (shot.t >= 1 && shot.dolly) camera.position.addScaledVector(shot.dolly, dt * 0.06);
        if (shot.t >= 1 && shot.done) { const d = shot.done; shot.done = null; d(); }
      }

      living.update(t);
      grade.uniforms.time.value = t % 100;
      composer.render();
    };
    tick();

    // ----- API for the rest of the site -----
    const quatLookingAt = (pos, target) => {
      const m = new THREE.Matrix4().lookAt(pos, target, new THREE.Vector3(0, 1, 0));
      return new THREE.Quaternion().setFromRotationMatrix(m);
    };

    api.current = {
      teleport(roomId) {
        const r = ROOMS.find((x) => x.id === roomId);
        if (!r) return;
        [player.x, player.z, player.yaw] = r.spawn;
        player.pitch = 0;
        keys.clear();
        placeCamera();
        lastRoom = r.id;
        onRoom?.(r);
      },
      currentRoom: () => roomAt(player.x, player.z),
      // Cinematic: camera glides to a two-shot of the model, who turns to you.
      talkTo(modelId) {
        const m = models.find((x) => x.data.id === modelId);
        if (!m) return Promise.resolve();
        mode = 'cinematic';
        keys.clear();
        const P = m.group.position;
        const faceTo = Math.atan2(player.x - P.x, player.z - P.z);
        const dir = new THREE.Vector3(Math.sin(faceTo), 0, Math.cos(faceTo));
        const sideV = new THREE.Vector3(dir.z, 0, -dir.x);
        const eye = m.data.eye ?? 1.42;
        const toPos = P.clone().addScaledVector(dir, 1.25).addScaledVector(sideV, 0.42).setY(eye + 0.1);
        const target = P.clone().setY(eye).addScaledVector(sideV, -0.08);
        return new Promise((resolve) => {
          shot = {
            t: 0, start: performance.now(), dur: 1.4, model: m, faceTo,
            fromPos: camera.position.clone(), fromQ: camera.quaternion.clone(),
            toPos, toQ: quatLookingAt(toPos, target),
            dolly: target.clone().sub(toPos).normalize(),
            done: resolve
          };
        });
      },
      endTalk() {
        if (!shot) { mode = 'roam'; return Promise.resolve(); }
        const m = shot.model;
        placeCamera();
        const back = { pos: camera.position.clone(), q: camera.quaternion.clone() };
        return new Promise((resolve) => {
          shot = {
            t: 0, start: performance.now(), dur: 1.1, model: m, faceTo: m.baseFace,
            fromPos: shot.toPos.clone(), fromQ: shot.toQ.clone(),
            toPos: back.pos, toQ: back.q,
            done: () => { mode = 'roam'; shot = null; lastNear = null; onNearby?.(null); resolve(); }
          };
          camera.position.copy(shot.fromPos);
        });
      },
      use(id) { const th = (living.things || []).find((x) => x.id === id); return th ? th.use() : null; },
      press(k, on) { if (on) keys.add(k); else keys.delete(k); }
    };
    if (import.meta.env.DEV || window.__NEKAO_DEBUG) window.__nekao = { api: api.current, clock, camera, player };

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('pointermove', pm);
      window.removeEventListener('pointerup', pu);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      el.removeChild(cvs);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    teleport: (id) => api.current.teleport?.(id),
    talkTo: (id) => api.current.talkTo?.(id),
    endTalk: () => api.current.endTalk?.(),
    press: (k, on) => api.current.press?.(k, on),
    use: (id) => api.current.use?.(id),
    currentRoom: () => api.current.currentRoom?.()
  }));

  return <div ref={mount} className="world" />;
});

export default World;
