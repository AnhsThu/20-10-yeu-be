import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { initLove } from './love.js';
import { createPhotoStars } from './photostars.js';
import { createSky } from './sky.js';
import { initCastle } from './castle.js';

// ---- Lâu đài: bấm vào quả cầu trung tâm để mở (xem castle.js) ----
let castleOpen = false;
const castleHintEl = document.getElementById('castle-hint');
const castle = initCastle({
  onOpen: () => { castleOpen = true; document.body.classList.add('castle-open'); document.body.classList.remove('planet-hover'); castleHintEl?.classList.remove('show'); },
  onClose: () => { castleOpen = false; document.body.classList.remove('castle-open'); }
});

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 20, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enabled = false;
controls.target.set(0, 0, 0);
controls.enablePan = false;
controls.minDistance = 15;
controls.maxDistance = 450;
controls.zoomSpeed = 1.1;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.5;
controls.update();

function createGlowMaterial(color, size = 128, opacity = 0.55) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  return new THREE.Sprite(material);
}


const centralGlow = createGlowMaterial('rgba(255,150,200,0.7)', 156, 0.18);
centralGlow.scale.set(8, 8, 1);
scene.add(centralGlow);

for (let i = 0; i < 15; i++) {
  const hue = 285 + Math.random() * 75;
  const color = `hsla(${hue}, 75%, 42%, 0.4)`;
  const nebula = createGlowMaterial(color, 256);
  nebula.scale.set(100, 100, 1);
  nebula.position.set(
    (Math.random() - 0.5) * 175,
    (Math.random() - 0.5) * 175,
    (Math.random() - 0.5) * 175
  );
  scene.add(nebula);
}

const galaxyParameters = {
  count: 100000,
  arms: 6,
  radius: 100,
  spin: 0.5,
  randomness: 0.2,
  randomnessPower: 20,
  insideColor: new THREE.Color(0xff5fa2),
  outsideColor: new THREE.Color(0x8f7bff),
};

// Toàn bộ ảnh "Anh (..)" trong thư mục style/images (giữ đúng tên + đuôi file).
// Thêm ảnh mới: chép file vào style/images rồi thêm một dòng vào danh sách này.
const defaultHeartImages = [
  'style/images/Anh (1).jpeg',
  'style/images/Anh (1).jpg',
  'style/images/Anh (2).jpeg',
  'style/images/Anh (2).jpg',
  'style/images/Anh (3).jpg',
  'style/images/Anh (44).jpeg',
  'style/images/Anh (45).jpeg',
  'style/images/Anh (46).jpeg',
  'style/images/Anh (47).jpeg',
  'style/images/Anh (48).jpeg',
  'style/images/Anh (49).jpeg',
  'style/images/Anh (50).jpeg',
  'style/images/Anh (51).jpeg',
  'style/images/Anh (52).jpeg',
  'style/images/Anh (53).jpeg',
  'style/images/Anh (54).jpeg',
  'style/images/Anh (55).jpeg',
  'style/images/Anh (56).jpeg',
  'style/images/Anh (57).jpeg',
  'style/images/Anh (58).jpeg',
  'style/images/Anh (59).jpeg',
  'style/images/Anh (61).jpeg',
  'style/images/Anh (62).jpeg',
  'style/images/Anh (63).jpeg',
  'style/images/Anh (64).jpeg',
  'style/images/Anh (65).jpeg',
  'style/images/Anh (66).jpeg',
  'style/images/Anh (67).jpeg',
  'style/images/Anh (68).jpeg',
  'style/images/Anh (69).jpeg',
  'style/images/Anh (70).jpeg',
  'style/images/Anh (71).jpeg',
  'style/images/Anh (72).jpeg',
  'style/images/Anh (73).jpeg',
  'style/images/Anh (74).jpeg',
  'style/images/Anh (75).jpeg',
  'style/images/Anh (76).jpeg',
  'style/images/Anh (77).jpeg',
  'style/images/Anh (78).jpeg',
  'style/images/Anh (79).jpeg',
  'style/images/Anh (80).jpeg',
  'style/images/Anh (81).jpeg',
  'style/images/Anh (82).jpeg',
  'style/images/Anh (83).jpeg',
  'style/images/Anh (84).jpeg',
  'style/images/Anh (85).jpeg',
  'style/images/Anh (86).jpeg',
  'style/images/Anh (87).jpeg',
  'style/images/Anh (88).jpeg',
  'style/images/Anh (89).jpeg',
  'style/images/Anh (90).jpeg',
  'style/images/Anh (91).jpeg',
  'style/images/Anh (92).jpeg',
  'style/images/Anh (93).jpeg',
  'style/images/Anh (94).jpeg',
  'style/images/Anh (95).jpeg',
];

