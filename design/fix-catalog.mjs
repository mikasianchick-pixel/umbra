// Правка каталога: подпись ANIM про FLIP — вправо, на строку активных фильтров
import { connect, cmd, close } from "./figma.mjs";
await connect();
const info = await cmd("get_node_info", { nodeId: process.argv[3] || "2:1283" });
const oy = info.absoluteBoundingBox.y;
const n = info.children.find((c) => c.name.startsWith("Chip ANIM  React island"));
const f = info.children.find((c) => c.name.startsWith("Active filter ROGUELIKE"));
await cmd("move_node", { nodeId: n.id, x: Math.round(1440 - 96 - n.absoluteBoundingBox.width), y: Math.round(f.absoluteBoundingBox.y - oy + 4) });
close();
console.log("ok");
