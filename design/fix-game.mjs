// Правка страницы игры: луна и вышка — в центр (их закрывала панель покупки), волны сигнала — прозрачные
import { connect, cmd, hex, close } from "./figma.mjs";
await connect();
const root = await cmd("get_node_info", { nodeId: process.argv[3] || "2:1541" });
const hero = root.children.find((c) => c.name === "Parallax hero");
const by = (p) => hero.children.find((c) => c.name.startsWith(p));
const mv = (n, x, y) => cmd("move_node", { nodeId: n.id, x, y });
await mv(by("Layer 2 · moon"), 600, 90);
await mv(by("Haze"), 420, 40);
await mv(by("Layer 5 · radio tower"), 760, 190);
await mv(by("Beacon"), 814, 192);
for (const [i, r] of [60, 110, 160].entries()) {
  const w = by("Signal wave " + i);
  await cmd("set_fill_color", { nodeId: w.id, color: hex("#090910", 0.001) });
  await mv(w, 820 - r, 198 - r);
}
close();
console.log("ok");
