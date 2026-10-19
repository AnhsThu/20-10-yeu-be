// =====================================================================
//  TRANH VẼ LÂU ĐÀI (SVG) – bầu trời hoàng hôn + mặt cắt lâu đài 4 tầng
//  Toạ độ "thế giới" 1600 x 1000. Các hằng số bên dưới dùng chung với castle.js
// =====================================================================

export const W = 1600, H = 1000;
export const LV = [885, 700, 515, 330];       // mặt sàn của tầng 0..3 (toạ độ y)
export const SLAB = 18;                          // độ dày sàn
export const BAND = 14;                          // dải sàn nhìn nghiêng (tạo chiều sâu)
export const roomTop = l => (l < 3 ? LV[l + 1] + SLAB : 148);

// ---------------------------------------------------------------- cầu thang xoắn ốc ----
// Hai cầu thang đối xứng gương, mỗi tầng = đúng MỘT vòng xoắn quanh cột trụ giữa (3 vòng từ tầng 0 lên tầng 3).
// Chân cầu thang (nơi bước lên từ sàn) nằm ở phía trong sảnh: s = +1 → mép phải, s = -1 → mép trái.
export const STAIRS = [{ cx: 535, s: 1 }, { cx: 1065, s: -1 }];
export const PITCH = LV[0] - LV[1];              // chiều cao một vòng xoắn (= khoảng cách giữa 2 tầng)
export const N_STEP = 16;                        // số bậc trong một vòng
export const R_IN = 9, R_OUT = 60, R_WALK = 35;  // bán kính: cột giữa / mép ngoài (lan can) / lối nhân vật bước đi
export const TILT = 0.2;                         // độ nghiêng góc nhìn: phía trước thấp hơn phía sau
export const LADDERS = STAIRS.map(a => a.cx + a.s * R_WALK);   // toạ độ x của chân cầu thang
const TAU = Math.PI * 2, TURNS = 3, STEPS = TURNS * N_STEP, DY = PITCH / N_STEP;
const RAIL_H = 24, BAND_H = 58;                  // cao lan can / cao dải đá ốp ngoài (stringer)
const stepY = i => LV[0] - DY * (i + 1);         // độ cao mặt bậc thứ i
const ridgeY = ph => LV[0] - PITCH * ph / TAU;   // đường xoắn liên tục (chân lan can)
const proj = (a, Y, r, ph) => [a.cx + a.s * r * Math.cos(ph), Y + TILT * r * Math.sin(ph)];
const smooth01 = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

// độ cao mặt bậc khi đã leo p bậc: nhún lên từng bậc, đúng tại gờ bậc; tại sàn mỗi tầng luôn bằng đúng mặt sàn
export function stairY(p) {
  let n = 0;
  for (let b = 0; b < STEPS; b++) n += smooth01((p - (b % N_STEP === 0 ? b : b - 0.4)) / 0.8);   // cửa sổ nâng rộng hơn → lướt lên mượt, không nảy từng bậc
  return LV[0] - DY * n;
}
// vị trí chân nhân vật trên cầu thang a khi đã leo lv tầng (lv lẻ = đang ở giữa chừng)
export function stairPose(a, lv) {
  const ph = TAU * lv, [x, y] = proj(a, stairY(lv * N_STEP), R_WALK, ph);
  return { x, y, back: Math.sin(ph) < -1e-3, vx: -a.s * Math.sin(ph) };   // vx: hướng đi ngang khi leo lên
}

const f = n => Math.round(n * 10) / 10;
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------------------------------------------------------------- màu phòng
const T = {
  sapphire: ['#2f428f', '#1b2459', '#121846'],
  ruby:     ['#99213f', '#5e1029', '#3b0a1a'],
  emerald:  ['#1a7058', '#0e4033', '#082a22'],
  amethyst: ['#64389d', '#3c1f67', '#26124a'],
  rose:     ['#b23c6e', '#702145', '#4a1330'],
  ocean:    ['#2468a0', '#134268', '#0b2b47'],
  plum:     ['#7a2a80', '#47154d', '#2d0a31'],
  night:    ['#3c1f7a', '#1f1049', '#150a33'],
};

const heart = (x, y, s, fill, extra = '') =>
  `<path transform="translate(${f(x)} ${f(y)}) scale(${s})" d="M0 6 C-10 -2 -9 -9 -4.5 -9 C-2 -9 0 -7 0 -5 C0 -7 2 -9 4.5 -9 C9 -9 10 -2 0 6Z" fill="${fill}" ${extra}/>`;

// ============================================================== BẦU TRỜI ====
export function buildSky() {
  const R = rng(11);
  let stars = '';
  for (let i = 0; i < 170; i++) {
    const x = -1400 + R() * 4400, y = -1100 + R() * 1650, r = 0.7 + R() * 1.7, tw = R() < 0.4;
    stars += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${R() < 0.2 ? '#ffd9ec' : '#fff'}" opacity="${f(0.45 + R() * 0.55)}"${tw ? ` class="cstar" style="animation-delay:-${f(R() * 3)}s"` : ''}/>`;
  }
  const ridge = (seed, base, amp, step, x0 = -1500, x1 = 3100) => {
    const r = rng(seed); let d = `M${x0} 900 L${x0} ${base}`;
    for (let x = x0; x <= x1; x += step) d += ` L${x + step * 0.5} ${f(base - amp * (0.25 + r() * 0.75))} L${x + step} ${f(base - amp * r() * 0.35)}`;
    return d + ` L${x1} 900Z`;
  };
  const hills = (seed, base, amp, step) => {
    const r = rng(seed); let d = `M-1500 900 L-1500 ${base}`;
    for (let x = -1500; x < 3100; x += step) d += ` Q${x + step / 2} ${f(base - amp * (0.3 + r() * 0.7))} ${x + step} ${f(base - amp * r() * 0.25)}`;
    return d + ' L3100 900Z';
  };
  let clouds = '';
  [[-300, 300, 1], [200, 160, 0.8], [900, 250, 1.2], [1500, 120, 0.9], [2000, 330, 1.1], [-800, 150, 1.0], [560, 470, 0.9], [1180, 520, 1]].forEach(([x, y, s], i) => {
    const c = i % 2 ? 'rgba(255,176,210,.2)' : 'rgba(190,150,255,.17)';
    clouds += `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><ellipse cx="0" cy="0" rx="150" ry="22"/><ellipse cx="-70" cy="-14" rx="70" ry="22"/><ellipse cx="40" cy="-22" rx="86" ry="26"/><ellipse cx="110" cy="-6" rx="60" ry="18"/></g>`;
  });
  let lights = ''; const rl = rng(5);
  for (let i = 0; i < 46; i++) { const x = -1300 + rl() * 4200; lights += `<circle cx="${f(x)}" cy="${f(836 + rl() * 40)}" r="${f(1 + rl() * 1.1)}" fill="#ffe3a3" opacity="${f(.5 + rl() * .5)}"/>`; }

  return `<svg class="csky" viewBox="-1500 -1200 4600 2400" xmlns="http://www.w3.org/2000/svg">
<defs>
 <linearGradient id="skG" gradientUnits="userSpaceOnUse" x1="0" y1="-1200" x2="0" y2="885">
  <stop offset="0" stop-color="#090520"/><stop offset=".5" stop-color="#1d0e4a"/><stop offset=".72" stop-color="#4a1c78"/>
  <stop offset=".86" stop-color="#96367e"/><stop offset=".95" stop-color="#e0607f"/><stop offset="1" stop-color="#ffb08a"/>
 </linearGradient>
 <radialGradient id="moonHalo"><stop offset="0" stop-color="#fff3d6" stop-opacity=".55"/><stop offset=".4" stop-color="#ffd5ec" stop-opacity=".18"/><stop offset="1" stop-color="#ffd5ec" stop-opacity="0"/></radialGradient>
 <linearGradient id="moonG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf2"/><stop offset="1" stop-color="#f3dcc0"/></linearGradient>
 <linearGradient id="mtFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4a9c"/><stop offset="1" stop-color="#3a2268"/></linearGradient>
 <linearGradient id="mtNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46277c"/><stop offset="1" stop-color="#1c1040"/></linearGradient>
</defs>
<rect x="-1500" y="-1200" width="4600" height="2090" fill="url(#skG)"/>
${stars}
<circle cx="1290" cy="170" r="190" fill="url(#moonHalo)"/>
<circle cx="1290" cy="170" r="56" fill="url(#moonG)"/>
<circle cx="1272" cy="156" r="9" fill="#e6cfb4" opacity=".55"/><circle cx="1310" cy="188" r="12" fill="#e6cfb4" opacity=".45"/><circle cx="1300" cy="144" r="5" fill="#e6cfb4" opacity=".5"/>
${clouds}
<path d="${ridge(3, 760, 210, 120)}" fill="url(#mtFar)" opacity=".9"/>
<path d="${ridge(9, 820, 130, 90)}" fill="url(#mtNear)"/>
${lights}
<path d="${hills(21, 868, 46, 210)}" fill="#190d38"/>
</svg>`;
}

