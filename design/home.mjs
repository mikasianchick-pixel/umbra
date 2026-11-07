// Главная страница, десктоп 1440. Запуск: bun run home.mjs <канал> [x] [y]
import { connect, frame, rect, t, chip, shadow, gradient, svgRaw, close, cmd } from "./figma.mjs";
import { C, glow, border, mono, blur, alpha, icon, hug, width, button, tag, cover, gameCard, GAMES, note } from "./ui.mjs";

const OX = Number(process.argv[3] || 4800);
const OY = Number(process.argv[4] || 0);
const W = 1440, H = 5880, P = 96, CW = W - P * 2;

async function heading(parent, x, y, num, label, title) {
  await t(parent, x, y, `${num} / ${label}`, mono({ w: "Medium", size: 13, color: C.accent2, ls: 12 }));
  return t(parent, x, y + 28, title, { family: "Orbitron", w: "Black", size: 48, color: C.text, ls: 3 });
}

await connect();
const root = await frame(undefined, OX, OY, W, H, C.bg, { name: "Umbra — Home (Desktop 1440)" });

// ================= HERO =================
const b1 = await rect(root, 700, -200, 900, 900, C.accent, 450, "Hero glow violet");
await alpha(b1, C.accent, 0.22); await blur(b1, 260);
const b2 = await rect(root, 1000, 400, 500, 500, C.accent2, 250, "Hero glow cyan");
await alpha(b2, C.accent2, 0.14); await blur(b2, 200);

