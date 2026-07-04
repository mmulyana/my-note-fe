import type { DocItem } from "@/lib/types";
import { atom } from "jotai";

/** The ID of the note currently being edited (null = modal closed) */
export const editingIdAtom = atom<string | null>(null);

/** The full doc data for the editor modal (fetched on open) */
export const editingDocAtom = atom<DocItem | null>(null);

/** Whether the editor content has actually changed since open */
export const hasChangedAtom = atom(false);

/** Whether this is a brand-new note (not yet persisted to the backend) */
export const isNewNoteAtom = atom(false);

/** Category IDs currently selected for the open note */
export const editingCategoryIdsAtom = atom<string[]>([]);

/** Folder ID currently selected for the open note */
export const editingFolderIdAtom = atom<string | null>(null);
