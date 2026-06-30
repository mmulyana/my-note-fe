import { atom } from "jotai";

export interface Profile {
  email: string;
}

const STORAGE_KEY = "mynote-profile";

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const baseAtom = atom<Profile | null>(loadProfile());

/** Profile atom: persisted to localStorage, cleared on logout */
export const profileAtom = atom(
  (get) => get(baseAtom),
  (_get, set, value: Profile | null) => {
    set(baseAtom, value);
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
);
