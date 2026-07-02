# AI Client

一个高级感的 AI 桌面客户端：聊天 + 绘画。

## 技术栈

- **桌面壳**: Tauri 2（Rust + WebView2）
- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS + shadcn/ui 设计风格
- **动效**: Framer Motion
- **状态**: Zustand（含 persist -> localStorage）
- **存储**: 当前 localStorage；下一阶段升级到 SQLite
- **LLM**: Anthropic Messages API 兼容协议（SSE 流式）

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

## 目录结构

```
apps/desktop/
  src/                # React 前端
    components/       # 通用 UI 组件
    features/         # chat / image / settings 三个视图
    lib/              # llm.ts / use-theme.ts / utils
    stores/           # app-store / conversation-store
  src-tauri/          # Tauri Rust 后端
    src/lib.rs        # llm_proxy 命令（流式 SSE 中继）
    tauri.conf.json   # 窗口、打包配置
    icons/            # 全套图标（tauri icon 生成）
  vite.config.ts      # /llm 代理（Web 阶段绕 CORS）
```

## 路线图

- [x] **阶段 1**: 骨架 + 主界面 + 主题
- [x] **阶段 2**: localStorage 持久化 + 会话/消息 CRUD
- [x] **阶段 3**: AI 聊天（SSE 流式，Web + Tauri 双端）
- [x] **阶段 4**: Tauri 桌面端（dev 已跑通，streamChatViaTauri 走 Channel 流式）
- [ ] **阶段 5**: 打包 `.exe`（`tauri build`）
- [ ] **阶段 6**: AI 绘画
- [ ] **阶段 7**: 数据升级到 SQLite + API Key 转入 Stronghold

## 下一阶段计划

> Tauri 端 LLM 流式已接通，`.exe` 打包是当前最短路径。

### 1. 打包 `.exe`

**目标**：`pnpm tauri build` 出可分发的安装包

**要做的事**：
- [ ] 完善 `tauri.conf.json`（版本号、bundle 元信息）
- [ ] 装 WiX Toolset 或 NSIS（首次构建会提示）
- [ ] 跑 `pnpm tauri build` 验证产物
- [ ] 在干净 Windows 机器验证安装包能跑
- [ ] 加应用签名（可选，发布需要）
- [ ] 加自动更新（`tauri-plugin-updater`，可选）

**预估**：半天（首轮踩坑）

### 2. AI 绘画

**目标**：在 `image-view` 里输入 prompt 出图

**要做的事**：
- [ ] 选定 provider（OpenAI Images / Stability / Replicate）
- [ ] 加 `kind: 'image'` 专属的 Rust 命令（HTTP 代理）
- [ ] 图片结果落到本地（`tauri-plugin-fs` 或下载到 `AppData/Roaming`）
- [ ] 加生成历史（按会话组织）
- [ ] 加参数：比例、数量、风格

**预估**：1-2 天

### 3. 数据升级：localStorage -> SQLite

**目标**：会话数据迁移到 SQLite，支持全文搜索

**理由**：
- localStorage 容量 5-10MB，消息多了卡
- SQLite 的 FTS5 能全文搜会话
- 是"真正的桌面客户端存储"该有的样子

**要做的事**：
- [ ] 加 `tauri-plugin-sql` 依赖
- [ ] 设计 schema：`conversations` / `messages` / `settings` 三张表
- [ ] 写 Rust 端 SQL 命令：`save_conversation` / `list_conversations` / ...
- [ ] 写迁移脚本：首次启动把旧 localStorage 数据导入 SQLite
- [ ] `conversation-store` 切换后端（API 不变，UI 不动）

**预估**：1 天

### 4. API Key 转 Stronghold

**目标**：API Key 不再明文存 localStorage

**预估**：半天

## 路线图总览

```
1. 骨架 + 主界面 + 主题
2. localStorage + 会话/消息 CRUD
3. AI 聊天（SSE 流式）
4. Tauri 桌面端
```

完成度 ~70%。下一阶段完成后即可达到可发布状态。