// Страница Components (палитра v2). Запуск: bun run components.mjs <канал> [x] [y]
import { connect, frame, rect, t, chip, shadow, gradient, svgRaw, close, cmd, hex } from "./figma.mjs";

const C = {
  bg: "#090910", s1: "#12121A", s2: "#1B1A26", s3: "#24232F", line: "#2A2838",
  text: "#EAEAF0", muted: "#9D9DAB", accent: "#AD99FB", accent2: "#6FDAE6", hot: "#ED83B4",
  success: "#72D699", danger: "#ED7473",
};
const OX = Number(process.argv[3] || 3200);
const OY = Number(process.argv[4] || 0);
const W = 1440, H = 3560, P = 96;

const glow = (color, blur, a = 0.4, spread = 0) => ({ type: "DROP_SHADOW", color, a, blur, spread });
const ring = [{ type: "DROP_SHADOW", color: C.bg, a: 1, blur: 0, spread: 3 }, { type: "DROP_SHADOW", color: C.accent2, a: 1, blur: 0, spread: 5 }];
const border = (id, color = C.accent, a = 0.14) => shadow(id, [], { color, a });
const mono = (o = {}) => ({ family: "JetBrains Mono", size: 12, color: C.muted, ...o });

// ---------- иконки (простые линейные, 24×24) ----------
const ico = (body, color, fill = "none") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const I = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  volume: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  pad: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18" cy="13.5" r=".8"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
};
const icon = (parent, name, x, y, size, color, fill) => svgRaw(parent, ico(I[name], color, fill), x, y, size, "Icon " + name);

