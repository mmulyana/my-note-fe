import { useEffect } from "react";
import { IconMaximize } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { EditorBody } from ".";
import { useNoteEditor } from "./session";
import { FolderPicker } from "./folder-picker";
import { NoteDropdown } from "./note-dropdown";

export function NoteModal() {
  const note = useNoteEditor();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isNotePage = pathname.startsWith("/note/");
  const close = note?.close;

  useEffect(() => {
    if (!close || isNotePage) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close, isNotePage]);

  if (!note || isNotePage) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-black/55 backdrop-blur-[3px] overflow-y-auto items-start pt-[max(48px,8vh)] px-4 pb-4"
      onMouseDown={note.close}
    >
      <div
        className="relative bg-surface animate-[modal-in_0.18s_cubic-bezier(0.3,0.7,0.4,1)] w-full max-w-180 rounded-[16px] border border-line-2 shadow-card-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2 shrink-0 pt-3 pb-1 px-3.5">
          <FolderPicker
            selectedId={note.folderId}
            onChange={note.onFolderChange}
          />
          <span className="ml-auto min-w-0 truncate text-[11px] text-ink-3">
            {note.updatedText}
          </span>
          <div className="flex items-center gap-1 shrink-0">
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
              onDelete={note.onDelete}
              onArchive={note.onArchive}
              onSecret={note.onSecret}
              secret={note.doc.secret}
            />
          </div>
        </header>
        <div>
          <div className="flex flex-col gap-2.5 px-5 pt-2 pb-4">
            <EditorBody />
          </div>
        </div>
      </div>
    </div>
  );
}
