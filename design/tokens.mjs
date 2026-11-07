// Страница Tokens: цвета, типографика, отступы, радиусы, свечения. Запуск: bun run tokens.mjs <канал> [x] [y] [v1|v2]
import { connect, frame, rect, t, shadow, gradient, svgRaw, close, cmd, hex } from "./figma.mjs";

const PALETTES = {
  // v1 — первая версия: насыщенный неон
  v1: {
    bg: "#07070D", s1: "#0F0F1A", s2: "#171728", border: "#9D7BFF",
    text: "#E6E6F0", muted: "#8B8BA3", accent: "#9D7BFF", accent2: "#3DE8FF", hot: "#FF4FD8",
    success: "#4ADE80", danger: "#FF5C7A", glowK: 1,
  },
  // v2 — «мягкий неон»: подобрано в OKLCH, у трёх акцентов одинаковые яркость и насыщенность → смотрятся одной семьёй
  v2: {
    bg: "#090910", s1: "#12121A", s2: "#1B1A26", border: "#AD99FB",
    text: "#EAEAF0", muted: "#9D9DAB", accent: "#AD99FB", accent2: "#6FDAE6", hot: "#ED83B4",
    success: "#72D699", danger: "#ED7473", glowK: 0.7,
  },
};
const VER = process.argv[5] || "v2";
const C = PALETTES[VER];
const OX = Number(process.argv[3] || 0);
const OY = Number(process.argv[4] || 0);
const W = 1440, H = 2900, P = 96;

const glow = (color, blur, a = 0.55, spread = 0) => ({ type: "DROP_SHADOW", color, a: a * C.glowK, blur, spread });
const line = (id) => shadow(id, [], { color: C.border, a: 0.14 });

async function section(root, y, num, title, note) {
  await t(root, P, y, num, { family: "JetBrains Mono", w: "Medium", size: 13, color: C.accent2, ls: 10 });
  await t(root, P, y + 24, title, { family: "Orbitron", w: "Bold", size: 32, color: C.text, ls: 4 });
  if (note) await t(root, P, y + 72, note, { size: 15, color: C.muted, width: 640, lh: 24 });
  const l = await rect(root, P, y - 32, W - P * 2, 1, C.border, 0, "Divider");
  await cmd("set_fill_color", { nodeId: l, color: hex(C.accent, 0.14) });
}

await connect();
const root = await frame(undefined, OX, OY, W, H, C.bg, { name: `Umbra — Tokens ${VER}` });

// ---------- фоновые неоновые пятна ----------
const blobA = await rect(root, 820, -260, 760, 760, C.accent, 380, "Glow blob violet");
await gradient(blobA, [[0, C.accent, 0.22], [1, C.accent, 0]], 90);
await cmd("set_effects", { nodeId: blobA, effects: [{ type: "LAYER_BLUR", blur: 220 }] });
const blobB = await rect(root, -300, 120, 620, 620, C.accent2, 310, "Glow blob cyan");
await gradient(blobB, [[0, C.accent2, 0], [1, C.accent2, 0.12]], 45);
await cmd("set_effects", { nodeId: blobB, effects: [{ type: "LAYER_BLUR", blur: 220 }] });

// ---------- шапка ----------
await t(root, P, 96, "UMBRA / DESIGN SYSTEM", { family: "JetBrains Mono", w: "Medium", size: 13, color: C.accent2, ls: 12 });
const logo = await t(root, P, 124, "UMBRA", { family: "Orbitron", w: "Black", size: 120, color: C.text, ls: 8 });
await shadow(logo.id, [glow(C.accent, 40, 0.7), glow(C.accent2, 120, 0.25)]);
await t(root, P, 280, "Design tokens — one source of truth for Figma and code.", { size: 20, color: C.muted });
const badge = await frame(root, W - P - 172, 104, 172, 32, C.s1, { name: "Version", r: 999 });
await line(badge);
await t(badge, 22, 8, (VER === "v1" ? "v0.1" : "v0.2") + " · soft neon", { family: "JetBrains Mono", size: 12, color: C.muted });