const heartImages = [
  ...(window.dataCCD?.data?.heartImages || []),
  ...defaultHeartImages,
];

const positions = new Float32Array(galaxyParameters.count * 3);
const colors = new Float32Array(galaxyParameters.count * 3);


let pointIdx = 0;
for (let i = 0; i < galaxyParameters.count; i++) {
  const radius = Math.pow(Math.random(), galaxyParameters.randomnessPower) * galaxyParameters.radius;
  const branchAngle = (i % galaxyParameters.arms) / galaxyParameters.arms * Math.PI * 2;
  const spinAngle = radius * galaxyParameters.spin;

  const randomX = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
  const randomY = (Math.random() - 0.5) * galaxyParameters.randomness * radius * 1.2; 
  const randomZ = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
  const totalAngle = branchAngle + spinAngle;

  if (radius < 30 && Math.random() < 0.8) continue;

  const i3 = pointIdx * 3;
  positions[i3] = Math.cos(totalAngle) * radius + randomX;
  positions[i3 + 1] = randomY;
  positions[i3 + 2] = Math.sin(totalAngle) * radius + randomZ;

  const mixedColor = new THREE.Color(0xff7ab8);
  mixedColor.lerp(new THREE.Color(0x9a8cff), radius / galaxyParameters.radius);
  mixedColor.multiplyScalar(0.5 + 0.25 * Math.random());
  colors[i3] = mixedColor.r;
  colors[i3 + 1] = mixedColor.g;
  colors[i3 + 2] = mixedColor.b;

  pointIdx++;
}

const galaxyGeometry = new THREE.BufferGeometry();
galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(0, pointIdx * 3), 3));
galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors.slice(0, pointIdx * 3), 3));

const galaxyMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0.0 },
    uSize: { value: 50.0 * renderer.getPixelRatio() },
    uRippleTime: { value: -1.0 },
    uRippleSpeed: { value: 40.0 },
    uRippleWidth: { value: 20.0 }
  },
  vertexShader: `
        uniform float uSize;
        uniform float uTime;
        uniform float uRippleTime;
        uniform float uRippleSpeed;
        uniform float uRippleWidth;

        varying vec3 vColor;

        void main() {
            // Lấy màu gốc từ geometry (giống hệt vertexColors: true)
            vColor = color;

            vec4 modelPosition = modelMatrix * vec4(position, 1.0);

            // ---- LOGIC HIỆU ỨNG GỢN SÓNG ----
            if (uRippleTime > 0.0) {
                float rippleRadius = (uTime - uRippleTime) * uRippleSpeed;
                float particleDist = length(modelPosition.xyz);

                float strength = 1.0 - smoothstep(rippleRadius - uRippleWidth, rippleRadius + uRippleWidth, particleDist);
                strength *= smoothstep(rippleRadius + uRippleWidth, rippleRadius - uRippleWidth, particleDist);

                if (strength > 0.0) {
                    vColor += vec3(0.55, 0.14, 0.32) * strength; // Làm màu sáng hơn khi sóng đi qua
                }
            }

            vec4 viewPosition = viewMatrix * modelPosition;
            gl_Position = projectionMatrix * viewPosition;
            // Dòng này làm cho các hạt nhỏ hơn khi ở xa, mô phỏng hành vi của PointsMaterial
            gl_PointSize = uSize / -viewPosition.z;
        }
    `,
  fragmentShader: `
        varying vec3 vColor;
        void main() {
            // Làm cho các hạt có hình tròn thay vì hình vuông
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;

            float a = smoothstep(0.5, 0.05, dist);
            gl_FragColor = vec4(vColor * 0.7, a * 0.85);
        }
    `,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
  vertexColors: true
});
const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
scene.add(galaxy);

