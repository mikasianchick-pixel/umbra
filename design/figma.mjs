// Мини-клиент к мосту Talk to Figma: подключается к сокету и шлёт команды плагину
const CHANNEL = process.argv[2];
const ws = new WebSocket("ws://localhost:3055");
const pending = new Map();
let n = 0;

ws.onmessage = (e) => {
  const d = JSON.parse(e.data);
  const m = d.message;
  if (m && typeof m === "object" && m.id && pending.has(m.id) && (m.result || m.error)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    m.error ? p.rej(new Error(m.error)) : p.res(m.result);
  }
};

function send(command, params = {}) {
  const id = "c" + Date.now() + "_" + n++;
  const req = command === "join"
    ? { id, type: "join", channel: params.channel, message: { id, command, params: { ...params, commandId: id } } }
    : { id, type: "message", channel: CHANNEL, message: { id, command, params: { ...params, commandId: id } } };
  return new Promise((res, rej) => {
    pending.set(id, { res, rej });
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error("timeout " + command)); } }, 30000);
    ws.send(JSON.stringify(req));
  });
}

export const hex = (h, a = 1) => ({
  r: parseInt(h.slice(1, 3), 16) / 255,
  g: parseInt(h.slice(3, 5), 16) / 255,
  b: parseInt(h.slice(5, 7), 16) / 255,
  a,
});

export async function connect() {
  await new Promise((r) => (ws.onopen = r));
  await send("join", { channel: CHANNEL });
}

export const cmd = send;

export async function frame(parent, x, y, w, h, fill, opts = {}) {
  const f = await send("create_frame", {
    x, y, width: w, height: h, name: opts.name || "Frame",
    parentId: parent, fillColor: hex(fill),
    ...(opts.stroke ? { strokeColor: hex(opts.stroke), strokeWeight: 1 } : {}),
  });
  if (opts.r) await send("set_corner_radius", { nodeId: f.id, radius: opts.r });
  return f.id;
}

export async function rect(parent, x, y, w, h, fill, r = 0, name = "Shape") {
  const s = await send("create_rectangle", { x, y, width: w, height: h, parentId: parent, name });
  await send("set_fill_color", { nodeId: s.id, color: hex(fill) });
  if (r) await send("set_corner_radius", { nodeId: s.id, radius: r });
  return s.id;
}

// align: "left" | "right" | "center" — x это левый край, правый край или центр
export async function text(parent, x, y, str, size, weight, color, align = "left") {
  const t = await send("create_text", {
    x, y, text: str, fontSize: size, fontWeight: weight, fontColor: hex(color), parentId: parent,
  });
  if (align !== "left") {
    // ширина из create_text приходит до вставки текста — берём настоящую
    const info = await send("get_node_info", { nodeId: t.id });
    const w = info.absoluteBoundingBox ? info.absoluteBoundingBox.width : t.width;
    const nx = align === "right" ? x - w : x - w / 2;
    await send("move_node", { nodeId: t.id, x: Math.round(nx), y });
  }
  return t;
}

export function close() { ws.close(); }

// ---------- расширенные помощники (нужен обновлённый плагин) ----------
import { readFileSync as _rf } from "fs";
const ICON_DIR = new URL("./icons/", import.meta.url);

// t(parent, x, y, "текст", {size, w: "Regular|Medium|Semi Bold|Bold", color, family, ls, lh, width, align, opacity})
export async function t(parent, x, y, str, o = {}) {
  const r = await send("create_text_ex", {
    text: str, x, y, parentId: parent,
    family: o.family || "Inter", style: o.w || "Regular", size: o.size || 14,
    color: hex(o.color || "#000000"), opacity: o.opacity ?? 1,
    letterSpacing: o.ls, lineHeight: o.lh, width: o.width, align: o.align || "LEFT",
  });
  return r;
}

// иконка из папки icons: name вида "solar_eye-linear"
export async function icon(parent, name, x, y, size, color) {
  let svg = _rf(new URL(name + ".svg", ICON_DIR), "utf8");
  svg = svg.replaceAll("currentColor", color).replace(/width="1em" height="1em"/, "");
  const r = await send("create_svg", { svg, x, y, width: size, parentId: parent, name });
  return r.id;
}

export async function svgRaw(parent, svg, x, y, size, name = "Vector") {
  const r = await send("create_svg", { svg, x, y, width: size, parentId: parent, name });
  return r.id;
}

export async function shadow(nodeId, list, stroke) {
  await send("set_effects", {
    nodeId,
    effects: list.map((s) => ({ ...s, color: hex(s.color, s.a ?? 0.1) })),
    ...(stroke ? { stroke: { color: hex(stroke.color, stroke.a ?? 1), weight: stroke.weight || 1 } } : {}),
  });
}

export async function gradient(nodeId, stops, angle = 90) {
  await send("set_gradient", { nodeId, angle, stops: stops.map(([pos, c, a = 1]) => ({ pos, color: hex(c, a) })) });
}

// плашка-чип по размеру содержимого (auto-layout). align: "left" | "right" (x = правый край)
export async function chip(parent, x, y, str, o = {}) {
  const f = await send("create_frame", {
    x, y, width: 10, height: 10, name: "Chip " + str, parentId: parent,
    fillColor: hex(o.bg || "#EEEEEE"), layoutMode: "HORIZONTAL",
    paddingTop: o.py ?? 4, paddingBottom: o.py ?? 4, paddingLeft: o.px ?? 10, paddingRight: o.px ?? 10,
    counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG",
    itemSpacing: o.gap ?? 6,
  });
  await send("set_corner_radius", { nodeId: f.id, radius: o.r ?? 999 });
  if (o.stroke) await send("set_effects", { nodeId: f.id, effects: [], stroke: { color: hex(o.stroke), weight: 1 } });
  if (o.dot) {
    const d = await send("create_rectangle", { x: 0, y: 0, width: 6, height: 6, parentId: f.id, name: "Dot" });
    await send("set_fill_color", { nodeId: d.id, color: hex(o.dot) });
    await send("set_corner_radius", { nodeId: d.id, radius: 3 });
  }
  if (o.icon) await icon(f.id, o.icon, 0, 0, o.iconSize || 14, o.fg || "#000000");
  await t(f.id, 0, 0, str, { size: o.size || 12, w: o.w || "Medium", color: o.fg || "#000000", family: o.family });
  if (o.align === "right" || o.align === "center") {
    const info = await send("get_node_info", { nodeId: f.id });
    const w = info.absoluteBoundingBox.width;
    await send("move_node", { nodeId: f.id, x: Math.round(o.align === "right" ? x - w : x - w / 2), y });
  }
  return f.id;
}
