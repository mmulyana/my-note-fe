import { createPortal } from "react-dom";
import { useAtomValue } from "jotai";
import { IconListCheck } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { IApi, Notes } from "@/lib/types";
import { buildQuery, toDocItem } from "@/lib/utils";
import { urls } from "@/lib/urls";
import { topbarActionsSlotAtom } from "@/store/topbar";
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

  const params = todoFilterParams(filters, sort);
  const { data } = useApi<IApi<Notes[]>>({
    url: buildQuery(urls.Notes, { hasTodo: true, ...params }),
    queryKey: ["notes", { hasTodo: true, ...params }],
    keepPreviousData: true,
  });

  const docs = (data?.data ?? []).map(toDocItem);
  const hasFilters = activeFilterCount(filters) > 0;

  return (
    <>
      {actionsSlot &&
        createPortal(
          <TodoFilterSortGroup
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
          />,
          actionsSlot,
        )}
      {docs.length > 0 ? (
        <div className="masonry grid-view todo-grid pb-4">
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
