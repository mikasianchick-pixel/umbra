// Каталог /games, десктоп 1440. Запуск: bun run catalog.mjs <канал> [x] [y]
import { connect, frame, rect, t, chip, shadow, gradient, svgRaw, close, cmd } from "./figma.mjs";
import { C, glow, border, mono, blur, alpha, icon, hug, width, button, tag, gameCard, GAMES, note, desktopHeader } from "./ui.mjs";

const OX = Number(process.argv[3] || 7400);
const OY = Number(process.argv[4] || 0);
const W = 1440, P = 96, CW = W - P * 2;

await connect();
const root = await frame(undefined, OX, OY, W, 2000, C.bg, { name: "Umbra — Catalog /games (Desktop 1440)" });
const gl = await rect(root, 800, -300, 800, 700, C.accent, 400, "Glow");
await alpha(gl, C.accent, 0.16); await blur(gl, 240);
await desktopHeader(root, P, 24, CW, 0);

// заголовок
let y = 152;
await t(root, P, y, "STORE / ALL GAMES", mono({ w: "Medium", size: 13, color: C.accent2, ls: 12 }));
const h = await t(root, P, y + 28, "FIND YOUR NIGHT", { family: "Orbitron", w: "Black", size: 56, color: C.text, ls: 3 });
await shadow(h.id, [glow(C.accent, 30, 0.35)]);
await t(root, P, y + 104, "2 400 indie games · updated every Friday", { size: 17, color: C.muted });

// строка поиска + сортировка + вид
y += 168;
const sb = await frame(root, P, y, 760, 60, C.s1, { name: "Catalog search", r: 14 });
await shadow(sb, [glow(C.accent2, 16, 0.2)], { color: C.accent2, a: 0.8 });
await icon(sb, "search", 20, 18, 24, C.accent2);
await t(sb, 60, 19, "neon", { size: 17, color: C.text });
await rect(sb, 108, 18, 2, 24, C.accent2, 1, "Caret");
await chip(sb, 650, 17, "6 results", { bg: C.s3, fg: C.muted, family: "JetBrains Mono", size: 11, r: 6, px: 8, py: 4 });
const sort = await frame(root, P + 784, y, 260, 60, C.s1, { name: "Sort dropdown", r: 14 });
await border(sort, C.accent, 0.2);
await t(sort, 20, 20, "Sort:", { size: 15, color: C.muted });
await t(sort, 64, 20, "Trending", { size: 15, w: "Medium", color: C.text });
await svgChevron(sort, 224, 20);
const vt = await frame(root, W - P - 180, y, 180, 60, C.s1, { name: "View toggle", r: 14 });
await border(vt, C.accent, 0.2);
const von = await frame(vt, 6, 6, 82, 48, C.s3, { name: "Grid (active)", r: 10 });
await t(von, 24, 15, "GRID", mono({ w: "Bold", size: 12, color: C.text, ls: 10 }));
await t(vt, 112, 21, "LIST", mono({ w: "Bold", size: 12, ls: 10 }));

