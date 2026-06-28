import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { DocumentPayload, TodoPayload } from "@/lib/types";
import { deriveListFields, diffTodos, extractTodos } from "@/lib/utils";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved";

interface UseAutoSaveOptions {
  editor: Editor | null;
  onSave: (payload: DocumentPayload, overrideCategoryIds?: string[]) => Promise<void> | void;
  delay?: number;
}

export function useAutoSave({ editor, onSave, delay = 1500 }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baselineRef = useRef<TodoPayload[] | null>(null);
  const initialContentRef = useRef<string | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!editor) return;
    if (baselineRef.current === null) baselineRef.current = extractTodos(editor.getJSON());
    if (initialContentRef.current === null) initialContentRef.current = editor.getHTML();
  }, [editor]);

  const buildPayload = useCallback((): DocumentPayload | null => {
    if (!editor) return null;
    const content = editor.getHTML();
    const todos = extractTodos(editor.getJSON());
    const todoDiff = diffTodos(baselineRef.current ?? [], todos);
    baselineRef.current = todos;
    const { preview } = deriveListFields(content);
    return { content, preview, todos, todoDiff };
  }, [editor]);

  // note: used for non-editor changes (e.g. category picks)
  const triggerSave = useCallback(async (overrideCategoryIds?: string[]) => {
    if (!editor) return;
    const payload = buildPayload();
    if (!payload) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    dirtyRef.current = false;
    setStatus("saving");
    await onSaveRef.current(payload, overrideCategoryIds);
    setStatus(dirtyRef.current ? "dirty" : "saved");
    setLastSavedAt(new Date());
  }, [editor, buildPayload]);

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

  return { status, lastSavedAt, triggerSave };
}
