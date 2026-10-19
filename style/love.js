import * as THREE from 'three';

// Hiệu ứng tình yêu: trái tim bay lơ lửng + hào quang trái tim đập nhịp quanh hành tinh.
export function initLove(scene, camera, planet, centralGlow) {
  const pr = Math.min(window.devicePixelRatio || 1, 1.5);

  // ---- 1. Trái tim nhỏ bay lên chậm, lắc lư nhẹ ----
  const N = 420;
  const seed = new Float32Array(N * 4), info = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 130;
    seed.set([Math.cos(a) * r, Math.sin(a) * r, Math.random() * 120, Math.random() * 6.28], i * 4);
    info.set([2 + Math.random() * 3, 0.6 + Math.random() * 1.0, Math.random()], i * 3);
  }
  const hg = new THREE.BufferGeometry();
  hg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  hg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
  hg.setAttribute('aInfo', new THREE.BufferAttribute(info, 3));
  const hearts = new THREE.Points(hg, new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uSize: { value: 1100 * pr }, uFade: { value: 0 } },
    vertexShader: `
      attribute vec4 aSeed; attribute vec3 aInfo;
      uniform float uTime, uSize, uFade; varying vec3 vCol; varying float vA;
      void main(){
        float y = mod(aSeed.z + uTime * aInfo.x, 120.0) - 60.0;
        vec3 p = vec3(aSeed.x + sin(uTime*0.4 + aSeed.w)*4.0, y, aSeed.y + cos(uTime*0.3 + aSeed.w)*4.0);
        float life = (y + 60.0) / 120.0;
        vA = smoothstep(0.0,0.15,life) * smoothstep(1.0,0.75,life) * (0.6 + 0.4*sin(uTime*1.5 + aSeed.w*6.0)) * uFade;
        vCol = mix(mix(vec3(1.0,0.42,0.62), vec3(1.0,0.78,0.86), aInfo.z), vec3(0.78,0.62,1.0), step(0.85, aInfo.z));
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_PointSize = aInfo.y * uSize / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vCol; varying float vA;
      void main(){
        vec2 c = gl_PointCoord; vec2 p = vec2(c.x - 0.5, 0.5 - c.y) * 2.8; p.y += 0.2;
        float x2 = p.x*p.x, f = pow(x2 + p.y*p.y - 1.0, 3.0) - x2*p.y*p.y*p.y;
        float a = smoothstep(0.12, -0.12, f) * (0.65 + 0.35*smoothstep(0.0, -0.6, f));
        gl_FragColor = vec4(vCol, a * vA * 0.7);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  hearts.frustumCulled = false;
  hearts.userData.keepOpacity = true;
  scene.add(hearts);

  // ---- 2. Hào quang hình trái tim (hạt mịn) đập theo nhịp tim ----
  const M = 3600, ap = new Float32Array(M * 3), ar = new Float32Array(M);
  for (let i = 0; i < M; i++) {
    const t = Math.random() * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const s = Math.random() < 0.6 ? 0.9 + Math.random() * 0.1 : Math.sqrt(Math.random()) * 0.9;
    ap.set([hx * s * 1.25, (hy - 2) * s * 1.25 + 2, (Math.random() - 0.5) * 6 * s], i * 3);
    ar[i] = Math.random();
  }
  const ag = new THREE.BufferGeometry();
  ag.setAttribute('position', new THREE.BufferAttribute(ap, 3));
  ag.setAttribute('aR', new THREE.BufferAttribute(ar, 1));
  const aura = new THREE.Points(ag, new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uBeat: { value: 0 }, uSize: { value: 380 * pr }, uFade: { value: 0 } },
    vertexShader: `
      attribute float aR; uniform float uTime, uBeat, uSize, uFade; varying vec3 vCol; varying float vA;
      void main(){
        vec3 p = position * (1.0 + 0.06*uBeat);
        p += vec3(sin(uTime + aR*40.0), cos(uTime*0.8 + aR*30.0), sin(uTime*0.6 + aR*20.0)) * 0.25;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_PointSize = uSize * (1.0 + 0.5*uBeat) / -mv.z;
        gl_Position = projectionMatrix * mv;
        vCol = mix(vec3(1.0,0.3,0.55), vec3(1.0,0.72,0.82), aR);
        vA = uFade * (0.5 + 0.5*sin(uTime*2.0 + aR*50.0));
      }`,
    fragmentShader: `
      varying vec3 vCol; varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(vCol, smoothstep(0.5, 0.0, d) * vA * 0.55);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  aura.frustumCulled = false;
  aura.userData.keepOpacity = true;
  scene.add(aura);

  // ---- 3. Nhịp tim "thịch-thịch" cho hành tinh + ánh sáng trung tâm ----
  function update(time, fade) {
    const t = (time * 1.1) % 1;
    const beat = Math.min(1, Math.exp(-Math.pow((t - 0.08) / 0.06, 2)) + 0.55 * Math.exp(-Math.pow((t - 0.32) / 0.07, 2)));
    planet.scale.setScalar(1 + 0.04 * beat);
    const g = 8 * (1 + 0.25 * beat);
    centralGlow.scale.set(g, g, 1);

    hearts.material.uniforms.uTime.value = time;
    hearts.material.uniforms.uFade.value = fade;
    aura.material.uniforms.uTime.value = time;
    aura.material.uniforms.uBeat.value = beat;
    aura.material.uniforms.uFade.value = fade;
    aura.quaternion.slerp(camera.quaternion, 0.04); // luôn hướng về người xem, xoay mượt
  }

  return { update };
}