// =============================================================== LÂU ĐÀI ====
function defs() {
  const th = Object.entries(T).map(([k, [a, b]]) =>
    `<linearGradient id="rt-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient>`).join('');
  const gold = (id, dir) => `<linearGradient id="${id}" x1="0" y1="0" x2="${dir ? 1 : 0}" y2="${dir ? 0 : 1}"><stop offset="0" stop-color="#fff3b4"/><stop offset=".45" stop-color="#f1c452"/><stop offset=".8" stop-color="#c58a25"/><stop offset="1" stop-color="#f5d57c"/></linearGradient>`;
  return `<defs>${th}
${gold('cGold', 0)}${gold('cGoldH', 1)}
<linearGradient id="cStoneSh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f7e8ca"/><stop offset=".55" stop-color="#d9c096"/><stop offset="1" stop-color="#9a7e5c"/></linearGradient>
<linearGradient id="cStoneWall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b79a73"/><stop offset=".5" stop-color="#e8d3ad"/><stop offset="1" stop-color="#b79a73"/></linearGradient>
<linearGradient id="cSlab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eed9b1"/><stop offset="1" stop-color="#a98c63"/></linearGradient>
<linearGradient id="cUnder" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0a2a" stop-opacity=".6"/><stop offset="1" stop-color="#1a0a2a" stop-opacity="0"/></linearGradient>
<linearGradient id="cFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f2318"/><stop offset="1" stop-color="#a06a3c"/></linearGradient>
<linearGradient id="cShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05000f" stop-opacity=".6"/><stop offset=".5" stop-color="#05000f" stop-opacity=".05"/><stop offset="1" stop-color="#05000f" stop-opacity=".2"/></linearGradient>
<radialGradient id="cWarm"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".6"/><stop offset=".6" stop-color="#ffb877" stop-opacity=".13"/><stop offset="1" stop-color="#ffb877" stop-opacity="0"/></radialGradient>
<radialGradient id="cFlame"><stop offset="0" stop-color="#fff2c0" stop-opacity=".95"/><stop offset=".25" stop-color="#ffc766" stop-opacity=".5"/><stop offset="1" stop-color="#ff9a44" stop-opacity="0"/></radialGradient>
<radialGradient id="cPinkGlow"><stop offset="0" stop-color="#ffd0e4" stop-opacity=".9"/><stop offset=".35" stop-color="#ff7fb0" stop-opacity=".45"/><stop offset="1" stop-color="#ff5c92" stop-opacity="0"/></radialGradient>
<linearGradient id="cGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1052"/><stop offset=".55" stop-color="#6a2f86"/><stop offset="1" stop-color="#f4a3a0"/></linearGradient>
<linearGradient id="cGlassWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#ff9f5a"/></linearGradient>
<linearGradient id="cVelvet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7d0f32"/><stop offset=".5" stop-color="#d9305a"/><stop offset="1" stop-color="#6a0b2a"/></linearGradient>
<linearGradient id="cRoof" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a82ff"/><stop offset=".5" stop-color="#5a46d0"/><stop offset="1" stop-color="#2c2380"/></linearGradient>
<linearGradient id="cRoofPink" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffa6cb"/><stop offset=".5" stop-color="#d8508c"/><stop offset="1" stop-color="#7c2766"/></linearGradient>
<linearGradient id="cMarble" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d4c8b2"/><stop offset=".4" stop-color="#fffaf0"/><stop offset="1" stop-color="#bba98c"/></linearGradient>
<linearGradient id="cWoodD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b3220"/><stop offset=".5" stop-color="#8a5535"/><stop offset="1" stop-color="#4a2818"/></linearGradient>
<linearGradient id="cEarth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#442a52"/><stop offset=".5" stop-color="#27163b"/><stop offset="1" stop-color="#130924"/></linearGradient>
<linearGradient id="cGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fc08a"/><stop offset="1" stop-color="#2f7a62"/></linearGradient>
<linearGradient id="cShaft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0c0526" stop-opacity=".78"/><stop offset=".5" stop-color="#2a1560" stop-opacity=".55"/><stop offset="1" stop-color="#0c0526" stop-opacity=".78"/></linearGradient>
<linearGradient id="cCrystal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd0e4"/><stop offset=".5" stop-color="#ff5c92"/><stop offset="1" stop-color="#b3205f"/></linearGradient>
<radialGradient id="cBall" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fffbe0"/><stop offset=".4" stop-color="#f4c94f"/><stop offset=".8" stop-color="#c58a25"/><stop offset="1" stop-color="#7a4a10"/></radialGradient>
<linearGradient id="cStringer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbeed8"/><stop offset=".35" stop-color="#ecd3c0"/><stop offset=".75" stop-color="#cfa6a8"/><stop offset="1" stop-color="#a97d92"/></linearGradient>
<linearGradient id="cStrShL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a2a5c" stop-opacity=".42"/><stop offset=".55" stop-color="#4a2a5c" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient>
<linearGradient id="cStrShR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#4a2a5c" stop-opacity=".42"/><stop offset=".55" stop-color="#4a2a5c" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient>
<linearGradient id="cRailRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3153f"/><stop offset="1" stop-color="#5e0a26"/></linearGradient>
<linearGradient id="cStep" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e6c6"/><stop offset="1" stop-color="#cdb085"/></linearGradient>
<clipPath id="cStairClip"><rect x="-300" y="-300" width="2200" height="${LV[0] + 300}"/></clipPath>
<pattern id="cpStone" width="48" height="24" patternUnits="userSpaceOnUse">
 <path d="M0 .5H48M0 12.5H48M24 .5V12.5M0 12.5V24M48 12.5V24" stroke="#5a4028" stroke-opacity=".3" stroke-width="1.2" fill="none"/>
 <path d="M0 1.7H48M0 13.7H48" stroke="#fff" stroke-opacity=".22" stroke-width="1" fill="none"/>
</pattern>
<pattern id="cpDamask" width="36" height="36" patternUnits="userSpaceOnUse">
 <path d="M18 2 L34 18 L18 34 L2 18Z" fill="none" stroke="#fff" stroke-opacity=".11" stroke-width="1.2"/>
 <path d="M18 24 C10 18 10 11 14.5 11 C16.5 11 18 12.5 18 14 C18 12.5 19.5 11 21.5 11 C26 11 26 18 18 24Z" fill="#fff" fill-opacity=".1"/>
 <circle cx="0" cy="0" r="1.8" fill="#fff" fill-opacity=".13"/><circle cx="36" cy="0" r="1.8" fill="#fff" fill-opacity=".13"/><circle cx="0" cy="36" r="1.8" fill="#fff" fill-opacity=".13"/><circle cx="36" cy="36" r="1.8" fill="#fff" fill-opacity=".13"/>
</pattern>
<pattern id="cpTile" width="14" height="10" patternUnits="userSpaceOnUse">
 <path d="M0 10 A7 7 0 0 1 14 10 M-7 5 A7 7 0 0 1 7 5 M7 5 A7 7 0 0 1 21 5" stroke="#1a0a40" stroke-opacity=".35" stroke-width="1.1" fill="none"/>
</pattern>
<pattern id="cpPlank" width="46" height="14" patternUnits="userSpaceOnUse">
 <path d="M0 0V14M23 0V14" stroke="#1d0c06" stroke-opacity=".35" stroke-width="1"/><path d="M0 7H46" stroke="#fff" stroke-opacity=".07"/>
</pattern>
</defs>`;
}

