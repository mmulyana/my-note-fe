export type TodoStatusFilter = "overdue" | "open" | "done";
export type TodoPriorityFilter = "none" | "low" | "medium" | "high";
export type TodoSortKey = "priority" | "overdue" | "updated";
export type SortOrder = "asc" | "desc";

export type TodoFilters = {
  folderIds: string[];
  noFolder: boolean;
  priorities: TodoPriorityFilter[];
  status: TodoStatusFilter | null;
};

export type TodoSort = {
  key: TodoSortKey | null;
  order: SortOrder;
};

export const DEFAULT_TODO_FILTERS: TodoFilters = {
  folderIds: [],
  noFolder: false,
  priorities: [],
  status: null,
};

export const DEFAULT_TODO_SORT: TodoSort = { key: null, order: "desc" };

export const STATUS_OPTIONS: { value: TodoStatusFilter; label: string }[] = [
  { value: "overdue", label: "Overdue" },
  { value: "open", label: "Not completed" },
  { value: "done", label: "Completed" },
];

export const PRIORITY_OPTIONS: { value: TodoPriorityFilter; label: string }[] =
  [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
    { value: "none", label: "No priority" },
  ];

export const SORT_OPTIONS: { value: TodoSortKey; label: string }[] = [
  { value: "priority", label: "Priority" },
  { value: "overdue", label: "Overdue" },
  { value: "updated", label: "Last updated" },
];

export function folderFilterCount(filters: TodoFilters) {
  return filters.folderIds.length + (filters.noFolder ? 1 : 0);
}

export function activeFilterCount(filters: TodoFilters) {
  return (
    (folderFilterCount(filters) > 0 ? 1 : 0) +
    (filters.priorities.length > 0 ? 1 : 0) +
    (filters.status ? 1 : 0)
  );
}

export function localDateString(d = new Date()) {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function todoFilterParams(filters: TodoFilters, sort: TodoSort) {
  return {
    folderIds: filters.folderIds.join(","),
    noFolder: filters.noFolder || undefined,
    todoPriority: filters.priorities.join(","),
    todoStatus: filters.status ?? undefined,
    sort: sort.key ?? undefined,
    order: sort.key ? sort.order : undefined,
    date: localDateString(),
  };
}