// ---- Ảnh-sao: mỗi bức ảnh là một "ngôi sao" rải ngẫu nhiên khắp không gian 3D (xem photostars.js) ----
const photoStars = createPhotoStars({ scene, camera, renderer, images: heartImages });

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// ---- Bầu trời đêm: sao nhấp nháy nhiều màu, dải Ngân Hà, tinh vân (xem sky.js) ----
const sky = createSky(scene, renderer);
const starField = sky.stars;


let shootingStars = [];

function createShootingStar() {
  const trailLength = 100;

  const headGeometry = new THREE.SphereGeometry(2, 32, 32);
  const headMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);

  const glowGeometry = new THREE.SphereGeometry(3, 32, 32);
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            varying vec3 vNormal;
            uniform float time;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(1.0, 0.72, 0.88, intensity * (0.6 + sin(time * 5.0) * 0.15));
            }
        `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  head.add(glow);

  const curve = createRandomCurve();
  const trailPoints = [];
  for (let i = 0; i < trailLength; i++) {
    const progress = i / (trailLength - 1);
    trailPoints.push(curve.getPoint(progress));
  }
  const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
  const trailMaterial = new THREE.LineBasicMaterial({
    color: 0xffb3d9,
    transparent: true,
    opacity: 0.7,
    linewidth: 2
  });
  const trail = new THREE.Line(trailGeometry, trailMaterial);

  const shootingStarGroup = new THREE.Group();
  shootingStarGroup.add(head);
  shootingStarGroup.add(trail);
  shootingStarGroup.userData = {
    curve: curve,
    progress: 0,
    speed: 0.002 + Math.random() * 0.002,
    life: 0,
    maxLife: 150,
    head: head,
    trail: trail,
    trailLength: trailLength,
    trailPoints: trailPoints,
  };
  scene.add(shootingStarGroup);
  shootingStars.push(shootingStarGroup);
}

function createRandomCurve() {
  const points = [];
  const startPoint = new THREE.Vector3(-200 + Math.random() * 100, -100 + Math.random() * 200, -100 + Math.random() * 200);
  const endPoint = new THREE.Vector3(600 + Math.random() * 200, startPoint.y + (-100 + Math.random() * 200), startPoint.z + (-100 + Math.random() * 200));
  const controlPoint1 = new THREE.Vector3(startPoint.x + 200 + Math.random() * 100, startPoint.y + (-50 + Math.random() * 100), startPoint.z + (-50 + Math.random() * 100));
  const controlPoint2 = new THREE.Vector3(endPoint.x - 200 + Math.random() * 100, endPoint.y + (-50 + Math.random() * 100), endPoint.z + (-50 + Math.random() * 100));

  points.push(startPoint, controlPoint1, controlPoint2, endPoint);
  return new THREE.CubicBezierCurve3(startPoint, controlPoint1, controlPoint2, endPoint);
}


function createPlanetTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(size / 2, size / 2, size / 8, size / 2, size / 2, size / 2);
  gradient.addColorStop(0.00, '#f8bbd0');
  gradient.addColorStop(0.12, '#f48fb1');
  gradient.addColorStop(0.22, '#f06292');
  gradient.addColorStop(0.35, '#ffffff');
  gradient.addColorStop(0.50, '#e1aaff');
  gradient.addColorStop(0.62, '#a259f7');
  gradient.addColorStop(0.75, '#b2ff59');
  gradient.addColorStop(1.00, '#3fd8c7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const spotColors = ['#f8bbd0', '#f8bbd0', '#f48fb1', '#f48fb1', '#f06292', '#f06292', '#ffffff', '#e1aaff', '#a259f7', '#b2ff59'];
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 30 + Math.random() * 120;
    const color = spotColors[Math.floor(Math.random() * spotColors.length)];
    const spotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    spotGradient.addColorStop(0, color + 'cc'); // 'cc' là alpha
    spotGradient.addColorStop(1, color + '00');
    ctx.fillStyle = spotGradient;
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * size, Math.random() * size);
    ctx.bezierCurveTo(Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size);
    ctx.strokeStyle = 'rgba(180, 120, 200, ' + (0.12 + Math.random() * 0.18) + ')';
    ctx.lineWidth = 8 + Math.random() * 18;
    ctx.stroke();
  }

  if (ctx.filter !== undefined) {
    ctx.filter = 'blur(2px)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
  }

  return new THREE.CanvasTexture(canvas);
}

const stormShader = {
  uniforms: {
    time: { value: 0.0 },
    baseTexture: { value: null }
  },
  vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform float time;
        uniform sampler2D baseTexture;
        varying vec2 vUv;
        void main() {
            vec2 uv = vUv;
            float angle = length(uv - vec2(0.5)) * 3.0;
            float twist = sin(angle * 3.0 + time) * 0.1;
            uv.x += twist * sin(time * 0.5);
            uv.y += twist * cos(time * 0.5);
            vec4 texColor = texture2D(baseTexture, uv);
            float noise = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time) * 0.1;
            texColor.rgb += noise * vec3(0.8, 0.4, 0.2);
            gl_FragColor = vec4(texColor.rgb * 0.8, texColor.a);
        }
    `
};

