import { atom } from "jotai";

export interface ShockwaveTheme {
  value: string;
  label: string;
  colors: [string, string] | null;
}

export const SHOCKWAVE_THEMES: ShockwaveTheme[] = [
  { value: "default", label: "Blue & green", colors: null },
  { value: "violet-pink", label: "Violet & pink", colors: ["#7c5cff", "#ec4899"] },
  { value: "teal-blue", label: "Teal & blue", colors: ["#14b8a6", "#3b82f6"] },
  { value: "orange-yellow", label: "Orange & yellow", colors: ["#f97316", "#f5b800"] },
  { value: "red-orange", label: "Red & orange", colors: ["#ef4444", "#f97316"] },
  { value: "pink-blue", label: "Pink & blue", colors: ["#ec4899", "#3b82f6"] },
  { value: "green-yellow", label: "Green & yellow", colors: ["#10b981", "#f5b800"] },
  { value: "mono", label: "Mono", colors: ["#8b93a1", "#cbd0d8"] },
];

const STORAGE_KEY = "mynote-shockwave-theme";

function load(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && SHOCKWAVE_THEMES.some((t) => t.value === raw)) return raw;
  } catch {
    return "default";
  }
  return "default";
}

const baseAtom = atom<string>(load());

export const shockwaveThemeAtom = atom(
  (get) => get(baseAtom),
  (_get, set, value: string) => {
    set(baseAtom, value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      return;
    }
  },
);