async function hug(parent, x, y, bg, { px = 28, py = 16, gap = 10, r = 12, name = "Auto" } = {}) {
  const f = await frame(parent, x, y, 10, 10, bg, { name, r });
  await cmd("set_layout_mode", { nodeId: f, layoutMode: "HORIZONTAL" });
  await cmd("set_padding", { nodeId: f, paddingTop: py, paddingBottom: py, paddingLeft: px, paddingRight: px });
  await cmd("set_axis_align", { nodeId: f, counterAxisAlignItems: "CENTER" });
  await cmd("set_item_spacing", { nodeId: f, itemSpacing: gap });
  await cmd("set_layout_sizing", { nodeId: f, layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  return f;
}

async function section(root, y, num, title, note) {
  const l = await rect(root, P, y - 40, W - P * 2, 1, C.accent, 0, "Divider");
  await cmd("set_fill_color", { nodeId: l, color: hex(C.accent, 0.12) });
  await t(root, P, y, num, mono({ w: "Medium", size: 13, color: C.accent2, ls: 10 }));
  await t(root, P, y + 24, title, { family: "Orbitron", w: "Bold", size: 32, color: C.text, ls: 4 });
  if (note) await t(root, P, y + 72, note, { size: 15, color: C.muted, width: 720, lh: 24 });
}

await connect();
const root = await frame(undefined, OX, OY, W, H, C.bg, { name: "Umbra — Components" });
const blob = await rect(root, 900, -300, 800, 800, C.accent, 400, "Glow blob");
await gradient(blob, [[0, C.accent, 0.18], [1, C.accent, 0]], 90);
await cmd("set_effects", { nodeId: blob, effects: [{ type: "LAYER_BLUR", blur: 240 }] });

await t(root, P, 96, "UMBRA / DESIGN SYSTEM", mono({ w: "Medium", size: 13, color: C.accent2, ls: 12 }));
const h = await t(root, P, 124, "COMPONENTS", { family: "Orbitron", w: "Black", size: 88, color: C.text, ls: 6 });
await shadow(h.id, [glow(C.accent, 40, 0.45)]);
await t(root, P, 240, "Every UI element in every state — default, hover, focus, disabled.", { size: 20, color: C.muted });

// ---------- 01 кнопки ----------
let y = 380;
await section(root, y, "01", "BUTTONS", "Primary for the main action, ghost for secondary, hot pink only for Play. Focus ring is cyan with a 3px gap.");
y += 150;
const states = ["DEFAULT", "HOVER", "FOCUS", "DISABLED"];
for (let i = 0; i < 4; i++) await t(root, P + 220 + i * 260, y, states[i], mono({ ls: 10 }));
y += 40;
const kinds = [
  ["primary", "GET STARTED", C.accent, C.bg, "#C2B3FF"],
  ["ghost", "BROWSE GAMES", C.s1, C.text, C.s2],
  ["hot", "PLAY NOW", C.hot, C.bg, "#F59DC6"],
];
for (const [kind, label, bg, fg, hoverBg] of kinds) {
  await t(root, P, y + 18, kind, mono({ size: 13, color: C.text }));
  for (let s = 0; s < 4; s++) {
    const dis = s === 3;
    const b = await hug(root, P + 220 + s * 260, y, dis ? C.s2 : s === 1 ? hoverBg : bg, { name: `Button ${kind} ${states[s]}` });
    const col = dis ? C.muted : fg;
    if (kind === "hot") await icon(b, "play", 0, 0, 12, col, col);
    await t(b, 0, 0, label, { family: "Orbitron", w: "Bold", size: 14, ls: 8, color: col, opacity: dis ? 0.5 : 1 });
    if (kind === "primary" && !dis) await shadow(b, s === 1 ? [glow(C.accent, 40, 0.55)] : s === 2 ? ring : [glow(C.accent, 24, 0.35)]);
    if (kind === "hot" && !dis) await shadow(b, s === 1 ? [glow(C.hot, 44, 0.55)] : s === 2 ? ring : [glow(C.hot, 24, 0.35)]);
    if (kind === "ghost") await shadow(b, s === 2 ? ring : [], { color: s === 1 ? C.accent : C.accent, a: s === 1 ? 0.6 : dis ? 0.1 : 0.3 });
  }
  y += 88;
}
// иконки-кнопки
await t(root, P, y + 14, "icon", mono({ size: 13, color: C.text }));
const ib = [["volume", false], ["heart", false], ["heart", true], ["search", false]];
for (let i = 0; i < ib.length; i++) {
  const [n, on] = ib[i];
  const f = await frame(root, P + 220 + i * 72, y, 48, 48, on ? C.s2 : C.s1, { name: "Icon button " + n, r: 999 });
  await border(f, C.accent, on ? 0.6 : 0.2);
  await icon(f, n, 14, 14, 20, on ? C.hot : C.text, on ? C.hot : "none");
  if (on) await shadow(f, [glow(C.hot, 20, 0.35)], { color: C.hot, a: 0.5 });
}

// ---------- 02 поля и переключатели ----------
y += 180;
await section(root, y, "02", "INPUTS & CONTROLS", "Search with keyboard hint, error state with message, toggles and the Monthly / Yearly switch for Umbra Pass.");
y += 150;
const fields = [["DEFAULT", C.accent, 0.14, "Search games, genres, studios…", C.muted], ["FOCUS", C.accent2, 1, "neon dri", C.text], ["ERROR", C.danger, 1, "user@umbra", C.text]];
for (let i = 0; i < 3; i++) {
  const [st, bc, a, ph, tc] = fields[i];
  const x = P + i * 424;
  await t(root, x, y, st, mono({ ls: 10 }));
  const f = await frame(root, x, y + 28, 400, 52, C.s1, { name: "Input " + st, r: 12 });
  await shadow(f, st === "FOCUS" ? [glow(C.accent2, 16, 0.25)] : [], { color: bc, a });
  if (i < 2) await icon(f, "search", 16, 16, 20, i === 1 ? C.accent2 : C.muted);
  await t(f, i < 2 ? 48 : 18, 16, ph, { size: 15, color: tc });
  if (i === 0) await chip(f, 330, 14, "Ctrl K", { bg: C.s3, fg: C.muted, family: "JetBrains Mono", size: 11, r: 6, px: 8, py: 3 });
  if (i === 1) await rect(f, 120, 14, 2, 24, C.accent2, 1, "Caret");
  if (i === 2) await t(root, x, y + 92, "Please enter a valid email address", { size: 13, color: C.danger });
}
y += 150;
// переключатели
async function toggle(x, on, label) {
  const tr = await frame(root, x, y, 48, 28, on ? C.accent : C.s3, { name: "Toggle " + (on ? "on" : "off"), r: 999 });
  if (on) await shadow(tr, [glow(C.accent, 16, 0.4)]);
  await rect(tr, on ? 23 : 3, 3, 22, 22, on ? C.bg : C.muted, 11, "Knob");
  await t(root, x + 60, y + 4, label, { size: 15, color: C.text });
}
await toggle(P, true, "Cloud saves");
await toggle(P + 220, false, "Ambient sound");
// чекбоксы
const cb1 = await frame(root, P + 460, y + 2, 24, 24, C.accent, { name: "Checkbox on", r: 6 });
await icon(cb1, "check", 4, 4, 16, C.bg);
await t(root, P + 494, y + 4, "Controller support", { size: 15, color: C.text });
const cb2 = await frame(root, P + 700, y + 2, 24, 24, C.s1, { name: "Checkbox off", r: 6 });
await border(cb2, C.accent, 0.4);
await t(root, P + 734, y + 4, "Co-op", { size: 15, color: C.text });
// сегмент месяц/год
const seg = await frame(root, W - P - 300, y - 8, 300, 48, C.s1, { name: "Segmented Monthly/Yearly", r: 999 });
await border(seg, C.accent, 0.2);
const on = await frame(seg, 150, 4, 146, 40, C.accent, { name: "Active", r: 999 });
await shadow(on, [glow(C.accent, 20, 0.4)]);
await t(seg, 40, 14, "Monthly", { size: 15, w: "Medium", color: C.muted });
await t(on, 22, 10, "Yearly", { size: 15, w: "Semi Bold", color: C.bg });
await chip(on, 82, 9, "-20%", { bg: C.bg, fg: C.accent, family: "JetBrains Mono", w: "Bold", size: 11, r: 999, px: 7, py: 2 });

// ---------- 03 теги и бейджи ----------
y += 140;
await section(root, y, "03", "TAGS & BADGES", "Mono tags for genres, badges for price drops and new releases, live counter for players online.");
y += 150;
let cx = P;
for (const g of ["ROGUELIKE", "SYNTHWAVE", "CO-OP", "PIXEL", "STEALTH", "OPEN WORLD"]) {
  const id = await chip(root, cx, y, g, { bg: C.s1, fg: C.muted, stroke: C.line, family: "JetBrains Mono", w: "Medium", size: 12, ls: 10, r: 999, px: 14, py: 7 });
  const inf = await cmd("get_node_info", { nodeId: id });
  cx += inf.absoluteBoundingBox.width + 10;
}
const act = await chip(root, cx, y, "ROGUELIKE ✓", { bg: C.s2, fg: C.accent, stroke: C.accent, family: "JetBrains Mono", w: "Medium", size: 12, r: 999, px: 14, py: 7 });
y += 64;
await chip(root, P, y, "-40%", { bg: C.hot, fg: C.bg, family: "JetBrains Mono", w: "Bold", size: 13, r: 6, px: 8, py: 4 });
await chip(root, P + 80, y, "NEW", { bg: C.accent2, fg: C.bg, family: "JetBrains Mono", w: "Bold", size: 13, r: 6, px: 8, py: 4 });
await chip(root, P + 160, y, "EARLY ACCESS", { bg: C.s2, fg: C.accent, stroke: C.accent, family: "JetBrains Mono", w: "Bold", size: 12, r: 6, px: 8, py: 4 });
await chip(root, P + 320, y, "128 402 online", { bg: C.s1, fg: C.text, stroke: C.line, dot: C.success, family: "JetBrains Mono", w: "Medium", size: 13, r: 999, px: 12, py: 6 });
const rt = await hug(root, P + 520, y, C.s1, { px: 12, py: 6, gap: 6, r: 999, name: "Rating" });
await icon(rt, "star", 0, 0, 14, C.accent2, C.accent2);
await t(rt, 0, 0, "4.8", { family: "JetBrains Mono", w: "Bold", size: 13, color: C.text });
await t(rt, 0, 0, "(2.1k)", mono({ size: 13 }));

// ---------- 04 карточки игр ----------
y += 140;
await section(root, y, "04", "GAME CARD", "Cover art is procedural (gradients + light), so every fictional game gets its own look with zero image licensing.");
y += 150;
async function cover(parent, w, hgt, a, b, title) {
  const cv = await frame(parent, 0, 0, w, hgt, C.s2, { name: "Cover" });
  const g = await rect(cv, 0, 0, w, hgt, a, 0, "Cover gradient");
  await gradient(g, [[0, a, 0.9], [0.6, b, 0.55], [1, C.bg, 1]], 120);
  const orb = await rect(cv, w * 0.55, hgt * 0.1, hgt * 0.7, hgt * 0.7, b, hgt, "Orb");
  await cmd("set_effects", { nodeId: orb, effects: [{ type: "LAYER_BLUR", blur: 40 }] });
  const ln = await rect(cv, 0, hgt * 0.72, w, 1, C.text, 0, "Horizon");
  await cmd("set_fill_color", { nodeId: ln, color: hex(C.text, 0.25) });
  const tt = await t(cv, 20, hgt - 88, title, { family: "Orbitron", w: "Black", size: 26, color: C.text, ls: 4 });
  await shadow(tt.id, [glow(b, 18, 0.6)]);
  return cv;
}
async function card(x, st, game) {
  const lift = st === "HOVER" ? -8 : 0;
  await t(root, x, y, st, mono({ ls: 10 }));
  const c = await frame(root, x, y + 32 + lift, 360, 452, C.s1, { name: "Game card " + st, r: 16 });
  await shadow(c, st === "HOVER" ? [glow(game.b, 48, 0.35)] : st === "FOCUS" ? ring : [], { color: st === "HOVER" ? game.b : C.accent, a: st === "HOVER" ? 0.5 : 0.14 });
  await cover(c, 360, 240, game.a, game.b, game.title);
  if (game.badge) await chip(c, 16, 16, game.badge, { bg: game.badgeBg, fg: C.bg, family: "JetBrains Mono", w: "Bold", size: 12, r: 6, px: 8, py: 4 });
  const fav = await frame(c, 304, 16, 40, 40, C.bg, { name: "Wishlist", r: 999 });
  await cmd("set_fill_color", { nodeId: fav, color: hex(C.bg, 0.6) });
  await icon(fav, "heart", 10, 10, 20, st === "HOVER" ? C.hot : C.text, st === "HOVER" ? C.hot : "none");
  await t(c, 20, 260, game.studio, mono({ size: 12, ls: 6 }));
  await t(c, 20, 282, game.name, { size: 20, w: "Semi Bold", color: C.text });
  let tx = 20;
  for (const g of game.tags) {
    const id = await chip(c, tx, 322, g, { bg: C.s2, fg: C.muted, family: "JetBrains Mono", w: "Medium", size: 11, r: 999, px: 10, py: 4 });
    const inf = await cmd("get_node_info", { nodeId: id });
    tx += inf.absoluteBoundingBox.width + 8;
  }
  const dl = await rect(c, 20, 368, 320, 1, C.line, 0, "Divider");
  const rt = await hug(c, 20, 392, C.s1, { px: 0, py: 0, gap: 6, r: 0, name: "Rating" });
  await icon(rt, "star", 0, 0, 14, C.accent2, C.accent2);
  await t(rt, 0, 0, game.rating, { family: "JetBrains Mono", w: "Bold", size: 14, color: C.text });
  if (game.old) await t(c, 196, 394, game.old, mono({ size: 14, color: C.muted }));
  await t(c, game.old ? 262 : 270, 390, game.price, { family: "JetBrains Mono", w: "Bold", size: 18, color: game.old ? C.hot : C.text });
}
const GAMES = [
  { title: "HOLLOW\nSIGNAL", name: "Hollow Signal", studio: "STATIC MOTH", a: "#4B3A9E", b: C.accent, tags: ["HORROR", "RADIO", "SOLO"], rating: "4.8", price: "$14.99", badge: "NEW", badgeBg: C.accent2 },
  { title: "GLASS\nWING", name: "Glasswing", studio: "PAPER ORBIT", a: "#1E5E6B", b: C.accent2, tags: ["FLIGHT", "CO-OP"], rating: "4.6", price: "$8.99", old: "$14.99", badge: "-40%", badgeBg: C.hot },
  { title: "LAST\nLUMEN", name: "Last Lumen", studio: "NORTHWAKE", a: "#6B2A55", b: C.hot, tags: ["ROGUELIKE", "PIXEL"], rating: "4.9", price: "$19.99" },
];
await card(P, "DEFAULT", GAMES[0]);
await card(P + 424, "HOVER", GAMES[1]);
await card(P + 848, "FOCUS", GAMES[2]);

// ---------- 05 навигация ----------
y += 600;
await section(root, y, "05", "NAVIGATION", "Glass header. The dot under the active link slides between sections; search opens the command palette.");
y += 150;
const nav = await frame(root, P, y, W - P * 2, 72, C.s1, { name: "Header", r: 16 });
await cmd("set_fill_color", { nodeId: nav, color: hex(C.s1, 0.72) });
await border(nav, C.accent, 0.16);
const lg = await t(nav, 28, 22, "UMBRA", { family: "Orbitron", w: "Black", size: 22, color: C.text, ls: 10 });
await shadow(lg.id, [glow(C.accent, 16, 0.5)]);
const links = ["Store", "Library", "Umbra Pass", "Community"];
let lx = 220;
for (let i = 0; i < links.length; i++) {
  const tl = await t(nav, lx, 25, links[i], { size: 15, w: i === 0 ? "Semi Bold" : "Regular", color: i === 0 ? C.text : C.muted });
  if (i === 0) {
    const d = await rect(nav, lx + 18, 52, 6, 6, C.accent2, 3, "Active dot");
    await shadow(d, [glow(C.accent2, 8, 0.8)]);
  }
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

// ---------- 06 обратная связь ----------
y += 200;
await section(root, y, "06", "FEEDBACK & OVERLAYS", "Command palette (Ctrl+K or /), toast, tooltip and the 0 → 100% loader.");
y += 150;
// командная палитра
const pal = await frame(root, P, y, 620, 420, C.s2, { name: "Command palette", r: 16 });
await shadow(pal, [glow("#000000", 60, 0.6, 0), glow(C.accent, 60, 0.15)], { color: C.accent, a: 0.25 });
await icon(pal, "search", 20, 22, 20, C.accent2);
await t(pal, 52, 22, "neo", { size: 17, color: C.text });
await rect(pal, 84, 22, 2, 22, C.accent2, 1, "Caret");
await chip(pal, 556, 20, "ESC", { bg: C.s3, fg: C.muted, family: "JetBrains Mono", size: 11, r: 6, px: 8, py: 3 });
await rect(pal, 0, 66, 620, 1, C.line, 0, "Divider");
await t(pal, 20, 84, "GAMES", mono({ size: 11, ls: 12 }));
const items = [["pad", "Neon Drift", "Racing · $12.99", true], ["pad", "Neon Saints", "Brawler · Free", false]];
let iy = 108;
for (const [ic, a, b, active] of items) {
  const row = await frame(pal, 8, iy, 604, 52, active ? C.s3 : C.s2, { name: "Item " + a, r: 10 });
  if (active) await border(row, C.accent, 0.35);
  await icon(row, ic, 14, 14, 24, active ? C.accent : C.muted);
  await t(row, 52, 8, a, { size: 15, w: "Medium", color: C.text });
  await t(row, 52, 28, b, mono({ size: 11 }));
  if (active) await icon(row, "arrow", 568, 16, 20, C.accent);
  iy += 56;
}
await t(pal, 20, iy + 12, "COMMANDS", mono({ size: 11, ls: 12 }));
iy += 36;
for (const [cmdName, desc] of [["/neon", "Boost the glow"], ["/retro", "CRT scanlines filter"], ["/calm", "Reduce motion"]]) {
  await t(pal, 22, iy + 10, cmdName, { family: "JetBrains Mono", w: "Bold", size: 14, color: C.accent2 });
  await t(pal, 120, iy + 10, desc, { size: 14, color: C.muted });
  iy += 40;
}
// тост
const tx2 = P + 680;
const toast = await frame(root, tx2, y, 468, 64, C.s2, { name: "Toast", r: 12 });
await shadow(toast, [glow("#000000", 30, 0.5)], { color: C.success, a: 0.35 });
const tc = await frame(toast, 16, 18, 28, 28, C.success, { name: "Toast icon", r: 999 });
await icon(tc, "check", 6, 6, 16, C.bg);
await t(toast, 58, 21, "Added to wishlist", { size: 15, w: "Medium", color: C.text });
await t(toast, 360, 22, "UNDO", { family: "JetBrains Mono", w: "Bold", size: 13, color: C.accent, ls: 10 });
await icon(toast, "x", 428, 22, 18, C.muted);
// тултип
const tip = await hug(root, tx2, y + 110, C.s3, { px: 12, py: 8, r: 8, name: "Tooltip" });
await t(tip, 0, 0, "Toggle ambient sound", { size: 13, color: C.text });
await chip(tip, 0, 0, "M", { bg: C.bg, fg: C.muted, family: "JetBrains Mono", size: 11, r: 4, px: 6, py: 1 });
// загрузчик
const ld = await frame(root, tx2, y + 190, 468, 230, C.bg, { name: "Loader", r: 16 });
await border(ld, C.accent, 0.14);
const pct = await t(ld, 160, 50, "64%", { family: "Orbitron", w: "Black", size: 64, color: C.text, ls: 4 });
await shadow(pct.id, [glow(C.accent, 30, 0.5)]);
await rect(ld, 40, 160, 388, 4, C.s3, 2, "Track");
const bar = await rect(ld, 40, 160, 248, 4, C.accent, 2, "Progress");
await gradient(bar, [[0, C.accent], [1, C.accent2]], 0);
await shadow(bar, [glow(C.accent2, 12, 0.7)]);
await t(ld, 40, 182, "LOADING WORLDS", mono({ size: 11, ls: 14 }));
await t(ld, 360, 182, "v0.2", mono({ size: 11 }));

close();
console.log("done", y);
