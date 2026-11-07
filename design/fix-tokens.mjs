// Правки страницы Tokens: мягкие пятна (blur), высота рамки, ширина плашки версии
import { connect, cmd, close } from "./figma.mjs";

const ROOT = process.argv[3] || "2:2";
await connect();
const info = await cmd("get_node_info", { nodeId: ROOT });
const byName = (n) => info.children.find((c) => c.name === n);

for (const n of ["Glow blob violet", "Glow blob cyan"]) {
  const b = byName(n);
  if (b) await cmd("set_effects", { nodeId: b.id, effects: [{ type: "LAYER_BLUR", blur: 220 }] });
}
await cmd("resize_node", { nodeId: ROOT, width: 1440, height: 2900 });
const v = byName("Version");
if (v) {
  await cmd("resize_node", { nodeId: v.id, width: 172, height: 32 });
  await cmd("move_node", { nodeId: v.id, x: info.absoluteBoundingBox.x + 1440 - 96 - 172, y: info.absoluteBoundingBox.y + 104 });
}
close();
console.log("fixed");
