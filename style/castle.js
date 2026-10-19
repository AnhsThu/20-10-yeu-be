// =====================================================================
//  LÂU ĐÀI YÊU THƯƠNG – bấm vào quả cầu trung tâm để mở.
//  Điều khiển nhân vật, mở cửa, hiện lời chúc.
//
//  ✏️  MUỐN ĐỔI LỜI CHÚC / ẢNH / TÊN CỬA?  Sửa mảng DOORS ngay bên dưới.
//      • level: tầng (0 = tầng trệt … 3 = tầng trên cùng)
//      • x: vị trí cửa theo chiều ngang (đừng đổi nếu không cần)
//      • icon / title / wish / photo / color: biểu tượng, tên cửa, lời chúc, ảnh, màu ánh sáng
// =====================================================================
import { W, H, LV, BAND, LADDERS, STAIRS, PITCH, N_STEP, R_WALK, buildSky, buildCastle, buildStairsFront, buildStairsRail, stairPose } from './castle-art.js';

export const CASTLE_TITLE = 'Lâu Đài Yêu Thương';

export const DOORS = [
  // ---- Tầng 0 (trệt) ----
  { level: 0, x: 258,  icon: '🕊️', title: 'Cửa Bình Yên',    color: '#8fd3ff', photo: 'style/images/Cua 1.jpeg',
    wish: 'Chúc mọi sóng gió đều dừng lại ngoài cánh cửa này, để trong tim bé luôn có một miền bình yên' },
  { level: 0, x: 394,  icon: '🌸', title: 'Cửa Nụ Cười',     color: '#ff9ec3', photo: 'style/images/Cua 2.jpg',
    wish: 'Nụ cười của bé là điều đẹp nhất vũ trụ từng tạo ra, em bé hãy cười thật nhiều nha, anh sẽ mãi bảo vệ nụ cười ấy' },
  { level: 0, x: 1206, icon: '🍀', title: 'Cửa May Mắn',     color: '#7be0a8', photo: 'style/images/Cua 3.jpeg',
    wish: 'Chúc may mắn luôn đi cùng từng bước chân của bé' },
  { level: 0, x: 1342, icon: '🍎', title: 'Cửa Sức Khỏe',    color: '#ff8a8a', photo: 'style/images/Cua 4.jpeg',
    wish: 'Bé yêu phải giữ gìn chăm sóc sức khoẻ nhá, cố gắng khum thức khuya quá ạ' },
  // ---- Tầng 1 ----
  { level: 1, x: 258,  icon: '🌈', title: 'Cửa Ước Mơ',      color: '#c58bff', photo: 'style/images/Cua 5.jpeg',
    wish: 'Chúc mọi ước mơ của bé, dù nhỏ hay lớn, đều có một ngày trở thành hiện thực' },
  { level: 1, x: 394,  icon: '🍰', title: 'Cửa Ngọt Ngào',   color: '#ffb27a', photo: 'style/images/Cua 6.jpeg',
    wish: 'Hí hí khum có gì ngọt ngào được bằng đôi môi của bé yêu ạ' },
  { level: 1, x: 1206, icon: '🌟', title: 'Cửa Thành Công',  color: '#ffd36b', photo: 'style/images/Cua 7.jpeg',
    wish: 'Chúc em bé thi đạt điểm cao nhá' },
  { level: 1, x: 1342, icon: '✈️', title: 'Cửa Hành Trình',  color: '#6fd6ff', photo: 'style/images/Cua 8.jpeg',
    wish: 'Chúc những chuyến đi sắp tới đều có chúng mình bên nhau' },
  // ---- Tầng 2 (trong tháp chính) ----
  { level: 2, x: 658,  icon: '🎁', title: 'Cửa Bất Ngờ',     color: '#ff7fae', photo: 'style/images/Cua 9.jpeg',
    wish: 'Hí hí, cô bé này đã trở thành người mà anh yêu nhất đó' },
  { level: 2, x: 800,  icon: '🌙', title: 'Cửa Ánh Trăng',   color: '#bda8ff', photo: 'style/images/Cua 10.jpeg',
    wish: 'Chúc em bé đêm nào cũng yên giấc ngủ ngon ạ' },
  { level: 2, x: 942,  icon: '💍', title: 'Cửa Mãi Bên Nhau', color: '#ffc2d9', photo: 'style/images/Cua 11.jpeg',
    wish: 'Chúc chúng mình cùng đi qua mọi mùa, từ nắng ấm đến mưa dầm, tay vẫn nắm chặt tay' },
  // ---- Tầng 3 (đỉnh tháp) – cánh cửa lớn cuối cùng ----
  { level: 3, x: 800,  icon: '❤️', title: 'Cánh Cửa Yêu Thương Vô Tận', color: '#ff5c92', photo: 'style/images/Cua 12.jpg', big: true,
    wish: 'Yêu bé nhiều nhất vũ trụ, mãi mãi bên nhau nha ♥ Love Thu in every universe ❤️' },
];
export const FINALE_TEXT = '✨ Chúc em bé ngày 20/10 vui vẻ, cảm ơn bé đã yêu anh. Anh Yêu Nàng✨';

// --------------------------------------------------------------- thông số ----
const RANGE = [[205, 1395], [205, 1395], [500, 1100], [500, 1100]];  // đoạn đi được của từng tầng
const FEET = 5;           // chân nhân vật cách mép dưới sàn
const WALK = 205;         // tốc độ đi tối đa (px/s) – thong thả, thướt tha
const SLOW = 0.58;        // hệ số chậm lại khi đi ngang cửa
const WALK_ACC = 520;     // gia tốc khi bắt đầu bước (px/s²) – khởi động từ từ
const WALK_BRAKE = 460;   // giảm tốc khi dừng (px/s²) – dừng êm, không khựng
const STRIDE = 170;       // quãng đường của một chu kỳ bước đầy đủ (2 bước) – nhịp chân khớp với tốc độ
const CLIMB = 40;         // tốc độ leo cầu thang (px chiều cao / giây) – mỗi tầng là một vòng xoắn đầy đủ
const CLIMB_ACC = 60;     // gia tốc khi bắt đầu leo
const CLIMB_BRAKE = 52;   // giảm tốc khi đến đầu cầu thang
const TAU = Math.PI * 2;
const OPEN_R = 40, CLOSE_R = 72, NEAR_R = 150;
const ZOOM = 1.5;        // phóng to khi cửa mở
const MIN_SCALE = 0.55;   // tỉ lệ nhỏ nhất (màn hình bé thì camera sẽ chạy theo nhân vật)

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const floorY = l => LV[l] - FEET;

