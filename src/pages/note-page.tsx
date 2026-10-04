import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IconArrowLeft, IconPin, IconPinFilled } from "@tabler/icons-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAtomValue, useStore } from "jotai";
import { editingIdAtom } from "@/store/document";
import { topbarActionsSlotAtom, topbarTitleSlotAtom } from "@/store/topbar";
import { useDocumentActions } from "@/hooks/use-document-actions";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { EditorBody } from "@/components/editor";
import { useNoteEditor } from "@/components/editor/session";
import { FolderPicker } from "@/components/editor/folder-picker";
import { NoteDropdown } from "@/components/editor/note-dropdown";
import { LabelsIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const { openNoteData, closeEditor } = useDocumentActions();
  const store = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const note = useNoteEditor();
  const titleSlot = useAtomValue(topbarTitleSlotAtom);
  const actionsSlot = useAtomValue(topbarActionsSlotAtom);
  const handledIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id || handledIdRef.current === id) return;
    handledIdRef.current = id;
    if (store.get(editingIdAtom) !== id) openNoteData(id);
  }, [id, openNoteData, store]);

  const goBack = useCallback(() => {
    if (location.key === "default") navigate("/");
    else navigate(-1);
  }, [location.key, navigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") goBack();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [goBack]);

  const handleDelete = () => {
    note?.onDelete();
    if (!isMobile) goBack();
  };

  const noteRef = useRef(note);
  noteRef.current = note;

  const mountedRef = useRef(false);
  // note: on desktop the note stays open and comes back as the modal, only mobile has no modal to return to
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (!isMobile) return;
      const current = noteRef.current;
      if (!current) return;
      const docId = current.doc.id;
      const finalContent = current.editor?.getHTML() ?? current.doc.content;
      setTimeout(() => {
        if (mountedRef.current) return;
        if (store.get(editingIdAtom) !== docId) return;
        closeEditor(finalContent);
      }, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!id || note?.doc.id !== id) return null;

  const pinButton = (className: string) => (
    <button
      type="button"
      onClick={note.onPinned}
      className={cn(
        "grid place-items-center w-8 h-8 max-md:w-10 max-md:h-10 flex-none rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi focus-visible:bg-surface-hi focus-visible:text-ink outline-none hover:text-amber-400 cursor-pointer",
        note.doc.pinned && "text-amber-500",
        className,
      )}
      aria-label={note.doc.pinned ? "Unpin note" : "Pin note"}
      title={note.doc.pinned ? "Unpin note" : "Pin note"}
    >
      {note.doc.pinned ? (
        <IconPinFilled size={18} className="max-md:size-5" />
      ) : (
        <IconPin size={18} className="max-md:size-5" />
      )}
    </button>
  );

  const sideMeta = (
    <>
      <div>
        <p className="mb-1 px-1.5 max-lg:px-0 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3">
          Folder
        </p>
        <div className="flex items-center gap-1">
          <FolderPicker
            selectedId={note.folderId}
            onChange={note.onFolderChange}
          />
          {pinButton("max-md:hidden")}
        </div>
      </div>
      {note.labels.length > 0 && (
        <div className="mt-4">
          <p className="mb-1 px-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Labels
          </p>
          <div className="flex flex-wrap items-center gap-1 px-0.5">
            {note.labels.map((name) => (
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

  return (
    <>
      {titleSlot &&
        createPortal(
          <>
            <button
              type="button"
              onClick={goBack}
              className="grid place-items-center w-7 h-7 max-md:w-10 max-md:h-10 flex-none rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink outline-none cursor-pointer"
              aria-label="Back"
              title="Back"
            >
              <IconArrowLeft size={15} className="max-md:size-5" />
            </button>
            {pinButton("md:hidden")}
          </>,
          titleSlot,
        )}
      {actionsSlot &&
        createPortal(
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline mr-1 min-w-0 truncate text-[11px] text-ink-3">
              {note.updatedText}
            </span>
            <NoteDropdown
              onDelete={handleDelete}
              onArchive={note.onArchive}
              onSecret={note.onSecret}
              secret={note.doc.secret}
              cover={note.cover}
              onCoverStyle={note.onCoverStyle}
              folderId={note.folderId}
              onFolderChange={note.onFolderChange}
              labels={note.labels}
            />
          </div>,
          actionsSlot,
        )}
      <div className="note-page pt-2.5">
        <div className="relative mx-auto w-full max-w-180">
          <aside className="absolute top-0 left-full ml-3 hidden h-full w-40 min-[1120px]:block">
            <div className="sticky top-2">{sideMeta}</div>
          </aside>
          <div className="pb-3 max-md:hidden min-[1120px]:hidden">{sideMeta}</div>
          <div className="flex flex-col gap-2.5 pb-4">
            <EditorBody />
          </div>
        </div>
      </div>
    </>
  );
}
