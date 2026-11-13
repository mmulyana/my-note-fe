import { useMemo, useState } from "react";
import { useAtom } from "jotai";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { DocumentCard } from "@/components/editor/document-card";
import { NoteContextMenu } from "@/components/editor/note-context-menu";
import { useColumnCount } from "@/hooks/use-column-count";
import type { DocItem } from "@/lib/types";
import { NOTE_DRAG_TYPE, selectedNoteIdsAtom, type HomeView } from "@/store/home-view";
import { cn } from "@/lib/utils";
import { watchNativeDrag } from "@/lib/drag";

export type ReorderMove = {
  id: string;
  prevId: string | null;
  nextId: string | null;
};

interface NotesBoardProps {
  docs: DocItem[];
  view: HomeView;
  arranging: boolean;
  onReorder: (move: ReorderMove) => Promise<void>;
}

type Entry = { doc: DocItem; index: number };

export function NotesBoard({
  docs,
  view,
  arranging,
  onReorder,
}: NotesBoardProps) {
  const columnCount = useColumnCount();
  // note: live order while dragging (and until the server confirms the drop); null = follow docs
  const [liveIds, setLiveIds] = useState<string[] | null>(null);

  const ordered = useMemo(() => {
    if (!liveIds) return docs;
    const byId = new Map(docs.map((d) => [d.id, d]));
    return liveIds.flatMap((id) => byId.get(id) ?? []);
  }, [docs, liveIds]);

  // note: column-major buckets like CSS columns; index stays the flat index dnd-kit sorts by
  const columns = useMemo(() => {
    const perColumn = Math.ceil(ordered.length / columnCount) || 1;
    const buckets: Entry[][] = Array.from({ length: columnCount }, () => []);
    ordered.forEach((doc, index) => {
      buckets[Math.min(Math.floor(index / perColumn), columnCount - 1)].push({
        doc,
        index,
      });
    });
    return buckets;
  }, [ordered, columnCount]);

  const renderItem = ({ doc, index }: Entry) => (
    <SortableCard
      key={doc.id}
      doc={doc}
      index={index}
      arranging={arranging}
      view={view}
    />
  );

  const layout =
    view === "masonry" ? (
      <div className="flex items-start gap-2 pb-4">
        {columns.map((bucket, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col gap-2">
            {bucket.map(renderItem)}
          </div>
        ))}
      </div>
    ) : (
      <div className="masonry grid-view pb-4">
        {ordered.map((doc, index) => renderItem({ doc, index }))}
      </div>
    );

  return (
    <DragDropProvider
      onDragOver={(event) => {
        setLiveIds(
          (current) =>
            move({ list: current ?? docs.map((d) => d.id) }, event).list,
        );
      }}
      onDragEnd={async (event) => {
        const ids = liveIds;
        const activeId = event.operation.source?.id;
        if (event.canceled || !ids || activeId == null) {
          setLiveIds(null);
          return;
        }
        const byId = new Map(docs.map((d) => [d.id, d]));
        const list = ids.flatMap((id) => byId.get(id) ?? []);
        const at = list.findIndex((d) => d.id === activeId);
        const pinned = Boolean(list[at]?.pinned);
        // note: pinned and unpinned notes are separate lists; a drop across them is undone
        const firstUnpinned = list.findIndex((d) => !d.pinned);
        const mixed =
          firstUnpinned >= 0 && list.slice(firstUnpinned).some((d) => d.pinned);
        if (
          at < 0 ||
          mixed ||
          list.map((d) => d.id).join() === docs.map((d) => d.id).join()
        ) {
          setLiveIds(null);
          return;
        }
        const group = list.filter((d) => Boolean(d.pinned) === pinned);
        const i = group.findIndex((d) => d.id === activeId);
        try {
          await onReorder({
            id: String(activeId),
            prevId: group[i - 1]?.id ?? null,
            nextId: group[i + 1]?.id ?? null,
          });
        } finally {
          setLiveIds(null);
        }
      }}
    >
      {layout}
    </DragDropProvider>
  );
}

