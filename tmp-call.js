const fs = require("fs");
const p = "E:/ClaudeCode/AI-Client/apps/desktop/src/features/chat/chat-view.tsx";
let s = fs.readFileSync(p, "utf8");
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

// 看 3 处调用的实际形态
const lines = s.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("sendMessage(")) console.log((i+1)+":"+lines[i]);
}