// перспективная сетка-пол
let grid = "";
for (let i = 0; i <= 24; i++) { const x = (i / 24) * 2880 - 720; grid += `<line x1="720" y1="0" x2="${x}" y2="320"/>`; }
for (let i = 1; i <= 9; i++) { const y = Math.pow(i / 9, 2) * 320; grid += `<line x1="0" y1="${y}" x2="1440" y2="${y}"/>`; }
await svgRaw(root, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" fill="none" stroke="#AD99FB" stroke-opacity="0.22" stroke-width="1">${grid}</svg>`, 0, 640, W, "Perspective grid");
const fade = await rect(root, 0, 630, W, 200, C.bg, 0, "Grid fade");
await gradient(fade, [[0, C.bg, 1], [1, C.bg, 0]], 90);

// 3D-кристалл (в коде — Three.js, здесь — векторный «рендер»)
const crystal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520">
<defs>
<linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4DCFF"/><stop offset="1" stop-color="#AD99FB"/></linearGradient>
<linearGradient id="b" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9F6FB"/><stop offset="1" stop-color="#6FDAE6"/></linearGradient>
<linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E58C9"/><stop offset="1" stop-color="#1B1A26"/></linearGradient>
<linearGradient id="d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9B86F0"/><stop offset="1" stop-color="#2C2550"/></linearGradient>
<linearGradient id="e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ED83B4"/><stop offset="1" stop-color="#3A1E3A"/></linearGradient>
<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FA7B5"/><stop offset="1" stop-color="#12121A"/></linearGradient>
</defs>
<g stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1.2" stroke-linejoin="round">
<path d="M200 20 60 200 140 230 200 250z" fill="url(#a)"/>
<path d="M200 20 340 200 260 230 200 250z" fill="url(#b)"/>
<path d="M60 200 140 230 200 500z" fill="url(#c)"/>
<path d="M140 230 200 250 200 500z" fill="url(#d)"/>
<path d="M200 250 260 230 200 500z" fill="url(#e)"/>
<path d="M260 230 340 200 200 500z" fill="url(#f)"/>
</g>
<path d="M200 20 200 250" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="2"/>
</svg>`;
const halo = await rect(root, 930, 200, 360, 360, C.accent, 180, "Crystal halo");
await alpha(halo, C.accent, 0.5); await blur(halo, 120);
const cr = await svgRaw(root, crystal, 900, 150, 420, "3D Crystal (Three.js placeholder)");
await shadow(cr, [glow(C.accent, 60, 0.5), glow(C.accent2, 120, 0.3)]);
const shadowEl = await rect(root, 990, 720, 240, 30, C.accent, 999, "Crystal floor light");
await alpha(shadowEl, C.accent, 0.5); await blur(shadowEl, 30);
for (const [x, y, s, c] of [[870, 260, 6, C.accent2], [1340, 340, 4, C.text], [1290, 160, 5, C.hot], [860, 560, 4, C.accent], [1380, 600, 6, C.accent2], [1010, 110, 3, C.text]]) {
  const d = await rect(root, x, y, s, s, c, s, "Particle");
  await shadow(d, [glow(c, 10, 0.9)]);
}

// шапка
const nav = await frame(root, P, 24, CW, 72, C.s1, { name: "Header", r: 16 });
await alpha(nav, C.s1, 0.6); await border(nav, C.accent, 0.16);
const lg = await t(nav, 28, 22, "UMBRA", { family: "Orbitron", w: "Black", size: 22, color: C.text, ls: 10 });
await shadow(lg.id, [glow(C.accent, 16, 0.5)]);
let lx = 220;
for (const [i, l] of ["Store", "Library", "Umbra Pass", "Community"].entries()) {
  const tl = await t(nav, lx, 25, l, { size: 15, w: i ? "Regular" : "Semi Bold", color: i ? C.muted : C.text });
  if (!i) { const d = await rect(nav, lx + 18, 52, 6, 6, C.accent2, 3, "Active dot"); await shadow(d, [glow(C.accent2, 8, 0.8)]); }
  lx += tl.width + 40;
}
const sb = await frame(nav, 700, 16, 300, 40, C.bg, { name: "Search", r: 10 });
await border(sb, C.accent, 0.14);
await icon(sb, "search", 12, 10, 18, C.muted);
await t(sb, 40, 11, "Search games…", { size: 14, color: C.muted });
await chip(sb, 236, 9, "Ctrl K", { bg: C.s3, fg: C.muted, family: "JetBrains Mono", size: 11, r: 6, px: 8, py: 3 });
const snd = await frame(nav, 1016, 16, 40, 40, C.bg, { name: "Sound", r: 999 });
await border(snd, C.accent, 0.2);
await icon(snd, "volume", 10, 10, 20, C.muted);
const gp = await hug(nav, 1072, 14, C.accent, { px: 18, py: 12, gap: 8, r: 10, name: "Get Pass" });
await icon(gp, "bolt", 0, 0, 14, C.bg, C.bg);
await t(gp, 0, 0, "GET PASS", { family: "Orbitron", w: "Bold", size: 12, ls: 8, color: C.bg });
await shadow(gp, [glow(C.accent, 20, 0.4)]);

// текст hero
await chip(root, P, 200, "128 402 players online now", { bg: C.s1, fg: C.text, stroke: C.line, dot: C.success, family: "JetBrains Mono", w: "Medium", size: 13, r: 999, px: 14, py: 8 });
const l1 = await t(root, P, 262, "PLAY", { family: "Orbitron", w: "Black", size: 92, color: C.text, ls: 2 });
const pill = await frame(root, P + l1.width + 20, 278, 148, 84, C.accent, { name: "Inline pill (animated icon)", r: 999 });
await gradient(pill, [[0, C.accent], [1, C.accent2]], 0);
await shadow(pill, [glow(C.accent, 30, 0.5)]);
await icon(pill, "pad", 46, 14, 56, C.bg);
await t(root, P + l1.width + 188, 262, "THE", { family: "Orbitron", w: "Black", size: 92, color: C.text, ls: 2 });
const night = await t(root, P, 372, "NIGHT", { family: "Orbitron", w: "Black", size: 92, color: C.text, ls: 2 });
const away = await t(root, Math.round(P + night.width + 32), 372, "AWAY", { family: "Orbitron", w: "Black", size: 92, color: C.accent, ls: 2 });
await shadow(away.id, [glow(C.accent, 30, 0.55)]);
await t(root, P, 500, "Handpicked indie worlds in one launcher. Cloud saves, co-op and achievements — built for long nights.", { size: 20, color: C.muted, width: 600, lh: 32 });
await button(root, P, 600, "GET STARTED", "primary", { iconName: "bolt" });
const bb = await button(root, P + 250, 600, "BROWSE GAMES", "ghost", { iconName: "arrow" });
let sx = P;
for (const [n, l] of [["2 400+", "GAMES"], ["128K", "ONLINE"], ["4.9", "AVG RATING"]]) {
  await t(root, sx, 720, n, { family: "Orbitron", w: "Bold", size: 28, color: C.text });
  await t(root, sx, 760, l, mono({ size: 11, ls: 12 }));
  sx += 180;
}
await note(root, 900, 760, "3D crystal · Three.js · follows cursor · light shifts per section");
await note(root, P, 812, "pill = looping icon inside headline · words reveal line by line");

// ================= MARQUEE =================
let y = 880;
const mq = await frame(root, 0, y, W, 72, C.s1, { name: "Marquee (CSS only)" });
await alpha(mq, C.s1, 0.7); await border(mq, C.accent, 0.12);
let mx = -40;
for (const g of ["ROGUELIKE", "SYNTHWAVE", "CO-OP", "PIXEL ART", "STEALTH", "OPEN WORLD", "HORROR", "RACING"]) {
  const tt = await t(mq, mx, 22, g, { family: "Orbitron", w: "Bold", size: 22, color: C.muted, ls: 6 });
  const d = await rect(mq, mx + tt.width + 24, 32, 8, 8, C.accent, 2, "Separator");
  mx += tt.width + 56;
}

// ================= GAMES OF THE WEEK =================
y = 1060;
await heading(root, P, y, "01", "STORE", "GAMES OF THE WEEK");
for (const [i, n] of ["arrowL", "arrow"].entries()) {
  const f = await frame(root, W - P - 112 + i * 64, y + 30, 48, 48, i ? C.accent : C.s1, { name: "Carousel " + n, r: 999 });
  if (i) await shadow(f, [glow(C.accent, 20, 0.4)]); else await border(f, C.accent, 0.3);
  await icon(f, n, 14, 14, 20, i ? C.bg : C.text);
}
y += 140;
for (let i = 0; i < 4; i++) await gameCard(root, P + i * 384, i === 1 ? y - 8 : y, GAMES[i], { state: i === 1 ? "HOVER" : "DEFAULT" });
y += 480;
for (let i = 0; i < 5; i++) await rect(root, P + i * 20, y, i ? 8 : 28, 4, i ? C.s3 : C.accent, 2, "Carousel dot");
await note(root, P + 140, y - 6, "drag / swipe carousel · cards tilt in 3D + glare under cursor");

// ================= BENTO =================
y = 1820;
await heading(root, P, y, "02", "PLATFORM", "BUILT FOR LONG NIGHTS");
y += 140;
async function tile(x, yy, w, h, ic, title, text) {
  const f = await frame(root, x, yy, w, h, C.s1, { name: "Bento " + title, r: 20 });
  await border(f, C.accent, 0.14);
  const ib = await frame(f, 28, 28, 48, 48, C.s2, { name: "Icon", r: 12 });
  await border(ib, C.accent, 0.3);
  await icon(ib, ic, 12, 12, 24, C.accent);
  await t(f, 28, h - 92, title, { family: "Orbitron", w: "Bold", size: 22, color: C.text, ls: 2 });
  await t(f, 28, h - 56, text, { size: 15, color: C.muted, width: w - 56, lh: 22 });
  return f;
}
const big = await tile(P, y, 816, 400, "cloud", "CLOUD SAVES", "Start on desktop, continue on the laptop. Your progress follows you, instantly.");
const spot = await rect(big, 420, -120, 420, 420, C.accent, 210, "Cursor spotlight");
await alpha(spot, C.accent, 0.25); await blur(spot, 120);
for (const [i, [label, c]] of [["DESKTOP", C.accent], ["LAPTOP", C.accent2], ["DECK", C.hot]].entries()) {
  const dv = await frame(big, 420 + i * 120, 90 + (i % 2) * 40, 96, 96, C.s2, { name: "Device " + label, r: 16 });
  await shadow(dv, [glow(c, 24, 0.35)], { color: c, a: 0.6 });
  await t(dv, 14, 40, label, mono({ size: 11, color: c, w: "Bold" }));
}
await chip(big, 560, 236, "SYNCED 2s AGO", { bg: C.bg, fg: C.success, stroke: C.line, dot: C.success, family: "JetBrains Mono", w: "Medium", size: 11, r: 999, px: 10, py: 5 });
const ach = await tile(P + 840, y, 408, 400, "trophy", "ACHIEVEMENTS", "1 284 unlocked this week across the community.");
await t(ach, 28, 120, "74%", { family: "Orbitron", w: "Black", size: 64, color: C.text });
await rect(ach, 28, 210, 352, 6, C.s3, 3, "Track");
const pb = await rect(ach, 28, 210, 260, 6, C.accent, 3, "Progress");
await gradient(pb, [[0, C.accent], [1, C.accent2]], 0);
await shadow(pb, [glow(C.accent2, 10, 0.6)]);
y += 424;
const fr = await tile(P, y, 400, 260, "users", "FRIENDS", "12 friends playing right now.");
for (const [i, c] of [C.accent, C.accent2, C.hot, "#8FB4FF", C.success].entries()) {
  const a = await rect(fr, 220 + i * 28, 32, 40, 40, c, 20, "Avatar");
  await shadow(a, [{ type: "DROP_SHADOW", color: C.s1, a: 1, blur: 0, spread: 3 }]);
}
await tile(P + 424, y, 400, 260, "pad", "ANY CONTROLLER", "Xbox, PlayStation, generic — auto-detected.");
const fps = await tile(P + 848, y, 400, 260, "gauge", "120 FPS", "Streaming engine tuned for buttery frames.");
await t(fps, 230, 30, "120", { family: "JetBrains Mono", w: "Bold", size: 40, color: C.accent2 });
await note(root, 0, 1876, "tiles fade up on scroll · spotlight follows cursor inside each tile").then(async (id) => cmd("move_node", { nodeId: id, x: W - P - (await width(id)), y: 1876 }));

// ================= HOW IT WORKS (sticky) =================
y = 2760;
await heading(root, P, y, "03", "HOW IT WORKS", "FROM WISHLIST TO WORLD");
y += 150;
const steps = [
  ["01", "DISCOVER", "Curated drops every Friday. No noise, only games worth your night."],
  ["02", "PLAY", "One click install. Cloud saves and controller set up for you."],
  ["03", "SHARE", "Clip, screenshot and invite friends straight from the overlay."],
  ["04", "LEVEL UP", "Earn badges, climb seasons, unlock Pass rewards."],
];
for (const [i, [n, title, text]] of steps.entries()) {
  const yy = y + i * 136;
  const on = i === 0;
  if (on) { const bar = await rect(root, P, yy, 3, 104, C.accent, 2, "Active bar"); await shadow(bar, [glow(C.accent, 12, 0.8)]); }
  await t(root, P + 28, yy, n, { family: "Orbitron", w: "Black", size: 40, color: on ? C.accent : C.line });
  await t(root, P + 120, yy + 4, title, { family: "Orbitron", w: "Bold", size: 24, color: on ? C.text : C.muted, ls: 4 });
  await t(root, P + 120, yy + 44, text, { size: 16, color: C.muted, width: 420, lh: 24 });
}
const st = await frame(root, 720, y, 624, 520, C.s1, { name: "Sticky visual", r: 24 });
await border(st, C.accent, 0.2);
await shadow(st, [glow(C.accent, 60, 0.2)], { color: C.accent, a: 0.25 });
await cover(st, 624, 520, "#3B2E86", C.accent, "DISCOVER", 56);
await tag(st, 28, 28, "STEP 01 / 04", { bg: C.bg, fg: C.accent2 });
await note(root, 720, y + 540, "panel sticks while steps scroll · visual swaps per step (ScrollTrigger)");

// ================= STATS =================
y = 3500;
const stats = await frame(root, P, y, CW, 180, C.s1, { name: "Stats", r: 24 });
await border(stats, C.accent, 0.14);
for (const [i, [n, l]] of [["2 400+", "INDIE GAMES"], ["128K", "PLAYERS ONLINE"], ["4.9", "AVERAGE RATING"], ["99.9%", "UPTIME"]].entries()) {
  const x = 48 + i * 300;
  if (i) await rect(stats, x - 24, 40, 1, 100, C.line, 0, "Divider");
  const nn = await t(stats, x, 44, n, { family: "Orbitron", w: "Black", size: 52, color: i === 1 ? C.accent2 : C.text });
  if (i === 1) await shadow(nn.id, [glow(C.accent2, 24, 0.5)]);
  await t(stats, x, 118, l, mono({ size: 12, ls: 12 }));
}
await note(root, P, y + 196, "numbers count up when visible");

// ================= PRICING =================
y = 3820;
await heading(root, P, y, "04", "UMBRA PASS", "ONE PASS. EVERY NIGHT.");
const seg = await frame(root, W - P - 300, y + 30, 300, 48, C.s1, { name: "Monthly/Yearly", r: 999 });
await border(seg, C.accent, 0.2);
const son = await frame(seg, 150, 4, 146, 40, C.accent, { name: "Active", r: 999 });
await shadow(son, [glow(C.accent, 20, 0.4)]);
await t(seg, 40, 14, "Monthly", { size: 15, w: "Medium", color: C.muted });
await t(son, 22, 10, "Yearly", { size: 15, w: "Semi Bold", color: C.bg });
await chip(son, 82, 9, "-20%", { bg: C.bg, fg: C.accent, family: "JetBrains Mono", w: "Bold", size: 11, r: 999, px: 7, py: 2 });
y += 150;
const tiers = [
  ["FREE", "$0", "forever", ["Store & wishlist", "Cloud saves (1 GB)", "Friends & chat"], "ghost", "START FREE"],
  ["PASS", "$7.99", "/ month, billed yearly", ["200+ games included", "Cloud saves (50 GB)", "Early access drops", "Exclusive badges"], "primary", "GET PASS"],
  ["PASS+", "$11.99", "/ month, billed yearly", ["Everything in Pass", "Day-one releases", "Family sharing (5)"], "ghost", "GO PLUS"],
];
for (const [i, [name, price, per, feats, kind, cta]] of tiers.entries()) {
  const x = P + i * 424;
  const hi = i === 1;
  const card = await frame(root, x, hi ? y - 16 : y, 400, hi ? 552 : 520, hi ? C.s2 : C.s1, { name: "Tier " + name, r: 24 });
  await shadow(card, hi ? [glow(C.accent, 60, 0.35)] : [], { color: C.accent, a: hi ? 0.7 : 0.14 });
  if (hi) await chip(card, 232, 32, "MOST POPULAR", { bg: C.accent, fg: C.bg, family: "JetBrains Mono", w: "Bold", size: 11, r: 999, px: 10, py: 5 });
  await t(card, 32, 32, name, { family: "Orbitron", w: "Bold", size: 18, color: hi ? C.accent : C.muted, ls: 10 });
  await t(card, 32, 80, price, { family: "Orbitron", w: "Black", size: 56, color: C.text });
  await t(card, 32, 152, per, mono({ size: 12 }));
  await rect(card, 32, 192, 336, 1, C.line, 0, "Divider");
  for (const [j, f] of feats.entries()) {
    await icon(card, "check", 32, 220 + j * 40, 18, hi ? C.accent2 : C.muted);
    await t(card, 62, 219 + j * 40, f, { size: 15, color: C.text });
  }
  const bt = await button(card, 32, (hi ? 552 : 520) - 92, cta, kind);
}
await note(root, P, y + 560, "price morphs on toggle · popular card has slow light sweeping its border");

// ================= FAQ =================
y = 4640;
await heading(root, P, y, "05", "FAQ", "QUESTIONS");
const qs = [
  ["Is Umbra a real store?", "No — Umbra is a fictional platform made as a portfolio project to show design, 3D, animation and front-end skills. All games and prices are made up.", true],
  ["Can I play with a controller?", "", false],
  ["What happens to my saves if I cancel Pass?", "", false],
  ["Does it work on low-end laptops?", "", false],
];
let qy = y;
for (const [q, a, open] of qs) {
  const h = open ? 150 : 76;
  const f = await frame(root, 584, qy, 760, h, open ? C.s1 : C.bg, { name: "FAQ " + q, r: 16 });
  await border(f, C.accent, open ? 0.3 : 0.12);
  await t(f, 28, 26, q, { size: 18, w: "Medium", color: C.text });
  await icon(f, open ? "minus" : "plus", 712, 26, 20, open ? C.accent : C.muted);
  if (open) await t(f, 28, 66, a, { size: 15, color: C.muted, width: 660, lh: 24 });
  qy += h + 12;
}

// ================= CTA =================
y = 5120;
const cta = await frame(root, P, y, CW, 400, C.s1, { name: "CTA", r: 32 });
const cg = await rect(cta, 0, 0, CW, 400, C.accent, 0, "CTA gradient");
await gradient(cg, [[0, "#2C2550"], [0.5, C.s1], [1, "#173A40"]], 0);
const cb = await rect(cta, 424, 120, 400, 300, C.hot, 200, "CTA glow");
await alpha(cb, C.hot, 0.3); await blur(cb, 120);
await border(cta, C.accent, 0.3);
const ct = await t(cta, 0, 96, "THE NIGHT IS YOUNG", { family: "Orbitron", w: "Black", size: 64, color: C.text, ls: 3, width: CW, align: "CENTER" });
await shadow(ct.id, [glow(C.accent, 30, 0.45)]);
await t(cta, 0, 190, "Join 128 000 players. First month of Pass is on us.", { size: 18, color: C.muted, width: CW, align: "CENTER" });
const pb2 = await button(cta, 0, 262, "PLAY FREE NOW", "hot", { iconName: "play" });
const pw = await width(pb2);
await cmd("move_node", { nodeId: pb2, x: Math.round((CW - pw) / 2), y: 262 });

// ================= FOOTER =================
y = 5600;
await rect(root, P, y, CW, 1, C.line, 0, "Divider");
await t(root, P, y + 48, "UMBRA", { family: "Orbitron", w: "Black", size: 28, color: C.text, ls: 10 });
await t(root, P, y + 92, "Indie worlds for long nights.", { size: 15, color: C.muted });
const cols = [["PLATFORM", ["Store", "Library", "Umbra Pass"]], ["COMMUNITY", ["Discord", "Creators", "Events"]], ["ABOUT", ["Design system", "Source code", "Contact"]]];
for (const [i, [h, ls]] of cols.entries()) {
  const x = 720 + i * 220;
  await t(root, x, y + 48, h, mono({ size: 11, ls: 12, color: C.accent2 }));
  for (const [j, l] of ls.entries()) await t(root, x, y + 80 + j * 30, l, { size: 15, color: C.muted });
}
await t(root, P, y + 220, "© 2026 Umbra — a fictional platform. Portfolio project, not a real store.", mono({ size: 12 }));

close();
console.log("done");
