import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  IconArrowsSort,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconX,
} from "@tabler/icons-react";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { useApi } from "@/hooks/use-api";
import type { Folder, IApi } from "@/lib/types";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import {
  DEFAULT_TODO_FILTERS,
  DEFAULT_TODO_SORT,
  PRIORITY_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  activeFilterCount,
  folderFilterCount,
  type SortOrder,
  type TodoFilters,
  type TodoSort,
  type TodoSortKey,
} from "@/lib/todo-filter";

const ORDER_LABELS: Record<TodoSortKey, Record<SortOrder, string>> = {
  priority: { desc: "High to low", asc: "Low to high" },
  overdue: { desc: "Overdue first", asc: "Overdue last" },
  updated: { desc: "Newest first", asc: "Oldest first" },
};

const triggerClass =
  "relative inline-flex h-8 w-9 items-center justify-center text-ink-3 transition-[color,background-color] duration-150 hover:bg-surface-2 hover:text-ink cursor-pointer";

const triggerActiveClass = "text-ink";

const markerClass =
  "absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-surface";

const panelClass =
  "absolute right-0 top-full z-40 mt-1.5 overflow-hidden rounded-[12px] border border-line-2 bg-surface shadow-card-lg";

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, ref };
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="grid h-[18px] min-w-[18px] place-items-center rounded-[5px] bg-surface-2 px-1 text-[11px] font-medium text-ink-2 border border-line">
      {children}
    </span>
  );
}

function OptionRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink cursor-pointer"
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {checked && <IconCheck size={15} className="flex-none text-brand" />}
    </button>
  );
}

function ClearButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="border-t border-line p-1.5">
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-[8px] px-2.5 py-2 text-left text-[13px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink cursor-pointer"
      >
        {label}
      </button>
    </div>
  );
}

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

type FilterView = "root" | "folder" | "status" | "priority";

export function TodoFilterSortGroup({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
}: {
  filters: TodoFilters;
  onFiltersChange: (filters: TodoFilters) => void;
  sort: TodoSort;
  onSortChange: (sort: TodoSort) => void;
}) {
  return (
    <ButtonGroup className="mr-1 rounded-full border border-line-2 bg-surface">
      <TodoFilterMenu filters={filters} onChange={onFiltersChange} />
      <ButtonGroupSeparator className="bg-line-2 data-vertical:h-4 data-vertical:self-center" />
      <TodoSortMenu sort={sort} onChange={onSortChange} />
    </ButtonGroup>
  );
}

