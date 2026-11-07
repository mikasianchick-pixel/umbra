// Главная, мобильная 375 + открытое меню. Запуск: bun run mobile.mjs <канал> [x] [y]
import { connect, frame, rect, t, chip, shadow, gradient, svgRaw, close, cmd } from "./figma.mjs";
import { C, glow, border, mono, blur, alpha, icon, hug, width, button, tag, cover, gameCard, GAMES, note } from "./ui.mjs";

const OX = Number(process.argv[3] || 6400);
const OY = Number(process.argv[4] || 0);
const W = 375, H = 6200, P = 24, CW = W - P * 2;

const burgerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#EAEAF0" stroke-width="2" stroke-linecap="round"><path d="M4 8h16M4 16h10"/></svg>`;

async function fullButton(parent, y, label, kind, iconName) {
  const b = await button(parent, P, y, label, kind, { iconName, size: 13 });
  const h = (await cmd("get_node_info", { nodeId: b })).absoluteBoundingBox.height;
  await cmd("set_layout_sizing", { nodeId: b, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });
  await cmd("resize_node", { nodeId: b, width: CW, height: h });
  await cmd("set_axis_align", { nodeId: b, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" });
  return b;
}
async function heading(parent, y, num, label, title) {
  await t(parent, P, y, `${num} / ${label}`, mono({ w: "Medium", size: 11, color: C.accent2, ls: 12 }));
  return t(parent, P, y + 22, title, { family: "Orbitron", w: "Black", size: 28, color: C.text, ls: 2, width: CW, lh: 34 });
}
async function header(parent, menuOpen = false) {
  const nav = await frame(parent, 12, 12, W - 24, 56, C.s1, { name: "Header mobile", r: 14 });
  await alpha(nav, C.s1, 0.7); await border(nav, C.accent, 0.16);
  const lg = await t(nav, 18, 16, "UMBRA", { family: "Orbitron", w: "Black", size: 18, color: C.text, ls: 10 });
  await shadow(lg.id, [glow(C.accent, 14, 0.5)]);
  const s = await frame(nav, 239, 8, 40, 40, C.bg, { name: "Search", r: 999 });
  await border(s, C.accent, 0.2); await icon(s, "search", 10, 10, 20, C.muted);
  const m = await frame(nav, 287, 8, 40, 40, menuOpen ? C.accent : C.bg, { name: "Menu", r: 999 });
  if (menuOpen) await icon(m, "x", 10, 10, 20, C.bg);
  else { await border(m, C.accent, 0.2); await svgRaw(m, burgerSvg, 10, 10, 20, "Burger"); }
}

await connect();
const root = await frame(undefined, OX, OY, W, H, C.bg, { name: "Umbra — Home (Mobile 375)" });

// ================= HERO =================
const b1 = await rect(root, 40, 60, 420, 420, C.accent, 210, "Hero glow violet");
await alpha(b1, C.accent, 0.25); await blur(b1, 140);
let grid = "";
for (let i = 0; i <= 12; i++) { const x = (i / 12) * 1125 - 375; grid += `<line x1="187" y1="0" x2="${x}" y2="160"/>`; }
for (let i = 1; i <= 6; i++) { const y = Math.pow(i / 6, 2) * 160; grid += `<line x1="0" y1="${y}" x2="375" y2="${y}"/>`; }
await svgRaw(root, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 160" fill="none" stroke="#AD99FB" stroke-opacity="0.22">${grid}</svg>`, 0, 300, W, "Perspective grid");
const fade = await rect(root, 0, 290, W, 90, C.bg, 0, "Grid fade");
await gradient(fade, [[0, C.bg, 1], [1, C.bg, 0]], 90);
const crystal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520"><defs>
<linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4DCFF"/><stop offset="1" stop-color="#AD99FB"/></linearGradient>
<linearGradient id="b" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9F6FB"/><stop offset="1" stop-color="#6FDAE6"/></linearGradient>
<linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E58C9"/><stop offset="1" stop-color="#1B1A26"/></linearGradient>
<linearGradient id="d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9B86F0"/><stop offset="1" stop-color="#2C2550"/></linearGradient>
<linearGradient id="e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ED83B4"/><stop offset="1" stop-color="#3A1E3A"/></linearGradient>
<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FA7B5"/><stop offset="1" stop-color="#12121A"/></linearGradient></defs>
<g stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1.2" stroke-linejoin="round">
<path d="M200 20 60 200 140 230 200 250z" fill="url(#a)"/><path d="M200 20 340 200 260 230 200 250z" fill="url(#b)"/>
<path d="M60 200 140 230 200 500z" fill="url(#c)"/><path d="M140 230 200 250 200 500z" fill="url(#d)"/>
<path d="M200 250 260 230 200 500z" fill="url(#e)"/><path d="M260 230 340 200 200 500z" fill="url(#f)"/></g>
<path d="M200 20 200 250" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="2"/></svg>`;
const cr = await svgRaw(root, crystal, 117, 96, 140, "3D Crystal (Three.js placeholder)");
await shadow(cr, [glow(C.accent, 40, 0.5), glow(C.accent2, 80, 0.3)]);
const fl = await rect(root, 132, 290, 110, 16, C.accent, 999, "Crystal floor light");
await alpha(fl, C.accent, 0.5); await blur(fl, 16);
for (const [x, y, s, c] of [[80, 140, 4, C.accent2], [300, 120, 3, C.hot], [290, 250, 4, C.text], [60, 260, 3, C.accent]]) {
  const d = await rect(root, x, y, s, s, c, s, "Particle"); await shadow(d, [glow(c, 8, 0.9)]);
}
await header(root);

let y = 360;
await chip(root, P, y, "128 402 online now", { bg: C.s1, fg: C.text, stroke: C.line, dot: C.success, family: "JetBrains Mono", w: "Medium", size: 12, r: 999, px: 12, py: 6 });
y += 48;
const l1 = await t(root, P, y, "PLAY", { family: "Orbitron", w: "Black", size: 48, color: C.text, ls: 2 });
const pill = await frame(root, P + l1.width + 12, y + 8, 80, 44, C.accent, { name: "Inline pill (animated icon)", r: 999 });
await gradient(pill, [[0, C.accent], [1, C.accent2]], 0);
await shadow(pill, [glow(C.accent, 20, 0.5)]);
await icon(pill, "pad", 24, 6, 32, C.bg);
await t(root, P, y + 58, "THE", { family: "Orbitron", w: "Black", size: 48, color: C.text, ls: 2 });
const n = await t(root, P, y + 116, "NIGHT", { family: "Orbitron", w: "Black", size: 48, color: C.text, ls: 2 });
await t(root, P, y + 174, "AWAY", { family: "Orbitron", w: "Black", size: 48, color: C.accent, ls: 2 }).then((a) => shadow(a.id, [glow(C.accent, 24, 0.55)]));
y += 254;
await t(root, P, y, "Handpicked indie worlds in one launcher. Cloud saves, co-op and achievements — built for long nights.", { size: 16, color: C.muted, width: CW, lh: 26 });
y += 112;
await fullButton(root, y, "GET STARTED", "primary", "bolt");
await fullButton(root, y + 64, "BROWSE GAMES", "ghost", "arrow");
y += 156;
for (const [i, [nn, l]] of [["2 400+", "GAMES"], ["128K", "ONLINE"], ["4.9", "RATING"]].entries()) {
  await t(root, P + i * 112, y, nn, { family: "Orbitron", w: "Bold", size: 22, color: C.text });
  await t(root, P + i * 112, y + 32, l, mono({ size: 10, ls: 12 }));
}
y += 76;
await note(root, P, y, "3D lighter on mobile · gyro tilt");

// ================= MARQUEE =================
y += 56;
const mq = await frame(root, 0, y, W, 52, C.s1, { name: "Marquee" });
await alpha(mq, C.s1, 0.7); await border(mq, C.accent, 0.12);
let mx = -20;
for (const g of ["ROGUELIKE", "SYNTHWAVE", "CO-OP", "PIXEL"]) {
  const tt = await t(mq, mx, 15, g, { family: "Orbitron", w: "Bold", size: 16, color: C.muted, ls: 6 });
  await rect(mq, mx + tt.width + 14, 23, 6, 6, C.accent, 2, "Separator");
  mx += tt.width + 34;
}

// ================= GAMES =================
y += 100;
await heading(root, y, "01", "STORE", "GAMES OF THE WEEK");
y += 104;
await gameCard(root, P, y, GAMES[0], { w: 280 });
await gameCard(root, P + 296, y, GAMES[1], { w: 280 });
y += 420;
for (let i = 0; i < 4; i++) await rect(root, P + i * 16, y, i ? 6 : 22, 4, i ? C.s3 : C.accent, 2, "Carousel dot");
await note(root, P + 90, y - 7, "swipe · scroll-snap");

// ================= BENTO (стопкой) =================
y += 64;
await heading(root, y, "02", "PLATFORM", "BUILT FOR LONG NIGHTS");
y += 104;
async function tile(yy, h, ic, title, text, accent = C.accent) {
  const f = await frame(root, P, yy, CW, h, C.s1, { name: "Bento " + title, r: 18 });
  await border(f, C.accent, 0.14);
  const ib = await frame(f, 20, 20, 40, 40, C.s2, { name: "Icon", r: 10 });
  await border(ib, C.accent, 0.3); await icon(ib, ic, 10, 10, 20, accent);
  await t(f, 20, h - 78, title, { family: "Orbitron", w: "Bold", size: 18, color: C.text, ls: 2 });
  await t(f, 20, h - 48, text, { size: 14, color: C.muted, width: CW - 40, lh: 20 });
  return f;
}
const big = await tile(y, 240, "cloud", "CLOUD SAVES", "Your progress follows you, instantly.");
const spot = await rect(big, 160, -60, 220, 220, C.accent, 110, "Spotlight");
await alpha(spot, C.accent, 0.25); await blur(spot, 70);
for (const [i, [label, c]] of [["PC", C.accent], ["LAPTOP", C.accent2], ["DECK", C.hot]].entries()) {
  const dv = await frame(big, 120 + i * 66, 24 + (i % 2) * 24, 56, 56, C.s2, { name: "Device " + label, r: 12 });
  await shadow(dv, [glow(c, 16, 0.35)], { color: c, a: 0.6 });
  await t(dv, 8, 22, label, mono({ size: 9, color: c, w: "Bold" }));
}
y += 256;
const ach = await tile(y, 200, "trophy", "ACHIEVEMENTS", "1 284 unlocked this week.");
await t(ach, 200, 18, "74%", { family: "Orbitron", w: "Black", size: 36, color: C.text });
await rect(ach, 200, 68, 107, 4, C.s3, 2, "Track");
const pb = await rect(ach, 200, 68, 80, 4, C.accent, 2, "Progress");
await gradient(pb, [[0, C.accent], [1, C.accent2]], 0);
y += 216;
const fr = await frame(root, P, y, 155, 150, C.s1, { name: "Bento Friends", r: 18 });
await border(fr, C.accent, 0.14);
for (const [i, c] of [C.accent, C.accent2, C.hot].entries()) await rect(fr, 18 + i * 22, 20, 32, 32, c, 16, "Avatar");
await t(fr, 18, 86, "FRIENDS", { family: "Orbitron", w: "Bold", size: 15, color: C.text });
await t(fr, 18, 110, "12 playing now", { size: 13, color: C.muted });
const fp = await frame(root, P + 172, y, 155, 150, C.s1, { name: "Bento FPS", r: 18 });
await border(fp, C.accent, 0.14);
await t(fp, 18, 18, "120", { family: "JetBrains Mono", w: "Bold", size: 32, color: C.accent2 });
await t(fp, 18, 86, "FPS", { family: "Orbitron", w: "Bold", size: 15, color: C.text });
await t(fp, 18, 110, "Buttery frames", { size: 13, color: C.muted });

// ================= HOW IT WORKS =================
y += 214;
await heading(root, y, "03", "HOW IT WORKS", "FROM WISHLIST TO WORLD");
y += 104;
const vis = await frame(root, P, y, CW, 200, C.s1, { name: "Step visual", r: 18 });
await border(vis, C.accent, 0.2);
await cover(vis, CW, 200, "#3B2E86", C.accent, "DISCOVER", 30);
await tag(vis, 16, 16, "STEP 01 / 04", { bg: C.bg, fg: C.accent2 });
y += 224;
const steps = [["01", "DISCOVER", "Curated drops every Friday."], ["02", "PLAY", "One click install, cloud saves ready."], ["03", "SHARE", "Clip and invite friends from the overlay."], ["04", "LEVEL UP", "Earn badges and Pass rewards."]];
for (const [i, [nn, title, text]] of steps.entries()) {
  const on = i === 0;
  if (on) await rect(root, P, y, 3, 64, C.accent, 2, "Active bar").then((b) => shadow(b, [glow(C.accent, 10, 0.8)]));
  await t(root, P + 18, y, nn, { family: "Orbitron", w: "Black", size: 26, color: on ? C.accent : C.line });
  await t(root, P + 74, y + 2, title, { family: "Orbitron", w: "Bold", size: 17, color: on ? C.text : C.muted, ls: 4 });
  await t(root, P + 74, y + 30, text, { size: 14, color: C.muted, width: CW - 74, lh: 20 });
  y += 84;
}
await note(root, P, y, "visual swaps per step on scroll");

// ================= STATS 2×2 =================
y += 56;
const stats = await frame(root, P, y, CW, 220, C.s1, { name: "Stats", r: 18 });
await border(stats, C.accent, 0.14);
await rect(stats, CW / 2, 20, 1, 180, C.line, 0, "Divider");
await rect(stats, 20, 110, CW - 40, 1, C.line, 0, "Divider");
for (const [i, [nn, l]] of [["2 400+", "GAMES"], ["128K", "ONLINE"], ["4.9", "RATING"], ["99.9%", "UPTIME"]].entries()) {
  const x = 20 + (i % 2) * (CW / 2), yy = 26 + Math.floor(i / 2) * 110;
  await t(stats, x, yy, nn, { family: "Orbitron", w: "Black", size: 28, color: i === 1 ? C.accent2 : C.text });
  await t(stats, x, yy + 42, l, mono({ size: 10, ls: 12 }));
}

// ================= PRICING =================
y += 268;
await heading(root, y, "04", "UMBRA PASS", "ONE PASS. EVERY NIGHT.");
y += 104;
const seg = await frame(root, P, y, CW, 48, C.s1, { name: "Monthly/Yearly", r: 999 });
await border(seg, C.accent, 0.2);
const son = await frame(seg, CW / 2, 4, CW / 2 - 4, 40, C.accent, { name: "Active", r: 999 });
await t(seg, 46, 14, "Monthly", { size: 15, w: "Medium", color: C.muted });
await t(son, 26, 10, "Yearly", { size: 15, w: "Semi Bold", color: C.bg });
await chip(son, 88, 9, "-20%", { bg: C.bg, fg: C.accent, family: "JetBrains Mono", w: "Bold", size: 11, r: 999, px: 7, py: 2 });
y += 72;
const card = await frame(root, P, y, CW, 470, C.s2, { name: "Tier PASS", r: 22 });
await shadow(card, [glow(C.accent, 40, 0.35)], { color: C.accent, a: 0.7 });
await chip(card, 172, 24, "MOST POPULAR", { bg: C.accent, fg: C.bg, family: "JetBrains Mono", w: "Bold", size: 10, r: 999, px: 10, py: 5 });
await t(card, 24, 26, "PASS", { family: "Orbitron", w: "Bold", size: 16, color: C.accent, ls: 10 });
await t(card, 24, 68, "$7.99", { family: "Orbitron", w: "Black", size: 48, color: C.text });
await t(card, 24, 130, "/ month, billed yearly", mono({ size: 12 }));
await rect(card, 24, 166, CW - 48, 1, C.line, 0, "Divider");
for (const [j, f] of ["200+ games included", "Cloud saves (50 GB)", "Early access drops", "Exclusive badges"].entries()) {
  await icon(card, "check", 24, 190 + j * 38, 18, C.accent2);
  await t(card, 54, 189 + j * 38, f, { size: 15, color: C.text });
}
const cb = await button(card, 24, 380, "GET PASS", "primary", { size: 13 });
const bh = (await cmd("get_node_info", { nodeId: cb })).absoluteBoundingBox.height;
await cmd("set_layout_sizing", { nodeId: cb, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });
await cmd("resize_node", { nodeId: cb, width: CW - 48, height: bh });
await cmd("set_axis_align", { nodeId: cb, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" });
y += 490;
for (let i = 0; i < 3; i++) await rect(root, W / 2 - 26 + i * 18, y, i === 1 ? 22 : 6, 4, i === 1 ? C.accent : C.s3, 2, "Tier dot");
await t(root, P, y + 20, "Swipe for Free and Pass+", mono({ size: 11, width: CW, align: "CENTER" }));

// ================= FAQ =================
y += 80;
await heading(root, y, "05", "FAQ", "QUESTIONS");
y += 70;
const qs = [["Is Umbra a real store?", "No — Umbra is a fictional platform made as a portfolio project. All games and prices are made up.", true], ["Can I play with a controller?", "", false], ["What if I cancel Pass?", "", false]];
for (const [q, a, open] of qs) {
  const h = open ? 150 : 64;
  const f = await frame(root, P, y, CW, h, open ? C.s1 : C.bg, { name: "FAQ " + q, r: 14 });
  await border(f, C.accent, open ? 0.3 : 0.12);
  await t(f, 18, 21, q, { size: 15, w: "Medium", color: C.text, width: CW - 70 });
  await icon(f, open ? "minus" : "plus", CW - 38, 22, 18, open ? C.accent : C.muted);
  if (open) await t(f, 18, 62, a, { size: 14, color: C.muted, width: CW - 36, lh: 22 });
  y += h + 10;
}

// ================= CTA =================
y += 50;
const cta = await frame(root, P, y, CW, 320, C.s1, { name: "CTA", r: 24 });
const cg = await rect(cta, 0, 0, CW, 320, C.accent, 0, "CTA gradient");
await gradient(cg, [[0, "#2C2550"], [0.5, C.s1], [1, "#173A40"]], 90);
const gl = await rect(cta, 60, 180, 220, 200, C.hot, 110, "CTA glow");
await alpha(gl, C.hot, 0.3); await blur(gl, 80);
await border(cta, C.accent, 0.3);
const ct = await t(cta, 0, 56, "THE NIGHT\nIS YOUNG", { family: "Orbitron", w: "Black", size: 36, color: C.text, ls: 2, width: CW, align: "CENTER", lh: 44 });
await shadow(ct.id, [glow(C.accent, 24, 0.45)]);
await t(cta, 24, 160, "First month of Pass is on us.", { size: 15, color: C.muted, width: CW - 48, align: "CENTER" });
const pb2 = await button(cta, 0, 220, "PLAY FREE NOW", "hot", { iconName: "play", size: 13 });
await cmd("move_node", { nodeId: pb2, x: Math.round((CW - (await width(pb2))) / 2), y: 220 });

// ================= FOOTER =================
y += 368;
await rect(root, P, y, CW, 1, C.line, 0, "Divider");
await t(root, P, y + 32, "UMBRA", { family: "Orbitron", w: "Black", size: 22, color: C.text, ls: 10 });
await t(root, P, y + 68, "Indie worlds for long nights.", { size: 14, color: C.muted });
for (const [i, [h, ls]] of [["PLATFORM", ["Store", "Library", "Umbra Pass"]], ["ABOUT", ["Design system", "Source code", "Contact"]]].entries()) {
  const x = P + i * 170;
  await t(root, x, y + 120, h, mono({ size: 10, ls: 12, color: C.accent2 }));
  for (const [j, l] of ls.entries()) await t(root, x, y + 146 + j * 28, l, { size: 14, color: C.muted });
}
await t(root, P, y + 256, "© 2026 Umbra — a fictional platform.\nPortfolio project, not a real store.", mono({ size: 11, lh: 18 }));
const endY = y + 320;
await cmd("resize_node", { nodeId: root, width: W, height: endY });

// ================= ОТКРЫТОЕ МЕНЮ =================
const menu = await frame(undefined, OX + W + 80, OY, W, 812, C.bg, { name: "Umbra — Mobile menu open" });
const mg = await rect(menu, -80, 420, 500, 500, C.accent, 250, "Menu glow");
await alpha(mg, C.accent, 0.22); await blur(mg, 160);
await header(menu, true);
let my = 120;
for (const [i, l] of ["Store", "Library", "Umbra Pass", "Community"].entries()) {
  const on = i === 0;
  await t(menu, P, my, `0${i + 1}`, mono({ size: 12, color: on ? C.accent2 : C.muted }));
  const tt = await t(menu, P + 40, my - 10, l.toUpperCase(), { family: "Orbitron", w: "Black", size: 34, color: on ? C.text : C.muted, ls: 2 });
  if (on) await shadow(tt.id, [glow(C.accent, 20, 0.5)]);
  my += 76;
}
const ms = await frame(menu, P, my + 20, CW, 52, C.s1, { name: "Search", r: 12 });
await border(ms, C.accent, 0.2); await icon(ms, "search", 16, 16, 20, C.muted);
await t(ms, 48, 16, "Search games…", { size: 15, color: C.muted });
const sr = await frame(menu, P, my + 96, CW, 56, C.s1, { name: "Sound row", r: 12 });
await border(sr, C.accent, 0.14); await icon(sr, "volume", 16, 18, 20, C.muted);
await t(sr, 48, 18, "Ambient sound", { size: 15, color: C.text });
const tg = await frame(sr, CW - 64, 14, 48, 28, C.s3, { name: "Toggle off", r: 999 });
await rect(tg, 3, 3, 22, 22, C.muted, 11, "Knob");
await fullButton(menu, 812 - 24 - 56, "GET PASS", "primary", "bolt");
await note(menu, P, my + 176, "links slide in one by one · bg blurs");

close();
console.log("done", endY);
