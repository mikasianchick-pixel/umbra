// Страница игры /games/hollow-signal, десктоп 1440. Запуск: bun run game.mjs <канал> [x] [y]
import { connect, frame, rect, t, chip, shadow, gradient, svgRaw, close, cmd } from "./figma.mjs";
import { C, glow, border, mono, blur, alpha, icon, hug, width, button, tag, cover, gameCard, GAMES, note, desktopHeader } from "./ui.mjs";

const OX = Number(process.argv[3] || 9000);
const OY = Number(process.argv[4] || 0);
const W = 1440, P = 96, CW = W - P * 2;
const G = GAMES[0]; // Hollow Signal

async function stretch(b, w) {
  const h = (await cmd("get_node_info", { nodeId: b })).absoluteBoundingBox.height;
  await cmd("set_layout_sizing", { nodeId: b, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });
  await cmd("resize_node", { nodeId: b, width: w, height: h });
  await cmd("set_axis_align", { nodeId: b, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" });
}
const card = async (parent, x, y, w, h, name) => {
  const f = await frame(parent, x, y, w, h, C.s1, { name, r: 20 });
  await border(f, C.accent, 0.14);
  return f;
};
const h3 = (parent, x, y, s) => t(parent, x, y, s, { family: "Orbitron", w: "Bold", size: 22, color: C.text, ls: 4 });

await connect();
const root = await frame(undefined, OX, OY, W, 4000, C.bg, { name: "Umbra — Game page /games/hollow-signal (Desktop 1440)" });

// ================= PARALLAX HERO (слои) =================
const hero = await frame(root, 0, 0, W, 760, C.bg, { name: "Parallax hero" });
const l1 = await rect(hero, 0, 0, W, 760, G.a, 0, "Layer 1 · sky (speed 0.2)");
await gradient(l1, [[0, "#2A2160", 1], [0.7, "#141228", 1], [1, C.bg, 1]], 90);
const moon = await rect(hero, 600, 90, 280, 280, C.accent, 140, "Layer 2 · moon (speed 0.35)");
await gradient(moon, [[0, "#E4DCFF"], [1, C.accent]], 135);
await shadow(moon, [glow(C.accent, 120, 0.6)]);
const haze = await rect(hero, 420, 40, 760, 500, C.accent, 380, "Haze");
await alpha(haze, C.accent, 0.18); await blur(haze, 160);
await svgRaw(hero, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 300"><path d="M0 220 120 150 240 190 380 110 520 180 640 120 780 170 900 90 1040 160 1180 100 1320 170 1440 130V300H0z" fill="#2C2550" fill-opacity="0.85"/></svg>`, 0, 400, W, "Layer 3 · far ridge (speed 0.5)");
await svgRaw(hero, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 260"><path d="M0 200 160 120 300 170 460 90 600 160 760 110 900 180 1060 120 1220 190 1440 140V260H0z" fill="#12121A"/></svg>`, 0, 520, W, "Layer 4 · near ridge (speed 0.8)");
// радиовышка — тема игры
await svgRaw(hero, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 400" fill="none" stroke="#090910" stroke-width="5" stroke-linejoin="round"><path d="M60 10 20 400M60 10l40 390M34 300h52M40 220h40M47 140h26M30 360 90 300M90 360 30 300M36 280 84 220M84 280 36 220"/></svg>`, 760, 190, 120, "Layer 5 · radio tower (speed 1.0)");
const beacon = await rect(hero, 814, 192, 12, 12, C.hot, 6, "Beacon (blinks)");
await shadow(beacon, [glow(C.hot, 20, 1), glow(C.hot, 60, 0.6)]);
for (const [i, r] of [60, 110, 160].entries()) {
  const w = await frame(hero, 820 - r, 198 - r, r * 2, r * 2, C.bg, { name: "Signal wave " + i, r: 999 });
  await alpha(w, C.bg, 0.001); // 0 плагин считает «не задано»
  await shadow(w, [], { color: C.hot, a: 0.5 - i * 0.14 });
}
const hf = await rect(hero, 0, 560, W, 200, C.bg, 0, "Bottom fade");
await gradient(hf, [[0, C.bg, 0], [1, C.bg, 1]], 90);
await desktopHeader(root, P, 24, CW, 0);
await note(root, W - P - 340, 132, "5 parallax layers · each moves at its own speed");

// заголовок игры
await t(root, P, 150, "STORE / HORROR / HOLLOW SIGNAL", mono({ w: "Medium", size: 12, color: C.accent2, ls: 12 }));
let tx = P;
for (const tg of ["NEW", ...G.tags]) {
  const id = tg === "NEW"
    ? await chip(root, tx, 400, tg, { bg: C.accent2, fg: C.bg, family: "JetBrains Mono", w: "Bold", size: 12, r: 6, px: 8, py: 4 })
    : await tag(root, tx, 400, tg, { bg: C.s1, stroke: C.line, size: 12, px: 12, py: 5 });
  tx += (await width(id)) + 8;
}
const title = await t(root, P, 440, "HOLLOW\nSIGNAL", { family: "Orbitron", w: "Black", size: 104, color: C.text, ls: 4, lh: 108 });
await shadow(title.id, [glow(C.accent, 40, 0.5)]);
await t(root, P, 676, "by STATIC MOTH  ·  A lonely radio tower keeps receiving voices that shouldn't exist.", { size: 17, color: C.muted });

// панель покупки
const buy = await frame(root, 1000, 380, 344, 360, C.s1, { name: "Purchase panel", r: 24 });
await alpha(buy, C.s1, 0.8);
await shadow(buy, [glow("#000000", 40, 0.5)], { color: C.accent, a: 0.3 });
await chip(buy, 24, 24, "INCLUDED IN UMBRA PASS", { bg: C.s2, fg: C.accent, stroke: C.accent, family: "JetBrains Mono", w: "Bold", size: 11, r: 999, px: 10, py: 5 });
await t(buy, 24, 70, "$14.99", { family: "Orbitron", w: "Black", size: 44, color: C.text });
const rt = await hug(buy, 220, 84, C.s1, { px: 0, py: 0, gap: 6, r: 0, name: "Rating" });
await icon(rt, "star", 0, 0, 16, C.accent2, C.accent2);
await t(rt, 0, 0, "4.8", { family: "JetBrains Mono", w: "Bold", size: 15, color: C.text });
await t(rt, 0, 0, "(2.1k)", mono({ size: 13 }));
const play = await button(buy, 24, 148, "PLAY NOW", "hot", { iconName: "play" });
await stretch(play, 296);
const wl = await button(buy, 24, 216, "ADD TO WISHLIST", "ghost", { iconName: "heart", size: 13 });
await stretch(wl, 296);
await rect(buy, 24, 290, 296, 1, C.line, 0, "Divider");
await t(buy, 24, 310, "WINDOWS · LINUX · DECK", mono({ size: 11, ls: 10 }));
await t(buy, 236, 310, "4.2 GB", mono({ size: 11, color: C.text }));

// ================= ВКЛАДКИ =================
let y = 800;
await rect(root, P, y + 52, CW, 1, C.line, 0, "Tabs line");
let tbx = P;
for (const [i, l] of ["Overview", "Achievements", "Reviews  2.1k", "Requirements"].entries()) {
  const on = i === 0;
  const tt = await t(root, tbx, y + 14, l, { size: 16, w: on ? "Semi Bold" : "Regular", color: on ? C.text : C.muted });
  if (on) { const u = await rect(root, tbx, y + 50, tt.width, 3, C.accent, 2, "Tab indicator"); await shadow(u, [glow(C.accent, 10, 0.8)]); }
  tbx += tt.width + 48;
}
await note(root, tbx + 20, y + 14, "indicator slides between tabs");

// ================= ЛЕВАЯ КОЛОНКА =================
y += 104;
const LW = 780;
await h3(root, P, y, "ABOUT");
await t(root, P, y + 44, "You are the last operator of Hollow Ridge relay. Every night at 03:00 the tower picks up a broadcast — voices of people who never lived here. Tune the dial, decode the noise and decide which signals to answer.", { size: 17, color: C.muted, width: LW, lh: 28 });
await t(root, P, y + 150, "A slow, atmospheric horror about listening. No jump scares — just you, the static and something that is learning your voice.", { size: 17, color: C.muted, width: LW, lh: 28 });

// галерея
y += 250;
await h3(root, P, y, "GALLERY");
const gmain = await frame(root, P, y + 44, LW, 420, C.s2, { name: "Gallery main", r: 20 });
await cover(gmain, LW, 420, "#3B2E86", C.accent, "03:00 AM", 40);
const pl = await frame(gmain, LW / 2 - 36, 174, 72, 72, C.bg, { name: "Play trailer", r: 999 });
await alpha(pl, C.bg, 0.6); await border(pl, C.text, 0.4);
await icon(pl, "play", 24, 22, 28, C.text, C.text);
const thumbs = [["#3B2E86", C.accent], ["#1E5E6B", C.accent2], ["#6B2A55", C.hot], ["#2B3F8F", "#8FB4FF"]];
for (const [i, [a, b]] of thumbs.entries()) {
  const th = await frame(root, P + i * 199, y + 480, 183, 103, C.s2, { name: "Thumb " + i, r: 12 });
  await cover(th, 183, 103, a, b, "", 1);
  if (i === 0) await shadow(th, [], { color: C.accent, a: 1, weight: 2 });
}
await note(root, P, y + 600, "lightbox on click · arrow keys / swipe");

// достижения
y += 660;
await h3(root, P, y, "ACHIEVEMENTS");
await t(root, P + LW - 160, y + 4, "12 / 36 unlocked", mono({ size: 13, color: C.text }));
const ach = [
  ["First Contact", "Answer your first signal", 100, C.accent],
  ["Night Owl", "Stay on air until dawn", 100, C.accent2],
  ["Static Poet", "Decode 50 broadcasts", 64, C.hot],
  ["Silence", "Ignore every call for a night", 3, C.muted],
];
for (const [i, [n, d, p, c]] of ach.entries()) {
  const x = P + (i % 2) * 398, yy = y + 48 + Math.floor(i / 2) * 116;
  const a = await card(root, x, yy, 382, 100, "Achievement " + n);
  const done = p === 100;
  const badge = await frame(a, 20, 22, 56, 56, done ? c : C.s2, { name: "Badge", r: 16 });
  if (done) await shadow(badge, [glow(c, 20, 0.5)]); else await border(badge, C.accent, 0.3);
  await icon(badge, "trophy", 14, 14, 28, done ? C.bg : C.muted);
  await t(a, 92, 22, n, { size: 16, w: "Semi Bold", color: done ? C.text : C.muted });
  await t(a, 92, 46, d, { size: 13, color: C.muted });
  if (done) await t(a, 92, 70, "UNLOCKED", mono({ w: "Bold", size: 11, color: c, ls: 10 }));
  else {
    await rect(a, 92, 76, 200, 4, C.s3, 2, "Track");
    if (p > 5) { const pr = await rect(a, 92, 76, 2 * p, 4, c, 2, "Progress"); await shadow(pr, [glow(c, 8, 0.6)]); }
    await t(a, 304, 69, p + "%", mono({ size: 11, color: C.text }));
  }
}
await note(root, P, y + 290, "unlock: badge flips + sparkle burst");

// отзывы
y += 350;
await h3(root, P, y, "REVIEWS");
const reviews = [
  ["nightshift_ana", "4h on record", "I played with headphones at 2am. Bad idea. Best idea. The radio dial is the most tactile UI I've touched in a game.", C.accent],
  ["kilowatt", "11h on record", "Slow, patient and genuinely unsettling. The sound design carries everything — wish there was a photo mode.", C.accent2],
];
for (const [i, [u, h, txt, c]] of reviews.entries()) {
  const r = await card(root, P, y + 48 + i * 184, LW, 168, "Review " + u);
  await rect(r, 24, 24, 40, 40, c, 20, "Avatar");
  await t(r, 78, 24, u, { size: 15, w: "Semi Bold", color: C.text });
  await t(r, 78, 46, h, mono({ size: 11 }));
  const st = await hug(r, LW - 140, 30, C.s1, { px: 0, py: 0, gap: 2, r: 0, name: "Stars" });
  for (let s = 0; s < 5; s++) await icon(st, "star", 0, 0, 16, s < 5 - i ? C.accent2 : C.s3, s < 5 - i ? C.accent2 : C.s3);
  await t(r, 24, 84, txt, { size: 15, color: C.muted, width: LW - 48, lh: 24 });
}
const leftEnd = y + 48 + 2 * 184;

// ================= ПРАВАЯ КОЛОНКА =================
const RX = P + LW + 32, RW = CW - LW - 32;
let ry = 904;
const req = await card(root, RX, ry, RW, 360, "System requirements");
await t(req, 24, 24, "REQUIREMENTS", { family: "Orbitron", w: "Bold", size: 16, color: C.text, ls: 6 });
const seg = await frame(req, 24, 64, RW - 48, 40, C.bg, { name: "Min/Rec", r: 999 });
const sOn = await frame(seg, 4, 4, (RW - 48) / 2 - 4, 32, C.s3, { name: "Active", r: 999 });
await t(sOn, 40, 7, "Minimum", { size: 14, w: "Medium", color: C.text });
await t(seg, (RW - 48) / 2 + 30, 11, "Recommended", { size: 14, color: C.muted });
const rows = [["OS", "Windows 10 / SteamOS"], ["CPU", "Ryzen 3 3100"], ["GPU", "GTX 1050 Ti"], ["RAM", "8 GB"], ["DISK", "4.2 GB SSD"]];
for (const [i, [k, v]] of rows.entries()) {
  await t(req, 24, 128 + i * 44, k, mono({ size: 12, ls: 10 }));
  await t(req, 120, 126 + i * 44, v, { size: 15, color: C.text });
  if (i < rows.length - 1) await rect(req, 24, 160 + i * 44, RW - 48, 1, C.line, 0, "Row line");
}
ry += 384;
const info = await card(root, RX, ry, RW, 260, "Game info");
for (const [i, [k, v]] of [["DEVELOPER", "Static Moth"], ["RELEASE", "Oct 31, 2026"], ["LANGUAGES", "EN, DE, JP, ES"], ["MODES", "Single-player"], ["CONTROLLER", "Full support"]].entries()) {
  await t(info, 24, 28 + i * 44, k, mono({ size: 11, ls: 10 }));
  await t(info, 170, 26 + i * 44, v, { size: 15, color: i === 4 ? C.success : C.text });
}
ry += 284;
const pass = await frame(root, RX, ry, RW, 220, C.s2, { name: "Pass promo", r: 20 });
const pg = await rect(pass, 0, 0, RW, 220, C.accent, 0, "Gradient");
await gradient(pg, [[0, "#2C2550"], [1, "#173A40"]], 0);
await shadow(pass, [glow(C.accent, 30, 0.25)], { color: C.accent, a: 0.4 });
await t(pass, 24, 28, "PLAY IT WITH\nUMBRA PASS", { family: "Orbitron", w: "Black", size: 22, color: C.text, ls: 2, lh: 28 });
await t(pass, 24, 96, "200+ games, one price. First month free.", { size: 14, color: C.muted, width: RW - 48, lh: 22 });
await button(pass, 24, 148, "GET PASS", "primary", { iconName: "bolt", size: 12 });

// ================= ПОХОЖИЕ ИГРЫ =================
y = leftEnd + 96;
await t(root, P, y, "MORE LIKE THIS", mono({ w: "Medium", size: 13, color: C.accent2, ls: 12 }));
await t(root, P, y + 28, "IF YOU LIKE THE DARK", { family: "Orbitron", w: "Black", size: 40, color: C.text, ls: 2 });
y += 110;
for (const [i, gi] of [5, 2, 3].entries()) await gameCard(root, P + i * 424, y, GAMES[gi], { w: 400 });
await note(root, P, y + 504, "cover morphs into the game page hero (View Transitions)");

// футер-строка
y += 580;
await rect(root, P, y, CW, 1, C.line, 0, "Divider");
await t(root, P, y + 32, "© 2026 Umbra — a fictional platform. Portfolio project, not a real store.", mono({ size: 12 }));
await cmd("resize_node", { nodeId: root, width: W, height: y + 100 });

close();
console.log("done", y + 100);
