// Sinclaire Storion — Tauri desktop entry.
// Property of Sinclaire Sebastian Studios. Made by Sseruwagi Sinclaire Sebastian.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Sinclaire Storion");
}
