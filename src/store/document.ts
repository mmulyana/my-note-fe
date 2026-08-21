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

/** Label IDs currently selected for the open note */
export const editingLabelIdsAtom = atom<string[]>([]);

/** Folder ID currently selected for the open note */
export const editingFolderIdAtom = atom<string | null>(null);

/** Desktop full-screen toggle for the editor modal (mobile is always full) */
export const isFullScreenAtom = atom(false);

/**
 * note
 * diubah saat ada aksi dari luar editor yang meminta editor ditutup,
 * saat ini dari tombol back. Editor yang menangani penutupan karena editor yang bisa memastikan konten terakhir tersimpan.
 */
export const closeRequestAtom = atom(0);
