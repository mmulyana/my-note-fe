import { useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { request } from "@/lib/api-client";
import type { IApi, Todo, TodoDateGroup } from "@/lib/types";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { TaskCheckbox, TaskMeta } from "@/components/editor/task-checkbox";
import { TodoProgress } from "@/components/editor/todo-progress";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type UpdatePayload = { id: string } & Partial<
  Pick<Todo, "text" | "checked" | "deadline" | "priority">
>;

const NAV_BTN =
  "grid h-7 w-7 flex-none place-items-center rounded-lg border border-line bg-surface text-ink-2 cursor-pointer outline-none transition-colors duration-120 hover:bg-surface-2";

const WEEK_OPTS = { weekStartsOn: 1 } as const;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const ISO = "yyyy-MM-dd";

export default function TodosPage() {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [monthCursor, setMonthCursor] = useState(() =>
    startOfMonth(new Date()),
  );
  const [selected, setSelected] = useState(() => format(new Date(), ISO));
  const [sheetOpen, setSheetOpen] = useState(false);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor), WEEK_OPTS);
    const end = endOfWeek(endOfMonth(monthCursor), WEEK_OPTS);
    return eachDayOfInterval({ start, end });
  }, [monthCursor]);

  const from = format(days[0], ISO);
  const to = format(days[days.length - 1], ISO);

  const { data, isLoading } = useApi<IApi<TodoDateGroup[]>>({
    url: urls.TodosGroupedByDate(from, to, TZ),
    queryKey: ["todos-by-date", from, to],
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["todos-by-date"] });

  const { mutate: updateTodo } = useMutation({
    mutationFn: ({ id, ...body }: UpdatePayload) =>
      request(urls.Todo(id), { method: "PATCH", body }),
    onSuccess: invalidate,
  });

  const { mutate: deleteTodo } = useMutation({
    mutationFn: (id: string) => request(urls.Todo(id), { method: "DELETE" }),
    onSuccess: invalidate,
  });

  const byDate = useMemo(() => {
    const map = new Map<string, Todo[]>();
    for (const group of data?.data ?? []) map.set(group.date, group.todos);
    return map;
  }, [data]);

  const totalTodos = useMemo(
    () => [...byDate.values()].reduce((acc, todos) => acc + todos.length, 0),
    [byDate],
  );

  const openDay = (date: string) => {
    setSelected(date);
    setSheetOpen(true);
  };

  const selectedTodos = byDate.get(selected) ?? [];

  return (
    <div className="py-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          className={NAV_BTN}
          title="Previous month"
          aria-label="Previous month"
          onClick={() => setMonthCursor((m) => addMonths(m, -1))}
        >
          <IconChevronLeft size={15} />
        </button>
        <button
          type="button"
          className={NAV_BTN}
          title="Next month"
          aria-label="Next month"
          onClick={() => setMonthCursor((m) => addMonths(m, 1))}
        >
          <IconChevronRight size={15} />
        </button>
        <p className="truncate text-sm font-semibold">
          {format(monthCursor, "MMMM yyyy")}
        </p>
        {!isSameMonth(monthCursor, new Date()) && (
          <button
            type="button"
            onClick={() => {
              setMonthCursor(startOfMonth(new Date()));
              setSelected(format(new Date(), ISO));
            }}
            className="h-7 flex-none rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink-2 cursor-pointer outline-none transition-colors duration-120 hover:bg-surface-2"
          >
            Today
          </button>
        )}
        <span className="ml-auto hidden flex-none text-sm text-ink-3 sm:inline">
          {totalTodos} todo{totalTodos === 1 ? "" : "s"}
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
          <div className="text-sm">Loading...</div>
        </div>
      ) : (
        <MonthGrid
          days={days}
          monthCursor={monthCursor}
          byDate={byDate}
          selected={selected}
          compact={isMobile}
          onOpenDay={openDay}
        />
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side={isMobile ? "bottom" : "right"}>
          <SheetTitle className="sr-only">
            {format(parseISO(selected), "EEEE, MMMM d")}
          </SheetTitle>
          <DayHeader
            date={selected}
            todos={selectedTodos}
            onClose={() => setSheetOpen(false)}
          />
          <DayList
            todos={selectedTodos}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
            className="flex-1 overflow-y-auto px-3 pt-1 pb-3"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DayHeader({
  date,
  todos,
  onClose,
}: {
  date: string;
  todos: Todo[];
  onClose?: () => void;
}) {
  const done = todos.filter((t) => t.checked).length;

  return (
    <div className="flex flex-none items-center gap-2 px-3 pt-2.5">
      <p className="min-w-0 flex-1 truncate text-xs font-medium tracking-[0.08em] text-ink-2">
        {format(parseISO(date), "EEEE, MMMM d")}
      </p>
      {todos.length > 0 && <TodoProgress done={done} total={todos.length} />}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 flex-none place-items-center rounded-full bg-surface-hi text-ink-3 outline-none cursor-pointer transition-colors duration-140 hover:text-ink"
          aria-label="Close"
        >
          <IconX size={15} />
        </button>
      )}
    </div>
  );
}

