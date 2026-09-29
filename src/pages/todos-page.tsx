import { useMemo } from "react";
import { createPortal } from "react-dom";
import { useAtom, useAtomValue } from "jotai";
import { IconListCheck } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { useColumnCount } from "@/hooks/use-column-count";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { IApi, Notes } from "@/lib/types";
import { buildQuery, cn, toDocItem } from "@/lib/utils";
import { urls } from "@/lib/urls";
import { topbarActionsSlotAtom } from "@/store/topbar";
import { todosViewAtom } from "@/store/home-view";
import {
  DEFAULT_TODO_FILTERS,
  DEFAULT_TODO_SORT,
  activeFilterCount,
  todoFilterParams,
  type TodoFilters,
  type TodoSort,
} from "@/lib/todo-filter";
import { TodoFilterSortGroup } from "@/components/common/todo-filter-menu";
import { TodoNoteCard } from "@/components/editor/todo-note-card";

export default function TodosPage() {
  const actionsSlot = useAtomValue(topbarActionsSlotAtom);
  const [filters, setFilters] = useLocalStorage<TodoFilters>(
    "todos-filters",
    DEFAULT_TODO_FILTERS,
  );
  const [sort, setSort] = useLocalStorage<TodoSort>(
    "todos-sort",
    DEFAULT_TODO_SORT,
  );
  const [view, setView] = useAtom(todosViewAtom);
  const isMobile = useIsMobile();
  const responsiveColumns = useColumnCount();
  // note: the column count follows the viewport like the home page; todo cards stay single-column on mobile
  const effectiveColumns = isMobile ? 1 : responsiveColumns;

  const params = todoFilterParams(filters, sort);
  const { data } = useApi<IApi<Notes[]>>({
    url: buildQuery(urls.Notes, { hasTodo: true, ...params }),
    queryKey: ["notes", { hasTodo: true, ...params }],
    keepPreviousData: true,
  });

  const docs = (data?.data ?? []).map(toDocItem);
  const hasFilters = activeFilterCount(filters) > 0;

  // note: masonry only differs from the grid with 2+ columns; round-robin keeps the reading order left-to-right
  const masonryColumns = useMemo(() => {
    const buckets: (typeof docs)[] = Array.from(
      { length: effectiveColumns },
      () => [],
    );
    docs.forEach((d, i) => buckets[i % effectiveColumns].push(d));
    return buckets;
  }, [docs, effectiveColumns]);

  return (
    <>
      {actionsSlot &&
        createPortal(
          <TodoFilterSortGroup
            view={isMobile ? undefined : view}
            onViewChange={setView}
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
          />,
          actionsSlot,
        )}
      {docs.length > 0 && view === "masonry" && effectiveColumns > 1 ? (
        <div className="flex items-start gap-2 pb-4">
          {masonryColumns.map((bucket, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col gap-2 [&>*]:h-fit md:[&>*]:max-h-100"
            >
              {bucket.map((d) => (
                <TodoNoteCard key={d.id} doc={d} />
              ))}
            </div>
          ))}
        </div>
      ) : docs.length > 0 ? (
        <div
          className={cn(
            effectiveColumns === 1
              ? "grid gap-2 pb-4 [&>*]:h-fit"
              : "masonry grid-view pb-4",
          )}
        >
          {docs.map((d) => (
            <TodoNoteCard key={d.id} doc={d} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
          <div className="grid place-items-center w-19.5 h-19.5 rounded-full bg-surface-2 border border-line mb-1.5">
            <IconListCheck size={30} />
          </div>
          <div className="text-[17px] font-semibold text-ink-2">
            {hasFilters ? "No matching todos" : "No todos yet"}
          </div>
          <div className="text-sm max-w-75">
            {hasFilters
              ? "Try changing or clearing the filters."
              : "Notes with a checklist show up here."}
          </div>
        </div>
      )}
    </>
  );
}
