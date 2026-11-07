// Правка мобильной: слово THE переносим на свою строку (не влезало в 375)
import { connect, cmd, close } from "./figma.mjs";

const ROOT = process.argv[3] || "2:962";
await connect();
const info = await cmd("get_node_info", { nodeId: ROOT });
const oy = info.absoluteBoundingBox.y, ox = info.absoluteBoundingBox.x;
const the = info.children.find((c) => c.type === "TEXT" && c.name === "THE");
const yThe = the.absoluteBoundingBox.y - oy;
const DY = 58;
for (const c of info.children) {
  const b = c.absoluteBoundingBox;
  if (!b || b.y - oy <= yThe + 10) continue;
  await cmd("move_node", { nodeId: c.id, x: Math.round(b.x - ox), y: Math.round(b.y - oy + DY) });
}
await cmd("move_node", { nodeId: the.id, x: 24, y: Math.round(yThe + DY) });
await cmd("resize_node", { nodeId: ROOT, width: 375, height: info.absoluteBoundingBox.height + DY });
close();
console.log("ok");
