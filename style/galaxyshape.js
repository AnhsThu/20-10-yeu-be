// Hàm dùng chung: lấy mẫu vị trí ngẫu nhiên trong "đĩa thiên hà" có nhánh xoắn ốc rất mờ.
// Cả ảnh-sao (photostars.js) lẫn lớp bụi sáng (sky.js) cùng dùng hàm này nên các nhánh khớp nhau.

export function gauss() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const ARMS = 4;
const ARM_SPIN = 0.017; // độ cong của nhánh theo bán kính

// Ghi toạ độ (x, y, z) vào `out` (đối tượng có set(x, y, z), vd. THREE.Vector3).
export function sampleDisc(out, rMin, rMax, { power = 1.25, armShare = 0.45, armSigma = 0.55, thickBase = 3, thickK = 0.1 } = {}) {
  const r = rMin + (rMax - rMin) * Math.pow(Math.random(), power);
  let th = Math.random() * Math.PI * 2;
  if (Math.random() < armShare) {
    th = Math.floor(Math.random() * ARMS) * (Math.PI * 2 / ARMS) + r * ARM_SPIN + gauss() * armSigma;
  }
  const y = gauss() * (thickBase + r * thickK);
  out.set(Math.cos(th) * r, y, Math.sin(th) * r);
  return out;
}

// Điểm ngẫu nhiên đều trong vỏ cầu rMin..rMax (hào quang sao bao quanh mọi hướng).
export function sampleShell(out, rMin, rMax) {
  const r = Math.cbrt(rMin ** 3 + Math.random() * (rMax ** 3 - rMin ** 3));
  const z = Math.random() * 2 - 1;
  const a = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - z * z);
  out.set(s * Math.cos(a) * r, z * r, s * Math.sin(a) * r);
  return out;
}
