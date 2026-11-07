// Общие детали для макетов Umbra (палитра v2, иконки, кнопки, карточка игры)
import { frame, rect, t, chip, shadow, gradient, svgRaw, cmd, hex } from "./figma.mjs";

export const C = {
  bg: "#090910", s1: "#12121A", s2: "#1B1A26", s3: "#24232F", line: "#2A2838",
  text: "#EAEAF0", muted: "#9D9DAB", accent: "#AD99FB", accent2: "#6FDAE6", hot: "#ED83B4",
  success: "#72D699", danger: "#ED7473",
};

export const glow = (color, blur, a = 0.4, spread = 0) => ({ type: "DROP_SHADOW", color, a, blur, spread });
export const ring = [
  { type: "DROP_SHADOW", color: C.bg, a: 1, blur: 0, spread: 3 },
  { type: "DROP_SHADOW", color: C.accent2, a: 1, blur: 0, spread: 5 },
];
export const border = (id, color = C.accent, a = 0.14) => shadow(id, [], { color, a });
export const mono = (o = {}) => ({ family: "JetBrains Mono", size: 12, color: C.muted, ...o });
export const blur = (id, r) => cmd("set_effects", { nodeId: id, effects: [{ type: "LAYER_BLUR", blur: r }] });
export const alpha = (id, color, a) => cmd("set_fill_color", { nodeId: id, color: hex(color, a) });

const ico = (body, color, fill = "none") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
export const I = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  volume: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  arrowL: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  pad: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18" cy="13.5" r=".8"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  cloud: '<path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21 20a6 6 0 0 0-3.5-5.5"/>',
  gauge: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 18 4-5"/>',
  puzzle: '<path d="M10 3h4v3a2 2 0 1 0 4 0V3h3v7h-3a2 2 0 1 0 0 4h3v7h-7v-3a2 2 0 1 0-4 0v3H3v-7h3a2 2 0 1 0 0-4H3V3z"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
};
export const icon = (parent, name, x, y, size, color, fill) => svgRaw(parent, ico(I[name], color, fill), x, y, size, "Icon " + name);

