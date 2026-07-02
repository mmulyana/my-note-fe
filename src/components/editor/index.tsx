import { IconGripVertical, IconTagFilled } from "@tabler/icons-react";
import { useCallback, useEffect, useRef } from "react";
import { EditorContent } from "@tiptap/react";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { useAutoSave, type SaveStatus } from "@/hooks/use-autosave";
import { useDocumentEditor } from "@/hooks/use-editor";
import { useApi } from "@/hooks/use-api";
import { CategoryPicker } from "@/components/common/category-picker";
import { NoteDropdown } from "@/components/common/note-dropdown";
import { InsertImageMenu } from "@/components/editor/insert-image-menu";
import type { DocItem, DocumentPayload, IApi } from "@/lib/types";
import { urls } from "@/lib/urls";

interface EditorProps {
  doc: DocItem;
  onAutoSave: (
    payload: DocumentPayload,
    overrideCategoryIds?: string[],
  ) => void;
  onClose: (finalContent: string) => void;
  onDelete: () => void;
  onArchive?: () => void;
  categoryIds?: string[];
  onCategoryChange?: (ids: string[]) => void;
}

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: "",
  dirty: "Editing…",
  saving: "Saving…",
  saved: "Saved",
};

export function Editor({
  doc,
  onAutoSave,
  onClose,
  onDelete,
  onArchive,
  categoryIds = [],
  onCategoryChange,
}: EditorProps) {
  const editor = useDocumentEditor(doc.content);

  const { status, triggerSave } = useAutoSave({
    editor,
    onSave: async (payload, overrideCategoryIds) => {
      onAutoSave(payload, overrideCategoryIds);
    },
  });

  const { data: categoriesData } = useApi<IApi<{ id: string; name: string }[]>>(
    {
      url: urls.Categories,
      queryKey: ["categories"],
    },
  );
  const allCategories = categoriesData?.data ?? [];
  const selectedCategories = allCategories.filter((c) =>
    categoryIds.includes(c.id),
  );

  const handleClose = useCallback(() => {
    onClose(editor ? editor.getHTML() : doc.content);
  }, [editor, onClose, doc.content]);

  // tag the grip with the hovered node's type so CSS can align it per block
  // (stable ref: DragHandle re-registers its plugin when this prop changes)
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 backdrop-blur-[3px] overflow-y-auto pt-[max(48px,8vh)] px-4 pb-4"
      onMouseDown={handleClose}
    >
      <div
        className="relative w-full max-w-150 rounded-[18px] border border-(--line-2) shadow-(--shadow-lg) bg-(--surface) animate-[modal-in_0.18s_cubic-bezier(0.3,0.7,0.4,1)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2.5 px-5 pt-4.5 pb-2">
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
        <footer className="flex items-center gap-2 pt-2 px-3.5 pb-3">
          {selectedCategories.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap flex-1">
              {selectedCategories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-(--ink-2) border border-(--line)"
                >
                  <IconTagFilled size={10} />
                  {cat.name}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-[11px] text-(--ink-3)">
              {STATUS_TEXT[status]}
            </span>
            <InsertImageMenu editor={editor} />
            <CategoryPicker
              selectedIds={categoryIds}
              onChange={(ids) => {
                onCategoryChange?.(ids);
                triggerSave(ids);
              }}
            />
            <NoteDropdown onDelete={onDelete} onArchive={onArchive} />
          </div>
        </footer>
      </div>
    </div>
  );
}