// ------------------------------------------------------------ SVG nhỏ ----
const orn = (cls) => `<svg class="cf-orn ${cls}" viewBox="0 0 46 46"><defs><linearGradient id="og${cls}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b4"/><stop offset=".5" stop-color="#e4a93a"/><stop offset="1" stop-color="#8b5a14"/></linearGradient></defs>
<circle cx="23" cy="23" r="21" fill="url(#og${cls})" stroke="#4a2a08" stroke-width="2"/><circle cx="23" cy="23" r="14.5" fill="#7a1238" stroke="#ffe9a0" stroke-width="1.6"/>
<path transform="translate(23 24) scale(.95)" d="M0 6 C-10 -2 -9 -9 -4.5 -9 C-2 -9 0 -7 0 -5 C0 -7 2 -9 4.5 -9 C9 -9 10 -2 0 6Z" fill="#ff6b9a" stroke="#ffd0e0" stroke-width="1"/></svg>`;
const CREST = `<svg class="cf-crest" viewBox="0 0 74 62"><defs><linearGradient id="ogc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b4"/><stop offset=".5" stop-color="#e4a93a"/><stop offset="1" stop-color="#8b5a14"/></linearGradient></defs>
<path d="M10 24 L16 6 L28 18 L37 2 L46 18 L58 6 L64 24 Z" fill="url(#ogc)" stroke="#4a2a08" stroke-width="2" stroke-linejoin="round"/>
<circle cx="16" cy="6" r="3.4" fill="#ff6b9a" stroke="#4a2a08"/><circle cx="37" cy="3" r="3.8" fill="#ffd0e0" stroke="#4a2a08"/><circle cx="58" cy="6" r="3.4" fill="#ff6b9a" stroke="#4a2a08"/>
<ellipse cx="37" cy="40" rx="30" ry="19" fill="url(#ogc)" stroke="#4a2a08" stroke-width="2"/><ellipse cx="37" cy="40" rx="23" ry="13.5" fill="#7a1238" stroke="#ffe9a0" stroke-width="1.5"/>
<path transform="translate(37 41) scale(1.25)" d="M0 6 C-10 -2 -9 -9 -4.5 -9 C-2 -9 0 -7 0 -5 C0 -7 2 -9 4.5 -9 C9 -9 10 -2 0 6Z" fill="#ff6b9a" stroke="#ffd0e0" stroke-width="1"/></svg>`;

