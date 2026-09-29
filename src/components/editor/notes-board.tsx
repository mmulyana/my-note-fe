import { useMemo, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { DocumentCard } from "@/components/editor/document-card";
import { NoteContextMenu } from "@/components/editor/note-context-menu";
import { useColumnCount } from "@/hooks/use-column-count";
import type { DocItem } from "@/lib/types";
import type { HomeView } from "@/store/home-view";
import { cn } from "@/lib/utils";

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
  const { ref } = useSortable({
    id: doc.id,
    index,
    type: "item",
    accept: "item",
    group: "notes",
    disabled: !arranging,
    transition: { duration: 250, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
  });

  return (
    <div
      ref={ref}
      className={cn(
        view === "grid"
          ? "h-full min-w-0 overflow-hidden [&_article]:h-full"
          : "min-w-0 [&_article]:max-h-90",
        arranging && "cursor-grab select-none touch-manipulation",
      )}
    >
      {/* note: inert card while arranging so a click or native image drag never fights the drag pointer events */}
      <NoteContextMenu doc={doc} disabled={arranging}>
        <div className={cn("h-full", arranging && "pointer-events-none")}>
          <DocumentCard doc={doc} />
        </div>
      </NoteContextMenu>
    </div>
  );
}
