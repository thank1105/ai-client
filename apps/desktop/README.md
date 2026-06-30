# AI Client Desktop

桌面端应用主入口。

## 开发（Web 模式，不需要 Rust）

```bash
# 根目录
pnpm install
pnpm --filter @ai-client/desktop dev
```

访问 http://localhost:5173

## 打包成桌面应用（需要 Rust）

```bash
# 1. 安装 Rust: https://rustup.rs
# 2. 在 apps/desktop 下执行：
cd apps/desktop
pnpm tauri dev      # 开发模式
pnpm tauri build    # 打包
```

## Tauri 配置文件

- `src-tauri/tauri.conf.json` — 主配置
- `src-tauri/Cargo.toml` — Rust 依赖
- `src-tauri/capabilities/default.json` — 权限
