import { useCallback } from "react";
import { useStore } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  editingIdAtom,
  editingDocAtom,
  hasChangedAtom,
  isNewNoteAtom,
  editingLabelIdsAtom,
  editingFolderIdAtom,
} from "@/store/document";
import type { DocumentPayload, NoteDetail, NoteFlags } from "@/lib/types";
import { newId, deriveListFields } from "@/lib/utils";
import { request } from "@/lib/api-client";
import { useIsMobile } from "@/hooks/use-is-mobile";
import type { IApi } from "@/lib/types";
import { urls } from "@/lib/urls";

interface CreateNoteResponse {
  id: string;
  title: string;
  content: string;
  todos: unknown[];
  createdAt: string;
  updatedAt: string;
}

function isEmptyHtml(html: string): boolean {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const hasText = (parsed.body.textContent ?? "").trim().length > 0;
  const hasTask = parsed.querySelector('[data-type="taskItem"]') != null;
  return !hasText && !hasTask;
}

export function useDocumentActions() {
  const store = useStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const resetEditing = useCallback(() => {
    store.set(editingIdAtom, null);
    store.set(editingDocAtom, null);
    store.set(hasChangedAtom, false);
    store.set(isNewNoteAtom, false);
    store.set(editingLabelIdsAtom, []);
    store.set(editingFolderIdAtom, null);
  }, [store]);

  const openNew = useCallback(() => {
    const id = newId();
    store.set(hasChangedAtom, false);
    store.set(isNewNoteAtom, true);
    store.set(editingDocAtom, {
      id,
      content: "",
      preview: "",
      todoSummary: { total: 0, done: 0 },
      updatedAt: Date.now(),
      labels: [],
    });
    store.set(editingIdAtom, id);
    if (isMobile) navigate(`/note/${id}`);
  }, [store, isMobile, navigate]);

  const openNoteData = useCallback(
    async (id: string) => {
      try {
        const detail = await request<IApi<NoteDetail>>(urls.Note(id));
        store.set(hasChangedAtom, false);
        store.set(
          editingLabelIdsAtom,
          (detail.data.labels ?? []).map((c) => c.id),
        );
        store.set(editingFolderIdAtom, detail.data.folderId ?? null);
        store.set(editingDocAtom, {
          id: detail.data.id,
          content: detail.data.content,
          preview: "",
          todoSummary: { total: 0, done: 0 },
          labels: (detail.data.labels ?? []).map(({ id, name }) => ({
            id,
            name,
          })),
          folderId: detail.data.folderId ?? null,
          updatedAt: new Date(detail.data.updatedAt).getTime(),
          folder: detail.data.folder,
          secret: detail.data.secret,
          archived: detail.data.archived,
          pinned: detail.data.pinned,
        });
        store.set(editingIdAtom, id);
      } catch (err) {
        console.error("Failed to fetch note detail:", err);
      }
    },
    [store],
  );

  const openNote = useCallback(
    (id: string) => {
      if (isMobile) {
        navigate(`/note/${id}`);
        return;
      }
      openNoteData(id);
    },
    [isMobile, navigate, openNoteData],
  );

  const persist = useCallback(
    async (
      payload: DocumentPayload,
      opts: {
        overrideLabelIds?: string[];
        overrideFolderId?: string | null;
        flags?: NoteFlags;
      } = {},
    ) => {
      const editingId = store.get(editingIdAtom);
      if (!editingId) return;

      const isNewNote = store.get(isNewNoteAtom);
      const hasChanged = store.get(hasChangedAtom);
      const { overrideLabelIds, overrideFolderId, flags } = opts;
      const isMetadataOnlyChange =
        overrideLabelIds !== undefined || overrideFolderId !== undefined;
      if (isNewNote && !hasChanged && isMetadataOnlyChange) return;
      store.set(hasChangedAtom, true);

      if (flags) {
        store.set(editingDocAtom, (prev) => (prev ? { ...prev, ...flags } : prev));
      }

      const ids = overrideLabelIds ?? store.get(editingLabelIdsAtom);
      const fId =
        overrideFolderId !== undefined
          ? overrideFolderId
          : store.get(editingFolderIdAtom);
      const diff = payload.todoDiff;
      const todoDiff = diff
        ? {
            added: diff.added.map((t) => ({
              id: t.id,
              checked: t.checked,
              text: t.text,
              deadline: t.deadline,
              today: t.today,
              priority: t.priority,
            })),
            updated: diff.updated.map((u) => ({
              id: u.id,
              fields: Object.fromEntries(
                u.changedFields.map((f) => [f, u.after[f]]),
              ),
            })),
            removed: diff.removed.map((t) => t.id),
          }
        : undefined;

      const body = {
        content: payload.content,
        preview: payload.preview,
        todoDiff,
        labelIds: ids,
        folderId: fId,
        ...flags,
      };

      try {
        if (isNewNote) {
          await request<IApi<CreateNoteResponse>>(urls.Notes, {
            method: "POST",
            body: { id: editingId, content: payload.content },
          });
          store.set(isNewNoteAtom, false);
        }
        await request(urls.Note(editingId), { method: "PATCH", body });
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      } catch (err) {
        console.error("Save failed:", err);
      }
    },
    [store, queryClient],
  );

  const autoSave = useCallback(
    (
      payload: DocumentPayload,
      overrideLabelIds?: string[],
      overrideFolderId?: string | null,
    ) => persist(payload, { overrideLabelIds, overrideFolderId }),
    [persist],
  );

  const closeEditor = useCallback(
    async (finalContent: string) => {
      // note: snapshot before the reset, the final PATCH still needs these
      const id = store.get(editingIdAtom);
      const changed = store.get(hasChangedAtom);
      const wasNew = store.get(isNewNoteAtom);
      const labelIds = store.get(editingLabelIdsAtom);
      const folderId = store.get(editingFolderIdAtom);
      resetEditing();

      if (!id) return;

      if (wasNew && !changed) {
        return;
      }

      if (isEmptyHtml(finalContent)) {
        if (!wasNew) {
          try {
            await request(urls.Note(id), { method: "DELETE" });
          } catch (err) {
            console.error("Failed to delete empty note:", err);
          }
        }
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      } else if (changed) {
        try {
          await request(urls.Note(id), {
            method: "PATCH",
            body: {
              content: finalContent,
              preview: deriveListFields(finalContent).preview,
              labelIds,
              folderId,
            },
          });
        } catch (err) {
          console.error("Final save failed:", err);
        }
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      }
    },
    [store, resetEditing, queryClient],
  );

  const archiveDoc = useCallback(
    (payload: DocumentPayload, archived = true) =>
      persist(payload, { flags: { archived } }),
    [persist],
  );
  const pinnedDoc = useCallback(
    (payload: DocumentPayload, pinned = true) =>
      persist(payload, { flags: { pinned } }),
    [persist],
  );
  const secretDoc = useCallback(
    (payload: DocumentPayload, secret = true) =>
      persist(payload, { flags: { secret } }),
    [persist],
  );

  const deleteDoc = useCallback(async () => {
    const id = store.get(editingIdAtom);
    const wasNew = store.get(isNewNoteAtom);
    resetEditing();
    if (isMobile) navigate(-1);
    if (id && !wasNew) {
      try {
        await request(urls.Note(id), { method: "DELETE" });
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      } catch (err) {
        console.error("Failed to delete note:", err);
      }
    }
  }, [store, resetEditing, queryClient, isMobile, navigate]);

  return {
    openNew,
    openNote,
    openNoteData,
    autoSave,
    closeEditor,
    deleteDoc,
    archiveDoc,
    pinnedDoc,
    secretDoc,
  };
}
