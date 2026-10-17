import { useCallback } from "react";
import { useStore } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  editingIdAtom,
  editingDocAtom,
  hasChangedAtom,
  isNewNoteAtom,
  editingFolderIdAtom,
  noteModalOpenAtom,
  noteSwitchingAtom,
  noteViewAtom,
} from "@/store/document";
import type { CoverStyle, DocItem, DocumentPayload, NoteDetail, NoteFlags } from "@/lib/types";
import { newId, deriveListFields, toDocItem } from "@/lib/utils";
import { request } from "@/lib/api-client";
import type { IApi } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-is-mobile";
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
  const hasLink = parsed.querySelector('[data-type="link-card"]') != null;
  return !hasText && !hasTask && !hasLink;
}

export function useDocumentActions() {
  const store = useStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  const resetEditing = useCallback(() => {
    store.set(editingIdAtom, null);
    store.set(editingDocAtom, null);
    store.set(hasChangedAtom, false);
    store.set(isNewNoteAtom, false);
    store.set(editingFolderIdAtom, null);
    store.set(noteModalOpenAtom, false);
    store.set(noteSwitchingAtom, null);
    store.set(noteViewAtom, "note");
  }, [store]);

  const openNewWith = useCallback(
    (content: string) => {
      const id = newId();
      const { preview, todoSummary } = deriveListFields(content);
      const folderId = pathname.match(/^\/folder\/([^/]+)/)?.[1] ?? null;
      store.set(hasChangedAtom, false);
      store.set(isNewNoteAtom, true);
      store.set(editingFolderIdAtom, folderId);
      store.set(editingDocAtom, {
        id,
        content,
        preview,
        todoSummary,
        updatedAt: Date.now(),
        labels: [],
        folderId,
      });
      store.set(editingIdAtom, id);
      store.set(noteModalOpenAtom, true);
      if (isMobile) navigate(`/note/${id}`);
    },
    [store, isMobile, navigate, pathname],
  );

  const openNew = useCallback(() => openNewWith(""), [openNewWith]);

  const openNewChild = useCallback(
    (parent: Pick<DocItem, "id" | "title" | "folderId" | "folder" | "secret" | "archived">) => {
      const id = newId();
      const folderId = parent.folderId ?? null;
      store.set(hasChangedAtom, false);
      store.set(isNewNoteAtom, true);
      store.set(editingFolderIdAtom, folderId);
      store.set(editingDocAtom, {
        id,
        content: "",
        preview: "",
        todoSummary: { total: 0, done: 0 },
        updatedAt: Date.now(),
        labels: [],
        folderId,
        folder: parent.folder,
        secret: parent.secret,
        archived: parent.archived,
        parentId: parent.id,
        parent: { id: parent.id, title: parent.title ?? "" },
      });
      store.set(editingIdAtom, id);
      store.set(noteViewAtom, "note");
      store.set(noteModalOpenAtom, true);
      if (isMobile || pathname.startsWith("/note/")) navigate(`/note/${id}`);
    },
    [store, isMobile, navigate, pathname],
  );

  const fetchNoteDoc = useCallback(async (id: string): Promise<DocItem | null> => {
    try {
      const detail = await request<IApi<NoteDetail>>(urls.Note(id));
      return {
        id: detail.data.id,
        parentId: detail.data.parentId ?? null,
        parent: detail.data.parent ?? null,
        title: detail.data.title,
        children: (detail.data.children ?? []).map(toDocItem),
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
        coverStyle: detail.data.coverStyle,
      };
    } catch (err) {
      console.error("Failed to fetch note detail:", err);
      return null;
    }
  }, []);

  const showNoteDoc = useCallback(
    (doc: DocItem) => {
      store.set(hasChangedAtom, false);
      store.set(isNewNoteAtom, false);
      store.set(editingFolderIdAtom, doc.folderId ?? null);
      store.set(editingDocAtom, doc);
      store.set(editingIdAtom, doc.id);
      store.set(noteViewAtom, "note");
      store.set(noteModalOpenAtom, true);
    },
    [store],
  );

  const openNoteData = useCallback(
    async (id: string) => {
      const doc = await fetchNoteDoc(id);
      if (doc) showNoteDoc(doc);
    },
    [fetchNoteDoc, showNoteDoc],
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
        overrideFolderId?: string | null;
        flags?: NoteFlags;
      } = {},
    ) => {
      const editingId = store.get(editingIdAtom);
      if (!editingId) return;

      const isNewNote = store.get(isNewNoteAtom);
      const hasChanged = store.get(hasChangedAtom);
      const { overrideFolderId, flags } = opts;
      const isMetadataOnlyChange = overrideFolderId !== undefined;
      if (isNewNote && !hasChanged && isMetadataOnlyChange) return;
      store.set(hasChangedAtom, true);

      if (flags) {
        store.set(editingDocAtom, (prev) => (prev ? { ...prev, ...flags } : prev));
      }

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

      const ld = payload.linkDiff;
      const linkDiff = ld
        ? {
            added: ld.added,
            updated: ld.updated.map((u) => ({
              id: u.id,
              fields: Object.fromEntries(
                u.changedFields.map((f) => [f, u.after[f]]),
              ),
            })),
            removed: ld.removed.map((l) => l.id),
          }
        : undefined;

      const ad = payload.attachmentDiff;
      const attachmentDiff = ad
        ? { added: ad.added, removed: ad.removed.map((a) => a.id), cover: ad.cover }
        : undefined;

      const body = {
        content: payload.content,
        preview: payload.preview,
        todoDiff,
        linkDiff,
        attachmentDiff,
        labels: payload.labels,
        folderId: fId,
        ...flags,
      };

      try {
        if (isNewNote) {
          await request<IApi<CreateNoteResponse>>(urls.Notes, {
            method: "POST",
            body: {
              id: editingId,
              content: payload.content,
              parentId: store.get(editingDocAtom)?.parentId ?? undefined,
            },
          });
          store.set(isNewNoteAtom, false);
        }
        await request(urls.Note(editingId), { method: "PATCH", body });
        queryClient.invalidateQueries({ queryKey: ["notes"] });
        queryClient.invalidateQueries({ queryKey: ["labels"] });
      } catch (err) {
        console.error("Save failed:", err);
      }
    },
    [store, queryClient],
  );

  const autoSave = useCallback(
    (payload: DocumentPayload, overrideFolderId?: string | null) =>
      persist(payload, { overrideFolderId }),
    [persist],
  );

  const closeEditor = useCallback(
    async (finalContent: string, { reset = true }: { reset?: boolean } = {}) => {
      // note: snapshot before the reset, the final PATCH still needs these
      const id = store.get(editingIdAtom);
      const changed = store.get(hasChangedAtom);
      const wasNew = store.get(isNewNoteAtom);
      const folderId = store.get(editingFolderIdAtom);
      const hasChildren = (store.get(editingDocAtom)?.children?.length ?? 0) > 0;
      if (reset) resetEditing();

      if (!id) return;

      if (wasNew && !changed) {
        return;
      }

      if (isEmptyHtml(finalContent) && !hasChildren) {
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

  const openRelated = useCallback(
    async (id: string, finalContent: string) => {
      if (isMobile || pathname.startsWith("/note/")) {
        await closeEditor(finalContent);
        navigate(`/note/${id}`);
        return;
      }
      store.set(noteSwitchingAtom, id);
      const next = await fetchNoteDoc(id);
      if (next) {
        await closeEditor(finalContent, { reset: false });
        showNoteDoc(next);
      }
      store.set(noteSwitchingAtom, null);
    },
    [isMobile, pathname, navigate, store, fetchNoteDoc, closeEditor, showNoteDoc],
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

  const coverStyleDoc = useCallback(
    (payload: DocumentPayload, coverStyle: CoverStyle) =>
      persist(payload, { flags: { coverStyle } }),
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
    openNewWith,
    openNewChild,
    openRelated,
    openNote,
    openNoteData,
    autoSave,
    closeEditor,
    deleteDoc,
    archiveDoc,
    pinnedDoc,
    secretDoc,
    coverStyleDoc,
  };
}
