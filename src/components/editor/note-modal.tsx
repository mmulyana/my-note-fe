import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { noteModalOpenAtom, noteViewAtom } from "@/store/document";
import { IconMaximize, IconPin, IconPinFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { EditorBody } from ".";
import { useNoteEditor } from "./session";
import { FolderPicker } from "./folder-picker";
import { NoteDropdown } from "./note-dropdown";
import { ParentCrumb, SubNotesCards, SubNotesToggle } from "./sub-notes";

export function NoteModal() {
  const note = useNoteEditor();
  const open = useAtomValue(noteModalOpenAtom);
  const [view, setView] = useAtom(noteViewAtom);
  const panelOpen = view === "children" && (note?.doc.children?.length ?? 0) > 0;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isNotePage = pathname.startsWith("/note/");
  const close = note?.close;

  useEffect(() => {
    if (!close || isNotePage) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (panelOpen) setView("note");
      else close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close, isNotePage, panelOpen, setView]);

  if (!open || isNotePage) return null;

  return (
    <div
      className="main-layout fixed inset-0 z-50 flex justify-center bg-black/55 backdrop-blur-[3px] animate-[modal-backdrop-in_0.15s_cubic-bezier(0.23,1,0.32,1)] overflow-y-auto items-start pt-[max(48px,8vh)] px-4 pb-4"
      onMouseDown={note?.close}
    >
      <div className="relative flex w-full max-w-200 flex-col">
      <div
        className="relative bg-surface animate-[modal-in_0.18s_cubic-bezier(0.23,1,0.32,1)] w-full rounded-[16px] border border-line-2 shadow-card-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {note ? (
        <div
          key={note.doc.id}
          className={cn(
            "transition-opacity duration-150",
            note.switching && "pointer-events-none opacity-50",
          )}
          aria-busy={note.switching}
        >
        <header className="flex items-center gap-2 shrink-0 pt-3.5 pb-1 px-[18px]">
          {note.doc.parent ? (
            <ParentCrumb />
          ) : (
            <FolderPicker
              selectedId={note.folderId}
              onChange={note.onFolderChange}
            />
          )}
          <button
            type="button"
            onClick={note.onPinned}
            className={cn(
              "grid place-items-center w-7 h-7 max-md:w-10 max-md:h-10 flex-none rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi focus-visible:bg-surface-hi focus-visible:text-ink outline-none hover:text-amber-400 cursor-pointer",
              note.doc.pinned && "text-amber-500",
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
          <span className="ml-auto min-w-0 truncate text-[11px] text-ink-3">
            {note.updatedText}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <SubNotesToggle />
            <button
              type="button"
              onClick={() => navigate(`/note/${note.doc.id}`)}
              className="grid place-items-center w-7 h-7 rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink focus-visible:bg-surface-hi focus-visible:text-ink outline-none"
              aria-label="Open as page"
              title="Open as page"
            >
              <IconMaximize size={15} />
            </button>
            <NoteDropdown
              moveTo={
                note.isNew
                  ? undefined
                  : {
                      noteId: note.doc.id,
                      currentParentId: note.doc.parentId,
                      onMove: note.moveToParent,
                    }
              }
              onAddSubNote={note.isNew ? undefined : note.addChild}
              onDelete={note.onDelete}
              onArchive={note.onArchive}
              onSecret={note.onSecret}
              secret={note.doc.secret}
              cover={note.cover}
              onCoverStyle={note.onCoverStyle}
            />
          </div>
        </header>
        <div>
          <div className="flex flex-col gap-2.5 px-[24px] pt-2 pb-4">
            <EditorBody />
          </div>
        </div>
        </div>
        ) : (
          <div className="h-48" aria-busy />
        )}
      </div>
      {panelOpen && (
        <aside
          className="thin-scroll absolute right-2 top-14 z-20 max-h-[70vh] w-64 overflow-y-auto animate-[view-in_0.15s_cubic-bezier(0.23,1,0.32,1)] min-[1180px]:top-0 min-[1180px]:right-auto min-[1180px]:left-full min-[1180px]:ml-3"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <SubNotesCards />
        </aside>
      )}
      </div>
    </div>
  );
}
