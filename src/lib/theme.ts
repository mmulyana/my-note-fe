import type { Theme } from "./types";

const THEME_KEY = "mynote-theme";

export const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored !== null) return JSON.parse(stored) as Theme;
  } catch {
    //
  }
  return "dark";
}

export function resolveTheme(theme: Theme): "dark" | "light" {
  if (theme !== "system") return theme;
  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", resolveTheme(theme));
}

export function bootstrapTheme() {
  applyTheme(getStoredTheme());
}