// ------------------------------------------------------------ cấu kiện nhỏ ----
function room(x1, x2, l, th) {
  const t = roomTop(l), fb = LV[l] - BAND, h = fb - t, w = x2 - x1, cx = (x1 + x2) / 2;
  let s = `<rect x="${x1}" y="${t}" width="${w}" height="${h}" fill="url(#rt-${th})"/>`;
  s += `<rect x="${x1}" y="${t}" width="${w}" height="${h}" fill="url(#cpDamask)"/>`;
  s += `<rect x="${x1}" y="${t}" width="${w}" height="${h}" fill="url(#cShade)"/>`;
  s += `<ellipse cx="${cx}" cy="${f(t + h * 0.62)}" rx="${f(w * 0.62)}" ry="${f(h * 0.8)}" fill="url(#cWarm)"/>`;
  s += `<rect x="${x1}" y="${fb - 34}" width="${w}" height="34" fill="${T[th][2]}"/>`;
  for (let px = x1 + 5; px + 34 < x2; px += 42) s += `<rect x="${px}" y="${fb - 29}" width="34" height="23" rx="2" fill="none" stroke="#f1c452" stroke-opacity=".4" stroke-width="1.2"/>`;
  s += `<rect x="${x1}" y="${fb - 37}" width="${w}" height="4" fill="url(#cGoldH)"/>`;
  s += `<rect x="${x1}" y="${t}" width="${w}" height="7" fill="url(#cGoldH)"/><rect x="${x1}" y="${t + 7}" width="${w}" height="6" fill="#05000f" opacity=".28"/>`;
  for (let px = x1 + 4; px < x2 - 6; px += 12) s += `<rect x="${px}" y="${t + 7}" width="6" height="4" fill="#f1c452" opacity=".75"/>`;
  return s;
}
function floorBand(x1, x2, l, carpet) {
  const y = LV[l] - BAND, w = x2 - x1;
  let s = `<rect x="${x1}" y="${y}" width="${w}" height="${BAND}" fill="url(#cFloor)"/><rect x="${x1}" y="${y}" width="${w}" height="${BAND}" fill="url(#cpPlank)"/>`;
  s += `<rect x="${x1}" y="${y}" width="${w}" height="2.4" fill="#1d0c06" opacity=".55"/>`;
  if (carpet) {
    const cx1 = x1 + 12, cw = w - 24;
    s += `<rect x="${cx1}" y="${y + 2.5}" width="${cw}" height="${BAND - 3.5}" fill="${carpet}"/>`;
    s += `<rect x="${cx1}" y="${y + 2.5}" width="${cw}" height="${BAND - 3.5}" fill="none" stroke="#f1c452" stroke-width="1.3"/>`;
    s += `<path d="M${cx1} ${y + 8.2}H${cx1 + cw}" stroke="#f1c452" stroke-opacity=".5" stroke-dasharray="4 5"/>`;
  }
  return s;
}
function slab(x1, x2, l) {
  const y = LV[l], w = x2 - x1;
  return `<rect x="${x1}" y="${y}" width="${w}" height="${SLAB}" fill="url(#cSlab)"/><rect x="${x1}" y="${y}" width="${w}" height="${SLAB}" fill="url(#cpStone)" opacity=".55"/>` +
    `<rect x="${x1}" y="${y}" width="${w}" height="3" fill="url(#cGoldH)"/><rect x="${x1}" y="${y + SLAB}" width="${w}" height="18" fill="url(#cUnder)"/>`;
}
function pilaster(x, l) {
  const t = roomTop(l), fb = LV[l] - BAND;
  let s = `<rect x="${x - 9}" y="${t}" width="18" height="${fb - t}" fill="url(#cMarble)"/>`;
  for (let i = -5; i <= 5; i += 5) s += `<path d="M${x + i} ${t + 12}V${fb - 10}" stroke="#7a6a50" stroke-opacity=".3" stroke-width="1.1"/>`;
  s += `<rect x="${x - 12}" y="${t + 6}" width="24" height="8" rx="2" fill="url(#cGoldH)"/><rect x="${x - 12}" y="${fb - 9}" width="24" height="9" rx="2" fill="url(#cGoldH)"/>`;
  return s;
}
function chandelier(cx, y, s = 1, col = '#ffd36b') {
  let o = `<circle cx="${cx}" cy="${f(y + 20 * s)}" r="${f(50 * s)}" fill="url(#cFlame)" class="glowp"/>`;
  o += `<line x1="${cx}" y1="${y}" x2="${cx}" y2="${f(y + 18 * s)}" stroke="#c58a25" stroke-width="${f(2 * s)}"/>`;
  o += `<ellipse cx="${cx}" cy="${f(y + 24 * s)}" rx="${f(27 * s)}" ry="${f(5 * s)}" fill="none" stroke="url(#cGoldH)" stroke-width="${f(3.4 * s)}"/>`;
  o += `<path d="M${f(cx - 6 * s)} ${f(y + 16 * s)} Q${cx} ${f(y + 30 * s)} ${f(cx + 6 * s)} ${f(y + 16 * s)}Z" fill="url(#cGold)"/>`;
  for (let i = -2; i <= 2; i++) {
    const px = cx + i * 11 * s;
    o += `<rect x="${f(px - 1.8 * s)}" y="${f(y + 14 * s)}" width="${f(3.6 * s)}" height="${f(10 * s)}" fill="#fff7e0"/>`;
    o += `<ellipse class="flame" cx="${f(px)}" cy="${f(y + 10.5 * s)}" rx="${f(2.5 * s)}" ry="${f(4.2 * s)}" fill="${col}"/>`;
  }
  for (const i of [-18, -9, 0, 9, 18]) o += `<path d="M${f(cx + i * s)} ${f(y + 29 * s)} l${f(2.3 * s)} ${f(5.5 * s)} l${f(-2.3 * s)} ${f(5.5 * s)} l${f(-2.3 * s)} ${f(-5.5 * s)}Z" fill="#d6ecff" opacity=".92"/>`;
  return o;
}
function sconce(x, y) {
  return `<circle cx="${x}" cy="${y - 6}" r="34" fill="url(#cFlame)" class="glowp"/>` +
    `<path d="M${x - 8} ${y + 17} Q${x} ${y + 3} ${x + 8} ${y + 17}Z" fill="url(#cGold)"/><rect x="${x - 3.5}" y="${y - 1}" width="7" height="12" rx="1.5" fill="#fff4d2"/>` +
    `<ellipse class="flame" cx="${x}" cy="${y - 6}" rx="3.2" ry="6" fill="#ffcf66"/><rect x="${x - 2.5}" y="${y + 15}" width="5" height="5" fill="#c58a25"/>`;
}
function candelabra(x, l) {
  const yb = LV[l] - BAND + 3;
  let o = `<circle cx="${x}" cy="${yb - 56}" r="40" fill="url(#cFlame)" class="glowp"/>`;
  o += `<path d="M${x - 10} ${yb}L${x + 10} ${yb}L${x + 5} ${yb - 9}L${x - 5} ${yb - 9}Z" fill="url(#cGold)"/><rect x="${x - 1.7}" y="${yb - 54}" width="3.4" height="46" fill="url(#cGold)"/>`;
  o += `<path d="M${x - 15} ${yb - 50}Q${x - 15} ${yb - 38} ${x} ${yb - 38}Q${x + 15} ${yb - 38} ${x + 15} ${yb - 50}" fill="none" stroke="#e5ae3f" stroke-width="2.4"/>`;
  for (const [cx, cy] of [[x - 15, yb - 50], [x, yb - 55], [x + 15, yb - 50]])
    o += `<rect x="${cx - 2}" y="${cy - 9}" width="4" height="9" fill="#fff7e0"/><ellipse class="flame" cx="${cx}" cy="${cy - 12}" rx="2.4" ry="4.6" fill="#ffd36b"/>`;
  return o;
}
function windowArch(cx, l, w, h) {
  const fb = LV[l] - BAND - 30, x = cx - w / 2, yt = fb - h, r = w / 2;
  const p = `M${x} ${fb}V${yt + r}A${r} ${r} 0 0 1 ${x + w} ${yt + r}V${fb}Z`;
  let s = `<path d="${p}" fill="url(#cGlass)"/>`;
  s += `<circle cx="${f(x + w * .66)}" cy="${f(yt + r + 4)}" r="6" fill="#fff6d8"/>`;
  [[.25, .1], [.5, -.4], [.3, .5], [.78, .55], [.15, .9]].forEach(([a, b]) => s += `<circle cx="${f(x + w * a)}" cy="${f(yt + r + b * (h - r) * .6 + 8)}" r="1.2" fill="#fff"/>`);
  s += `<path d="M${cx} ${yt}V${fb}M${x} ${f(yt + h * .55)}H${x + w}" stroke="#e5ae3f" stroke-width="2"/><path d="${p}" fill="none" stroke="url(#cGold)" stroke-width="5"/>`;
  s += `<rect x="${x - 6}" y="${fb}" width="${w + 12}" height="6" rx="2" fill="url(#cGoldH)"/>`;
  s += `<path d="M${x - 10} ${yt + r - 4}C${x + 6} ${yt + r + 8} ${x + 14} ${yt + r + 34} ${x + 10} ${fb + 24}L${x - 10} ${fb + 24}Z" fill="url(#cVelvet)"/>`;
  s += `<path d="M${x + w + 10} ${yt + r - 4}C${x + w - 6} ${yt + r + 8} ${x + w - 14} ${yt + r + 34} ${x + w - 10} ${fb + 24}L${x + w + 10} ${fb + 24}Z" fill="url(#cVelvet)"/>`;
  s += `<circle cx="${x + 3}" cy="${f(yt + h * .62)}" r="3.5" fill="url(#cGold)"/><circle cx="${x + w - 3}" cy="${f(yt + h * .62)}" r="3.5" fill="url(#cGold)"/>`;
  return s;
}
function tapestry(x, y, w, h, c1, c2) {
  let s = `<rect x="${x - w / 2 - 5}" y="${y}" width="${w + 10}" height="4" rx="2" fill="url(#cGoldH)"/><circle cx="${x - w / 2 - 5}" cy="${y + 2}" r="3.2" fill="url(#cGold)"/><circle cx="${x + w / 2 + 5}" cy="${y + 2}" r="3.2" fill="url(#cGold)"/>`;
  const p = `M${x - w / 2} ${y + 4}H${x + w / 2}V${y + h}L${x} ${y + h - 13}L${x - w / 2} ${y + h}Z`;
  s += `<path d="${p}" fill="${c1}"/><path d="${p}" fill="url(#cpDamask)"/><path d="${p}" fill="none" stroke="url(#cGold)" stroke-width="2"/>`;
  s += `<path d="M${x - w / 2 + 5} ${y + 10}H${x + w / 2 - 5}V${y + h - 12}L${x} ${y + h - 22}L${x - w / 2 + 5} ${y + h - 12}Z" fill="none" stroke="${c2}" stroke-width="1.4" stroke-dasharray="3 3"/>`;
  s += heart(x, y + h * 0.42, w / 26, 'url(#cGold)') + `<circle cx="${x}" cy="${y + h * 0.42 - 14}" r="2" fill="#fff6c8"/>`;
  return s;
}
function painting(x, y, w, h, hue) {
  return `<rect x="${x - w / 2 - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" rx="3" fill="url(#cGold)"/><rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" fill="hsl(${hue} 55% 28%)"/>` +
    `<ellipse cx="${x}" cy="${y + h * .5}" rx="${w * .32}" ry="${h * .36}" fill="hsl(${hue} 60% 62%)" opacity=".55"/>` + heart(x, y + h * .5, w / 22, '#ff7fae') +
    `<rect x="${x - 8}" y="${y + h + 5}" width="16" height="4" rx="1" fill="url(#cGoldH)"/>`;
}
function clock(x, l) {
  const yb = LV[l] - BAND;
  return `<rect x="${x - 21}" y="${yb - 104}" width="42" height="104" rx="3" fill="url(#cWoodD)"/><path d="M${x - 24} ${yb - 100}Q${x} ${yb - 122} ${x + 24} ${yb - 100}Z" fill="url(#cWoodD)" stroke="url(#cGold)" stroke-width="2"/>` +
    `<circle cx="${x}" cy="${yb - 84}" r="14" fill="#fff6dc" stroke="url(#cGold)" stroke-width="2.4"/><path d="M${x} ${yb - 84}V${yb - 93}M${x} ${yb - 84}L${x + 7} ${yb - 80}" stroke="#4a2a18" stroke-width="1.6" stroke-linecap="round"/>` +
    `<rect x="${x - 13}" y="${yb - 62}" width="26" height="48" rx="2" fill="#1b0b12" stroke="#d89b2c" stroke-width="1.6"/>` +
    `<g class="pend"><line x1="${x}" y1="${yb - 60}" x2="${x}" y2="${yb - 28}" stroke="#e5ae3f" stroke-width="1.5"/><circle cx="${x}" cy="${yb - 26}" r="6" fill="url(#cGold)"/></g>`;
}
function fountain(x, l) {
  const yb = LV[l] - BAND + 3;
  return `<circle cx="${x}" cy="${yb - 66}" r="62" fill="url(#cPinkGlow)" class="glowp"/>` +
    `<ellipse cx="${x}" cy="${yb - 6}" rx="52" ry="10" fill="#efe0c6" stroke="url(#cGold)" stroke-width="2.5"/><ellipse cx="${x}" cy="${yb - 8}" rx="43" ry="6.5" fill="#8fd8ff" opacity=".85"/>` +
    `<rect x="${x - 7}" y="${yb - 42}" width="14" height="34" fill="url(#cMarble)"/><ellipse cx="${x}" cy="${yb - 44}" rx="24" ry="5.5" fill="url(#cMarble)" stroke="url(#cGold)" stroke-width="1.6"/>` +
    heart(x, yb - 66, 2.5, 'url(#cCrystal)') + `<path d="M${x - 9} ${yb - 76}q3 -5 8 -4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"/>` +
    `<path class="water" d="M${x - 2} ${yb - 52}Q${x - 26} ${yb - 52} ${x - 34} ${yb - 12}M${x + 2} ${yb - 52}Q${x + 26} ${yb - 52} ${x + 34} ${yb - 12}" stroke="#d3f0ff" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
}
function plant(x, l, flower = '#ff8fb8') {
  const yb = LV[l] - BAND + 3;
  return `<path d="M${x - 9} ${yb - 15}H${x + 9}L${x + 6} ${yb}H${x - 6}Z" fill="url(#cGold)"/><ellipse cx="${x - 7}" cy="${yb - 24}" rx="5" ry="10" fill="#2e8a63" transform="rotate(-24 ${x - 7} ${yb - 24})"/>` +
    `<ellipse cx="${x + 7}" cy="${yb - 24}" rx="5" ry="10" fill="#37a173" transform="rotate(24 ${x + 7} ${yb - 24})"/><ellipse cx="${x}" cy="${yb - 28}" rx="5" ry="11" fill="#2e8a63"/>` +
    `<circle cx="${x - 3}" cy="${yb - 36}" r="3.6" fill="${flower}"/><circle cx="${x + 5}" cy="${yb - 31}" r="3.2" fill="#fff0f6"/>`;
}
function keystoneHeart(x, y) { return heart(x, y, 1.1, 'url(#cCrystal)'); }

// =========================================================== CẦU THANG XOẮN ỐC ====
// Vẽ làm 3 lớp để nhân vật đi "vòng quanh" cột trụ:
//   • stairBack  (trong tranh nền)  – nửa vòng phía SAU: bậc thảm đỏ + lan can nhìn từ bên trong
//   • stairFront (lớp z=4)          – cột trụ giữa + nửa vòng phía TRƯỚC: bậc + dải đá ốp ngoài
//   • stairRail  (lớp z=6)          – lan can nửa vòng phía trước + các trụ đầu bậc có quả cầu vàng
// Nhân vật (z=5) đi giữa lớp 2 và lớp 3; khi ra phía sau cột thì chuyển xuống z=1.
const pstr = pts => pts.map(p => `${f(p[0])},${f(p[1])}`).join(' ');
const poly = (pts, attr) => `<polygon points="${pstr(pts)}" ${attr}/>`;
const pline = (pts, attr) => `<polyline points="${pstr(pts)}" fill="none" ${attr}/>`;
const rise = (pts, dy) => pts.map(p => [p[0], p[1] + dy]);
const rev = pts => pts.slice().reverse();
const DEG = Math.PI / 180;

// các nửa vòng: k chẵn = nửa trước (sin φ > 0), k lẻ = nửa sau
const halves = front => Array.from({ length: TURNS * 2 }, (_, k) => k).filter(k => (k % 2 === 0) === front).map(k => [k * Math.PI, (k + 1) * Math.PI]);
function samples(a, ph0, ph1, stepDeg = 3) {
  const n = Math.max(2, Math.round((ph1 - ph0) / (stepDeg * DEG))), out = [];
  for (let j = 0; j <= n; j++) { const ph = ph0 + (ph1 - ph0) * j / n; out.push([...proj(a, ridgeY(ph), R_OUT, ph), ph]); }
  return out;
}

// các bậc thang (mặt đá + thảm đỏ + gờ bậc), vẽ từ xa tới gần
function stairSteps(a, front) {
  const items = [];
  for (let i = 0; i < STEPS; i++) {
    const pa = TAU * i / N_STEP, pb = TAU * (i + 1) / N_STEP, z = Math.sin((pa + pb) / 2);
    if ((z >= 0) === front) items.push([z, i, pa, pb]);
  }
  items.sort((p, q) => p[0] - q[0]);
  return items.map(([, i, pa, pb]) => {
    const H = stepY(i), Hp = i ? stepY(i - 1) : LV[0], ro = R_OUT - 1.5;
    let s = '';
    if (Math.cos(pa) < 0) {          // gờ bậc quay về phía người xem
      s += poly([proj(a, Hp, R_IN, pa), proj(a, Hp, ro, pa), proj(a, H, ro, pa), proj(a, H, R_IN, pa)], 'fill="#7a1131" stroke="#4a0a1e" stroke-width=".5"');
    }
    s += poly([proj(a, H, R_IN, pa), proj(a, H, ro, pa), proj(a, H, ro, pb), proj(a, H, R_IN, pb)], 'fill="url(#cStep)" stroke="#a98c63" stroke-width=".6"');
    s += poly([proj(a, H, 15, pa), proj(a, H, ro - 5, pa), proj(a, H, ro - 5, pb), proj(a, H, 15, pb)], 'fill="#c8173f" stroke="#7d0f2e" stroke-width=".5"');
    const n0 = proj(a, H, 15, pa), n1 = proj(a, H, ro - 5, pa);
    s += `<path d="M${f(n0[0])} ${f(n0[1])}L${f(n1[0])} ${f(n1[1])}" stroke="#ffe7a0" stroke-width="1.2" stroke-linecap="round" opacity=".9"/>`;
    return s;
  }).join('');
}

// lan can vàng: nền đỏ + dây hoa vàng đan nhau + con tiện + ngọc lục bảo + tay vịn
function railBlock(a, ph0, ph1, back) {
  const sm = samples(a, ph0, ph1), base = sm.map(q => [q[0], q[1]]), top = rise(base, -RAIL_H);
  let s = poly([...top, ...rev(base)], 'fill="url(#cRailRed)"');
  const lace = sg => sm.map(q => [q[0], q[1] - RAIL_H / 2 + sg * 3.8 * Math.sin(q[2] * 10)]);
  s += pline(lace(1), 'stroke="#f1c452" stroke-width="1.25" stroke-linecap="round"') + pline(lace(-1), 'stroke="#f1c452" stroke-width="1.25" stroke-linecap="round"');
  let lastX = -1e9, k = 0;
  sm.forEach((q, j) => {
    if (j % 3 || Math.abs(q[0] - lastX) < 3.2) return;
    lastX = q[0];
    s += `<line x1="${f(q[0])}" y1="${f(q[1] - RAIL_H)}" x2="${f(q[0])}" y2="${f(q[1])}" stroke="#f6d36e" stroke-width="1.5"/>`;
    s += k++ % 2 ? `<circle cx="${f(q[0])}" cy="${f(q[1] - RAIL_H / 2)}" r="1.9" fill="#f6d36e"/>` : `<circle cx="${f(q[0])}" cy="${f(q[1] - RAIL_H / 2)}" r="2.5" fill="#25c994" stroke="#fff3b4" stroke-width=".8"/>`;
  });
  if (back) s += poly([...top, ...rev(base)], 'fill="#12041f" opacity=".2"');
  s += pline(base, 'stroke="#7a4a10" stroke-width="4.2" stroke-linecap="round"') + pline(base, 'stroke="#e5ae3f" stroke-width="2.6" stroke-linecap="round"');
  s += pline(top, 'stroke="#7a4a10" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"') + pline(top, 'stroke="#f4cc62" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"');
  s += pline(rise(top, -1.1), 'stroke="#fff6c8" stroke-width="1.2" stroke-linecap="round" opacity=".9"');
  return s;
}

// dải đá ốp ngoài (mặt ngoài của thân cầu thang) – nửa vòng phía trước
function stringerBand(a, ph0, ph1) {
  const base = samples(a, ph0, ph1).map(q => [q[0], q[1]]), bot = rise(base, BAND_H), shape = [...base, ...rev(bot)];
  let s = poly(shape, 'fill="url(#cStringer)"') + poly(shape, `fill="url(#${a.s > 0 ? 'cStrShL' : 'cStrShR'})"`);
  s += pline(rise(base, 8), 'stroke="#d9a63e" stroke-width="1.8" stroke-dasharray="1.8 3.4" stroke-linecap="round"');
  s += pline(rise(base, 15), 'stroke="#c58a25" stroke-width=".9" opacity=".7"');
  s += pline(rise(base, 1.4), 'stroke="#fff3b4" stroke-width="1.2" opacity=".75"');
  s += pline(bot, 'stroke="#7a4a10" stroke-width="3.6"') + pline(bot, 'stroke="#f0c456" stroke-width="2.2"');
  for (const p of [base[0], base[base.length - 1]]) s += `<line x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(p[0])}" y2="${f(p[1] + BAND_H)}" stroke="#e5ae3f" stroke-width="2"/>`;
  return s;
}

