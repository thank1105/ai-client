// Tauri 入口（暂时不启用，等装好 Rust 后启用）
// 当前阶段只用 Web 跑原型，src-tauri 目录只是占位

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
