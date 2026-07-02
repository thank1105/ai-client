// AI Client - Tauri backend
// Responsibility: HTTP/SSE proxy from WebView to LLM API, bypassing browser CORS.

use bytes::Bytes;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use tauri::ipc::Channel;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
struct ProxyRequest {
    /// Target base URL, e.g. https://api.minimaxi.com/anthropic
    base_url: String,
    /// Request path, relative to base_url, e.g. /v1/messages
    path: String,
    /// Request body (JSON string, forwarded as-is)
    body: String,
    /// Extra headers (besides content-type/authorization)
    #[serde(default)]
    extra_headers: std::collections::HashMap<String, String>,
}

/// Events pushed to the frontend over a Tauri Channel while streaming.
#[derive(Debug, Serialize, Clone)]
#[serde(tag = "type", rename_all = "snake_case")]
enum StreamEvent {
    /// A chunk of the upstream SSE byte stream (UTF-8 decoded, may contain partial SSE events).
    Chunk { data: String },
    /// Stream finished successfully.
    Done,
    /// Stream failed; `message` is human-readable.
    Error { message: String },
}

/// Streamed LLM proxy.
/// Forwards the upstream SSE byte stream to the frontend through `channel`.
/// The frontend is responsible for parsing SSE events (it already does for the Web path).
#[tauri::command]
async fn llm_proxy(req: ProxyRequest, channel: Channel<StreamEvent>) -> Result<(), String> {
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
        .header("Accept", "text/event-stream")
        .body(req.body);

    for (k, v) in &req.extra_headers {
        builder = builder.header(k, v);
    }

    let resp = builder.send().await.map_err(|e| format!("network: {e}"))?;

    let status = resp.status();
    if !status.is_success() {
        let text = resp
            .text()
            .await
            .unwrap_or_else(|e| format!("<read body failed: {e}>"));
        let _ = channel.send(StreamEvent::Error {
            message: format!("HTTP {}: {}", status.as_u16(), text),
        });
        return Ok(());
    }

    let mut stream = resp.bytes_stream();
    while let Some(chunk) = stream.next().await {
        match chunk {
            Ok(bytes) => {
                if let Some(s) = decode_chunk(&bytes) {
                    if channel.send(StreamEvent::Chunk { data: s }).is_err() {
                        break;
                    }
                }
            }
            Err(e) => {
                let _ = channel.send(StreamEvent::Error {
                    message: format!("stream: {e}"),
                });
                return Ok(());
            }
        }
    }

    let _ = channel.send(StreamEvent::Done);
    Ok(())
}

fn decode_chunk(bytes: &Bytes) -> Option<String> {
    if bytes.is_empty() {
        return None;
    }
    Some(String::from_utf8_lossy(bytes).into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![llm_proxy])
        .setup(|app| {
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.set_title("AI Client");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}