function newel(x, yb, h, w) {
  return `<rect x="${f(x - w - 3.5)}" y="${f(yb - 8)}" width="${f(2 * w + 7)}" height="8" rx="2" fill="url(#cGoldH)" stroke="#7a4a10" stroke-width=".7"/>` +
    `<rect x="${f(x - w / 2)}" y="${f(yb - h)}" width="${w}" height="${f(h - 7)}" fill="url(#cMarble)" stroke="#9c8a6a" stroke-width=".6"/>` +
    `<rect x="${f(x - w / 2 - 2.2)}" y="${f(yb - h + 6)}" width="${f(w + 4.4)}" height="4.2" rx="1.6" fill="url(#cGoldH)" stroke="#7a4a10" stroke-width=".6"/>` +
    `<circle cx="${x}" cy="${f(yb - h)}" r="${f(w * 0.82)}" fill="url(#cBall)" stroke="#7a4a10" stroke-width=".8"/><circle cx="${f(x - w * 0.28)}" cy="${f(yb - h - w * 0.3)}" r="${f(w * 0.2)}" fill="#fff" opacity=".85"/>`;
}

function column(a) {
  const x = a.cx, top = LV[3] - 62, bot = LV[0];
  let s = `<rect x="${x - R_IN}" y="${top}" width="${R_IN * 2}" height="${bot - top}" fill="url(#cMarble)"/>`;
  for (const d of [-4.5, 0, 4.5]) s += `<path d="M${x + d} ${top + 10}V${bot - 14}" stroke="#7a6a50" stroke-opacity=".28" stroke-width=".9"/>`;
  for (let l = 0; l < 4; l++) s += `<rect x="${x - 11.5}" y="${LV[l] - 26}" width="23" height="6" rx="2" fill="url(#cGoldH)" stroke="#7a4a10" stroke-width=".6"/>`;
  s += `<rect x="${x - 14}" y="${bot - 13}" width="28" height="13" rx="2" fill="url(#cGoldH)" stroke="#7a4a10" stroke-width=".7"/>`;
  s += `<rect x="${x - 13}" y="${top}" width="26" height="8" rx="2.5" fill="url(#cGoldH)" stroke="#7a4a10" stroke-width=".7"/><rect x="${x - 3}" y="${top - 6}" width="6" height="8" fill="url(#cGold)"/>`;
  s += `<circle cx="${x}" cy="${top - 11}" r="9" fill="url(#cBall)" stroke="#7a4a10" stroke-width=".9"/><circle cx="${x - 3}" cy="${top - 14}" r="2.4" fill="#fff" opacity=".85"/>`;
  return s;
}

