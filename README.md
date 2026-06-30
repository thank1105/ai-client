# AI Client

一个"高级感"的 AI 桌面客户端：聊天 + 绘画。

## 技术栈

- **壳**: Tauri 2（Rust，先用 Web 跑原型）
- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS + shadcn/ui 设计风格
- **动效**: Framer Motion
- **状态**: Zustand
- **数据**: SQLite（后续接入）

## 开发

```bash
# 1. 安装 pnpm（首次需要）
npm install -g pnpm

# 2. 安装依赖
pnpm install

# 3. 启动 Web 原型
pnpm --filter @ai-client/desktop dev
```

访问 http://localhost:5173

## 目录

- `apps/desktop` — 桌面端应用（含 Web 入口）
- `packages/*` — 预留：抽离 ai-core、ui 组件库等

## 路线图

- [x] **第一阶段**: 骨架 + 主界面 + 主题
- [ ] **第二阶段**: SQLite + 会话/消息 CRUD
- [ ] **第三阶段**: AI 聊天（流式输出）
- [ ] **第四阶段**: AI 绘画
- [ ] **第五阶段**: 切换 Tauri 打包
