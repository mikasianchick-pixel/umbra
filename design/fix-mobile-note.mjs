// Правка мобильной: укоротить подпись ANIM в hero, чтобы влезала в 375
import { connect, cmd, close } from "./figma.mjs";
await connect();
const info = await cmd("get_node_info", { nodeId: process.argv[3] || "2:962" });
const chipNode = info.children.find((c) => c.name.startsWith("Chip ANIM  crystal"));
const txt = chipNode.children.find((c) => c.type === "TEXT");
await cmd("set_text_content", { nodeId: txt.id, text: "ANIM  3D lighter on mobile · gyro tilt" });
close();
console.log("ok");
