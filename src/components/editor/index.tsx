import {
  IconGripVertical,
  IconPin,
  IconMaximize,
  IconMinimize,
  IconPinFilled,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { EditorContent } from "@tiptap/react";
import { closeRequestAtom, isFullScreenAtom, isNewNoteAtom } from "@/store/document";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { useAutoSave, type SaveStatus } from "@/hooks/use-autosave";
import { useDocumentEditor } from "@/hooks/use-editor";
import { useAiEdit } from "@/hooks/use-ai-edit";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { FolderPicker } from "@/components/editor/folder-picker";
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
import type { SlashBridge, SlashState } from "@/components/editor/extensions/slash-command";
import type { DocItem, DocumentPayload } from "@/lib/types";
import { NoteDropdown } from "./note-dropdown";
import { cn, relative } from "@/lib/utils";

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
    overrideLabelIds?: string[],
    overrideFolderId?: string | null,
  ) => void;
  onClose: (finalContent: string) => void;
  onDelete: () => void;
  labelIds?: string[];
  onLabelChange?: (ids: string[]) => void;
  folderId?: string | null;
  onFolderChange?: (id: string | null) => void;
  onArchive?: (payload: DocumentPayload, value: boolean) => void;
  onPinned?: (payload: DocumentPayload, value: boolean) => void;
  onSecret?: (payload: DocumentPayload, value: boolean) => void;
}

export function Editor({
  doc,
  onAutoSave,
  onClose,
  onDelete,
  onArchive,
  onPinned,
  onSecret,
  labelIds = [],
  onLabelChange,
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
  const editor = useDocumentEditor(doc.content, slashBridge);
  const ai = useAiEdit(editor);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isFull, setIsFull] = useAtom(isFullScreenAtom);
  // mobile is always full screen; desktop follows the manual toggle
  const full = isFull || isMobile;

  useEffect(() => () => setIsFull(false), [setIsFull]);

  // note: dibaca sekali saat mount; atom ini jadi false setelah save pertama
  const startedNewRef = useRef(useAtomValue(isNewNoteAtom));

  const { status, triggerSave, flushPayload } = useAutoSave({
    editor,
    startEmpty: startedNewRef.current,
    onSave: async (payload, overrideLabelIds, overrideFolderId) => {
      onAutoSave(payload, overrideLabelIds, overrideFolderId);
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

  const handleClose = useCallback(() => {
    onClose(editor ? editor.getHTML() : doc.content);
  }, [editor, onClose, doc.content]);

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

  const handleLabelChange = useCallback(
    (ids: string[]) => {
      onLabelChange?.(ids);
      triggerSave(ids);
    },
    [onLabelChange, triggerSave],
  );

  const handleFolderChange = useCallback(
    (id: string | null) => {
      onFolderChange?.(id);
      triggerSave(undefined, id);
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

  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  const closeRequest = useAtomValue(closeRequestAtom);
  const seenCloseRequestRef = useRef(closeRequest);
  useEffect(() => {
    if (closeRequest === seenCloseRequestRef.current) return;
    seenCloseRequestRef.current = closeRequest;
    handleCloseRef.current();
  }, [closeRequest]);

  const requestClose = useCallback(() => {
    // note: on mobile, closing means leaving the /note/:id route; useBackGuard saves+resets from there.
    if (isMobile) {
      navigate(-1);
      return;
    }
    handleClose();
  }, [isMobile, navigate, handleClose]);

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
      className="grid place-items-center w-7 h-7 rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink focus-visible:bg-surface-hi focus-visible:text-ink outline-none"
      aria-label="Pin note"
      title="Pin note"
    >
      {doc.pinned ? <IconPinFilled size={15} /> : <IconPin size={15} />}
    </button>
  );

  const fullscreenButton = (
    <button
      type="button"
      onClick={() => setIsFull((v) => !v)}
      className="grid place-items-center w-7 h-7 rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink focus-visible:bg-surface-hi focus-visible:text-ink outline-none"
      aria-label={isFull ? "Exit full screen" : "Full screen"}
      title={isFull ? "Exit full screen" : "Full screen"}
    >
      {isFull ? <IconMinimize size={15} /> : <IconMaximize size={15} />}
    </button>
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex justify-center bg-black/55 backdrop-blur-[3px] overflow-y-auto",
        full ? "items-stretch p-0" : "items-start pt-[max(48px,8vh)] px-4 pb-4",
      )}
      onMouseDown={requestClose}
    >
      <div
        className={cn(
          "relative bg-surface animate-[modal-in_0.18s_cubic-bezier(0.3,0.7,0.4,1)]",
          full
            ? "w-full h-full flex flex-col overflow-hidden rounded-none border-0"
            : "w-full max-w-180 rounded-[18px] border border-line-2 shadow-(--shadow-lg)",
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header
          className={cn(
            "flex items-center gap-2 shrink-0 pt-3 pb-1",
            full ? "w-full max-w-180 mx-auto px-5" : "px-3.5",
          )}
        >
          {isMobile && (
            <button
              type="button"
              onClick={requestClose}
              className="grid place-items-center w-7 h-7 shrink-0 rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink focus-visible:bg-surface-hi focus-visible:text-ink outline-none"
              aria-label="Back"
              title="Back"
            >
              <IconArrowLeft size={15} />
            </button>
          )}
          <FolderPicker selectedId={folderId} onChange={handleFolderChange} />
          <span className="ml-auto min-w-0 truncate text-[11px] text-ink-3">
            {updatedText}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {isMobile ? pinButton : fullscreenButton}
            <NoteDropdown
              onDelete={onDelete}
              onArchive={handleArchive}
              onSecret={handleSecret}
              secret={doc.secret}
            />
          </div>
        </header>
        <div className={full ? "flex-1 min-h-0 overflow-y-auto" : ""}>
          <div
            className={cn(
              "flex flex-col gap-2.5",
              full ? "w-full max-w-180 mx-auto px-5 pt-2 pb-4" : "px-5 pt-2 pb-4",
            )}
          >
            <EditorContent editor={editor} />
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
                labelIds={labelIds}
                onLabelChange={handleLabelChange}
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
                <div
                  ref={gripRef}
                  className="drag-handle-btn"
                  title="Drag to move"
                >
                  <IconGripVertical size={13} />
                </div>
              </DragHandle>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