function DayList({
  todos,
  onUpdate,
  onDelete,
  className,
}: {
  todos: Todo[];
  onUpdate: (payload: UpdatePayload) => void;
  onDelete: (id: string) => void;
  className?: string;
}) {
  if (todos.length === 0) {
    return (
      <div className="px-3 py-10 text-center text-[13px] text-ink-3">
        No todos on this day.
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function MonthGrid({
  days,
  monthCursor,
  byDate,
  selected,
  compact,
  onOpenDay,
}: {
  days: Date[];
  monthCursor: Date;
  byDate: Map<string, Todo[]>;
  selected: string;
  compact: boolean;
  onOpenDay: (date: string) => void;
}) {
  const maxVisible = 3;

  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
      <div className="grid grid-cols-7 border-b border-line bg-surface-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-1.5 py-1.5 text-center text-[11px] font-medium text-ink-3"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day[0]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = format(day, ISO);
          const todos = byDate.get(key) ?? [];
          const outside = !isSameMonth(day, monthCursor);
          const current = isToday(day);
          const active = key === selected;
          const hidden = todos.length - maxVisible;

          return (
            <div
              key={key}
              onClick={() => onOpenDay(key)}
              className={cn(
                "flex flex-col gap-1 border-b border-r border-line p-1 cursor-pointer transition-colors duration-120 hover:bg-surface-hi sm:p-1.5",
                compact ? "min-h-16" : "min-h-27",
                outside && "bg-surface-2",
                active && "bg-surface-hi ring-1 ring-inset ring-(--accent)",
                i % 7 === 6 && "border-r-0",
                i >= days.length - 7 && "border-b-0",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 flex-none place-items-center rounded-full text-[11px] leading-none",
                  current && "bg-(--ink) font-semibold text-(--surface)",
                  !current && outside && "text-ink-3",
                  !current && !outside && "text-ink-2",
                )}
              >
                {format(day, "d")}
              </span>

              {compact ? (
                todos.length > 0 && (
                  <span className="mt-auto self-start rounded-md bg-surface-hi px-1.5 py-0.5 text-[10px] font-medium text-ink-2">
                    {todos.length}
                  </span>
                )
              ) : (
                <div className="flex min-h-0 flex-col gap-0.5">
                  {todos.slice(0, maxVisible).map((todo) => (
                    <TodoChip key={todo.id} todo={todo} />
                  ))}
                  {hidden > 0 && (
                    <span className="px-1 text-[10.5px] text-ink-3">
                      {hidden} more...
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PRIORITY_DOT: Record<Todo["priority"], string> = {
  high: "bg-red-500",
  medium: "bg-yellow-400",
  low: "bg-(--line-2)",
};

function TodoChip({ todo }: { todo: Todo }) {
  return (
    <span className="flex items-center gap-1 rounded-md bg-surface-2 px-1 py-0.5">
      <span
        className={cn(
          "h-1.5 w-1.5 flex-none rounded-full",
          PRIORITY_DOT[todo.priority],
        )}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[11px] leading-tight",
          todo.checked ? "text-ink-3 line-through" : "text-ink-2",
        )}
      >
        {todo.text || "Untitled"}
      </span>
    </span>
  );
}

function TodoItem({
  todo,
  onUpdate,
  onDelete,
}: {
  todo: Todo;
  onUpdate: (payload: UpdatePayload) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(todo.text);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== todo.text) {
      onUpdate({ id: todo.id, text: trimmed });
    } else {
      setDraft(todo.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") {
      setDraft(todo.text);
      setEditing(false);
    }
  };

  return (
    <div className="shrink-0 flex items-center gap-2.5 py-1 transition-colors duration-120 hover:bg-surface-2">
      <TaskCheckbox
        checked={todo.checked}
        onChange={(checked) => onUpdate({ id: todo.id, checked })}
      />
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="text-sm flex-1 min-w-0 leading-snug bg-transparent outline-none border-b border-line focus:border-ink transition-colors duration-120"
        />
      ) : (
        <span
          onClick={startEdit}
          className={cn(
            "text-sm flex-1 min-w-0 leading-snug cursor-text break-words",
            todo.checked && "line-through text-ink-3",
          )}
        >
          {todo.text}
        </span>
      )}
      <TaskMeta
        checked={todo.checked}
        priority={todo.priority}
        deadline={todo.deadline}
        onChange={(attrs) => onUpdate({ id: todo.id, ...attrs })}
        onDelete={() => onDelete(todo.id)}
      />
    </div>
  );
}
