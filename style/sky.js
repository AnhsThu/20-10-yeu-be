import * as THREE from 'three';
import { gauss, sampleDisc } from './galaxyshape.js';

// ============================================================================
//  BẦU TRỜI ĐÊM: nền sao nhấp nháy nhiều màu, dải Ngân Hà dày sao + tinh vân
//  xanh-lam-tím-hồng, và lớp bụi sáng mờ của thiên hà xoắn ốc (khớp với các
//  nhánh của ảnh-sao). Tất cả bao quanh mọi hướng nên xoay góc nào cũng đẹp.
// ============================================================================

// Màu sao nền (r, g, b, trọng số)
const STAR_COLORS = [
  [0.80, 0.88, 1.00, 38],   // trắng xanh
  [1.00, 1.00, 1.00, 22],   // trắng
  [0.66, 0.95, 1.00, 12],   // lam ngọc
  [1.00, 0.80, 0.90, 12],   // hồng nhạt
  [1.00, 0.90, 0.72, 10],   // vàng ấm
  [0.82, 0.76, 1.00, 6],    // tím nhạt
];
const SC_TOTAL = STAR_COLORS.reduce((s, c) => s + c[3], 0);
function pickStarColor() {
  let k = Math.random() * SC_TOTAL;
  for (const c of STAR_COLORS) { if ((k -= c[3]) <= 0) return c; }
  return STAR_COLORS[0];
}

// Mặt phẳng dải Ngân Hà: nghiêng so với trục đứng để có đường chéo như trong ảnh mẫu
const BAND_NORMAL = new THREE.Vector3(0.52, 0.72, 0.46).normalize();
const BAND_E1 = new THREE.Vector3().crossVectors(BAND_NORMAL, new THREE.Vector3(0, 0, 1)).normalize();
const BAND_E2 = new THREE.Vector3().crossVectors(BAND_NORMAL, BAND_E1).normalize();

// Hướng ngẫu nhiên nằm quanh dải Ngân Hà (có "lõi" dày đặc hơn ở φ ≈ 0)
function bandDirection(out, spread) {
  const phi = Math.random() < 0.45 ? gauss() * 0.75 : Math.random() * Math.PI * 2;
  const lat = gauss() * spread * (Math.abs(Math.sin(phi * 0.5)) * 0.6 + 0.55);
  return out
    .set(0, 0, 0)
    .addScaledVector(BAND_E1, Math.cos(phi))
    .addScaledVector(BAND_E2, Math.sin(phi))
    .addScaledVector(BAND_NORMAL, lat)
    .normalize();
}

function randomDirection(out) {
  const z = Math.random() * 2 - 1;
  const a = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - z * z);
  return out.set(s * Math.cos(a), z, s * Math.sin(a));
}

// ---------------------------------------------------------------- shaders ----
const STAR_VERT = /* glsl */`
  attribute vec4 aStar;   // x: kích thước px, y: pha, z: tốc độ nhấp nháy, w: độ sáng
  attribute vec3 aColor;
  uniform float uTime, uPx;
  varying vec3 vC;
  varying float vA;
  void main() {
    float tw = 0.5 + 0.5 * sin(uTime * aStar.z + aStar.y);
    gl_PointSize = aStar.x * uPx * (0.88 + 0.24 * tw);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vC = aColor;
    vA = aStar.w * (0.5 + 0.5 * tw);
  }
`;
const STAR_FRAG = /* glsl */`
  varying vec3 vC;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = pow(smoothstep(0.5, 0.0, d), 1.5);
    gl_FragColor = vec4(vC, a * vA);
  }
`;

const HAZE_VERT = /* glsl */`
  attribute vec4 aHaze;   // x: kích thước px, y: pha, z: tốc độ, w: độ sáng
  attribute vec3 aColor;
  uniform float uTime, uPx, uFade;
  varying vec3 vC;
  varying float vA;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 0.5 + 0.5 * sin(uTime * aHaze.z + aHaze.y);
    gl_PointSize = min(aHaze.x * uPx * (260.0 / max(-mv.z, 0.5)) * (0.92 + 0.16 * tw), 96.0 * uPx);  // giới hạn để hạt sát camera không phủ cả màn hình
    gl_Position = projectionMatrix * mv;
    vC = aColor;
    vA = aHaze.w * (0.75 + 0.25 * tw) * uFade * smoothstep(8.0, 40.0, -mv.z);
  }
`;
const HAZE_FRAG = /* glsl */`
  varying vec3 vC;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vC, a * a * vA);
  }
`;

// ----------------------------------------------------------- sprite glow ----
function makeGlowSprite(hsla, opacity, size) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, hsla);
  g.addColorStop(0.45, hsla.replace(/[\d.]+\)$/, '0.35)'));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(c),
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  }));
  sprite.scale.set(size, size, 1);
  return sprite;
}

