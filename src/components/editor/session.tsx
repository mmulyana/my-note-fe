import { IconGripVertical } from "@tabler/icons-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { atom, useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { isNewNoteAtom, editingFolderIdAtom } from "@/store/document";
import { useAutoSave, type SaveStatus } from "@/hooks/use-autosave";
import { useDocumentActions } from "@/hooks/use-document-actions";
import { useDocumentEditor } from "@/hooks/use-editor";
import { useAiEdit } from "@/hooks/use-ai-edit";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { LabelSuggestMenu } from "@/components/editor/label-suggest-menu";
import { AiBubbleMenu } from "@/components/editor/ai-bubble-menu";
import { AiLoader } from "@/components/editor/ai-loader";
import {
  SlashMenu,
  type SlashActionId,
  type SlashAnchor,
} from "@/components/editor/slash-menu";
import {
  SlashPopup,
  type SlashPopupView,
} from "@/components/editor/slash-popup";
import type {
  SlashBridge,
  SlashState,
} from "@/components/editor/extensions/slash-command";
import type { DocItem } from "@/lib/types";
import { extractLabels, relative } from "@/lib/utils";

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: "",
  dirty: "Editing…",
  saving: "Saving…",
  saved: "Saved",
};

export interface NoteEditorApi {
  doc: DocItem;
  editor: ReturnType<typeof useDocumentEditor>;
  folderId: string | null;
  labels: string[];
  updatedText: string;
  menus: ReactNode;
  onFolderChange: (id: string | null) => void;
  onPinned: () => void;
  onArchive: () => void;
  onSecret: () => void;
  onDelete: () => void;
  close: () => void;
}

export const noteEditorAtom = atom<NoteEditorApi | null>(null);

export function useNoteEditor() {
  return useAtomValue(noteEditorAtom);
}

function useNoteLabels(editor: ReturnType<typeof useDocumentEditor>) {
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    if (!editor) return;

    const sync = () => {
      const next = extractLabels(editor.getJSON());
      setLabels((prev) =>
        prev.length === next.length && prev.every((n, i) => n === next[i])
          ? prev
          : next,
      );
    };

    sync();
    editor.on("update", sync);
    return () => {
      editor.off("update", sync);
    };
  }, [editor]);

  return labels;
}

