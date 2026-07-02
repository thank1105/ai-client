/** Whether we are running inside the Tauri shell. */
export const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