// ---------------------------------------------------------------- CÔNG CHÚA ----
// Nhân vật chính: nàng công chúa váy dạ hội hồng, vương miện vàng, tóc vàng óng dài.
// Các lớp có class h-* được castle.css làm động (thở, bước đi, leo cầu thang).
const HERO = `<div class="chero"><div class="chero-flip"><svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
<defs>
 <linearGradient id="pHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe98a"/><stop offset=".55" stop-color="#f7c443"/><stop offset="1" stop-color="#dd9c26"/></linearGradient>
 <linearGradient id="pGown" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb3d6"/><stop offset=".5" stop-color="#f76daa"/><stop offset="1" stop-color="#ee5a9c"/></linearGradient>
 <linearGradient id="pUnder" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c3a0ee"/><stop offset=".5" stop-color="#ffe9f6"/><stop offset="1" stop-color="#c3a0ee"/></linearGradient>
 <linearGradient id="pBod" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffa9d2"/><stop offset="1" stop-color="#ee5a9c"/></linearGradient>
 <linearGradient id="pSleeve" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ead2ff"/><stop offset="1" stop-color="#c79cf2"/></linearGradient>
 <linearGradient id="pGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c0"/><stop offset="1" stop-color="#e0a52f"/></linearGradient>
 <radialGradient id="pEye" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#c8aed6"/><stop offset=".55" stop-color="#74508a"/><stop offset="1" stop-color="#34203f"/></radialGradient>
 <radialGradient id="pSkin" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="#fff3e8"/><stop offset="1" stop-color="#ffd9c4"/></radialGradient>
 <g id="pBow"><path d="M0 0 L-3 3.8 L-1.2 4.4 L0 1.6Z M0 0 L3 3.8 L1.2 4.4 L0 1.6Z" fill="#d93b7e" stroke="#a81a5a" stroke-width=".4"/><path d="M0 0 C-2 -3.8 -6.2 -4.2 -6.8 -1.4 C-7.2 1.6 -3.4 3 0 0Z M0 0 C2 -3.8 6.2 -4.2 6.8 -1.4 C7.2 1.6 3.4 3 0 0Z" fill="#f0508f" stroke="#a81a5a" stroke-width=".5" stroke-linejoin="round"/><circle r="1.2" fill="#ff86b6" stroke="#a81a5a" stroke-width=".4"/></g>
 <path id="pHeart" d="M0 6 C-10 -2 -9 -9 -4.5 -9 C-2 -9 0 -7 0 -5 C0 -7 2 -9 4.5 -9 C9 -9 10 -2 0 6Z"/>
</defs>
<ellipse cx="32" cy="93.6" rx="22" ry="3.6" fill="#000" opacity=".38"/>
<g class="h-bob">
 <g class="h-hair"><path d="M16.5 22 C8 30 11 46 8 60 C6.5 67 11 71 14.5 67 C16.5 71 21 71 23 65 L41 65 C43 71 47.5 71 49.5 67 C53 71 58 67 56 60 C53 46 56 30 47.5 22Z" fill="url(#pHair)" stroke="#c98a1e" stroke-width=".6"/>
  <path d="M12 44 C11 52 12 58 10 63 M52 44 C53 52 52 58 54 63" stroke="#fff3b8" stroke-width="1" fill="none" stroke-linecap="round" opacity=".6"/></g>
 <g class="h-skirt">
  <path d="M24 57 C21 66 12.5 77 3.5 90 C10 94.5 20 96 32 96 C44 96 54 94.5 60.5 90 C51.5 77 43 66 40 57Z" fill="url(#pUnder)" stroke="#8d5fc4" stroke-width=".7"/>
  <path d="M32 60 L32 86" stroke="#e8a63a" stroke-width=".9" stroke-dasharray=".1 2" stroke-linecap="round"/>
  <path d="M5 90.6 Q32 100 59 90.6" fill="none" stroke="url(#pGold)" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M9 92.2 q2.5 -2.6 5 0 M23 94.6 q2.5 -2.6 5 0 M36 94.6 q2.5 -2.6 5 0 M50 92.2 q2.5 -2.6 5 0" fill="none" stroke="#e8a63a" stroke-width=".7" stroke-linecap="round"/>
  <use href="#pHeart" transform="translate(32 91.6) scale(.3)" fill="#ff3d82" stroke="#fff" stroke-width="1.3"/>
  <path d="M24 57 C21 66 13 76 6 85.5 Q13 89.5 22 83 C24 74 28 65 31 57Z" fill="url(#pGown)" stroke="#b92a6c" stroke-width=".6"/>
  <path d="M40 57 C43 66 51 76 58 85.5 Q51 89.5 42 83 C40 74 36 65 33 57Z" fill="url(#pGown)" stroke="#b92a6c" stroke-width=".6"/>
  <path d="M27 60 C21 68 14 77 9 84 M23 62 C18 70 13 76 11 80 M37 60 C43 68 50 77 55 84 M41 62 C46 70 51 76 53 80" stroke="#d9468a" stroke-width=".6" fill="none" opacity=".5"/>
  <path d="M31 57.5 C28 65 24 74 22 83 Q13 89.5 6 85.5 M33 57.5 C36 65 40 74 42 83 Q51 89.5 58 85.5" fill="none" stroke="url(#pGold)" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M8 83 Q15 86.5 22 80.6 M56 83 Q49 86.5 42 80.6" fill="none" stroke="#fff" stroke-width="1.3" stroke-dasharray=".1 2.1" stroke-linecap="round"/>
  <use href="#pBow" transform="translate(18.5 68) rotate(-18) scale(.95)"/><use href="#pBow" transform="translate(45.5 68) rotate(18) scale(.95)"/>
  <use href="#pBow" transform="translate(13.5 83) rotate(-12) scale(.95)"/><use href="#pBow" transform="translate(50.5 83) rotate(12) scale(.95)"/>
  <g fill="#fff" opacity=".92"><circle cx="16" cy="76" r=".7"/><circle cx="26" cy="68" r=".6"/><circle cx="38" cy="68" r=".6"/><circle cx="48" cy="76" r=".7"/><circle cx="24" cy="90" r=".6"/><circle cx="41" cy="90" r=".6"/><circle cx="9" cy="89" r=".5"/><circle cx="55" cy="89" r=".5"/></g>
 </g>
 <g class="h-leg-l"><path d="M21.5 92.6 Q26 89 30.5 92.6 Q30.5 95.6 26 95.6 Q21.5 95.6 21.5 92.6Z" fill="url(#pGold)" stroke="#b9801f" stroke-width=".7"/></g>
 <g class="h-leg-r"><path d="M33.5 92.6 Q38 89 42.5 92.6 Q42.5 95.6 38 95.6 Q33.5 95.6 33.5 92.6Z" fill="url(#pGold)" stroke="#b9801f" stroke-width=".7"/></g>
 <g class="h-arm-b"><ellipse cx="20.4" cy="46.6" rx="5.2" ry="4.6" fill="url(#pSleeve)" stroke="#a477dc" stroke-width=".6"/><rect x="18.6" y="50.4" width="4.2" height="12" rx="2.1" fill="#fff" stroke="#ecc6da" stroke-width=".5"/><path d="M17.6 51 q1.2 1.6 2.4 0 t2.4 0 t2.4 0" fill="#fff" stroke="#d9b4f0" stroke-width=".6"/><circle cx="20.7" cy="62.6" r="2.7" fill="#fff" stroke="#ecc6da" stroke-width=".5"/></g>
 <path d="M23 43.5 Q32 39.5 41 43.5 L40.2 58 Q32 61.5 23.8 58Z" fill="url(#pBod)" stroke="#b81f6b" stroke-width=".7"/>
 <path d="M26 43.4 Q29 49 32 46.6 Q35 49 38 43.4 Q32 41.2 26 43.4Z" fill="url(#pSkin)"/>
 <path d="M25.6 43.6 Q29 49.6 32 47.2 Q35 49.6 38.4 43.6" fill="none" stroke="url(#pGold)" stroke-width="1.1" stroke-linecap="round"/>
 <path d="M26.6 44.6 Q29 49.6 32 47.8 Q35 49.6 37.4 44.6" fill="none" stroke="#fff" stroke-width="1.1" stroke-dasharray=".1 1.5" stroke-linecap="round"/>
 <path d="M26.4 50 L27.6 56.6 M37.6 50 L36.4 56.6" stroke="url(#pGold)" stroke-width=".8" stroke-linecap="round"/>
 <use href="#pBow" transform="translate(32 51.6) scale(.5)"/>
 <rect x="23.4" y="56" width="17.2" height="3.6" rx="1.2" fill="url(#pGold)" stroke="#b9801f" stroke-width=".5"/>
 <use href="#pHeart" transform="translate(32 57.8) scale(.3)" fill="#ff3d82" stroke="#fff" stroke-width="1.3"/>
 <g class="h-hair">
  <path d="M17.6 25 C15 34 16 44 11.5 52 C10.5 55 13 58 15.5 55.5 C19 51 21 42 20.6 32.5Z M46.4 25 C49 34 48 44 52.5 52 C53.5 55 51 58 48.5 55.5 C45 51 43 42 43.4 32.5Z" fill="url(#pHair)" stroke="#c98a1e" stroke-width=".5"/>
 </g>
 <g class="h-arm-f"><ellipse cx="43.6" cy="46.6" rx="5.2" ry="4.6" fill="url(#pSleeve)" stroke="#a477dc" stroke-width=".6"/><rect x="41.2" y="50.4" width="4.2" height="12" rx="2.1" fill="#fff" stroke="#ecc6da" stroke-width=".5"/><path d="M39.6 51 q1.2 1.6 2.4 0 t2.4 0 t2.4 0" fill="#fff" stroke="#d9b4f0" stroke-width=".6"/>
  <path d="M43.3 62 L47.4 50.2" stroke="url(#pGold)" stroke-width="1.2" stroke-linecap="round"/><circle cx="43.3" cy="62.6" r="2.7" fill="#fff" stroke="#ecc6da" stroke-width=".5"/>
  <circle cx="47.7" cy="48.6" r="2.4" fill="url(#pGold)" stroke="#b9801f" stroke-width=".6"/><use href="#pHeart" transform="translate(47.7 48.9) scale(.19)" fill="#ff3d82" stroke="#fff" stroke-width="1.5"/></g>
 <g class="h-head">
  <rect x="29.4" y="38" width="5.2" height="6" rx="2" fill="url(#pSkin)"/>
  <circle cx="32" cy="27" r="14.2" fill="url(#pSkin)"/>
  <path d="M17.6 25 C19 12.5 27.5 8 33 8.4 C41 8 47.6 13.5 46.4 25 C44.6 20.2 41 17.4 36 16.4 C33.4 21 25.4 22.4 17.6 25Z" fill="url(#pHair)" stroke="#c98a1e" stroke-width=".5"/>
  <path d="M33 9 C28 12 24 16 21.5 21 M13.5 46 C14.5 50 14 53 13 54.5 M50.5 46 C49.5 50 50 53 51 54.5" stroke="#fff5c0" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".7"/>
  <ellipse cx="26.4" cy="28.6" rx="2.9" ry="3.7" fill="#fff"/><ellipse cx="37.6" cy="28.6" rx="2.9" ry="3.7" fill="#fff"/>
  <ellipse cx="26.6" cy="29" rx="2.4" ry="3.2" fill="url(#pEye)"/><ellipse cx="37.4" cy="29" rx="2.4" ry="3.2" fill="url(#pEye)"/>
  <ellipse cx="26.6" cy="29.4" rx="1.1" ry="1.6" fill="#1b0b2a"/><ellipse cx="37.4" cy="29.4" rx="1.1" ry="1.6" fill="#1b0b2a"/>
  <circle cx="27.4" cy="27.6" r="1" fill="#fff"/><circle cx="38.2" cy="27.6" r="1" fill="#fff"/><circle cx="25.8" cy="30.6" r=".5" fill="#fff"/><circle cx="36.6" cy="30.6" r=".5" fill="#fff"/>
  <path d="M22.8 27.6 Q26.4 24 30 27 M34 27 Q37.6 24 41.2 27.6" fill="none" stroke="#2a1226" stroke-width="1.25" stroke-linecap="round"/>
  <path d="M22.9 27.4 L21.4 26 M41.1 27.4 L42.6 26" stroke="#2a1226" stroke-width=".8" stroke-linecap="round"/>
  <path d="M23.2 22.6 Q26.4 20.6 29.6 22.2 M34.4 22.2 Q37.6 20.6 40.8 22.6" fill="none" stroke="#c0842e" stroke-width=".9" stroke-linecap="round"/>
  <path d="M31.4 32.6 q.6 .7 1.2 0" stroke="#e29a86" stroke-width=".8" fill="none" stroke-linecap="round"/>
  <ellipse cx="22.4" cy="33.2" rx="3" ry="1.8" fill="#ff8fb0" opacity=".6"/><ellipse cx="41.6" cy="33.2" rx="3" ry="1.8" fill="#ff8fb0" opacity=".6"/>
  <path d="M28.6 35.6 Q32 38.8 35.4 35.6 Q32 36.8 28.6 35.6Z" fill="#e0477a" stroke="#c93668" stroke-width=".6" stroke-linejoin="round"/>
  <path d="M18.4 34 l-.6 2.4 M45.6 34 l.6 2.4" stroke="#e9ad3a" stroke-width=".5"/><circle cx="18.2" cy="37.4" r="1.4" fill="#ff7fae" stroke="#e9ad3a" stroke-width=".5"/><circle cx="45.8" cy="37.4" r="1.4" fill="#ff7fae" stroke="#e9ad3a" stroke-width=".5"/>
  <path d="M19.4 15.6 L21 8 L26.4 12.4 L32 4 L37.6 12.4 L43 8 L44.6 15.6 Q32 11.4 19.4 15.6Z" fill="url(#pGold)" stroke="#b9801f" stroke-width=".8" stroke-linejoin="round"/>
  <rect x="19.4" y="14.2" width="25.2" height="3.2" rx="1.3" fill="url(#pGold)" stroke="#b9801f" stroke-width=".6"/>
  <use href="#pHeart" transform="translate(32 11.2) scale(.34)" fill="#ff3d82" stroke="#fff" stroke-width="1.2"/>
  <g fill="#ff8fb8" stroke="#b9801f" stroke-width=".3"><circle cx="21" cy="7.8" r="1.2"/><circle cx="43" cy="7.8" r="1.2"/><circle cx="32" cy="3.6" r="1.4"/><circle cx="25.6" cy="14.8" r=".8"/><circle cx="38.4" cy="14.8" r=".8"/></g>
 </g>
 <path class="h-star" d="M56 12 l1.6 3.6 3.8 .4 -2.9 2.6 .9 3.8 -3.4 -2 -3.4 2 .9 -3.8 -2.9 -2.6 3.8 -.4z" fill="#fff6c8"/>
 <path class="h-star s2" d="M8 38 l1.2 2.7 2.8 .3 -2.1 1.9 .7 2.8 -2.6 -1.5 -2.6 1.5 .7 -2.8 -2.1 -1.9 2.8 -.3z" fill="#ffd9ec"/>
</g></svg></div></div>`;

