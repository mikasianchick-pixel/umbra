// Правка главной: сдвинуть всё, что начинается ниже FROM (по умолчанию 2630px), вниз на DY, и удлинить рамку
import { connect, cmd, close } from "./figma.mjs";

const ROOT = process.argv[3] || "2:519";
const FROM = Number(process.argv[4] || 2630);
const DY = Number(process.argv[5] || 120);
await connect();
const info = await cmd("get_node_info", { nodeId: ROOT });
const ox = info.absoluteBoundingBox.x, oy = info.absoluteBoundingBox.y;
let moved = 0;
for (const c of info.children) {
  const b = c.absoluteBoundingBox;
  if (!b || b.y - oy < FROM) continue;
  await cmd("move_node", { nodeId: c.id, x: Math.round(b.x - ox), y: Math.round(b.y - oy + DY) });
  moved++;
}
await cmd("resize_node", { nodeId: ROOT, width: info.absoluteBoundingBox.width, height: info.absoluteBoundingBox.height + DY });
close();
console.log("moved", moved);