function stairBack(a) {
  let s = stairSteps(a, false);
  halves(false).forEach(([p0, p1]) => s += railBlock(a, p0, p1, true));
  return s;
}
export function buildStairsFront() {
  let s = `<svg class="cwalls cst-a" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">`;
  STAIRS.forEach(a => {
    s += column(a) + stairSteps(a, true);
    s += `<g clip-path="url(#cStairClip)">` + halves(true).map(([p0, p1]) => stringerBand(a, p0, p1)).join('') + `</g>`;
  });
  return s + '</svg>';
}
export function buildStairsRail() {
  let s = `<svg class="cwalls cst-b" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">`;
  STAIRS.forEach(a => {
    halves(true).forEach(([p0, p1]) => s += railBlock(a, p0, p1, false));
    for (let l = 0; l < 4; l++) s += newel(a.cx + a.s * 15, LV[l] - 3, 34, 6) + newel(a.cx + a.s * R_OUT, LV[l] - 3, 46, 7.5);
  });
  return s + '</svg>';
}

function merlons(x1, x2, y, h, w = 22, gap = 16) {
  let s = '';
  for (let x = x1; x + w <= x2 + 0.1; x += w + gap) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#cStoneSh)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#cpStone)"/><rect x="${x}" y="${y}" width="${w}" height="3" fill="url(#cGoldH)"/>`;
  return s;
}
function flag(x, y, col = '#ff6f9c') {
  return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 38}" stroke="url(#cGold)" stroke-width="2.4"/><circle cx="${x}" cy="${y - 39}" r="3" fill="url(#cGold)"/>` +
    `<g class="flag"><path d="M${x} ${y - 36}l34 7l-8 8l8 8l-34 -4z" fill="${col}" stroke="#fff3c8" stroke-width="1"/></g>`;
}
function cone(x1, x2, yb, ya, grad = 'cRoof', fl = '#ff6f9c') {
  const cx = (x1 + x2) / 2;
  return `<path d="M${x1 - 10} ${yb}L${cx} ${ya}L${x2 + 10} ${yb}Z" fill="url(#${grad})"/><path d="M${x1 - 10} ${yb}L${cx} ${ya}L${x2 + 10} ${yb}Z" fill="url(#cpTile)"/>` +
    `<path d="M${cx} ${ya}L${x1 + (x2 - x1) * 0.42} ${yb}" stroke="#fff" stroke-opacity=".2" stroke-width="2"/>` +
    `<rect x="${x1 - 12}" y="${yb - 4}" width="${x2 - x1 + 24}" height="8" rx="3" fill="url(#cGoldH)"/>` + flag(cx, ya + 2, fl);
}
function endTower(x1, x2, mirror) {
  const top = 452, cx = (x1 + x2) / 2;
  let s = `<rect x="${x1}" y="${top}" width="${x2 - x1}" height="${LV[0] - top}" fill="url(#cStoneSh)"${mirror ? ` transform="translate(${x1 + x2} 0) scale(-1 1)"` : ''}/>`;
  s += `<rect x="${x1}" y="${top}" width="${x2 - x1}" height="${LV[0] - top}" fill="url(#cpStone)"/>`;
  for (const wy of [790, 650, 520]) {
    s += `<path d="M${cx - 12} ${wy}V${wy - 24}A12 12 0 0 1 ${cx + 12} ${wy - 24}V${wy}Z" fill="url(#cGlassWin)" stroke="url(#cGold)" stroke-width="3"/><path d="M${cx} ${wy - 38}V${wy}M${cx - 12} ${wy - 18}H${cx + 12}" stroke="#a8641e" stroke-width="1.6"/>`;
    s += `<circle cx="${cx}" cy="${wy - 16}" r="26" fill="url(#cFlame)" opacity=".5" class="glowp"/>`;
  }
  s += `<rect x="${x1 - 10}" y="${top - 12}" width="${x2 - x1 + 20}" height="14" rx="3" fill="url(#cGoldH)"/>`;
  s += `<rect x="${x1 - 6}" y="${top + 2}" width="${x2 - x1 + 12}" height="6" fill="#05000f" opacity=".25"/>`;
  s += cone(x1 - 2, x2 + 2, top - 10, 322);
  return s;
}
function blossomTree(x, s = 1) {
  let o = `<rect x="${x - 7 * s}" y="${f(885 - 62 * s)}" width="${14 * s}" height="${62 * s}" rx="4" fill="#4a2a38"/>`;
  [[-26, -78, 36], [24, -82, 38], [0, -108, 42], [-4, -70, 44], [36, -62, 28], [-38, -58, 28]].forEach(([dx, dy, r], i) => {
    o += `<circle cx="${f(x + dx * s)}" cy="${f(885 + dy * s)}" r="${f(r * s)}" fill="${i % 2 ? '#ff9fc4' : '#ffb7d3'}"/>`;
  });
  const rr = rng(Math.round(x));
  for (let i = 0; i < 16; i++) o += `<circle cx="${f(x + (rr() - .5) * 110 * s)}" cy="${f(885 - (40 + rr() * 90) * s)}" r="${f((2 + rr() * 2.4) * s)}" fill="${rr() < .5 ? '#fff0f6' : '#ff7fae'}" opacity=".85"/>`;
  return o;
}