export function EditorSession({ doc }: { doc: DocItem }) {
  const {
    autoSave,
    closeEditor,
    deleteDoc,
    archiveDoc,
    pinnedDoc,
    secretDoc,
  } = useDocumentActions();
  const [folderId, setFolderId] = useAtom(editingFolderIdAtom);
  const publish = useSetAtom(noteEditorAtom);
  const isMobile = useIsMobile();

  const [slash, setSlash] = useState<SlashState | null>(null);
  const [popup, setPopup] = useState<{
    view: SlashPopupView;
    anchor: SlashAnchor;
  } | null>(null);
  const slashKeyRef = useRef<(event: KeyboardEvent) => boolean>(() => false);
  const slashBridge = useMemo<SlashBridge>(
    () => ({
      open: setSlash,
      close: () => setSlash(null),
      keyDown: (event) => slashKeyRef.current(event),
    }),
    [],
  );
  const [labelSuggest, setLabelSuggest] = useState<SlashState | null>(null);
  const labelKeyRef = useRef<(event: KeyboardEvent) => boolean>(() => false);
  const labelBridge = useMemo<SlashBridge>(
    () => ({
      open: setLabelSuggest,
      close: () => setLabelSuggest(null),
      keyDown: (event) => labelKeyRef.current(event),
    }),
    [],
  );
  const editor = useDocumentEditor(doc.content, slashBridge, labelBridge);
  const ai = useAiEdit(editor);
  const labels = useNoteLabels(editor);
  const store = useStore();

  // note: dibaca sekali saat mount; atom ini jadi false setelah save pertama
  const startedNewRef = useRef(store.get(isNewNoteAtom));

  const { status, triggerSave, flushPayload } = useAutoSave({
    editor,
    startEmpty: startedNewRef.current,
    onSave: async (payload, overrideFolderId) => {
      autoSave(payload, overrideFolderId);
    },
  });

  // note: doc atom isnt refreshed by autosave, so track the last save locally
  const [savedAt, setSavedAt] = useState<number | null>(null);
  useEffect(() => {
    if (status === "saved") setSavedAt(Date.now());
  }, [status]);
  const updatedText =
    status === "dirty" || status === "saving"
      ? STATUS_TEXT[status]
      : `Updated ${relative(savedAt ?? doc.updatedAt)}`;

  const onArchive = useCallback(() => {
    const payload = flushPayload();
    if (payload) archiveDoc(payload, !doc.archived);
  }, [flushPayload, archiveDoc, doc]);

  const onPinned = useCallback(() => {
    const payload = flushPayload();
    if (payload) pinnedDoc(payload, !doc.pinned);
  }, [flushPayload, pinnedDoc, doc]);

  const onSecret = useCallback(() => {
    const payload = flushPayload();
    if (payload) secretDoc(payload, !doc.secret);
  }, [flushPayload, secretDoc, doc]);

  const onFolderChange = useCallback(
    (id: string | null) => {
      setFolderId(id);
      triggerSave(id);
    },
    [setFolderId, triggerSave],
  );

  const handleSlashPick = (id: SlashActionId, anchor: SlashAnchor) => {
    if (id === "pin") {
      onPinned();
      return;
    }
    setPopup({ view: id, anchor });
  };

  const gripRef = useRef<HTMLDivElement>(null);
  const handleDragNodeChange = useCallback(
    ({ node }: { node: ProseMirrorNode | null }) => {
      const grip = gripRef.current;
      if (!grip) return;
      if (node) grip.setAttribute("data-node-type", node.type.name);
      else grip.removeAttribute("data-node-type");
    },
    [],
  );

  const close = useCallback(() => {
    closeEditor(editor ? editor.getHTML() : doc.content);
  }, [editor, closeEditor, doc.content]);

  const menus = (
    <>
      {editor && (
        <AiBubbleMenu
          editor={editor}
          onRun={ai.run}
          busy={ai.status === "streaming"}
        />
      )}
      {editor && (
        <SlashMenu
          editor={editor}
          state={slash}
          pinned={!!doc.pinned}
          keyHandlerRef={slashKeyRef}
          onPick={handleSlashPick}
        />
      )}
      {editor && popup && (
        <SlashPopup
          editor={editor}
          anchor={popup.anchor}
          view={popup.view}
          onClose={() => setPopup(null)}
          onAiSubmit={(prompt) => ai.run("ask", prompt)}
          folderId={folderId}
          onFolderChange={onFolderChange}
        />
      )}
      {editor && (
        <LabelSuggestMenu
          editor={editor}
          state={labelSuggest}
          keyHandlerRef={labelKeyRef}
        />
      )}
      {editor && (
        <AiLoader
          editor={editor}
          origin={ai.origin}
          status={ai.status}
          error={ai.error}
          onStop={ai.stop}
          onKeep={ai.keep}
          onUndo={ai.undo}
        />
      )}
      {/* note: disabled on mobile*/}
      {editor && !isMobile && (
        <DragHandle
          editor={editor}
          // edge detection deducts 500×depth near a node's top/left edge,
          // which excludes one-line task items (depth 2) entirely
          nested={{ edgeDetection: "none" }}
          onNodeChange={handleDragNodeChange}
        >
          <div ref={gripRef} className="drag-handle-btn" title="Drag to move">
            <IconGripVertical size={13} />
          </div>
        </DragHandle>
      )}
    </>
  );

  useLayoutEffect(() => {
    publish({
      doc,
      editor,
      folderId,
      labels,
      updatedText,
      menus,
      onFolderChange,
      onPinned,
      onArchive,
      onSecret,
      onDelete: deleteDoc,
      close,
    });
  });

  useLayoutEffect(() => () => publish(null), [publish]);

  return null;
}
