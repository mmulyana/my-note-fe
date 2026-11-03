import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type HomeView = "grid" | "masonry";

export const homeViewAtom = atomWithStorage<HomeView>("home-view", "grid");

export const homeArrangeAtom = atom(false);

export const todosViewAtom = atomWithStorage<HomeView>("todos-view", "grid");

export const selectedNoteIdsAtom = atom<string[]>([]);

export const selectModeAtom = atom((get) => get(selectedNoteIdsAtom).length > 0);

export const NOTE_DRAG_TYPE = "application/x-note-ids";