function setDragPreview(e: React.DragEvent<HTMLElement>, count: number) {
  const source = e.currentTarget;
  const rect = source.getBoundingClientRect();
  const ghost = document.createElement("div");
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;
  const place = (x: number, y: number) =>
    `translate(${x - offsetX * 0.7}px,${y - offsetY * 0.7}px) scale(0.7)`;
  ghost.style.cssText = `position:fixed;top:0;left:0;transform-origin:0 0;z-index:9999;pointer-events:none;width:${rect.width}px;height:${rect.height}px;transform:${place(e.clientX, e.clientY)}`;
  const behind = ["rotate(-6deg) translate(-8px,4px)", "rotate(5deg) translate(8px,2px)"];
  behind.slice(0, Math.min(count - 1, 2)).forEach((t) => {
    const sheet = document.createElement("div");
    sheet.style.cssText = `position:absolute;inset:0;border-radius:16px;background:var(--surface);border:1px solid var(--line);box-shadow:0 6px 16px rgb(0 0 0/0.15);transform:${t}`;
    ghost.appendChild(sheet);
  });
  const front = document.createElement("div");
  front.style.cssText =
    "position:absolute;inset:0;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgb(0 0 0/0.25);transform:rotate(3deg)";
  front.appendChild(source.cloneNode(true));
  ghost.appendChild(front);
  document.body.appendChild(ghost);
  // note: the browser dims its native drag image, so hide it and move an opaque clone with the cursor instead
  // note: the blank image must be attached to the DOM, otherwise the browser falls back to its dimmed default
  const blank = document.createElement("div");
  blank.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0.01";
  document.body.appendChild(blank);
  e.dataTransfer.setDragImage(blank, 0, 0);
  setTimeout(() => blank.remove(), 0);
  const follow = (ev: DragEvent) => {
    ghost.style.transform = place(ev.clientX, ev.clientY);
  };
  document.addEventListener("dragover", follow);
  watchNativeDrag(() => {
    document.removeEventListener("dragover", follow);
    ghost.remove();
  });
}

function SortableCard({
  doc,
  index,
  arranging,
  view,
}: {
  doc: DocItem;
  index: number;
  arranging: boolean;
  view: HomeView;
}) {
  const [selectedIds, setSelectedIds] = useAtom(selectedNoteIdsAtom);
  const selecting = selectedIds.length > 0;
  const selected = selectedIds.includes(doc.id);
  const { ref } = useSortable({
    id: doc.id,
    index,
    type: "item",
    accept: "item",
    group: "notes",
    disabled: !arranging || selecting,
    transition: { duration: 250, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
  });

  return (
    <div
      ref={ref}
      className={cn(
        view === "grid"
          ? "h-full min-w-0 [&_article]:h-full"
          : "min-w-0 [&_article]:max-h-90",
        arranging && "cursor-grab select-none touch-manipulation",
        selecting && "cursor-pointer select-none",
        // note: wrapper stays relative at all times, otherwise the fading ::after border jumps to the page when selection ends
        "relative rounded-[16px] after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[16px] after:border-2 after:border-transparent after:transition-colors",
        selected && "after:border-brand",
      )}
      draggable={selected}
      onClickCapture={(e) => {
        if (!selecting) return;
        e.preventDefault();
        e.stopPropagation();
        setSelectedIds((ids) =>
          ids.includes(doc.id) ? ids.filter((id) => id !== doc.id) : [...ids, doc.id],
        );
      }}
      onDragStart={(e) => {
        if (!selected) return;
        e.dataTransfer.setData(NOTE_DRAG_TYPE, JSON.stringify(selectedIds));
        e.dataTransfer.effectAllowed = "move";
        setDragPreview(e, selectedIds.length);
      }}
    >
      {/* note: inert card while arranging so a click or native image drag never fights the drag pointer events */}
      <NoteContextMenu doc={doc} disabled={arranging || selecting}>
        <div className={cn("h-full", (arranging || selecting) && "pointer-events-none")}>
          <DocumentCard doc={doc} />
        </div>
      </NoteContextMenu>
    </div>
  );
}
