import { useAtom } from "jotai";
import { IconCornerLeftUp, IconStack2 } from "@tabler/icons-react";
import { noteViewAtom } from "@/store/document";
import { cn } from "@/lib/utils";
import { useNoteEditor } from "./session";
import { DocumentCard } from "./document-card";
import type { DocItem } from "@/lib/types";

export function noteLabel(note: Pick<DocItem, "title" | "preview">): string {
  const title = note.title?.trim();
  if (title) return title;
  const text = note.preview
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 60) || "Untitled";
}

export function ParentCrumb() {
  const note = useNoteEditor();
  const parent = note?.doc.parent;
  if (!note || !parent) return null;

  return (
    <button
      type="button"
      onClick={() => note.openRelated(parent.id)}
      className="inline-flex items-center h-7 max-w-full w-fit justify-center gap-1 rounded-lg text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink focus-visible:bg-surface-hi focus-visible:text-ink outline-none px-1.5 text-xs hover:cursor-pointer max-lg:px-0"
      title="Open parent note"
    >
      <IconCornerLeftUp className="size-4 shrink-0" />
      <span className="truncate">{parent.title.trim() || "Untitled"}</span>
    </button>
  );
}

export function SubNotesToggle() {
  const note = useNoteEditor();
  const [view, setView] = useAtom(noteViewAtom);
  const count = note?.doc.children?.length ?? 0;
  if (count === 0) return null;
  const open = view === "children";

  return (
    <button
      type="button"
      onClick={() => setView(open ? "note" : "children")}
      title={open ? "Hide sub-notes" : "Show sub-notes"}
      aria-pressed={open}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-lg px-1.5 text-xs tabular-nums transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink focus-visible:bg-surface-hi outline-none cursor-pointer max-md:h-10",
        open ? "bg-surface-hi text-ink" : "text-ink-3",
      )}
    >
      <IconStack2 size={15} />
      {count}
    </button>
  );
}

export function SubNotesCards({
  layout = "stack",
  hideWhenEmpty = false,
}: {
  layout?: "stack" | "grid";
  hideWhenEmpty?: boolean;
}) {
  const note = useNoteEditor();
  if (!note) return null;

  const children = note.doc.children ?? [];
  if (hideWhenEmpty && children.length === 0) return null;

  return (
    <div
      className={cn(
        "gap-2",
        layout === "grid"
          ? "grid grid-cols-2 max-sm:grid-cols-1"
          : "flex flex-col",
      )}
    >
      {children.map((child) => (
        <div key={child.id} className="h-48 [&>article]:h-full">
          <DocumentCard doc={child} onOpen={note.openRelated} />
        </div>
      ))}
    </div>
  );
}