function TodoFilterMenu({
  filters,
  onChange,
}: {
  filters: TodoFilters;
  onChange: (filters: TodoFilters) => void;
}) {
  const { open, setOpen, ref } = usePopover();
  const [view, setView] = useState<FilterView>("root");

  const { data } = useApi<IApi<Folder[]>>({
    url: urls.Folder,
    queryKey: ["folders"],
    enabled: open,
  });
  const folders = (data?.data ?? []).filter((f) => !f.isolated);

  const activeCount = activeFilterCount(filters);
  const folderCount = folderFilterCount(filters);

  const close = () => {
    setOpen(false);
    setView("root");
  };

  const title = {
    root: "Filters",
    folder: "Folder",
    status: "Status",
    priority: "Priority",
  }[view];

  const rows: { view: FilterView; label: string; count: number }[] = [
    { view: "folder", label: "Folder", count: folderCount },
    { view: "status", label: "Status", count: filters.status ? 1 : 0 },
    { view: "priority", label: "Priority", count: filters.priorities.length },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title="Filter"
        aria-label="Filter"
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(triggerClass, "rounded-l-full", activeCount > 0 && triggerActiveClass)}
      >
        <IconFilter size={18} />
        {activeCount > 0 && (
          <span className={markerClass} />
        )}
      </button>
      {open && (
        <div className={cn(panelClass, "w-[260px]")}>
          <div className="flex items-center gap-1 border-b border-line px-2 py-2">
            {view !== "root" && (
              <button
                type="button"
                onClick={() => setView("root")}
                aria-label="Back"
                className="grid h-6 w-6 place-items-center rounded-[6px] text-ink-3 hover:bg-surface-2 hover:text-ink cursor-pointer"
              >
                <IconChevronLeft size={16} />
              </button>
            )}
            <span className={cn("flex-1 text-[13px] font-medium text-ink", view === "root" && "pl-1.5")}>
              {title}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="grid h-6 w-6 place-items-center rounded-[6px] text-ink-3 hover:bg-surface-2 hover:text-ink cursor-pointer"
            >
              <IconX size={15} />
            </button>
          </div>

          <div className="max-h-[320px] overflow-y-auto p-1.5">
            {view === "root" &&
              rows.map((row) => (
                <button
                  key={row.view}
                  type="button"
                  onClick={() => setView(row.view)}
                  className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink cursor-pointer"
                >
                  <span className="flex-1">{row.label}</span>
                  {row.count > 0 && <Badge>{row.count}</Badge>}
                  <IconChevronRight size={15} className="text-ink-3" />
                </button>
              ))}

            {view === "folder" && (
              <>
                <OptionRow
                  label="No folder"
                  checked={filters.noFolder}
                  onClick={() => onChange({ ...filters, noFolder: !filters.noFolder })}
                />
                {folders.map((f) => (
                  <OptionRow
                    key={f.id}
                    label={f.name}
                    checked={filters.folderIds.includes(f.id)}
                    onClick={() =>
                      onChange({ ...filters, folderIds: toggle(filters.folderIds, f.id) })
                    }
                  />
                ))}
              </>
            )}

            {view === "status" &&
              STATUS_OPTIONS.map((o) => (
                <OptionRow
                  key={o.value}
                  label={o.label}
                  checked={filters.status === o.value}
                  onClick={() =>
                    onChange({ ...filters, status: filters.status === o.value ? null : o.value })
                  }
                />
              ))}

            {view === "priority" &&
              PRIORITY_OPTIONS.map((o) => (
                <OptionRow
                  key={o.value}
                  label={o.label}
                  checked={filters.priorities.includes(o.value)}
                  onClick={() =>
                    onChange({ ...filters, priorities: toggle(filters.priorities, o.value) })
                  }
                />
              ))}
          </div>

          {activeCount > 0 && (
            <ClearButton
              label="Clear filters"
              onClick={() => onChange(DEFAULT_TODO_FILTERS)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function TodoSortMenu({
  sort,
  onChange,
}: {
  sort: TodoSort;
  onChange: (sort: TodoSort) => void;
}) {
  const { open, setOpen, ref } = usePopover();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title="Sort"
        aria-label="Sort"
        onClick={() => setOpen(!open)}
        className={cn(triggerClass, "rounded-r-full", sort.key && triggerActiveClass)}
      >
        <IconArrowsSort size={18} />
        {sort.key && (
          <span className={markerClass} />
        )}
      </button>
      {open && (
        <div className={cn(panelClass, "w-[220px]")}>
          <div className="p-1.5">
            <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-3">
              Sort by
            </div>
            {SORT_OPTIONS.map((o) => (
              <OptionRow
                key={o.value}
                label={o.label}
                checked={sort.key === o.value}
                onClick={() =>
                  onChange(sort.key === o.value ? { ...sort, key: null } : { ...sort, key: o.value })
                }
              />
            ))}
            {sort.key && (
              <>
                <div className="my-1.5 h-px bg-line" />
                {(["desc", "asc"] as const).map((order) => (
                  <OptionRow
                    key={order}
                    label={ORDER_LABELS[sort.key as TodoSortKey][order]}
                    checked={sort.order === order}
                    onClick={() => onChange({ ...sort, order })}
                  />
                ))}
              </>
            )}
          </div>
          {sort.key && (
            <ClearButton
              label="Clear sort"
              onClick={() => onChange(DEFAULT_TODO_SORT)}
            />
          )}
        </div>
      )}
    </div>
  );
}
