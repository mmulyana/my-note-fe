import { useAtom } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import {
  editingIdAtom,
  editingDocAtom,
  hasChangedAtom,
  isNewNoteAtom,
  editingLabelIdsAtom,
  editingFolderIdAtom,
} from "@/store/document";
import type { DocumentPayload, NoteFlags } from "@/lib/types";
import { newId, deriveListFields } from "@/lib/utils";
import { request } from "@/lib/api-client";
import type { IApi } from "@/lib/types";
import { urls } from "@/lib/urls";

interface NoteDetail {
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
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useAtom(editingIdAtom);
  const [, setEditingDoc] = useAtom(editingDocAtom);
  const [hasChanged, setHasChanged] = useAtom(hasChangedAtom);
  const [isNewNote, setIsNewNote] = useAtom(isNewNoteAtom);
  const [labelIds, setLabelIds] = useAtom(editingLabelIdsAtom);
  const [folderId, setFolderId] = useAtom(editingFolderIdAtom);

  const openNew = () => {
    const id = newId();
    setHasChanged(false);
    setIsNewNote(true);
    setEditingDoc({
      id,
      content: "",
      preview: "",
      todoSummary: { total: 0, done: 0 },
      updatedAt: Date.now(),
      labels: []
    });
    setEditingId(id);
  };

  const persist = async (
    payload: DocumentPayload,
    opts: {
      overrideLabelIds?: string[];
      overrideFolderId?: string | null;
      flags?: NoteFlags;
    } = {},
  ) => {
    if (!editingId) return;
    const { overrideLabelIds, overrideFolderId, flags } = opts;
    const isMetadataOnlyChange =
      overrideLabelIds !== undefined || overrideFolderId !== undefined;
    if (isNewNote && !hasChanged && isMetadataOnlyChange) return;
    setHasChanged(true);

    const ids = overrideLabelIds ?? labelIds;
    const fId = overrideFolderId !== undefined ? overrideFolderId : folderId;
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
        await request<IApi<NoteDetail>>(urls.Notes, {
          method: "POST",
          body: { id: editingId, content: payload.content },
        });
        setIsNewNote(false);
      }
      await request(urls.Note(editingId), { method: "PATCH", body });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const autoSave = (
    payload: DocumentPayload,
    overrideLabelIds?: string[],
    overrideFolderId?: string | null,
  ) => persist(payload, { overrideLabelIds, overrideFolderId });

  const closeEditor = async (finalContent: string) => {
    const id = editingId;
    const changed = hasChanged;
    const wasNew = isNewNote;
    setEditingId(null);
    setEditingDoc(null);
    setHasChanged(false);
    setIsNewNote(false);
    setLabelIds([]);
    setFolderId(null);

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
  };

  const archiveDoc = (payload: DocumentPayload, archived = true) =>
    persist(payload, { flags: { archived } });
  const pinnedDoc = (payload: DocumentPayload, pinned = true) =>
    persist(payload, { flags: { pinned } });
  const secretDoc = (payload: DocumentPayload, secret = true) =>
    persist(payload, { flags: { secret } });

  const deleteDoc = async () => {
    const id = editingId;
    const wasNew = isNewNote;
    setEditingId(null);
    setEditingDoc(null);
    setHasChanged(false);
    setIsNewNote(false);
    setLabelIds([]);
    setFolderId(null);
    if (id && !wasNew) {
      try {
        await request(urls.Note(id), { method: "DELETE" });
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      } catch (err) {
        console.error("Failed to delete note:", err);
      }
    }
  };

  return {
    openNew,
    autoSave,
    closeEditor,
    deleteDoc,
    archiveDoc,
    pinnedDoc,
    secretDoc,
    labelIds,
    setLabelIds,
    folderId,
    setFolderId,
  };
}