export async function hug(parent, x, y, bg, { px = 28, py = 16, gap = 10, r = 12, name = "Auto", vertical = false } = {}) {
  const f = await frame(parent, x, y, 10, 10, bg, { name, r });
  await cmd("set_layout_mode", { nodeId: f, layoutMode: vertical ? "VERTICAL" : "HORIZONTAL" });
  await cmd("set_padding", { nodeId: f, paddingTop: py, paddingBottom: py, paddingLeft: px, paddingRight: px });
  await cmd("set_axis_align", { nodeId: f, counterAxisAlignItems: vertical ? "MIN" : "CENTER" });
  await cmd("set_item_spacing", { nodeId: f, itemSpacing: gap });
  await cmd("set_layout_sizing", { nodeId: f, layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  return f;
}

export const width = async (id) => (await cmd("get_node_info", { nodeId: id })).absoluteBoundingBox.width;

// kind: primary | ghost | hot
export async function button(parent, x, y, label, kind = "primary", { iconName, size = 14 } = {}) {
  const bg = kind === "primary" ? C.accent : kind === "hot" ? C.hot : C.s1;
  const fg = kind === "ghost" ? C.text : C.bg;
  const b = await hug(parent, x, y, bg, { name: `Button ${kind}`, px: 28, py: 17 });
  if (iconName) await icon(b, iconName, 0, 0, size, fg, iconName === "play" || iconName === "bolt" ? fg : undefined);
  await t(b, 0, 0, label, { family: "Orbitron", w: "Bold", size, ls: 8, color: fg });
  if (kind === "primary") await shadow(b, [glow(C.accent, 28, 0.4)]);
  if (kind === "hot") await shadow(b, [glow(C.hot, 28, 0.4)]);
  if (kind === "ghost") await shadow(b, [], { color: C.accent, a: 0.3 });
  return b;
}

export async function tag(parent, x, y, label, o = {}) {
  return chip(parent, x, y, label, { bg: C.s2, fg: C.muted, family: "JetBrains Mono", w: "Medium", size: 11, r: 999, px: 10, py: 4, ...o });
}

export async function cover(parent, w, hgt, a, b, title, size = 26) {
  const cv = await frame(parent, 0, 0, w, hgt, C.s2, { name: "Cover" });
  const g = await rect(cv, 0, 0, w, hgt, a, 0, "Cover gradient");
  await gradient(g, [[0, a, 0.9], [0.6, b, 0.55], [1, C.bg, 1]], 120);
  const orb = await rect(cv, w * 0.55, hgt * 0.1, hgt * 0.7, hgt * 0.7, b, hgt, "Orb");
  await blur(orb, 40);
  const ln = await rect(cv, 0, hgt * 0.72, w, 1, C.text, 0, "Horizon");
  await alpha(ln, C.text, 0.25);
  const lines = title.split("\n").length;
  const tt = await t(cv, 20, hgt - 20 - lines * size * 1.3, title, { family: "Orbitron", w: "Black", size, color: C.text, ls: 4 });
  await shadow(tt.id, [glow(b, 18, 0.6)]);
  return cv;
}

export async function gameCard(parent, x, y, game, { w = 360, state = "DEFAULT" } = {}) {
  const ch = Math.round(w * 0.667);
  const c = await frame(parent, x, y, w, ch + 212, C.s1, { name: "Game card " + game.name, r: 16 });
  const hov = state === "HOVER";
  await shadow(c, hov ? [glow(game.b, 48, 0.35)] : [], { color: hov ? game.b : C.accent, a: hov ? 0.5 : 0.14 });
  await cover(c, w, ch, game.a, game.b, game.title);
  if (game.badge) await chip(c, 16, 16, game.badge, { bg: game.badgeBg, fg: C.bg, family: "JetBrains Mono", w: "Bold", size: 12, r: 6, px: 8, py: 4 });
  const fav = await frame(c, w - 56, 16, 40, 40, C.bg, { name: "Wishlist", r: 999 });
  await alpha(fav, C.bg, 0.6);
  await icon(fav, "heart", 10, 10, 20, hov ? C.hot : C.text, hov ? C.hot : "none");
  await t(c, 20, ch + 20, game.studio, mono({ size: 12, ls: 6 }));
  await t(c, 20, ch + 42, game.name, { size: 20, w: "Semi Bold", color: C.text });
  let tx = 20;
  for (const g of game.tags) {
    const id = await tag(c, tx, ch + 82, g);
    tx += (await width(id)) + 8;
  }
  await rect(c, 20, ch + 128, w - 40, 1, C.line, 0, "Divider");
  const rt = await hug(c, 20, ch + 152, C.s1, { px: 0, py: 0, gap: 6, r: 0, name: "Rating" });
  await icon(rt, "star", 0, 0, 14, C.accent2, C.accent2);
  await t(rt, 0, 0, game.rating, { family: "JetBrains Mono", w: "Bold", size: 14, color: C.text });
  const pr = await t(c, 0, ch + 150, game.price, { family: "JetBrains Mono", w: "Bold", size: 18, color: game.old ? C.hot : C.text });
  await cmd("move_node", { nodeId: pr.id, x: Math.round(w - 20 - pr.width), y: ch + 150 });
  if (game.old) {
    const o = await t(c, 0, ch + 154, game.old, mono({ size: 14 }));
    await cmd("move_node", { nodeId: o.id, x: Math.round(w - 28 - pr.width - o.width), y: ch + 154 });
  }
  return c;
}

export const GAMES = [
  { title: "HOLLOW\nSIGNAL", name: "Hollow Signal", studio: "STATIC MOTH", a: "#4B3A9E", b: C.accent, tags: ["HORROR", "RADIO", "SOLO"], rating: "4.8", price: "$14.99", badge: "NEW", badgeBg: C.accent2 },
  { title: "GLASS\nWING", name: "Glasswing", studio: "PAPER ORBIT", a: "#1E5E6B", b: C.accent2, tags: ["FLIGHT", "CO-OP"], rating: "4.6", price: "$8.99", old: "$14.99", badge: "-40%", badgeBg: C.hot },
  { title: "LAST\nLUMEN", name: "Last Lumen", studio: "NORTHWAKE", a: "#6B2A55", b: C.hot, tags: ["ROGUELIKE", "PIXEL"], rating: "4.9", price: "$19.99" },
  { title: "NEON\nDRIFT", name: "Neon Drift", studio: "LOWLIGHT", a: "#2B3F8F", b: "#8FB4FF", tags: ["RACING", "SYNTH"], rating: "4.7", price: "$12.99" },
];

GAMES.push(
  { title: "EMBER\nCHOIR", name: "Ember Choir", studio: "KILN & CO", a: "#6B3A2A", b: "#F2A97E", tags: ["RHYTHM", "STORY"], rating: "4.5", price: "$9.99" },
  { title: "SUB\nTIDE", name: "Subtide", studio: "DEEP RUN", a: "#18465A", b: C.accent2, tags: ["SURVIVAL", "OCEAN"], rating: "4.4", price: "$16.99", badge: "EARLY", badgeBg: C.accent },
);

// стеклянная шапка десктопа; active — индекс активной ссылки
export async function desktopHeader(parent, x, y, w, active = 0) {
  const nav = await frame(parent, x, y, w, 72, C.s1, { name: "Header", r: 16 });
  await alpha(nav, C.s1, 0.6); await border(nav, C.accent, 0.16);
  const lg = await t(nav, 28, 22, "UMBRA", { family: "Orbitron", w: "Black", size: 22, color: C.text, ls: 10 });
  await shadow(lg.id, [glow(C.accent, 16, 0.5)]);
  let lx = 220;
  for (const [i, l] of ["Store", "Library", "Umbra Pass", "Community"].entries()) {
    const on = i === active;
    const tl = await t(nav, lx, 25, l, { size: 15, w: on ? "Semi Bold" : "Regular", color: on ? C.text : C.muted });
    if (on) { const d = await rect(nav, lx + Math.round(tl.width / 2) - 3, 52, 6, 6, C.accent2, 3, "Active dot"); await shadow(d, [glow(C.accent2, 8, 0.8)]); }
    lx += tl.width + 40;
  }
  const sb = await frame(nav, w - 548, 16, 300, 40, C.bg, { name: "Search", r: 10 });
  await border(sb, C.accent, 0.14);
  await icon(sb, "search", 12, 10, 18, C.muted);
  await t(sb, 40, 11, "Search games…", { size: 14, color: C.muted });
  await chip(sb, 236, 9, "Ctrl K", { bg: C.s3, fg: C.muted, family: "JetBrains Mono", size: 11, r: 6, px: 8, py: 3 });
  const snd = await frame(nav, w - 232, 16, 40, 40, C.bg, { name: "Sound", r: 999 });
  await border(snd, C.accent, 0.2);
  await icon(snd, "volume", 10, 10, 20, C.muted);
  const gp = await hug(nav, w - 176, 14, C.accent, { px: 18, py: 12, gap: 8, r: 10, name: "Get Pass" });
  await icon(gp, "bolt", 0, 0, 14, C.bg, C.bg);
  await t(gp, 0, 0, "GET PASS", { family: "Orbitron", w: "Bold", size: 12, ls: 8, color: C.bg });
  await shadow(gp, [glow(C.accent, 20, 0.4)]);
  return nav;
}

// подпись-аннотация для разработчика: что здесь анимируется
export async function note(parent, x, y, text) {
  return chip(parent, x, y, "ANIM  " + text, { bg: C.bg, fg: C.accent2, stroke: C.accent2, family: "JetBrains Mono", w: "Medium", size: 11, r: 6, px: 8, py: 4 });
}