// ---------------------------------------------------------------------------
export function buildCastle() {
  let s = `<svg class="cwalls" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">${defs()}`;

  // ---- đất & cỏ -----------------------------------------------------------
  s += `<rect x="-1500" y="880" width="4600" height="1600" fill="url(#cEarth)"/>`;
  const re = rng(31);
  for (let i = 0; i < 70; i++) { const x = -300 + re() * 2200, y = 935 + re() * 60; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + re() * 2.2)}" fill="${re() < .5 ? '#ff9fc4' : '#9fd8ff'}" opacity="${f(.25 + re() * .5)}" ${re() < .35 ? 'class="cstar"' : ''}/>`; }
  s += `<rect x="-1500" y="876" width="4600" height="16" fill="url(#cGrass)"/>`;
  s += blossomTree(34, 1.05) + blossomTree(1566, 1.05) + blossomTree(-170, .9) + blossomTree(1770, .9);
  const rf = rng(77);
  for (let i = 0; i < 46; i++) { const x = -260 + rf() * 2120; if (x > 80 && x < 1520) continue; s += `<circle cx="${f(x)}" cy="${f(878 + rf() * 5)}" r="${f(2 + rf() * 1.6)}" fill="${['#ff8fb8', '#fff0f6', '#ffd36b', '#c58bff'][i % 4]}"/>`; }

  // ---- phòng (nền tường) ------------------------------------------------------
  const rooms = [
    [190, 462, 0, 'sapphire'], [462, 1138, 0, 'ruby'], [1138, 1410, 0, 'emerald'],
    [190, 462, 1, 'amethyst'], [462, 1138, 1, 'rose'], [1138, 1410, 1, 'ocean'],
    [492, 1108, 2, 'plum'], [492, 1108, 3, 'night'],
  ];
  rooms.forEach(r => s += room(...r));
  const carpets = [[190, 462, 0, '#1d2b73'], [462, 1138, 0, '#a9142f'], [1138, 1410, 0, '#12604b'], [190, 462, 1, '#4b2a82'], [462, 1138, 1, '#9b1f52'], [1138, 1410, 1, '#18517e'], [492, 1108, 2, '#6a1d72'], [492, 1108, 3, '#4d2a96']];
  carpets.forEach(([a, b, l, c]) => s += floorBand(a, b, l, c));

  // ---- đồ nội thất / trang trí -------------------------------------------------
  // tầng 0 – Đại sảnh
  s += pilaster(462, 0) + pilaster(1138, 0) + pilaster(462, 1) + pilaster(1138, 1);
  s += windowArch(655, 0, 64, 92) + windowArch(945, 0, 64, 92);
  s += tapestry(728, 736, 40, 96, '#b4204a', '#ffd36b') + tapestry(872, 736, 40, 96, '#b4204a', '#ffd36b');
  s += fountain(800, 0) + chandelier(800, 718, 1.15);
  s += sconce(326, 770) + sconce(1274, 770);
  // tầng 1 – Phòng trưng bày
  s += windowArch(655, 1, 64, 92) + windowArch(945, 1, 64, 92);
  s += painting(728, 560, 36, 46, 330) + painting(872, 560, 36, 46, 210) + clock(800, 1) + chandelier(800, 533, .9);
  s += plant(603, 1) + plant(997, 1, '#fff0f6');
  s += sconce(326, 585) + sconce(1274, 585);
  // tầng 2 – ba cửa
  s += sconce(729, 410) + sconce(871, 410) + chandelier(800, 348, .78);
  // tầng 3 – sảnh trên cùng
  s += windowArch(650, 3, 78, 120) + windowArch(950, 3, 78, 120);
  s += candelabra(708, 3) + candelabra(892, 3) + chandelier(800, 148, 1.2, '#ffe39a');
  s += `<path d="M492 148Q640 92 800 128Q960 92 1108 148" fill="none" stroke="url(#cGold)" stroke-width="3" opacity=".6"/>`;
  s += `<path d="M492 300Q530 200 600 148M1108 300Q1070 200 1000 148" fill="none" stroke="url(#cGold)" stroke-width="2.4" opacity=".5"/>`;

  // ---- sàn (tấm đá) ------------------------------------------------------------
  s += slab(95, 1505, 0) + slab(190, 1410, 1) + slab(190, 1410, 2) + slab(462, 1138, 3);

  // ---- tường cắt của tháp chính (tầng 2-3) -------------------------------------
  [[462, 492], [1108, 1138]].forEach(([a, b]) => {
    s += `<rect x="${a}" y="108" width="30" height="${LV[2] + SLAB - 108}" fill="url(#cStoneWall)"/><rect x="${a}" y="108" width="30" height="${LV[2] + SLAB - 108}" fill="url(#cpStone)"/>`;
    s += `<rect x="${a === 462 ? a + 26 : a}" y="148" width="4" height="${LV[2] - 148}" fill="#05000f" opacity=".3"/>`;
  });
  // ---- cầu thang xoắn ốc (lớp phía sau; lớp trước + lan can nằm ở buildStairsFront / buildStairsRail) ----
  STAIRS.forEach(a => s += stairBack(a));
  // đỉnh tháp chính: sàn mái + lỗ châu mai
  s += `<rect x="462" y="130" width="676" height="18" fill="url(#cSlab)"/><rect x="462" y="130" width="676" height="18" fill="url(#cpStone)" opacity=".5"/><rect x="462" y="130" width="676" height="3" fill="url(#cGoldH)"/>`;
  s += `<rect x="462" y="148" width="676" height="16" fill="url(#cUnder)"/>`;
  s += merlons(462, 1138, 108, 22, 24, 17);
  // mái sân thượng hai cánh
  s += merlons(200, 456, 493, 22, 22, 16) + merlons(1144, 1400, 493, 22, 22, 16);
  s += endTower(95, 190, false) + endTower(1410, 1505, true);

  // mái chóp
  s += cone(462, 578, 108, 20, 'cRoof', '#ff6f9c') + cone(1022, 1138, 108, 20, 'cRoof', '#ffd36b');
  // mái vòm giữa
  s += `<path d="M652 110C652 62 724 38 800 38C876 38 948 62 948 110Z" fill="url(#cRoofPink)"/><path d="M652 110C652 62 724 38 800 38C876 38 948 62 948 110Z" fill="url(#cpTile)"/>`;
  for (const k of [-.66, -.33, 0, .33, .66]) s += `<path d="M${f(800 + k * 148)} 110C${f(800 + k * 140)} 80 ${f(800 + k * 60)} 52 800 38" fill="none" stroke="#ffe08a" stroke-opacity=".5" stroke-width="2"/>`;
  s += `<rect x="646" y="102" width="308" height="10" rx="4" fill="url(#cGoldH)"/><rect x="780" y="20" width="40" height="22" rx="4" fill="url(#cGold)"/><path d="M786 20q14 -14 28 0" fill="url(#cGold)"/>`;
  s += `<line x1="800" y1="8" x2="800" y2="22" stroke="url(#cGold)" stroke-width="3"/>` + heart(800, 10, 1.25, 'url(#cCrystal)') + `<circle cx="800" cy="6" r="20" fill="url(#cPinkGlow)" class="glowp"/>`;

  // ---- móng nhà (vòm đá) ----------------------------------------------------------
  s += `<rect x="95" y="${LV[0] + SLAB}" width="1410" height="74" fill="url(#cStoneSh)"/><rect x="95" y="${LV[0] + SLAB}" width="1410" height="74" fill="url(#cpStone)"/>`;
  for (let x = 130; x < 1480; x += 90) s += `<path d="M${x} ${LV[0] + SLAB + 74}V${LV[0] + SLAB + 36}A24 24 0 0 1 ${x + 48} ${LV[0] + SLAB + 36}V${LV[0] + SLAB + 74}Z" fill="#150a26" stroke="url(#cGold)" stroke-width="2.2"/>` + heart(x + 24, LV[0] + SLAB + 56, .8, '#ff5c92', 'opacity=".85"');
  s += `<rect x="95" y="${LV[0] + SLAB + 74}" width="1410" height="6" fill="url(#cGoldH)"/>`;
  s += '</svg>';
  return s;
}