const planetRadius = 10;
const planetGeometry = new THREE.SphereGeometry(planetRadius, 48, 48);
const planetTexture = createPlanetTexture();
const planetMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    baseTexture: { value: planetTexture }
  },
  vertexShader: stormShader.vertexShader,
  fragmentShader: stormShader.fragmentShader
});
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
planet.position.set(0, 0, 0);
scene.add(planet);
planet.add(new THREE.Mesh(new THREE.SphereGeometry(planetRadius * 1.05, 48, 48), new THREE.ShaderMaterial({
  uniforms: { glowColor: { value: new THREE.Color(0xff9cc8) } },
  vertexShader: `varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `varying vec3 vNormal; uniform vec3 glowColor; void main(){ float i = pow(max(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0); gl_FragColor = vec4(glowColor, 1.0) * i * 0.8; }`,
  side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
})));
// vùng bấm vô hình (to hơn quả cầu một chút cho dễ chạm trên điện thoại)
const planetHit = new THREE.Mesh(new THREE.SphereGeometry(planetRadius * 1.55, 16, 16), new THREE.MeshBasicMaterial({ visible: false }));
planet.add(planetHit);

// vòng sóng hồng lan ra từ quả cầu: gợi ý "bấm vào đây"
const castleRing = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(255,185,220,0.95)'; g.lineWidth = 7; g.shadowColor = '#ff7fb0'; g.shadowBlur = 22;
  g.beginPath(); g.arc(128, 128, 96, 0, Math.PI * 2); g.stroke();
  const m = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const sp = new THREE.Sprite(m);
  sp.userData.keepOpacity = true; sp.visible = false;
  scene.add(sp);
  return sp;
})();
function updateCastleRing(time) {
  const on = introStarted && controls.enabled && !castleOpen;
  castleRing.visible = on;
  if (!on) return;
  const p = (time * 0.5) % 1, sc = 24 + p * 22;
  castleRing.scale.set(sc, sc, 1);
  castleRing.material.opacity = (1 - p) * 0.7;
}
const love = initLove(scene, camera, planet, centralGlow);

const ringTexts = [
  "I LOVE YOU",
  "DR.GIFTER",
  "WELCOME TO MY TIKTOK",
  ...(window.dataCCD && window.dataCCD.data.ringTexts ? window.dataCCD.data.ringTexts : [])
];

function createTextRings() {
  const numRings = ringTexts.length;
  const baseRingRadius = planetRadius * 1.1;
  const ringSpacing = 5;
  window.textRings = [];

  for (let i = 0; i < numRings; i++) {
    const text = ringTexts[i % ringTexts.length] + '   '; 
    const ringRadius = baseRingRadius + i * ringSpacing;

    function getCharType(char) {
      const charCode = char.charCodeAt(0);
      if ((charCode >= 0x4E00 && charCode <= 0x9FFF) || 
        (charCode >= 0x3040 && charCode <= 0x309F) || 
        (charCode >= 0x30A0 && charCode <= 0x30FF) || 
        (charCode >= 0xAC00 && charCode <= 0xD7AF)) { 
        return 'cjk';
      } else if (charCode >= 0 && charCode <= 0x7F) { 
        return 'latin';
      }
      return 'other';
    }

    let charCounts = { cjk: 0, latin: 0, other: 0 };
    for (let char of text) {
      charCounts[getCharType(char)]++;
    }

    const totalChars = text.length;
    const cjkRatio = charCounts.cjk / totalChars;

    let scaleParams = { fontScale: 0.75, spacingScale: 1.1 };

    if (i === 0) {
      scaleParams.fontScale = 0.55;
      scaleParams.spacingScale = 0.9;
    } else if (i === 1) {
      scaleParams.fontScale = 0.65;
      scaleParams.spacingScale = 1.0;
    }

    if (cjkRatio > 0) {
      scaleParams.fontScale *= 0.9;
      scaleParams.spacingScale *= 1.1;
    }

    const textureHeight = 150;
    const fontSize = Math.max(130, 0.8 * textureHeight);

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `bold ${fontSize}px Arial, sans-serif`;
    let singleText = ringTexts[i % ringTexts.length];
    const separator = '   ';
    let repeatedTextSegment = singleText + separator;

    let segmentWidth = tempCtx.measureText(repeatedTextSegment).width;
    let textureWidthCircumference = 2 * Math.PI * ringRadius * 180; 
    let repeatCount = Math.ceil(textureWidthCircumference / segmentWidth);

    let fullText = '';
    for (let j = 0; j < repeatCount; j++) {
      fullText += repeatedTextSegment;
    }

    let finalTextureWidth = segmentWidth * repeatCount;
    if (finalTextureWidth < 1 || !fullText) {
      fullText = repeatedTextSegment;
      finalTextureWidth = segmentWidth;
    }

    const textCanvas = document.createElement('canvas');
    textCanvas.width = Math.ceil(Math.max(1, finalTextureWidth));
    textCanvas.height = textureHeight;
    const ctx = textCanvas.getContext('2d');

    ctx.clearRect(0, 0, textCanvas.width, textureHeight);
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.shadowColor = '#e0b3ff';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#fff';
    ctx.strokeText(fullText, 0, textureHeight * 0.82);

    ctx.shadowColor = '#ffb3de';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#fff';
    ctx.fillText(fullText, 0, textureHeight * 0.84);

    const ringTexture = new THREE.CanvasTexture(textCanvas);
    ringTexture.wrapS = THREE.RepeatWrapping;
    ringTexture.repeat.x = finalTextureWidth / textureWidthCircumference;
    ringTexture.needsUpdate = true;

    const ringGeometry = new THREE.CylinderGeometry(ringRadius, ringRadius, 1, 128, 1, true);

    const ringMaterial = new THREE.MeshBasicMaterial({
      map: ringTexture,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.01,
      opacity: 1,
      depthWrite: false,
    });

    const textRingMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    textRingMesh.position.set(0, 0, 0);
    textRingMesh.rotation.y = Math.PI / 2;

    const ringGroup = new THREE.Group();
    ringGroup.add(textRingMesh);
    ringGroup.userData = {
      ringRadius: ringRadius,
      angleOffset: 0.15 * Math.PI * 0.5,
      speed: 0.0045, 
      tiltSpeed: 0, rollSpeed: 0, pitchSpeed: 0, 
      tiltAmplitude: Math.PI / 3, rollAmplitude: Math.PI / 6, pitchAmplitude: Math.PI / 8, 
      tiltPhase: Math.PI * 2, rollPhase: Math.PI * 2, pitchPhase: Math.PI * 2, 
      isTextRing: true
    };

    const initialRotationX = i / numRings * (Math.PI / 1);
    ringGroup.rotation.x = initialRotationX;
    scene.add(ringGroup);
    window.textRings.push(ringGroup);
  }
}

createTextRings();

function updateTextRingsRotation() {
  if (!window.textRings || !camera) return;

  window.textRings.forEach((ringGroup, index) => {
    ringGroup.children.forEach(child => {
      if (child.userData.initialAngle !== undefined) {
        const angle = child.userData.initialAngle + ringGroup.userData.angleOffset;
        const x = Math.cos(angle) * child.userData.ringRadius;
        const z = Math.sin(angle) * child.userData.ringRadius;
        child.position.set(x, 0, z);

        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);

        const lookAtVector = new THREE.Vector3().subVectors(camera.position, worldPos).normalize();
        const rotationY = Math.atan2(lookAtVector.x, lookAtVector.z);
        child.rotation.y = rotationY;
      }
    });
  });
}

function animatePlanetSystem() {
  if (window.textRings) {
    const time = Date.now() * 0.001;
    window.textRings.forEach((ringGroup, index) => {
      const userData = ringGroup.userData;
      userData.angleOffset += userData.speed;

      const tilt = Math.sin(time * userData.tiltSpeed + userData.tiltPhase) * userData.tiltAmplitude;
      const roll = Math.cos(time * userData.rollSpeed + userData.rollPhase) * userData.rollAmplitude;
      const pitch = Math.sin(time * userData.pitchSpeed + userData.pitchPhase) * userData.pitchAmplitude;

      ringGroup.rotation.x = (index / window.textRings.length) * (Math.PI / 1) + tilt;
      ringGroup.rotation.z = roll;
      ringGroup.rotation.y = userData.angleOffset + pitch;

      const verticalBob = Math.sin(time * (userData.tiltSpeed * 0.7) + userData.tiltPhase) * 0.3;
      ringGroup.position.y = verticalBob;

      const pulse = (Math.sin(time * 1.5 + index) + 1) / 2; 
      const textMesh = ringGroup.children[0];
      if (textMesh && textMesh.material) {
        textMesh.material.opacity = 0.6 + pulse * 0.25;
      }
    });
    updateTextRingsRotation();
  }
}
function playGalaxyAudio() {
  // phát nhạc nền (#bg-music) – được khởi tạo trong index.html
  if (window.startBgMusic) window.startBgMusic();
}



let fadeOpacity = 0.1;
let fadeInProgress = false;

let hintIcon;
let hintText;
function createHintIcon() {
  hintIcon = new THREE.Group();
  hintIcon.name = 'hint-icon-group';
  scene.add(hintIcon);

  const cursorVisuals = new THREE.Group();

  const cursorShape = new THREE.Shape();
  const h = 1.5;
  const w = h * 0.5;

  cursorShape.moveTo(0, 0);
  cursorShape.lineTo(-w * 0.4, -h * 0.7);
  cursorShape.lineTo(-w * 0.25, -h * 0.7);
  cursorShape.lineTo(-w * 0.5, -h);
  cursorShape.lineTo(w * 0.5, -h);
  cursorShape.lineTo(w * 0.25, -h * 0.7);
  cursorShape.lineTo(w * 0.4, -h * 0.7);
  cursorShape.closePath();

  const backgroundGeometry = new THREE.ShapeGeometry(cursorShape);
  const backgroundMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, 
    side: THREE.DoubleSide
  });
  const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);

  const foregroundGeometry = new THREE.ShapeGeometry(cursorShape);
  const foregroundMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, 
    side: THREE.DoubleSide
  });
  const foregroundMesh = new THREE.Mesh(foregroundGeometry, foregroundMaterial);

  foregroundMesh.scale.set(0.8, 0.8, 1);
  foregroundMesh.position.z = 0.01;

  cursorVisuals.add(backgroundMesh, foregroundMesh);
  cursorVisuals.position.y = h / 2;
  cursorVisuals.rotation.x = Math.PI / 2;


  const ringGeometry = new THREE.RingGeometry(1.8, 2.0, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  ringMesh.rotation.x = Math.PI / 2;
  hintIcon.userData.ringMesh = ringMesh;

  hintIcon.add(cursorVisuals);
  hintIcon.add(ringMesh);


  hintIcon.position.set(1.5, 1.5, 15); 

  hintIcon.scale.set(0.8, 0.8, 0.8);
  hintIcon.lookAt(planet.position);
  hintIcon.userData.initialPosition = hintIcon.position.clone();
}

/**
 * Animate icon gợi ý.
 * @param {number} time - Thời gian hiện tại.
 */
function animateHintIcon(time) {
  if (!hintIcon) return;

  if (!introStarted) {
    hintIcon.visible = true;

    const tapFrequency = 2.5;
    const tapAmplitude = 1.5;
    const tapOffset = Math.sin(time * tapFrequency) * tapAmplitude;

    const direction = new THREE.Vector3();
    hintIcon.getWorldDirection(direction);
    hintIcon.position.copy(hintIcon.userData.initialPosition).addScaledVector(direction, -tapOffset);

    const ring = hintIcon.userData.ringMesh;
    const ringScale = 1 + Math.sin(time * tapFrequency) * 0.1;
    ring.scale.set(ringScale, ringScale, 1);
    ring.material.opacity = 0.5 + Math.sin(time * tapFrequency) * 0.2;
    if (hintText) {
      hintText.visible = true;
      hintText.material.opacity = 0.7 + Math.sin(time * 3) * 0.3;
      hintText.position.y = 15 + Math.sin(time * 2) * 0.5;
      hintText.lookAt(camera.position);
    }
  } else {
    if (hintIcon) hintIcon.visible = false;

    if (hintText) hintText.visible = false;
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (castleOpen) return;           // lâu đài đang mở: tạm dừng vũ trụ phía sau cho nhẹ máy
  const time = performance.now() * 0.001;
  updateCastleRing(time);

  animateHintIcon(time);

  stepZoom();
  controls.update();
  planet.material.uniforms.time.value = time * 0.5;

  if (fadeInProgress && fadeOpacity < 1) {
    fadeOpacity += 0.05;
    if (fadeOpacity > 1) fadeOpacity = 1;
  }

  if (!introStarted) fadeOpacity = 0.1;
  planet.visible = true;
  centralGlow.visible = true;
  const exempt = o => { for (let p = o; p; p = p.parent) if (p === hintIcon || p === hintText || p === centralGlow || p === planet || p.userData.isTextRing || p.userData.curve || p.userData.keepOpacity || p.name === 'starfield') return true; return false; };
  scene.traverse(obj => {
    const m = obj.material;
    if (!m || m.opacity === undefined || exempt(obj)) return;
    if (obj.userData.baseOpacity === undefined) obj.userData.baseOpacity = m.opacity;
    m.transparent = true;
    m.opacity = obj.userData.baseOpacity * fadeOpacity;
  });

  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];
    star.userData.life++;

    let opacity = 1.0;
    if (star.userData.life < 30) {
      opacity = star.userData.life / 30;
    } else if (star.userData.life > star.userData.maxLife - 30) {
      opacity = (star.userData.maxLife - star.userData.life) / 30;
    }

    star.userData.progress += star.userData.speed;
    if (star.userData.progress > 1) {
      scene.remove(star);
      shootingStars.splice(i, 1);
      continue;
    }

    const currentPos = star.userData.curve.getPoint(star.userData.progress);
    star.position.copy(currentPos);
    star.userData.head.material.opacity = opacity;
    star.userData.head.children[0].material.uniforms.time.value = time;

    const trail = star.userData.trail;
    const trailPoints = star.userData.trailPoints;
    trailPoints[0].copy(currentPos);
    for (let j = 1; j < star.userData.trailLength; j++) {
      const trailProgress = Math.max(0, star.userData.progress - j * 0.01);
      trailPoints[j].copy(star.userData.curve.getPoint(trailProgress));
    }
    trail.geometry.setFromPoints(trailPoints);
    trail.material.opacity = opacity * 0.7;
  }

  if (shootingStars.length < 3 && Math.random() < 0.04) {
    createShootingStar();
  }

  planet.lookAt(camera.position);
  animatePlanetSystem();

  galaxyMaterial.uniforms.uTime.value = time;
  photoStars.update(time, fadeOpacity);
  sky.update(time, fadeOpacity);
  love.update(time, fadeOpacity);
  renderer.render(scene, camera);
}
createShootingStar();
createHintIcon();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.target.set(0, 0, 0);
  controls.update();
});

function startCameraAnimation() {
  const s = camera.position.clone();
  const curve = new THREE.CatmullRomCurve3([s, new THREE.Vector3(s.x, 0, s.z), new THREE.Vector3(s.x, 0, 160), new THREE.Vector3(-40, 100, 100)], false, 'centripetal');
  const t0 = performance.now(), dur = 8000;
  controls.enabled = false;
  (function step() {
    const k = Math.min((performance.now() - t0) / dur, 1);
    const e = k * k * k * (k * (k * 6 - 15) + 10);
    camera.position.copy(curve.getPoint(e));
    camera.lookAt(0, 0, 0);
    if (k < 1) return requestAnimationFrame(step);
    controls.target.set(0, 0, 0);
    controls.update();
    controls.enabled = true;
    castleHintEl?.classList.add('show');
    setTimeout(() => castleHintEl?.classList.remove('show'), 18000);
  })();
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let introStarted = false;

const originalStarCount = starField.geometry.getAttribute('position').count;
if (starField && starField.geometry) {
  starField.geometry.setDrawRange(0, Math.floor(originalStarCount * 0.1));
}

function requestFullScreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { 
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { 
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { 
    elem.msRequestFullscreen();
  }
}

let downX = 0, downY = 0;
renderer.domElement.addEventListener('pointerdown', e => { downX = e.clientX; downY = e.clientY; });

function hitPlanet(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  return raycaster.intersectObject(planetHit).length > 0;
}

function onCanvasClick(event) {
  if (Math.hypot(event.clientX - downX, event.clientY - downY) > 8) return;   // vừa kéo xoay, không phải bấm
  if (castleOpen) return;

  if (introStarted) {                       // đã vào vũ trụ: bấm quả cầu -> mở lâu đài
    if (hitPlanet(event)) castle.open();
    return;
  }

  if (hitPlanet(event)) {
    requestFullScreen();
    introStarted = true;
    galaxyMaterial.uniforms.uRippleTime.value = performance.now() * 0.001;
    fadeInProgress = true;
    document.body.classList.add("intro-started");
    playGalaxyAudio(); 

    startCameraAnimation();

    if (starField && starField.geometry) {
      starField.geometry.setDrawRange(0, originalStarCount);
    }
  }
}

// rê chuột vào quả cầu: con trỏ trái tim to lên
let hoverPending = false;
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || !introStarted || castleOpen || hoverPending) return;
  hoverPending = true;
  requestAnimationFrame(() => { hoverPending = false; document.body.classList.toggle('planet-hover', !castleOpen && hitPlanet(e)); });
});

renderer.domElement.addEventListener("click", onCanvasClick);

animate();

planet.name = 'main-planet';
centralGlow.name = 'main-glow';

function setFullScreen() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  const container = document.getElementById('container');
  if (container) {
    container.style.height = `${window.innerHeight}px`;
  }
}

window.addEventListener('resize', setFullScreen);
window.addEventListener('orientationchange', () => {
  setTimeout(setFullScreen, 300);
});
setFullScreen();

const preventDefault = event => event.preventDefault();
document.addEventListener('touchmove', preventDefault, { passive: false });
document.addEventListener('gesturestart', preventDefault, { passive: false });

const container = document.getElementById('container');
if (container) {
  container.addEventListener('touchmove', preventDefault, { passive: false });
}

function checkOrientation() {
  const isMobilePortrait = window.innerHeight > window.innerWidth && 'ontouchstart' in window;

  if (isMobilePortrait) {
    document.body.classList.add('portrait-mode');
  } else {
    document.body.classList.remove('portrait-mode');
  }
}

window.addEventListener('DOMContentLoaded', checkOrientation);
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', () => {
  setTimeout(checkOrientation, 200);
});


// ---- Zoom dễ dàng: nút +/-, phím +/-, nhấp đúp, có làm mượt ----
var zoomGoal = null;
controls.addEventListener('start', () => { zoomGoal = null; });
function zoomBy(f) {
  if (!introStarted || !controls.enabled || castleOpen) return;
  zoomGoal = THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * f, controls.minDistance, controls.maxDistance);
}
function stepZoom() {
  if (zoomGoal == null) return;
  const d = camera.position.distanceTo(controls.target);
  const nd = d + (zoomGoal - d) * 0.1;
  camera.position.sub(controls.target).setLength(nd).add(controls.target);
  if (Math.abs(zoomGoal - nd) < 0.05) zoomGoal = null;
}
document.getElementById('zoom-in')?.addEventListener('click', () => zoomBy(0.7));
document.getElementById('zoom-out')?.addEventListener('click', () => zoomBy(1.4));
window.addEventListener('keydown', e => { if (e.key === '+' || e.key === '=') zoomBy(0.8); if (e.key === '-') zoomBy(1.25); });
renderer.domElement.addEventListener('dblclick', e => zoomBy(e.shiftKey ? 1.5 : 0.6));
