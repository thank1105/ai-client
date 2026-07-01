// AI Client - Tauri 后端
// 主要职责：作为 WebView 到 LLM API 的 HTTP 代理，绕开浏览器 CORS 限制

use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
struct ProxyRequest {
    /// 目标 base URL，例如 https://api.minimaxi.com/anthropic
    base_url: String,
    /// 请求路径，相对于 base_url，例如 /v1/messages
    path: String,
    /// 请求体（JSON 字符串原样转发）
    body: String,
    /// 自定义 headers（不含 content-type/authorization 之外）
    #[serde(default)]
    extra_headers: std::collections::HashMap<String, String>,
}

#[tauri::command]
async fn llm_proxy(req: ProxyRequest) -> Result<String, String> {
    let url = format!(
        "{}/{}",
        req.base_url.trim_end_matches('/'),
        req.path.trim_start_matches('/')
    );

    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(false)
        .build()
        .map_err(|e| format!("client build: {e}"))?;

    let mut builder = client
        .post(&url)
        .header("Content-Type", "application/json")
        .body(req.body);

    for (k, v) in &req.extra_headers {
        builder = builder.header(k, v);
    }

    let resp = builder
        .send()
        .await
        .map_err(|e| format!("network: {e}"))?;

    let status = resp.status();
    let text = resp
        .text()
        .await
        .map_err(|e| format!("read body: {e}"))?;

    if !status.is_success() {
        return Err(format!("HTTP {}: {}", status.as_u16(), text));
    }
    Ok(text)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![llm_proxy])
        .setup(|app| {
            // 防止窗口启动后立刻被关闭
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.set_title("AI Client");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}