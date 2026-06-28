import type { Theme } from "./types";

const THEME_KEY = "mynote-theme";

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored !== null) return JSON.parse(stored) as Theme;
  } catch {
    //
  }
  return "dark";
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function bootstrapTheme() {
  applyTheme(getStoredTheme());
}
