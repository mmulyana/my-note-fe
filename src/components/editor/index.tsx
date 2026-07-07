import {
  IconGripVertical,
  IconPin,
  IconMaximize,
  IconMinimize,
  IconPinFilled,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent } from "@tiptap/react";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { useAutoSave, type SaveStatus } from "@/hooks/use-autosave";
import { useDocumentEditor } from "@/hooks/use-editor";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { LabelPicker } from "@/components/editor/label-picker";
import { FolderPicker } from "@/components/editor/folder-picker";
import { InsertImageMenu } from "@/components/editor/insert-image-menu";
import type { DocItem, DocumentPayload } from "@/lib/types";
import { NoteDropdown } from "./note-dropdown";
import { cn } from "@/lib/utils";

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
  const editor = useDocumentEditor(doc.content);
  const isMobile = useIsMobile();
  const [isFull, setIsFull] = useState(false);
  // mobile is always full screen; desktop follows the manual toggle
  const full = isFull || isMobile;

  const { status, triggerSave, flushPayload } = useAutoSave({
    editor,
    onSave: async (payload, overrideLabelIds, overrideFolderId) => {
      onAutoSave(payload, overrideLabelIds, overrideFolderId);
    },
  });

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

  const pushedRef = useRef(false);
  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;
  useEffect(() => {
    if (!pushedRef.current) {
      window.history.pushState({ noteEditor: true }, "");
      pushedRef.current = true;
    }
    const onPop = () => handleCloseRef.current();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const requestClose = useCallback(() => {
    if (pushedRef.current) window.history.back();
    else handleClose();
  }, [handleClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [requestClose]);

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
          "relative bg-(--surface) animate-[modal-in_0.18s_cubic-bezier(0.3,0.7,0.4,1)]",
          full
            ? "w-full h-full flex flex-col overflow-hidden rounded-none border-0"
            : "w-full max-w-150 rounded-[18px] border border-(--line-2) shadow-(--shadow-lg)",
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {!isMobile && (
            <button
              type="button"
              onClick={() => setIsFull((v) => !v)}
              className="grid place-items-center w-7 h-7 rounded-lg border border-(--line) bg-(--surface) text-(--ink-3) transition-[background,color,border-color] duration-150 hover:bg-(--surface-hi) hover:text-(--ink) hover:border-(--line-2) outline-none"
              aria-label={isFull ? "Exit full screen" : "Full screen"}
              title={isFull ? "Exit full screen" : "Full screen"}
            >
              {isFull ? <IconMinimize size={15} /> : <IconMaximize size={15} />}
            </button>
          )}
          <button
            type="button"
            onClick={handlePinned}
            className="grid place-items-center w-7 h-7 rounded-lg border border-(--line) bg-(--surface) text-(--ink-3) transition-[background,color,border-color] duration-150 hover:bg-(--surface-hi) hover:text-(--ink) hover:border-(--line-2) outline-none"
            aria-label="Pin note"
            title="Pin note"
          >
            {doc.pinned ? <IconPinFilled size={15} /> : <IconPin size={15} />}
          </button>
          {isMobile && (
            <NoteDropdown
              onDelete={onDelete}
              onArchive={handleArchive}
              onSecret={handleSecret}
              secret={doc.secret}
            />
          )}
        </div>
        <div className={full ? "flex-1 min-h-0 overflow-y-auto" : ""}>
          <div
            className={cn(
              "flex flex-col gap-2.5",
              full
                ? "w-full max-w-150 mx-auto px-5 pt-12 pb-2"
                : "px-5 pt-4.5 pb-2",
            )}
          >
            <EditorContent editor={editor} />
            {editor && (
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

        <footer
          className={cn(
            "flex items-center gap-2 pt-2 pb-3",
            full
              ? "shrink-0 w-full max-w-150 mx-auto px-5 border-t border-(--line-2)"
              : "px-3.5",
          )}
        >
          <InsertImageMenu editor={editor} />
          <LabelPicker selectedIds={labelIds} onChange={handleLabelChange} />
          <FolderPicker selectedId={folderId} onChange={handleFolderChange} />
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-[11px] text-(--ink-3)">
              {STATUS_TEXT[status]}
            </span>

            {!isMobile && (
              <NoteDropdown
                onDelete={onDelete}
                onArchive={handleArchive}
                onSecret={handleSecret}
                secret={doc.secret}
              />
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
