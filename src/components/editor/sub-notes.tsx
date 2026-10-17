import { useAtom } from "jotai";
import { IconCornerLeftUp, IconPlus, IconStack2, IconSubtask } from "@tabler/icons-react";
import { noteViewAtom } from "@/store/document";
import { cn } from "@/lib/utils";
import { useNoteEditor } from "./session";
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
      className="inline-flex h-7 max-w-full w-fit items-center justify-center gap-1 rounded-lg px-1.5 text-xs text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink outline-none focus-visible:bg-surface-hi cursor-pointer"
      title="Open parent note"
    >
      <IconCornerLeftUp className="size-4 shrink-0" />
      <span className="truncate">{parent.title.trim() || "Untitled"}</span>
    </button>
  );
}

const ghostButton =
  "inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink outline-none focus-visible:bg-surface-hi cursor-pointer";

export function SubNotesToggle() {
  const note = useNoteEditor();
  const [view, setView] = useAtom(noteViewAtom);
  const count = note?.doc.children?.length ?? 0;
  if (count === 0 || view === "children") return null;

  return (
    <button
      type="button"
      onClick={() => setView("children")}
      title="Show sub-notes"
      className="inline-flex h-7 items-center gap-1 rounded-lg px-1.5 text-xs tabular-nums text-ink-3 transition-[background,color] duration-150 hover:bg-surface-hi hover:text-ink focus-visible:bg-surface-hi outline-none cursor-pointer max-md:h-10"
    >
      <IconStack2 size={15} />
      {count}
    </button>
  );
}

export function SubNotesList({ inline = false }: { inline?: boolean }) {
  const note = useNoteEditor();
  if (!note) return null;

  const children = note.doc.children ?? [];
  if (inline && children.length === 0) return null;

  return (
    <section className={cn("flex flex-col", inline ? "mt-2 border-t border-line pt-3" : "px-5 pt-2 pb-5")}>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3">
          Sub-notes · {children.length}
        </p>
        {!note.isNew && (
          <button type="button" onClick={() => note.addChild()} className={ghostButton}>
            <IconPlus size={14} />
            Add sub-note
          </button>
        )}
      </div>
      <ul className="flex flex-col">
        {children.map((child) => (
          <li key={child.id}>
            <button
              type="button"
              onClick={() => note.openRelated(child.id)}
              className="flex w-full items-center gap-2 rounded-lg px-1.5 py-2 text-left text-[13px] text-ink transition-[background,color] duration-150 hover:bg-black/6 dark:hover:bg-white/10 outline-none focus-visible:bg-black/6 dark:focus-visible:bg-white/10 cursor-pointer"
            >
              <IconSubtask size={14} className="shrink-0 text-ink-3" />
              <span className="min-w-0 flex-1 truncate">{noteLabel(child)}</span>
              {(child.childCount ?? 0) > 0 && (
                <span className="shrink-0 text-[11px] tabular-nums text-ink-3">
                  {child.childCount}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
