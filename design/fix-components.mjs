// Правки Components: поднять двухстрочные названия на обложках, подрезать высоту рамки
import { connect, cmd, close } from "./figma.mjs";

const ROOT = process.argv[3] || "2:220";
await connect();
const info = await cmd("get_node_info", { nodeId: ROOT });
const covers = [];
(function walk(n) {
  if (n.name === "Cover") covers.push(n);
  (n.children || []).forEach(walk);
})(info);
for (const c of covers) {
  const title = c.children.find((k) => k.type === "TEXT" && k.name.includes("\n"));
  if (title) await cmd("move_node", { nodeId: title.id, x: 20, y: 240 - 88 });
}
await cmd("resize_node", { nodeId: ROOT, width: 1440, height: 3560 });
close();
console.log("covers fixed:", covers.length);
