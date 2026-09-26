import {
  IconGripVertical,
  IconPin,
  IconMaximize,
  IconPinFilled,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAtomValue, useStore } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import { EditorContent } from "@tiptap/react";
import { editingDocAtom, editingIdAtom, isNewNoteAtom } from "@/store/document";
import { topbarActionsSlotAtom, topbarTitleSlotAtom } from "@/store/topbar";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { useAutoSave, type SaveStatus } from "@/hooks/use-autosave";
import { useDocumentEditor } from "@/hooks/use-editor";
import { useAiEdit } from "@/hooks/use-ai-edit";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { FolderPicker } from "@/components/editor/folder-picker";
import { LabelSuggestMenu } from "@/components/editor/label-suggest-menu";
import { LabelsIcon } from "@/components/icons";
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
import type { DocItem, DocumentPayload } from "@/lib/types";
import { NoteDropdown } from "./note-dropdown";
import { cn, extractLabels, relative } from "@/lib/utils";

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: "",
  dirty: "Editing…",
  saving: "Saving…",
  saved: "Saved",
};

interface EditorProps {
  doc: DocItem;
  onAutoSave: (
    payload: DocumentPayload,
    overrideFolderId?: string | null,
  ) => void;
  onClose: (finalContent: string) => void;
  onDelete: () => void;
  folderId?: string | null;
  onFolderChange?: (id: string | null) => void;
  onArchive?: (payload: DocumentPayload, value: boolean) => void;
  onPinned?: (payload: DocumentPayload, value: boolean) => void;
  onSecret?: (payload: DocumentPayload, value: boolean) => void;
  mode?: "modal" | "page";
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

export function Editor({
  doc,
  onAutoSave,
  onClose,
  onDelete,
  onArchive,
  onPinned,
  onSecret,
  mode = "modal",
  folderId = null,
  onFolderChange,
}: EditorProps) {
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
  const noteLabels = useNoteLabels(editor);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const store = useStore();
  const isPage = mode === "page";
  const titleSlot = useAtomValue(topbarTitleSlotAtom);
  const actionsSlot = useAtomValue(topbarActionsSlotAtom);

  // note: dibaca sekali saat mount; atom ini jadi false setelah save pertama
  const startedNewRef = useRef(useAtomValue(isNewNoteAtom));

  const { status, triggerSave, flushPayload } = useAutoSave({
    editor,
    startEmpty: startedNewRef.current,
    onSave: async (payload, overrideFolderId) => {
      onAutoSave(payload, overrideFolderId);
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

  const handleArchive = useCallback(() => {
    const payload = flushPayload();
    if (payload) onArchive?.(payload, !doc.archived);
  }, [flushPayload, onArchive, doc]);

  const handlePinned = useCallback(() => {
    const payload = flushPayload();
    if (payload) onPinned?.(payload, !doc.pinned);
  }, [flushPayload, onPinned, doc]);

  const handleSecret = useCallback(() => {
    const payload = flushPayload();
    if (payload) onSecret?.(payload, !doc.secret);
  }, [flushPayload, onSecret, doc]);

  const handleFolderChange = useCallback(
    (id: string | null) => {
      onFolderChange?.(id);
      triggerSave(id);
    },
    [onFolderChange, triggerSave],
  );

  const handleSlashPick = (id: SlashActionId, anchor: SlashAnchor) => {
    if (id === "pin") {
      handlePinned();
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

  const handleClose = useCallback(() => {
    onClose(editor ? editor.getHTML() : doc.content);
  }, [editor, onClose, doc.content]);

  const editorRef = useRef(editor);
  editorRef.current = editor;

  const mountedRef = useRef(false);
  useEffect(() => {
    if (!isPage) return;
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const finalContent = editorRef.current?.getHTML() ?? doc.content;
      setTimeout(() => {
        if (mountedRef.current) return;
        if (store.get(editingIdAtom) !== doc.id) return;
        onClose(finalContent);
      }, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPage]);

  const requestClose = useCallback(() => {
    if (!isPage) {
      handleClose();
      return;
    }
    if (location.key === "default") navigate("/");
    else navigate(-1);
  }, [isPage, handleClose, location.key, navigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [requestClose]);

  const pinButton = (
    <button
      type="button"
      onClick={handlePinned}
      className={cn(
        "grid place-items-center w-7 h-7 rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi focus-visible:bg-surface-hi focus-visible:text-ink outline-none hover:text-amber-400",
        doc.pinned && "text-amber-500",
      )}
      aria-label="Pin note"
      title="Pin note"
    >
      {doc.pinned ? <IconPinFilled size={15} /> : <IconPin size={15} />}
    </button>
  );

  const openAsPage = () => {
    if (!editor) return;
    if (status === "dirty") {
      const payload = flushPayload();
      if (payload) onAutoSave(payload);
    }
    const content = editor.getHTML();
    store.set(editingDocAtom, (prev) => (prev ? { ...prev, content } : prev));
    navigate(`/note/${doc.id}`);
  };

  const fullscreenButton = (
    <button
      type="button"
      onClick={openAsPage}
      className="grid place-items-center w-7 h-7 rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink focus-visible:bg-surface-hi focus-visible:text-ink outline-none"
      aria-label="Open as page"
      title="Open as page"
    >
      <IconMaximize size={15} />
    </button>
  );

  const sideMeta = (
    <>
      <div>
        <p className="mb-1 px-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3">
          Folder
        </p>
        <FolderPicker selectedId={folderId} onChange={handleFolderChange} />
      </div>
      {noteLabels.length > 0 && (
        <div className="mt-4">
          <p className="mb-1 px-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Labels
          </p>
          <div className="flex flex-wrap items-center gap-1 px-0.5">
            {noteLabels.map((name) => (
              <span
                key={name.toLowerCase()}
                className="inline-flex max-w-full items-center gap-0.5 px-1.5 py-0.5 rounded-[8px] text-xs text-ink-2 border border-line"
              >
                <LabelsIcon className="h-3 w-3 shrink-0" />
                <span className="truncate">{name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );

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
          onFolderChange={handleFolderChange}
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

  if (isPage) {
    return (
      <>
        {titleSlot &&
          createPortal(
            <>
              <button
                type="button"
                onClick={requestClose}
                className="grid place-items-center w-7 h-7 flex-none rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink outline-none cursor-pointer"
                aria-label="Back"
                title="Back"
              >
                <IconArrowLeft size={15} />
              </button>
              {pinButton}
            </>,
            titleSlot,
          )}
        {actionsSlot &&
          createPortal(
            <div className="flex items-center gap-1">
              <span className="hidden sm:inline mr-1 min-w-0 truncate text-[11px] text-ink-3">
                {updatedText}
              </span>
              <NoteDropdown
                onDelete={onDelete}
                onArchive={handleArchive}
                onSecret={handleSecret}
                secret={doc.secret}
              />
            </div>,
            actionsSlot,
          )}
        <div className="note-page">
          <div className="relative mx-auto w-full max-w-180">
            <aside className="absolute top-0 left-full ml-3 hidden h-full w-40 min-[1120px]:block">
              <div className="sticky top-2">{sideMeta}</div>
            </aside>
            <div className="pb-3 min-[1120px]:hidden">{sideMeta}</div>
            <div className="flex flex-col gap-2.5 pb-4">
              <EditorContent editor={editor} />
              {menus}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex justify-center bg-black/55 backdrop-blur-[3px] overflow-y-auto items-start pt-[max(48px,8vh)] px-4 pb-4",
      )}
      onMouseDown={requestClose}
    >
      <div
        className={cn(
          "relative bg-surface animate-[modal-in_0.18s_cubic-bezier(0.3,0.7,0.4,1)] w-full max-w-180 rounded-[16px] border border-line-2 shadow-card-lg",
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2 shrink-0 pt-3 pb-1 px-3.5">
          <FolderPicker selectedId={folderId} onChange={handleFolderChange} />
          <span className="ml-auto min-w-0 truncate text-[11px] text-ink-3">
            {updatedText}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {fullscreenButton}
            <NoteDropdown
              onDelete={onDelete}
              onArchive={handleArchive}
              onSecret={handleSecret}
              secret={doc.secret}
            />
          </div>
        </header>
        <div>
          <div className="flex flex-col gap-2.5 px-5 pt-2 pb-4">
            <EditorContent editor={editor} />
            {menus}
          </div>
        </div>
      </div>
    </div>
  );
}