// ------------------------------------------------------------------ main -----
export function createSky(scene, renderer) {
  const pr = renderer.getPixelRatio();
  const v = new THREE.Vector3();

  // ---- 1. Sao nền nhấp nháy: một phần dồn vào dải Ngân Hà, phần còn lại rải đều mọi hướng ----
  const N = 26000;
  const sp = new Float32Array(N * 3), sd = new Float32Array(N * 4), sc = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const inBand = Math.random() < 0.58;
    if (inBand) bandDirection(v, 0.13); else randomDirection(v);
    const R = 520 + Math.random() * 1100;
    sp.set([v.x * R, v.y * R, v.z * R], i * 3);

    const mag = Math.pow(Math.random(), 5);                       // hiếm sao thật sáng
    const size = 1.0 + 2.6 * mag;
    const bright = 0.28 + 0.72 * Math.pow(Math.random(), 2.2) * (inBand ? 1.0 : 0.85) + 0.3 * mag;
    sd.set([size, Math.random() * 6.283, 0.5 + Math.random() * 2.6, Math.min(1, bright)], i * 4);
    const c = pickStarColor();
    sc.set([c[0], c[1], c[2]], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  starGeo.setAttribute('aStar', new THREE.BufferAttribute(sd, 4));
  starGeo.setAttribute('aColor', new THREE.BufferAttribute(sc, 3));
  const starMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPx: { value: pr } },
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(starGeo, starMat);
  stars.name = 'starfield';
  stars.frustumCulled = false;
  stars.renderOrder = 999;
  scene.add(stars);

  // ---- 2. Bụi sáng của thiên hà: các nhánh xoắn ốc hồng → tím, mờ, nằm sau ảnh-sao ----
  const M = 15000;
  const hp = new Float32Array(M * 3), hd = new Float32Array(M * 4), hc = new Float32Array(M * 3);
  const pink = new THREE.Color(0xff7ab8), violet = new THREE.Color(0x8f7bff), tmp = new THREE.Color();
  for (let i = 0; i < M; i++) {
    sampleDisc(v, 30, 150, { power: 1.3, armShare: 0.8, armSigma: 0.38, thickBase: 1.5, thickK: 0.05 });
    hp.set([v.x, v.y, v.z], i * 3);
    const t = Math.min(1, v.length() / 150);
    tmp.copy(pink).lerp(violet, t);
    hc.set([tmp.r, tmp.g, tmp.b], i * 3);
    hd.set([2.6 + Math.random() * 4.5, Math.random() * 6.283, 0.3 + Math.random() * 1.2, 0.05 + Math.random() * 0.07], i * 4);
  }
  const hazeGeo = new THREE.BufferGeometry();
  hazeGeo.setAttribute('position', new THREE.BufferAttribute(hp, 3));
  hazeGeo.setAttribute('aHaze', new THREE.BufferAttribute(hd, 4));
  hazeGeo.setAttribute('aColor', new THREE.BufferAttribute(hc, 3));
  const hazeMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPx: { value: pr }, uFade: { value: 0 } },
    vertexShader: HAZE_VERT,
    fragmentShader: HAZE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const haze = new THREE.Points(hazeGeo, hazeMat);
  haze.frustumCulled = false;
  haze.userData.keepOpacity = true;
  scene.add(haze);

  // ---- 3. Tinh vân dọc dải Ngân Hà: xanh dương / lam ngọc / chàm / tím, lõi ấm hồng-cam ----
  const cool = [210, 192, 255, 275, 225];
  for (let i = 0; i < 18; i++) {
    bandDirection(v, 0.07);
    const R = 620 + Math.random() * 320;
    const hue = cool[Math.floor(Math.random() * cool.length)] + (Math.random() - 0.5) * 16;
    const s = makeGlowSprite(`hsla(${hue}, ${70 + Math.random() * 18}%, ${38 + Math.random() * 12}%, 0.6)`,
      0.13 + Math.random() * 0.11, 420 + Math.random() * 300);
    s.position.copy(v).multiplyScalar(R);
    scene.add(s);
  }
  const warm = [335, 350, 18, 305];
  for (let i = 0; i < 6; i++) {
    const phi = gauss() * 0.35;
    v.copy(BAND_E1).multiplyScalar(Math.cos(phi)).addScaledVector(BAND_E2, Math.sin(phi))
      .addScaledVector(BAND_NORMAL, gauss() * 0.05).normalize();
    const hue = warm[Math.floor(Math.random() * warm.length)];
    const s = makeGlowSprite(`hsla(${hue}, 78%, 55%, 0.6)`, 0.16 + Math.random() * 0.12, 380 + Math.random() * 280);
    s.position.copy(v).multiplyScalar(680 + Math.random() * 200);
    scene.add(s);
  }

  function update(time, fade) {
    starMat.uniforms.uTime.value = time;
    hazeMat.uniforms.uTime.value = time;
    hazeMat.uniforms.uFade.value = fade;
    starMat.uniforms.uPx.value = hazeMat.uniforms.uPx.value = renderer.getPixelRatio();
  }

  return { stars, update };
}