// ---------- 01 цвета ----------
let y = 420;
await section(root, y, "01", "COLOR", "Deep blue-black base, soft greys for text. One main accent, one glow colour, and a rare hot pink for wow moments only.");
y += 140;
const base = [
  ["--bg", C.bg, "Page background"], ["--surface-1", C.s1, "Cards"], ["--surface-2", C.s2, "Dialogs, raised"],
  ["--text", C.text, "Primary text"], ["--text-muted", C.muted, "Secondary text"],
];
for (let i = 0; i < base.length; i++) {
  const [name, hex, use] = base[i];
  const x = P + i * 254;
  const sw = await frame(root, x, y, 230, 140, hex, { name: "Swatch " + name, r: 16 });
  await line(sw);
  await t(root, x, y + 156, name, { family: "JetBrains Mono", w: "Medium", size: 14, color: C.text });
  await t(root, x, y + 180, hex + "  ·  " + use, { size: 13, color: C.muted });
}
y += 250;
const accents = [
  ["--accent", C.accent, "Main · buttons, links, active"],
  ["--accent-2", C.accent2, "Glow · gradients, charts"],
  ["--hot", C.hot, "Rare · Play, sales"],
];
for (let i = 0; i < accents.length; i++) {
  const [name, hex, use] = accents[i];
  const x = P + i * 424;
  const sw = await frame(root, x, y, 400, 180, hex, { name: "Swatch " + name, r: 20 });
  await shadow(sw, [glow(hex, 48, 0.45)]);
  await t(sw, 24, 132, name, { family: "JetBrains Mono", w: "Bold", size: 16, color: C.bg });
  await t(root, x, y + 196, hex + "  ·  " + use, { size: 13, color: C.muted });
}
y += 250;
const grad = await rect(root, P, y, W - P * 2, 64, C.accent, 16, "Gradient — signature");
await gradient(grad, [[0, C.accent], [0.55, C.accent2], [1, C.hot]], 0);
await shadow(grad, [glow(C.accent, 60, 0.35)]);
await t(root, P, y + 80, "--gradient-signature  ·  accent → accent-2 → hot  ·  hero, Umbra Pass, loaders", { family: "JetBrains Mono", size: 13, color: C.muted });
const states = [["--success", C.success], ["--danger", C.danger]];
for (let i = 0; i < states.length; i++) {
  const x = W - P - 360 + i * 184;
  await rect(root, x, y + 80, 12, 12, states[i][1], 6, "Dot");
  await t(root, x + 20, y + 78, states[i][0] + "  " + states[i][1], { family: "JetBrains Mono", size: 13, color: C.muted });
}

// ---------- 02 типографика ----------
y += 220;
await section(root, y, "02", "TYPOGRAPHY", "Orbitron for headlines, Inter for reading, JetBrains Mono for numbers, prices and stats.");
y += 140;
const type = [
  ["Display · Orbitron Black 88", "PLAY THE NIGHT", { family: "Orbitron", w: "Black", size: 88, ls: 4 }, 104],
  ["H1 · Orbitron Bold 56", "Games of the week", { family: "Orbitron", w: "Bold", size: 56, ls: 2 }, 72],
  ["H2 · Orbitron SemiBold 32", "Umbra Pass", { family: "Orbitron", w: "SemiBold", size: 32, ls: 2 }, 44],
  ["Body L · Inter Regular 20", "Discover handpicked indie worlds, built by small teams with big ideas.", { size: 20, color: C.muted }, 32],
  ["Body · Inter Regular 16", "Cloud saves, achievements and friends — everything syncs across your devices.", { size: 16, color: C.muted }, 28],
  ["Mono · JetBrains Mono Medium 16", "128 402 PLAYERS ONLINE   $9.99 / MO   +24%", { family: "JetBrains Mono", w: "Medium", size: 16, color: C.accent2, ls: 6 }, 28],
];
for (const [label, sample, o, h] of type) {
  await t(root, P, y + 8, label, { family: "JetBrains Mono", size: 12, color: C.muted });
  await t(root, P + 300, y, sample, { color: C.text, ...o });
  y += h + 36;
}

