import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { DocumentPayload, LinkPayload, TodoPayload } from "@/lib/types";
import {
  deriveListFields,
  diffLinks,
  diffTodos,
  extractLinks,
  extractTodos,
} from "@/lib/utils";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved";

interface UseAutoSaveOptions {
  editor: Editor | null;
  onSave: (
    payload: DocumentPayload,
    overrideLabelIds?: string[],
    overrideFolderId?: string | null,
  ) => Promise<void> | void;
  delay?: number;
  // note: note baru belum ada di server, jadi todo/link dari konten awal (template) dihitung sebagai baru
  startEmpty?: boolean;
}

export function useAutoSave({ editor, onSave, delay = 1500, startEmpty = false }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baselineRef = useRef<TodoPayload[] | null>(null);
  const linkBaselineRef = useRef<LinkPayload[] | null>(null);
  const initialContentRef = useRef<string | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!editor) return;
    if (baselineRef.current === null) baselineRef.current = startEmpty ? [] : extractTodos(editor.getJSON());
    if (linkBaselineRef.current === null) linkBaselineRef.current = startEmpty ? [] : extractLinks(editor.getJSON());
    if (initialContentRef.current === null) initialContentRef.current = editor.getHTML();
  }, [editor, startEmpty]);

  const buildPayload = useCallback((): DocumentPayload | null => {
    if (!editor) return null;
    const content = editor.getHTML();
    const json = editor.getJSON();
    const todos = extractTodos(json);
    const todoDiff = diffTodos(baselineRef.current ?? [], todos);
    baselineRef.current = todos;
    const links = extractLinks(json);
    const linkDiff = diffLinks(linkBaselineRef.current ?? [], links);
    linkBaselineRef.current = links;
    const { preview } = deriveListFields(content);
    return { content, preview, todos, todoDiff, links, linkDiff };
  }, [editor]);

  // note: used for non-editor changes (e.g. label/folder picks)
  const triggerSave = useCallback(async (overrideLabelIds?: string[], overrideFolderId?: string | null) => {
    if (!editor) return;
    const payload = buildPayload();
    if (!payload) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    dirtyRef.current = false;
    setStatus("saving");
    await onSaveRef.current(payload, overrideLabelIds, overrideFolderId);
    setStatus(dirtyRef.current ? "dirty" : "saved");
    setLastSavedAt(new Date());
  }, [editor, buildPayload]);

  // note: build the current payload and cancel any pending debounced save. Used when another action (archive/pin/secret) persists the note itself, so the editor
  const flushPayload = useCallback((): DocumentPayload | null => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dirtyRef.current = false;
    return buildPayload();
  }, [buildPayload]);

  useEffect(() => {
    if (!editor) return;

    const flush = async () => {
      if (!dirtyRef.current) return;
      const currentContent = editor.getHTML();
      if (currentContent === initialContentRef.current) {
        dirtyRef.current = false;
        setStatus("idle");
        return;
      }
      dirtyRef.current = false;
      setStatus("saving");
      const payload = buildPayload();
      if (!payload) return;
      await onSaveRef.current(payload);
      setStatus(dirtyRef.current ? "dirty" : "saved");
      setLastSavedAt(new Date());
    };

    const handleUpdate = () => {
      dirtyRef.current = true;
      setStatus("dirty");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, delay);
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dirtyRef.current) {
        const currentContent = editor.getHTML();
        if (currentContent !== initialContentRef.current) {
          dirtyRef.current = false;
          const payload = buildPayload();
          if (payload) void onSaveRef.current(payload);
        }
      }
    };
  }, [editor, delay, buildPayload]);

  return { status, lastSavedAt, triggerSave, flushPayload };
}
