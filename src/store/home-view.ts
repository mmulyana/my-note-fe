import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type HomeView = "grid" | "masonry";

export const homeViewAtom = atomWithStorage<HomeView>("home-view", "grid");

export const homeArrangeAtom = atom(false);

export const todosViewAtom = atomWithStorage<HomeView>("todos-view", "grid");
