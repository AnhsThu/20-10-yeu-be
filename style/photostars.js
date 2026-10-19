import * as THREE from 'three';
import { gauss, sampleDisc, sampleShell } from './galaxyshape.js';

// ============================================================================
//  ẢNH-SAO: mỗi bức ảnh là một "ngôi sao" nằm rải ngẫu nhiên trong không gian 3D.
//
//  • Vị trí ngẫu nhiên khắp một khối cầu + đĩa thiên hà dày, nên xoay camera sang
//    góc nào (trên, dưới, nghiêng, ngang…) cũng luôn có ảnh trong tầm nhìn.
//  • Mỗi ảnh là một tấm "billboard": luôn xoay mặt về phía người xem và luôn đứng
//    thẳng, nên nhìn từ mọi góc đều thấy rõ hình.
//  • Kích thước theo kiểu độ sáng sao thật: vài ảnh rất lớn & rực, một số vừa,
//    còn lại là vô số ảnh nhỏ li ti lấp lánh.
//  • Mỗi ảnh có quầng sáng màu, viền neon và vệt sáng 4 cánh như sao thật; cả
//    ảnh lẫn quầng sáng đều nhấp nháy với nhịp riêng.
// ============================================================================

const TEX_SIZE = 512;        // độ phân giải cạnh dài nhất của texture mỗi ảnh
const TOTAL_STARS = 2400;    // tổng số ảnh-sao (chia đều cho các ảnh nguồn)
const R_MIN = 52;            // chừa khoảng trống quanh hành tinh + các vòng chữ (hành tinh nằm giữa một vùng trống)
const R_SHELL = 270;         // bán kính ngoài của hào quang hình cầu
const R_DISC = 215;          // bán kính ngoài của đĩa thiên hà
const HALO = 3.1;            // quầng sáng rộng gấp bao nhiêu lần ảnh

// Màu quầng sáng (r, g, b, trọng số) – xanh băng, hồng, lam ngọc, tím, vàng ấm, trắng
const TINTS = [
  [0.70, 0.84, 1.00, 30],
  [1.00, 0.70, 0.86, 26],
  [0.60, 0.96, 1.00, 14],
  [0.82, 0.72, 1.00, 16],
  [1.00, 0.92, 0.70, 8],
  [1.00, 1.00, 1.00, 6],
];
const TINT_TOTAL = TINTS.reduce((s, t) => s + t[3], 0);
function pickTint() {
  let k = Math.random() * TINT_TOTAL;
  for (const t of TINTS) { if ((k -= t[3]) <= 0) return t; }
  return TINTS[0];
}

// ---------------------------------------------------------------- shaders ----
const VERT = /* glsl */`
  attribute vec3 aPos;
  attribute vec4 aData;   // x: kích thước (đơn vị thế giới), y: pha nhấp nháy, z: tốc độ nhấp nháy, w: độ sáng 0..1
  attribute vec3 aTint;
  uniform float uTime, uScale, uMaxPx, uHalo, uAspect;
  varying vec2 vUv, vW, vP;
  varying float vLight, vVis, vSpark, vBright, vDim;
  varying vec3 vTint;

  void main() {
    vec4 mv = modelViewMatrix * vec4(aPos, 1.0);
    float d = max(-mv.z, 0.001);
    float tw  = sin(uTime * aData.z + aData.y);
    float tw2 = sin(uTime * aData.z * 2.3 + aData.y * 3.1 + 1.7);

    // kích thước trên màn hình (px): xa thì nhỏ, nhưng không để ảnh quá gần camera phình khổng lồ
    float px = min(aData.x * uScale / d, uMaxPx);
    px *= 1.0 + 0.045 * tw;
    float world = px * d / uScale;

    vec2 ext = uAspect > 1.0 ? vec2(1.0, 1.0 / uAspect) : vec2(uAspect, 1.0);
    mv.xy += position.xy * ext * world * uHalo;   // dịch trong không gian camera => luôn quay mặt về người xem
    gl_Position = projectionMatrix * mv;

    vUv = position.xy + 0.5;
    vW = position.xy * ext * uHalo;               // toạ độ quầng sáng (đơn vị = kích thước ảnh)
    vP = position.xy * 2.0;
    vTint = aTint;
    vBright = aData.w;
    vSpark = 0.6 + 0.4 * tw2;
    vDim = 0.62 + 0.38 * exp(-d / 420.0);         // xa thì hơi mờ đi, tạo chiều sâu
    vLight = (0.88 + 0.12 * tw) * vDim;
    // ảnh sát camera mờ dần (tránh che hết màn hình); ảnh sắp nhỏ hơn vài pixel thì tắt hẳn phần lõi
    vVis = smoothstep(7.0, 24.0, d) * smoothstep(1.0, 3.2, px);
  }
`;

