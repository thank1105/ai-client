# AI Client

一个"高级感"的 AI 桌面客户端：聊天 + 绘画。

## 技术栈

- **壳**: Tauri 2（Rust + WebView2）
- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS + shadcn/ui 设计风格
- **动效**: Framer Motion
- **状态**: Zustand（含 persist → localStorage）
- **数据**: localStorage（Web 阶段）→ SQLite（Tauri 阶段）
- **LLM**: Anthropic Messages API 兼容协议

## 开发

```bash
# 1. 安装 pnpm（首次需要）
npm install -g pnpm

# 2. 安装依赖
pnpm install

# 3a. Web 原型（开发期主用）
pnpm --filter @ai-client/desktop dev
# 访问 http://localhost:5173

# 3b. 桌面客户端（需 Rust + MSVC 工具链）
pnpm --filter @ai-client/desktop dev:tauri
```

## 目录

```
apps/desktop/
  ├── src/                # React 前端
  │   ├── components/     # 通用 UI 组件
  │   ├── features/       # chat / image / settings 三个视图
  │   ├── lib/            # llm.ts / use-theme.ts / utils
  │   └── stores/         # app-store / conversation-store
  ├── src-tauri/          # Tauri Rust 后端
  │   ├── src/lib.rs      # llm_proxy 命令（HTTP 代理绕开 CORS）
  │   ├── tauri.conf.json # 窗口、打包配置
  │   └── icons/          # 全套图标（tauri icon 生成）
  └── vite.config.ts      # /llm 代理（Web 阶段绕 CORS）
```

## 路线图

- [x] **第一阶段**: 骨架 + 主界面 + 主题
- [x] **第二阶段**: localStorage 持久化 + 会话/消息 CRUD
- [x] **第三阶段**: AI 聊天（流式输出，已接 Anthropic 兼容 API）
- [x] **第五阶段**: Tauri 桌面壳（dev 已跑通，待打包 .exe）
- [ ] **第四阶段**: AI 绘画

## 下一阶段计划

> Tauri dev 已跑通，桌面窗口能弹出。剩下 4 件事，按价值密度排：

### 1. 验证 Tauri 窗口内的 LLM 调用链路

**目标**：在 Tauri 桌面窗口（不是浏览器）里发消息能成功流式输出

**要做的事**：
- [ ] 在 Tauri 窗口里进入设置，填入 API Key
- [ ] 发消息"你好"，观察是否能流式输出（不报 Failed to fetch）
- [ ] 验证 WebView → `invoke('llm_proxy')` → Rust `reqwest` → 真实 API → SSE 回传 链路通畅
- [ ] 若 Rust 端非流式（当前是同步返回），需要把 `llm_proxy` 改造为真正的 streaming

**涉及文件**：
- `apps/desktop/src/lib/llm.ts`（Tauri 分支调 invoke）
- `apps/desktop/src-tauri/src/lib.rs`（代理实现）

**预计**：30 分钟

### 2. 打磨对话体验

**目标**：让对话交互更接近"产品级"质感

**要做的事**：
- [ ] 流式输出 cursor 闪烁动画（pending 状态尾巴）
- [ ] 中止生成（AbortController 传 signal 进 streamChat）
- [ ] 复制消息按钮（每条助手消息右上角）
- [ ] 重新生成回复
- [ ] Markdown 渲染（react-markdown）+ 代码块高亮（shiki）
- [ ] 自动滚动到底部（已有，但加 smooth 行为）

**涉及文件**：
- `apps/desktop/src/features/chat/chat-view.tsx`
- 新增 `apps/desktop/src/components/markdown.tsx`
- `apps/desktop/package.json` 加 `react-markdown` / `shiki` 依赖

**预计**：半天

### 3. 数据存储升级

**目标**：从 localStorage 升级到 SQLite（Tauri 专属）

**为什么要升级**：
- localStorage 容量 5-10MB，会话多了卡
- 不支持全文搜索（SQLite 有 FTS5）
- 重装系统数据可能丢（取决于浏览器）
- 不是"真正的客户端存储"

**要做的事**：
- [ ] 加 `tauri-plugin-sql` 依赖
- [ ] 设计 schema：`conversations` / `messages` / `settings` 三张表
- [ ] 写 Rust 端 SQL 命令：`save_conversation` / `list_conversations` / `add_message` / ...
- [ ] 写数据迁移脚本：首次启动把旧 localStorage 数据导入 SQLite
- [ ] 把 conversation-store 从 Zustand persist 切换到 SQLite（保持 API 不变 → UI 不用动）
- [ ] API Key 移到 `tauri-plugin-stronghold`（系统密钥环）

**涉及文件**：
- `apps/desktop/src-tauri/Cargo.toml`
- `apps/desktop/src-tauri/src/lib.rs`（新增 SQL 命令）
- `apps/desktop/src/stores/conversation-store.ts`（后端换 SQLite）
- `apps/desktop/src/stores/app-store.ts`（API Key 存密钥环）

**预计**：1 天

### 4. 打包 .exe

**目标**：`pnpm tauri build` 产出可分发的 `.exe` 安装包

**要做的事**：
- [ ] 完善 `tauri.conf.json`（版本号、icon、bundler 配置）
- [ ] 装 WiX Toolset 或 NSIS（首次构建会提示）
- [ ] 跑 `pnpm tauri build` 验证产物
- [ ] 验证安装包在干净 Windows 机器能跑
- [ ] 加应用签名（可选，但发布需要）
- [ ] 加自动更新（`tauri-plugin-updater`）

**涉及文件**：
- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/package.json` 加 build 脚本
- 新增 `apps/desktop/src-tauri/icons/icon.ico`（用 `tauri icon` 已生成）

**预计**：半天（含首次踩坑）

## 路线总览

```
✅ 1. 骨架 + 主界面 + 主题
✅ 2. localStorage + 会话/消息 CRUD
✅ 3. AI 聊天（流式输出）
✅ 5. Tauri 桌面壳（dev 跑通）
⏳ 下一阶段: 4 件事（按上面顺序）
🔜 4. AI 绘画
```

完成度约 **75%**。下一阶段完成后即达到可发布状态。