async function svgChevron(parent, x, yy) {
  return svgRaw(parent, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#9D9DAB" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>`, x, yy, 20, "Chevron");
}

// активные фильтры
y += 84;
let fx = P;
for (const f of ["ROGUELIKE", "UNDER $15", "CO-OP"]) {
  const c = await hug(root, fx, y, C.s2, { px: 12, py: 7, gap: 8, r: 999, name: "Active filter " + f });
  await shadow(c, [], { color: C.accent, a: 0.5 });
  await t(c, 0, 0, f, mono({ w: "Medium", size: 12, color: C.accent }));
  await icon(c, "x", 0, 0, 14, C.accent);
  fx += (await width(c)) + 10;
}
await t(root, fx + 8, y + 7, "Clear all", { size: 14, w: "Medium", color: C.muted });

// боковые фильтры
y += 64;
const side = await frame(root, P, y, 280, 1080, C.s1, { name: "Filters sidebar", r: 20 });
await border(side, C.accent, 0.14);
let sy = 28;
await t(side, 24, sy, "FILTERS", { family: "Orbitron", w: "Bold", size: 16, color: C.text, ls: 8 });
sy += 52;
await t(side, 24, sy, "GENRE", mono({ size: 11, ls: 12, color: C.accent2 }));
sy += 30;
for (const [g, n, on] of [["Roguelike", 214, true], ["Horror", 168, false], ["Racing", 96, false], ["Co-op", 302, true], ["Rhythm", 54, false], ["Survival", 141, false]]) {
  const cb = await frame(side, 24, sy, 22, 22, on ? C.accent : C.s1, { name: "Checkbox " + g, r: 6 });
  if (on) await icon(cb, "check", 3, 3, 16, C.bg); else await border(cb, C.accent, 0.4);
  await t(side, 58, sy + 1, g, { size: 15, color: on ? C.text : C.muted });
  const nn = await t(side, 0, sy + 3, String(n), mono({ size: 12 }));
  await cmd("move_node", { nodeId: nn.id, x: Math.round(256 - nn.width), y: sy + 3 });
  sy += 38;
}
sy += 20;
await rect(side, 24, sy, 232, 1, C.line, 0, "Divider");
sy += 28;
await t(side, 24, sy, "PRICE", mono({ size: 11, ls: 12, color: C.accent2 }));
sy += 40;
await rect(side, 24, sy + 8, 232, 4, C.s3, 2, "Range track");
const rg = await rect(side, 24, sy + 8, 120, 4, C.accent, 2, "Range fill");
await gradient(rg, [[0, C.accent], [1, C.accent2]], 0);
for (const kx of [16, 136]) {
  const k = await rect(side, kx, sy, 20, 20, C.text, 10, "Range knob");
  await shadow(k, [glow(C.accent, 12, 0.6)]);
}
sy += 36;
await t(side, 24, sy, "$0", mono({ size: 12, color: C.text }));
await t(side, 128, sy, "$15", mono({ size: 12, color: C.text }));
await t(side, 224, sy, "$60", mono({ size: 12 }));
sy += 48;
await rect(side, 24, sy, 232, 1, C.line, 0, "Divider");
sy += 28;
await t(side, 24, sy, "RATING", mono({ size: 11, ls: 12, color: C.accent2 }));
sy += 34;
for (const [i, r] of ["4.5+", "4.0+", "Any"].entries()) {
  const c = await chip(side, 24 + i * 76, sy, r, i === 0
    ? { bg: C.accent, fg: C.bg, family: "JetBrains Mono", w: "Bold", size: 12, r: 999, px: 14, py: 6 }
    : { bg: C.s2, fg: C.muted, stroke: C.line, family: "JetBrains Mono", w: "Medium", size: 12, r: 999, px: 14, py: 6 });
}
sy += 64;
await rect(side, 24, sy, 232, 1, C.line, 0, "Divider");
sy += 28;
await t(side, 24, sy, "FEATURES", mono({ size: 11, ls: 12, color: C.accent2 }));
sy += 34;
for (const [f, on] of [["In Umbra Pass", true], ["Controller", true], ["Cloud saves", false], ["On sale", false]]) {
  await t(side, 24, sy + 4, f, { size: 15, color: on ? C.text : C.muted });
  const tr = await frame(side, 212, sy, 44, 26, on ? C.accent : C.s3, { name: "Toggle " + f, r: 999 });
  await rect(tr, on ? 21 : 3, 3, 20, 20, on ? C.bg : C.muted, 10, "Knob");
  sy += 44;
}

// сетка карточек
const gx = P + 312;
const order = [3, 0, 2, 1, 4, 5];
for (const [i, gi] of order.entries()) {
  const col = i % 3, row = Math.floor(i / 3);
  await gameCard(root, gx + col * 320, y + row * 432, GAMES[gi], { w: 296, state: i === 1 ? "HOVER" : "DEFAULT" });
}
const more = await button(root, 0, y + 900, "LOAD MORE", "ghost", { iconName: "plus" });
await cmd("move_node", { nodeId: more, x: Math.round(gx + (936 - (await width(more))) / 2), y: y + 900 });
await t(root, gx, y + 980, "Showing 6 of 2 400", mono({ size: 12, width: 936, align: "CENTER" }));
await note(root, 0, y - 60, "React island · cards reorder with FLIP animation when filters change").then(async (id) => cmd("move_node", { nodeId: id, x: W - P - (await width(id)), y: y - 60 }));
await note(root, P, y + 1100, "filters: instant, no reload · URL keeps state (?genre=roguelike)");

await cmd("resize_node", { nodeId: root, width: W, height: y + 1200 });
close();
console.log("done", y + 1200);