const CORE_FRAG = /* glsl */`
  uniform sampler2D uMap;
  uniform float uCoreAlpha;
  varying vec2 vUv;
  varying float vLight, vVis;

  void main() {
    vec4 t = texture2D(uMap, vUv);
    float a = t.a * vVis * uCoreAlpha;
    if (a < 0.03) discard;
    gl_FragColor = vec4(t.rgb * vLight, a);
  }
`;

const HALO_FRAG = /* glsl */`
  uniform float uFade, uAspect;
  varying vec2 vW, vP;
  varying float vSpark, vBright, vDim;
  varying vec3 vTint;
  varying float vVis;

  float sdBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 ext = uAspect > 1.0 ? vec2(1.0, 1.0 / uAspect) : vec2(uAspect, 1.0);
    float sd = sdBox(vW, 0.5 * ext, 0.12 * min(ext.x, ext.y));   // < 0: nằm trong khung ảnh
    float outside = smoothstep(-0.012, 0.0, sd);                  // không phủ sáng lên chính tấm ảnh

    float r = length(vW);
    float rim = exp(-max(sd, 0.0) * 12.0);                        // viền neon sát khung ảnh
    float bloom = exp(-r * r * 2.6) * 0.45 + exp(-r * 1.5) * 0.22;
    float bright = smoothstep(0.45, 0.9, vBright);
    float spike = (exp(-abs(vW.y) * 46.0) * exp(-abs(vW.x) * 1.35)
                 + exp(-abs(vW.x) * 46.0) * exp(-abs(vW.y) * 1.35)) * bright * (0.45 + 0.55 * vSpark) * 1.25;

    float k = (rim * 0.55 + bloom * (0.8 + 0.2 * vSpark) + spike) * (0.3 + 0.7 * vBright);
    float win = 1.0 - smoothstep(0.5, 1.0, length(vP));            // tắt dần về 0 ở mép quầng => không lộ khung vuông
    vec3 col = vTint * k * outside * win * vDim * uFade * vVis;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ------------------------------------------------------------- texture ------
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makePhotoTexture(img, renderer) {
  const aspect = img.width / img.height;
  const w = aspect >= 1 ? TEX_SIZE : Math.max(8, Math.round(TEX_SIZE * aspect));
  const h = aspect >= 1 ? Math.max(8, Math.round(TEX_SIZE / aspect)) : TEX_SIZE;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const radius = Math.min(w, h) * 0.12;
  ctx.save();
  roundRectPath(ctx, 0, 0, w, h, radius);
  ctx.clip();
  ctx.drawImage(img, 0, 0, w, h);
  ctx.restore();

  // viền trắng mảnh, hơi trong – để mỗi ảnh nhìn như một vì sao có khung sáng
  const lw = Math.max(2, Math.min(w, h) * 0.02);
  roundRectPath(ctx, lw / 2, lw / 2, w - lw, h - lw, radius - lw / 2);
  ctx.lineWidth = lw;
  ctx.strokeStyle = 'rgba(255,255,255,0.88)';
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  tex.needsUpdate = true;
  return { tex, aspect };
}

// ---------------------------------------------------------- star layout ------
// Sinh `count` ngôi sao cho một bức ảnh. Sao lớn/vừa được giữ cách nhau (poisson rải thưa)
// để ảnh to không đè lên nhau; sao nhỏ thì rải hoàn toàn ngẫu nhiên.
function generateStars(count, placed) {
  const nA = Math.max(1, Math.round(count * 0.014));
  const nB = Math.max(2, Math.round(count * 0.075));
  const nC = Math.round(count * 0.30);
  const tiers = [
    { n: nA, size: [17, 27], bright: [0.92, 1.0], sep: 48 },
    { n: nB, size: [8, 13.5], bright: [0.62, 0.86], sep: 22 },
    { n: nC, size: [3.2, 5.8], bright: [0.3, 0.56], sep: 0 },
    { n: Math.max(0, count - nA - nB - nC), size: [1.5, 2.7], bright: [0.14, 0.34], sep: 0 },
  ];

  const total = tiers.reduce((s, t) => s + t.n, 0);
  const pos = new Float32Array(total * 3);
  const data = new Float32Array(total * 4);
  const tint = new Float32Array(total * 3);
  const p = new THREE.Vector3();
  let i = 0;

  for (const tier of tiers) {
    for (let k = 0; k < tier.n; k++, i++) {
      let tries = 0;
      do {
        if (Math.random() < 0.36) sampleDisc(p, R_MIN, R_DISC, { thickBase: 3, thickK: 0.1 });
        else sampleShell(p, R_MIN, R_SHELL);
        tries++;
      } while (tier.sep > 0 && tries < 40 && placed.some(q => q.distanceToSquared(p) < tier.sep * tier.sep));
      if (tier.sep > 0) placed.push(p.clone());

      const u = Math.pow(Math.random(), 1.6);
      const size = tier.size[0] + (tier.size[1] - tier.size[0]) * u;
      const bright = tier.bright[0] + (tier.bright[1] - tier.bright[0]) * Math.random();
      const c = pickTint();

      pos.set([p.x, p.y, p.z], i * 3);
      data.set([size, Math.random() * Math.PI * 2, 0.7 + Math.random() * 2.2, bright], i * 4);
      tint.set([c[0], c[1], c[2]], i * 3);
    }
  }
  return { total, pos, data, tint };
}

// ------------------------------------------------------------------ main -----
export function createPhotoStars({ scene, camera, renderer, images }) {
  const shared = {
    uTime: { value: 0 },
    uScale: { value: 1 },
    uMaxPx: { value: 150 },
    uFade: { value: 0.1 },
    uCoreAlpha: { value: 0 },
  };
  const coreMaterials = [];

  const root = new THREE.Group();
  root.name = 'photo-stars';
  scene.add(root);

  const perImage = Math.max(60, Math.min(320, Math.round(TOTAL_STARS / Math.max(1, images.length))));
  const placed = [];

  // Sinh dữ liệu sao ngay (đồng bộ) để việc bố trí không phụ thuộc thứ tự tải ảnh.
  const layouts = images.map(() => generateStars(perImage, placed));

  images.forEach((src, index) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      let made;
      try {
        made = makePhotoTexture(img, renderer);
      } catch (err) {
        console.warn('Không tạo được texture cho ảnh', src, err);
        return;
      }
      const L = layouts[index];

      const plane = new THREE.PlaneGeometry(1, 1);
      const geo = new THREE.InstancedBufferGeometry();
      geo.index = plane.index;
      geo.setAttribute('position', plane.getAttribute('position'));
      geo.setAttribute('uv', plane.getAttribute('uv'));
      geo.setAttribute('aPos', new THREE.InstancedBufferAttribute(L.pos, 3));
      geo.setAttribute('aData', new THREE.InstancedBufferAttribute(L.data, 4));
      geo.setAttribute('aTint', new THREE.InstancedBufferAttribute(L.tint, 3));
      geo.instanceCount = L.total;

      // Lõi: bức ảnh (đục, có ghi chiều sâu để ảnh gần che ảnh xa đúng thứ tự)
      const core = new THREE.Mesh(geo, new THREE.ShaderMaterial({
        uniforms: { ...shared, uMap: { value: made.tex }, uAspect: { value: made.aspect }, uHalo: { value: 1 } },
        vertexShader: VERT,
        fragmentShader: CORE_FRAG,
        transparent: false,
        alphaToCoverage: true,   // làm mịn mép bo góc & mờ dần khi sát camera
        depthWrite: true,
        side: THREE.DoubleSide,
      }));

      coreMaterials.push(core.material);

      // Quầng sáng + viền neon + vệt sáng 4 cánh: cộng sáng (additive), nằm sau ảnh theo chiều sâu
      const halo = new THREE.Mesh(geo, new THREE.ShaderMaterial({
        uniforms: { ...shared, uAspect: { value: made.aspect }, uHalo: { value: HALO } },
        vertexShader: VERT,
        fragmentShader: HALO_FRAG,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
      }));

      for (const m of [core, halo]) {
        m.frustumCulled = false;       // vị trí nằm trong thuộc tính instance nên hộp bao mặc định không đúng
        m.userData.keepOpacity = true; // độ mờ do uniform uFade điều khiển, không qua vòng lặp opacity của scene
        root.add(m);
      }
    };
    img.onerror = () => console.warn('Không tải được ảnh', src);
    img.src = src;
  });

  function update(time, fade) {
    shared.uTime.value = time;
    // Trước khi bắt đầu gần như tắt hẳn, sau đó bừng sáng lên cùng cảnh. Lúc đang mờ dần thì lõi ảnh
    // chuyển sang pha trộn trong suốt thật (không để lại các ô tối che nền); khi sáng đủ thì quay về dạng đục.
    const f = fade * fade;
    const fading = fade < 0.999;
    shared.uFade.value = f;
    shared.uCoreAlpha.value = fading ? f : 1;
    for (const m of coreMaterials) {
      if (m.transparent !== fading) { m.transparent = fading; m.depthWrite = !fading; }
    }
    // px trên mỗi đơn vị thế giới ở khoảng cách 1 (theo pixel thật của canvas)
    shared.uScale.value = 0.5 * renderer.domElement.height * camera.projectionMatrix.elements[5];
    shared.uMaxPx.value = 150 * renderer.getPixelRatio();
  }

  return { update, root };
}