// =====================================================================
export function initCastle({ onOpen, onClose } = {}) {
  const root = el('div', 'castle-modal');
  root.id = 'castle-modal';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <div class="castle-backdrop"></div>
    <div class="castle-frame" role="dialog" aria-modal="true" aria-label="${CASTLE_TITLE}">
      <div class="castle-viewport">
        <div class="castle-stage">
          ${buildSky()}
          <div class="csky-hearts"></div>
          ${buildCastle()}
          ${buildStairsFront()}
          <div class="cdoors"></div>
          ${HERO}
          ${buildStairsRail()}
          <div class="cfx"></div>
        </div>
        <div class="castle-vignette"></div>
        <div class="castle-hud"><div class="castle-title">${CASTLE_TITLE}</div><div class="castle-progress"></div></div>
        <div class="castle-wish">
          <div class="cw-photo"><img alt="" decoding="async"><span class="cw-icon"></span></div>
          <div class="cw-body"><div class="cw-title"></div><div class="cw-text"><span class="cw-ghost"></span><span class="cw-typed"></span></div><div class="cw-extra">${FINALE_TEXT}</div></div>
        </div>
        <div class="castle-lock" aria-live="polite"></div>
        <div class="castle-hint">Dùng <b>← →</b> để đi · <b>↑ ↓</b> để leo cầu thang · hoặc <b>chạm vào cánh cửa</b> để đi tới đó</div>
        <div class="castle-pad">
          <div class="grp"><button data-k="left" aria-label="Sang trái">◀</button><button data-k="right" aria-label="Sang phải">▶</button></div>
          <div class="grp v"><button data-k="up" aria-label="Đi lên">▲</button><button data-k="down" aria-label="Đi xuống">▼</button></div>
        </div>
      </div>
      ${orn('tl')}${orn('tr')}${orn('bl')}${orn('br')}${CREST}
      <button class="castle-close" aria-label="Đóng">✕</button>
    </div>`;
  document.body.appendChild(root);

  const $ = s => root.querySelector(s);
  const viewport = $('.castle-viewport'), stage = $('.castle-stage'), doorsBox = $('.cdoors'), hero = $('.chero'), fx = $('.cfx');
  const wishEl = $('.castle-wish'), wIcon = $('.cw-icon'), wImg = $('.cw-photo img'), wPhoto = $('.cw-photo'), wTitle = $('.cw-title'), wGhost = $('.cw-ghost'), wTyped = $('.cw-typed');
  const lockNote = $('.castle-lock'), hint = $('.castle-hint'), progress = $('.castle-progress');

  if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) root.classList.add('touch');

  // trái tim bay lên ở nền trời
  const skyHearts = $('.csky-hearts');
  for (let i = 0; i < 22; i++) {
    const h = el('i', '', Math.random() < .8 ? '♥' : '✦');
    h.style.cssText = `left:${-300 + Math.random() * 2200}px;top:${300 + Math.random() * 650}px;font-size:${12 + Math.random() * 20}px;--d:${9 + Math.random() * 9}s;--dl:-${Math.random() * 14}s;--sx:${(Math.random() - .5) * 90}px`;
    skyHearts.appendChild(h);
  }
  // tiến độ: 12 trái tim
  DOORS.forEach(() => progress.appendChild(el('i', '', '♥')));

  // ---- các cánh cửa -------------------------------------------------------
  const doorEls = DOORS.map((d, i) => {
    const w = d.big ? 120 : 86, h = d.big ? 136 : 118, pad = d.big ? 8 : 6;
    const e = el('div', 'cdoor' + (d.big ? ' big' : ''));
    e.dataset.i = i;
    e.style.cssText = `left:${d.x - w / 2 - pad}px;top:${LV[d.level] - BAND - h - pad}px;width:${w + pad * 2}px;height:${h + pad}px;--c1:${d.color}`;
    e.innerHTML = `<div class="cdoor-medal">${d.icon}</div><div class="cdoor-frame"><div class="cdoor-hole"><div class="cdoor-glow"></div><img class="cdoor-photo" alt="" decoding="async"><div class="cdoor-leaf l"><i>♥</i></div><div class="cdoor-leaf r"><i>♥</i></div></div></div>`;
    if (d.big) e.insertAdjacentHTML('beforeend', '<div class="cdoor-lock">🔒</div>');
    doorsBox.appendChild(e);
    return e;
  });
  // Cửa trên cùng chỉ mở khi đã mở hết các cửa còn lại
  const BIG = DOORS.findIndex(d => d.big), OTHERS = DOORS.length - 1;
  const isLocked = i => i === BIG && [...seen].filter(k => k !== BIG).length < OTHERS;
  const leftCount = () => OTHERS - [...seen].filter(k => k !== BIG).length;
  let lockTimer = 0;
  function showLock() {
    lockNote.innerHTML = `🔒 Cánh cửa này còn đang khóa<br><small>Bé yêu mở <b>${leftCount()}</b> cánh cửa còn lại để mở khóa nhé</small>`;
    lockNote.classList.add('show'); doorEls[BIG].classList.add('shake');
    clearTimeout(lockTimer); lockTimer = setTimeout(hideLock, 2600);
  }
  function hideLock() { lockNote.classList.remove('show'); doorEls[BIG].classList.remove('shake'); }
  doorEls[BIG].classList.add('locked');
  let photosLoaded = false;
  function loadPhotos() {
    if (photosLoaded) return; photosLoaded = true;
    doorEls.forEach((e, i) => { if (DOORS[i].photo) e.querySelector('img').src = DOORS[i].photo; });
  }

  // ---- trạng thái ----------------------------------------------------------
  const seen = new Set();
  const st = { x: 705, level: 0, dir: 1, mode: 'walk', climb: null, task: [], walking: false, behind: false, y: floorY(0), vx: 0, va: 0, cv: 0, ca: 0, p: 0 };
  const input = { left: false, right: false, up: false, down: false };
    let active = -1, isOpen = false, raf = 0, last = 0, finaleDone = false;
  const cam = { x: W / 2, y: H / 2, s: 0.7 };
  let vw = 800, vh = 600, tx = 0, ty = 0;

  // ---- âm thanh nhỏ ----------------------------------------------------------
  let actx = null;
  function chime(seed) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const t0 = actx.currentTime, base = [523.25, 587.33, 659.25, 783.99, 880][seed % 5];
      [1, 1.5, 2, 3].forEach((m, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), t = t0 + i * 0.07;
        o.type = 'sine'; o.frequency.value = base * m;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05 / (1 + i * 0.5), t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 1.2);
      });
    } catch (e) { /* trình duyệt chặn âm thanh – bỏ qua */ }
  }

  // ---- hiệu ứng nổ trái tim ---------------------------------------------------
  function burst(x, y, color, n = 16) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 110;
      const p = el('i', '', Math.random() < .72 ? '❤' : '✦');
      p.style.cssText = `left:${x}px;top:${y}px;color:${Math.random() < .35 ? '#fff3c8' : color};font-size:${10 + Math.random() * 14}px;--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r - 50}px;--r:${(Math.random() - .5) * 120}deg;--sc:${.7 + Math.random() * .8};--dl:${Math.random() * 180}ms`;
      p.addEventListener('animationend', () => p.remove());
      fx.appendChild(p);
    }
  }

  // ---- lời chúc ---------------------------------------------------------------
  let typeTimer = 0;
  function showWish(i) {
    const d = DOORS[i], chars = [...d.wish];
    wIcon.textContent = d.icon; wTitle.textContent = d.title;
    wPhoto.style.display = d.photo ? '' : 'none'; if (d.photo && wImg.getAttribute('src') !== d.photo) wImg.src = d.photo; wishEl.style.setProperty('--cwc', d.color);
    wGhost.textContent = d.wish; wTyped.textContent = '';
    wishEl.classList.remove('finale'); wishEl.classList.add('show'); root.classList.add('wishing');
    clearInterval(typeTimer);
    let k = 0;
    typeTimer = setInterval(() => { k++; wTyped.textContent = chars.slice(0, k).join(''); if (k >= chars.length) clearInterval(typeTimer); }, 30);
  }
  function hideWish() { clearInterval(typeTimer); wishEl.classList.remove('show'); root.classList.remove('wishing'); }

  function openDoor(i) {
    active = i; hideHint();
    const d = DOORS[i];
    doorEls[i].classList.add('open', 'seen');
    if (!seen.has(i)) { seen.add(i); progress.children[i].classList.add('on'); }
    if (i !== BIG && !isLocked(BIG) && doorEls[BIG].classList.contains('locked')) {
      doorEls[BIG].classList.remove('locked'); doorEls[BIG].classList.add('unlocked');
      const b = DOORS[BIG]; setTimeout(() => burst(b.x, LV[b.level] - 90, '#ffd36b', 30), 900);
    }
    showWish(i);
    if (seen.size === DOORS.length && !finaleDone) { finaleDone = true; wishEl.classList.add('finale'); setTimeout(() => burst(d.x, LV[d.level] - 90, '#ff5c92', 44), 700); }
    const bx = d.x, by = LV[d.level] - BAND - (d.big ? 70 : 60);
    setTimeout(() => { if (active === i) burst(bx, by, d.color, d.big ? 30 : 18); }, 380);
    chime(i);
  }
  function closeDoor() {
    if (active < 0) return;
    doorEls[active].classList.remove('open'); active = -1; hideWish();
  }

  // ---- nhập liệu ----------------------------------------------------------------
  function hideHint() { hint.classList.add('gone'); }
  const keyMap = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down' };
  function onKey(e, down) {
    if (!isOpen) return;
    if (e.key === 'Escape') { if (down) close(); return; }
    const k = keyMap[e.key];
    if (!k) return;
    input[k] = down; e.preventDefault(); e.stopPropagation(); if (down) hideHint();
  }
  window.addEventListener('keydown', e => onKey(e, true), true);
  window.addEventListener('keyup', e => onKey(e, false), true);
  window.addEventListener('blur', () => { for (const k in input) input[k] = false; });

  root.querySelectorAll('.castle-pad button').forEach(b => {
    const k = b.dataset.k;
    const on = e => { e.preventDefault(); input[k] = true; b.classList.add('down'); hideHint(); try { b.setPointerCapture(e.pointerId); } catch (_) { } };
    const off = () => { input[k] = false; b.classList.remove('down'); };
    b.addEventListener('pointerdown', on);
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => b.addEventListener(t, off));
  });
  root.querySelector('.castle-close').addEventListener('click', close);
  root.querySelector('.castle-backdrop').addEventListener('click', close);

  // chạm / bấm vào lâu đài để đi tới đó
  viewport.addEventListener('pointerdown', e => {
    if (e.target.closest('.castle-pad') || e.target.closest('.castle-close')) return;
    const r = viewport.getBoundingClientRect();
    const lx = (e.clientX - r.left - tx) / cam.s, ly = (e.clientY - r.top - ty) / cam.s;
    let level = -1, best = 1e9;
    for (let l = 0; l < 4; l++) { const c = LV[l] - 85, dd = Math.abs(ly - c); if (dd < best) { best = dd; level = l; } }
    if (ly < 100 || ly > LV[0] + 40) return;
    if (level >= 2 && (lx < 480 || lx > 1120)) return;
    let x = clamp(lx, RANGE[level][0], RANGE[level][1]);
    DOORS.forEach(d => { if (d.level === level && Math.abs(d.x - x) < 55) x = d.x; });
    planTo(level, x); hideHint();
  });

  function planTo(level, x) {
    st.task = [];
    const fromLevel = st.mode === 'climb' ? st.climb.to : st.level;
    const startX = st.mode === 'climb' ? st.climb.lx : st.x;
    if (fromLevel !== level) {
      const lx = LADDERS.reduce((b, c) => (Math.abs(startX - c) + Math.abs(x - c) < Math.abs(startX - b) + Math.abs(x - b) ? c : b));
      st.task.push({ type: 'walk', x: lx }, { type: 'climb', to: level });
    }
    st.task.push({ type: 'walk', x });
  }

  // ---- dáng đi thướt tha: toàn bộ chuyển động của công chúa được tính theo thời gian thực ----------
  // Nhịp chân bám theo quãng đường đã đi (nên chậm lại khi đi chậm, dừng hẳn khi đứng yên);
  // váy và tóc là lò xo bị quán tính kéo → đung đưa, hơi "bay" khi khởi động / dừng lại.
  const G = {
    flip: hero.querySelector('.chero-flip'), bob: hero.querySelector('.h-bob'), skirt: hero.querySelector('.h-skirt'),
    hairs: hero.querySelectorAll('.h-hair'), head: hero.querySelector('.h-head'),
    armF: hero.querySelector('.h-arm-f'), armB: hero.querySelector('.h-arm-b'),
    legL: hero.querySelector('.h-leg-l'), legR: hero.querySelector('.h-leg-r'),
  };
  const P = { ph: 0, g: 0, cl: 0, face: 1, t: 0, lean: 0, px: st.x, pv: 0, a: 0, hair: { x: 0, v: 0 }, skirt: { x: 0, v: 0 } };
  function spring(o, target, w, z, drive, dt) {           // dao động tắt dần quanh target, bị gia tốc kéo lệch
    const n = 2, h = dt / n;
    for (let i = 0; i < n; i++) {
      o.v += (-w * w * (o.x - target) - 2 * z * w * o.v + drive) * h;
      o.x += o.v * h;
    }
  }
  function animateHero(dt) {
    if (!(dt > 0.002)) return;
    const climbing = st.mode === 'climb';
    P.t += dt;

    // vận tốc / gia tốc ngang thực tế (để váy, tóc, dáng nghiêng phản ứng đúng quán tính)
    const vm = (st.x - P.px) / dt; P.px = st.x;
    const am = clamp((vm - P.pv) / dt, -1400, 1400); P.pv = vm;
    P.a += (am - P.a) * (1 - Math.exp(-dt * 20));
    const face = st.dir >= 0 ? 1 : -1;
    const lv = clamp(vm * face / WALK, -1, 1), la = P.a * face;   // theo hướng nhìn: + là về phía trước

    // quay người từ từ (không lật cái bụp)
    P.face += (face - P.face) * (1 - Math.exp(-dt * 10));
    if (Math.abs(face - P.face) < 0.003) P.face = face;

    // cường độ bước (0..1) và mức "đang leo thang" – cả hai đổi mượt
    const sp = climbing ? Math.min(1, st.cv / CLIMB) : Math.min(1, Math.abs(st.vx) / WALK);
    P.g += (Math.pow(sp, 0.75) - P.g) * (1 - Math.exp(-dt * 8));
    P.cl += ((climbing ? 1 : 0) - P.cl) * (1 - Math.exp(-dt * 6));
    const g = P.g, cl = P.cl;

    // pha bước: đi bộ = theo quãng đường; leo thang = khớp từng bậc
    if (climbing) P.ph = Math.PI * (st.p + 0.2); else P.ph += Math.abs(st.vx) * dt / STRIDE * TAU;
    const ph = P.ph, sn = Math.sin(ph), cs = Math.cos(ph);

    // thân: nhấp nhô rất nhẹ, đưa hông, ngả về phía trước khi tăng tốc / ngả ra sau khi dừng
    const breath = 1 + 0.0125 * (1 - Math.cos(P.t * TAU / 2.6));
    const bobY = -1.1 * g * (0.5 + 0.5 * Math.cos(2 * ph)) * (1 - cl);
    const roll = g * (0.024 * (1 - cl) + 0.013 * cl) * sn;
    P.lean += (clamp(0.022 * lv + 0.00005 * la, -0.03, 0.04) + 0.035 * cl * g - P.lean) * (1 - Math.exp(-dt * 8));
    G.bob.style.transform = `translateY(${bobY.toFixed(3)}px) rotate(${(roll + P.lean).toFixed(4)}rad) scaleY(${breath.toFixed(4)})`;
    G.head.style.transform = `rotate(${(-0.6 * roll + 0.02 * g * Math.sin(ph + 1)).toFixed(4)}rad)`;

    // váy và tóc: lò xo – bị gia tốc kéo ra sau, rồi đu đưa trở lại
    spring(P.skirt, -0.06 * lv + 0.008 * Math.sin(P.t * 1.3), 9.5, 0.5, -0.012 * la, dt);
    spring(P.hair, -0.10 * lv + 0.012 * Math.sin(P.t * 1.7 + 1), 7.5, 0.38, -0.013 * la, dt);
    const sk = P.skirt.x + 0.06 * g * Math.sin(ph - 0.7);
    G.skirt.style.transform = `translateX(${(0.5 * g * Math.sin(ph - 0.7)).toFixed(3)}px) skewX(${sk.toFixed(4)}rad) scaleX(${(1 + 0.022 * g * Math.cos(2 * ph - 0.8)).toFixed(4)})`;
    const hk = `skewX(${(P.hair.x + 0.035 * g * Math.sin(ph - 1.3)).toFixed(4)}rad)`;
    G.hairs.forEach(h => { h.style.transform = hk; });

    // tay: đi bộ thì đung đưa nhẹ; leo thang thì một tay nâng váy, tay kia vịn lan can
    const swing = 0.14 * g * Math.sin(ph - 0.5);
    G.armF.style.transform = `rotate(${((1 - cl) * -swing + cl * (-0.58 + 0.07 * g * sn)).toFixed(4)}rad)`;
    G.armB.style.transform = `rotate(${((1 - cl) * swing + cl * (0.49 + 0.05 * g * sn)).toFixed(4)}rad)`;

    // bàn chân: lướt tới trước, nhấc lên nhẹ ở nửa bước (leo thang thì nhấc cao hơn một chút)
    const A = 3.4 * (1 - cl) + 1.2 * cl, H = 1.8 * (1 - cl) + 3.2 * cl;
    const liftL = Math.pow(Math.max(0, cs), 1.2), liftR = Math.pow(Math.max(0, -cs), 1.2);
    G.legL.style.transform = `translate(${(A * g * sn).toFixed(3)}px,${(-H * g * liftL).toFixed(3)}px)`;
    G.legR.style.transform = `translate(${(-A * g * sn).toFixed(3)}px,${(-H * g * liftR).toFixed(3)}px)`;

    G.flip.style.transform = `scaleX(${P.face.toFixed(3)})`;
  }

  // ---- cập nhật mỗi khung hình ------------------------------------------------------
  function ladderNear(x, r) { return LADDERS.find(c => Math.abs(c - x) <= r); }
  function startClimb(to, lx) {
    const stair = STAIRS.find(a => Math.abs(a.cx + a.s * R_WALK - lx) < 1) || STAIRS[0];
    st.mode = 'climb'; st.vx = st.va = 0; st.climb = { from: st.level, to, lx, t: 0, stair }; closeDoor();
  }
  const smooth = t => t * t * (3 - 2 * t);
  // đưa vận tốc o[kv] về vd: giới hạn gia tốc VÀ làm mềm cả gia tốc (o[ka]) → bắt đầu bước / dừng lại không có cú giật nào
  function approach(o, kv, ka, vd, acc, brake, dt) {
    const v = o[kv], speeding = Math.abs(vd) > Math.abs(v) && v * vd >= 0, lim = speeding ? acc : brake;
    const need = clamp((vd - v) / dt, -lim, lim);
    o[ka] += (need - o[ka]) * (1 - Math.exp(-dt * 20));
    const nv = v + o[ka] * dt;
    if ((nv - vd) * (v - vd) <= 0) { o[kv] = vd; o[ka] = 0; } else o[kv] = nv;   // tới đúng vận tốc mong muốn thì thôi, không vọt quá
  }
  function update(dt) {
    const manual = input.left || input.right || input.up || input.down;
    if (manual) st.task.length = 0;
    let moving = false;

    if (st.mode === 'walk') {
      let mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      let my = (input.up ? 1 : 0) - (input.down ? 1 : 0);
      let goal = null;                                   // điểm cần dừng lại thật êm
      const task = st.task[0];
      if (!manual && task) {
        if (task.type === 'walk') { if (Math.abs(task.x - st.x) < 1.2) { st.x = task.x; st.vx = st.va = 0; st.task.shift(); } else { mx = Math.sign(task.x - st.x); goal = task.x; } }
        else if (task.type === 'climb') { if (st.level === task.to) st.task.shift(); else my = task.to > st.level ? 1 : -1; }
      }
      if (my !== 0) {
        const to = st.level + my, lad = ladderNear(st.x, 36);
        if (lad != null && to >= 0 && to <= 3) {
          if (Math.abs(lad - st.x) > 2) { mx = Math.sign(lad - st.x); goal = lad; } else { st.x = lad; mx = 0; st.vx = st.va = 0; startClimb(to, lad); }
        }
      }
      if (st.mode === 'walk') {
        let vmax = WALK;
        for (const d of DOORS) if (d.level === st.level && Math.abs(d.x - st.x) < CLOSE_R) { vmax = WALK * SLOW; break; }
        let vd = mx * vmax;
        if (goal != null) vd = Math.sign(goal - st.x) * Math.min(vmax, Math.sqrt(2 * WALK_BRAKE * Math.abs(goal - st.x)));   // giảm tốc đều khi gần đích
        const old = st.x;
        approach(st, 'vx', 'va', vd, WALK_ACC, WALK_BRAKE * 1.5, dt);
        let nx = st.x + st.vx * dt;
        const t0 = st.task[0];
        if (t0 && t0.type === 'walk' && (t0.x - old) * (t0.x - nx) <= 0) { nx = t0.x; st.vx = st.va = 0; }
        const lad = ladderNear(old, 36), want = my !== 0 && lad != null;
        if (want && (lad - old) * (lad - nx) <= 0) { nx = lad; st.vx = st.va = 0; }
        const cl = clamp(nx, RANGE[st.level][0], RANGE[st.level][1]);
        if (cl !== nx) st.vx = st.va = 0;
        st.x = cl;
        if (mx !== 0) st.dir = mx;
        moving = Math.abs(st.vx) > 4;
        if (!(st.task[0] && st.task[0].type === 'climb')) st.cv = st.ca = 0;
      }
      st.y = floorY(st.level); st.behind = false;
    }

    if (st.mode === 'climb') {
      // nhân vật bước theo đúng đường xoắn ốc của cầu thang: 1 tầng = 1 vòng quanh cột trụ giữa
      const c = st.climb, up = Math.sign(c.to - c.from);        // +1: đang đi lên
      const seg = PITCH * Math.abs(c.to - c.from);
      // còn leo tiếp tầng sau không? nếu có thì giữ nhịp, nếu không thì giảm tốc êm khi tới đầu cầu thang
      const wantDir = input.up ? 1 : input.down ? -1 : 0, nxt0 = c.to + up, t0 = st.task[0];
      const chain = nxt0 >= 0 && nxt0 <= 3 && (wantDir === up || (!manual && t0 && t0.type === 'climb' && Math.sign(t0.to - c.to) === up));
      const remain = (1 - Math.min(c.t, 1)) * seg;
      const vd = chain ? CLIMB : Math.min(CLIMB, Math.sqrt(2 * CLIMB_BRAKE * remain) + 4);
      approach(st, 'cv', 'ca', vd, CLIMB_ACC, CLIMB_BRAKE * 1.6, dt);
      c.t += dt * st.cv / seg;
      const t = Math.min(c.t, 1), lvf = c.from + (c.to - c.from) * t, pose = stairPose(c.stair, lvf);
      st.x = pose.x; st.y = pose.y - FEET; st.p = lvf * N_STEP;
      if (Math.abs(pose.vx) > 0.08) st.dir = Math.sign(pose.vx) * up;
      st.behind = pose.back;                                     // nửa vòng phía sau cột: nhân vật bị cột che
      moving = true;
      if (c.t >= 1) {
        st.level = c.to; st.x = c.lx; st.y = floorY(st.level); st.mode = 'walk'; st.climb = null; st.behind = false;
        const my = (input.up ? 1 : 0) - (input.down ? 1 : 0), nxt = st.level + my;
        if (my !== 0 && nxt >= 0 && nxt <= 3) startClimb(nxt, c.lx);
        else if (!(t0 && t0.type === 'climb' && st.level !== t0.to)) st.cv = st.ca = 0;
      }
    }
    st.walking = moving;

    // ---- cửa mở / đóng
    if (st.mode === 'walk') {
      if (active >= 0) { const d = DOORS[active]; if (d.level !== st.level || Math.abs(d.x - st.x) > CLOSE_R) closeDoor(); }
      if (active < 0) {
        let bi = -1, bd = OPEN_R;
        DOORS.forEach((d, i) => { if (d.level === st.level) { const dd = Math.abs(d.x - st.x); if (dd < bd) { bd = dd; bi = i; } } });
        if (bi >= 0 && isLocked(bi)) { if (!lockNote.classList.contains('show')) showLock(); }
        else if (bi >= 0) openDoor(bi);
        else if (lockNote.classList.contains('show') && Math.abs(DOORS[BIG].x - st.x) > CLOSE_R) hideLock();
      }
    }
    DOORS.forEach((d, i) => doorEls[i].classList.toggle('near', st.mode === 'walk' && d.level === st.level && Math.abs(d.x - st.x) < NEAR_R && i !== active && !isLocked(i)));

    // ---- vẽ nhân vật
    hero.style.transform = `translate3d(${st.x.toFixed(2)}px,${st.y.toFixed(2)}px,0)`;
    hero.classList.toggle('walking', st.walking && st.mode === 'walk');
    hero.classList.toggle('climbing', st.mode === 'climb');
    hero.classList.toggle('left', st.dir < 0);
    hero.classList.toggle('behind', st.behind);
    animateHero(dt);
    const spd = st.mode === 'walk' ? Math.abs(st.vx) / WALK : 0;
    if (spd > 0.05 && Math.random() < dt * 7 * spd) burst(st.x, st.y - 4, '#ffd9ec', 1);
  }

  // ---- camera --------------------------------------------------------------------------
  function resize() {
    vw = viewport.clientWidth; vh = viewport.clientHeight;
  }
  const TOP = -60, BOT = 990, BH = BOT - TOP;       // vùng camera được phép nhìn (chừa trời phía trên cho đỉnh mái vòm)
  function camera(dt, instant) {
    const sBase = Math.max(Math.min(vw / W, vh / BH), MIN_SCALE);
    const zoomed = active >= 0;
    const sT = sBase * (zoomed ? ZOOM : 1);
    let fx_ = st.x, fy_ = st.y - 90;
    if (zoomed) { fx_ = DOORS[active].x; fy_ = LV[DOORS[active].level] - 112; }
    const hw = vw / (2 * sT), hh = vh / (2 * sT);
    const cxT = hw * 2 >= W ? W / 2 : clamp(fx_, hw, W - hw);
    const cyT = hh * 2 >= BH ? (TOP + BOT) / 2 : clamp(fy_, TOP + hh, BOT + 280 - hh);   // khi camera đi theo nhân vật được nhìn xuống phần đất bên dưới
    const k = instant ? 1 : 1 - Math.exp(-dt * 5), ks = instant ? 1 : 1 - Math.exp(-dt * 4.2);
    cam.s += (sT - cam.s) * ks; cam.x += (cxT - cam.x) * k; cam.y += (cyT - cam.y) * k;
    tx = vw / 2 - cam.x * cam.s; ty = vh / 2 - cam.y * cam.s;
    stage.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${cam.s.toFixed(4)})`;
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    update(dt); camera(dt, false);
  }

  // ---- mở / đóng ---------------------------------------------------------------------------
  let closeTimer = 0;
  function open() {
    if (isOpen) return;
    isOpen = true; clearTimeout(closeTimer);
    loadPhotos();
    root.classList.add('on'); root.setAttribute('aria-hidden', 'false');
    resize(); update(0.0001); camera(0, true);
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('show')));
    last = performance.now(); raf = requestAnimationFrame(loop);
    onOpen && onOpen();
  }
  function close() {
    if (!isOpen) return;
    isOpen = false; cancelAnimationFrame(raf);
    for (const k in input) input[k] = false;
    root.classList.remove('show'); root.setAttribute('aria-hidden', 'true');
    closeDoor(); hideLock();
    closeTimer = setTimeout(() => root.classList.remove('on'), 520);
    onClose && onClose();
  }
  window.addEventListener('resize', () => { if (isOpen) { resize(); camera(0, true); } });

  return { open, close, isOpen: () => isOpen, _state: st, _doors: DOORS, _planTo: planTo };
}
