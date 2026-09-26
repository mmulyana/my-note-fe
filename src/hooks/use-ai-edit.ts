import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
import { closeHistory, undo as undoHistory } from "@tiptap/pm/history";
import { aiOutputToSlice, selectionToHtml } from "@/lib/ai-content";
import { streamAi, type AiAction } from "@/lib/ai-stream";

export type AiEditStatus = "idle" | "streaming" | "review" | "failed";

const MAX_UNDO_STEPS = 500;

export function useAiEdit(editor: Editor | null) {
  const [status, setStatus] = useState<AiEditStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startDocRef = useRef<ProseMirrorNode | null>(null);

  const run = useCallback(
    async (action: AiAction, prompt = "") => {
      if (!editor || abortRef.current) return;

      const { from, to } = editor.state.selection;
      const selection = selectionToHtml(editor, from, to);
      const controller = new AbortController();

      abortRef.current = controller;
      startDocRef.current = editor.state.doc;
      setError(null);
      setOrigin(from);
      setStatus("streaming");
      editor.setEditable(false, false);

      let text = "";
      let end = to;
      let changed = false;
      let failure: string | null = null;

      const write = () => {
        const slice = aiOutputToSlice(editor, text, from);
        if (!slice) return;

        const { tr } = editor.state;
        tr.replace(from, end, slice);
        end = tr.mapping.map(end, 1);
        if (!changed) closeHistory(tr);
        tr.setSelection(TextSelection.near(tr.doc.resolve(end), -1));
        tr.scrollIntoView();
        editor.view.dispatch(tr);
        changed = true;
      };

      try {
        await streamAi(
          { action, prompt, selection },
          (delta) => {
            text += delta;
            write();
          },
          controller.signal,
        );
      } catch (e) {
        if (!controller.signal.aborted) {
          failure = e instanceof Error ? e.message : "Something went wrong";
        }
      } finally {
        abortRef.current = null;
        if (!editor.isDestroyed) editor.setEditable(true, false);
      }

      setError(failure);
      setStatus(changed ? "review" : failure ? "failed" : "idle");
    },
    [editor],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const keep = useCallback(() => {
    setStatus("idle");
    setError(null);
    editor?.commands.focus();
  }, [editor]);

  const undo = useCallback(() => {
    const startDoc = startDocRef.current;
    if (editor && startDoc) {
      const { view } = editor;
      for (let i = 0; i < MAX_UNDO_STEPS; i++) {
        if (view.state.doc.eq(startDoc)) break;
        if (!undoHistory(view.state, view.dispatch)) break;
      }
    }
    setStatus("idle");
    setError(null);
    editor?.commands.focus();
  }, [editor]);

  useEffect(() => {
    if (status !== "streaming" && status !== "review") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      if (status === "streaming") abortRef.current?.abort();
      else keep();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [status, keep]);

  useEffect(() => {
    if (!editor || status !== "review") return;
    const onUpdate = () => setStatus("idle");
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, status]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { status, error, origin, run, stop, keep, undo };
}