// ---------- 03 отступы и радиусы ----------
y += 80;
await section(root, y, "03", "SPACE & RADIUS", "4px grid. Everything — paddings, gaps, sections — comes from this scale.");
y += 140;
const space = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128];
let sx = P;
for (const s of space) {
  const b = await rect(root, sx, y + 128 - s, s, s, C.accent, Math.min(4, s / 4), "Space " + s);
  await cmd("set_fill_color", { nodeId: b, color: hex(C.accent, 0.85) });
  await t(root, sx, y + 144, String(s), { family: "JetBrains Mono", size: 13, color: C.muted });
  sx += s + 32;
}
const radii = [["--r-sm", 6], ["--r-md", 12], ["--r-lg", 20], ["--r-pill", 999]];
for (let i = 0; i < radii.length; i++) {
  const x = W - P - 4 * 120 + i * 120 + 16;
  const r = await frame(root, x, y + 24, 96, 96, C.s1, { name: "Radius " + radii[i][0], r: Math.min(radii[i][1], 48) });
  await shadow(r, [], { color: C.accent, a: 0.6 });
  await t(root, x, y + 144, radii[i][0], { family: "JetBrains Mono", size: 13, color: C.muted });
}

// ---------- 04 свечения ----------
y += 260;
await section(root, y, "04", "GLOW", "Neon is used with restraint: small glow for interactive elements, large glow for one hero element per screen.");
y += 150;
const glows = [
  ["--glow-none", []],
  ["--glow-sm", [glow(C.accent, 16, 0.5)]],
  ["--glow-md", [glow(C.accent, 32, 0.55), glow(C.accent2, 8, 0.25)]],
  ["--glow-lg", [glow(C.accent, 64, 0.6), glow(C.accent2, 24, 0.35)]],
];
for (let i = 0; i < glows.length; i++) {
  const x = P + i * 312;
  const g = await frame(root, x, y, 264, 120, C.s1, { name: "Glow " + glows[i][0], r: 16 });
  await shadow(g, glows[i][1], { color: C.accent, a: i === 0 ? 0.14 : 0.7 });
  await t(root, x, y + 140, glows[i][0], { family: "JetBrains Mono", size: 13, color: C.muted });
}

// ---------- превью кнопок ----------
y += 230;
async function button(x, label, kind) {
  const bg = kind === "primary" ? C.accent : kind === "hot" ? C.hot : C.s1;
  const b = await frame(root, x, y, 10, 10, bg, { name: "Button " + kind, r: 12 });
  await cmd("set_layout_mode", { nodeId: b, layoutMode: "HORIZONTAL" });
  await cmd("set_padding", { nodeId: b, paddingTop: 16, paddingBottom: 16, paddingLeft: 28, paddingRight: 28 });
  await cmd("set_layout_sizing", { nodeId: b, layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  if (kind === "hot") {
    await cmd("set_item_spacing", { nodeId: b, itemSpacing: 10 });
    await svgRaw(b, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 14"><path d="M1 1.5v11a.8.8 0 0 0 1.2.7l9.3-5.5a.8.8 0 0 0 0-1.4L2.2.8A.8.8 0 0 0 1 1.5z" fill="${C.bg}"/></svg>`, 0, 0, 11, "Play icon");
  }
  await t(b, 0, 0, label, { family: "Orbitron", w: "Bold", size: 15, ls: 8, color: kind === "ghost" ? C.text : C.bg });
  if (kind === "primary") await shadow(b, [glow(C.accent, 32, 0.6)]);
  if (kind === "hot") await shadow(b, [glow(C.hot, 40, 0.6)]);
  if (kind === "ghost") await shadow(b, [], { color: C.accent, a: 0.5 });
  const info = await cmd("get_node_info", { nodeId: b });
  return info.absoluteBoundingBox.width;
}
let bx = P;
bx += (await button(bx, "GET STARTED", "primary")) + 24;
bx += (await button(bx, "BROWSE GAMES", "ghost")) + 24;
await button(bx, "PLAY NOW", "hot");

close();
console.log("done");
