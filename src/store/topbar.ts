import { atom } from "jotai";

export const topbarTitleSlotAtom = atom<HTMLElement | null>(null);
export const topbarActionsSlotAtom = atom<HTMLElement | null>(null);
export const mobileSidebarOpenAtom = atom(false);
