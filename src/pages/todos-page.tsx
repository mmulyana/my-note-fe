import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { IconPlus, IconChevronDown } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { request } from "@/lib/api-client";
import type { IApi, Todo, TodoGroup, TodoTodayGroups, TodoView } from "@/lib/types";
import { urls } from "@/lib/urls";
import { cn, newId } from "@/lib/utils";
import { TaskCheckbox, TaskMeta } from "@/components/editor/task-checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UpdatePayload = { id: string } & Partial<
  Pick<Todo, "text" | "checked" | "deadline" | "priority" | "today">
>;

const TODAY_SECTIONS: { key: keyof TodoTodayGroups; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Completed" },
];

export default function TodosPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useLocalStorage<TodoView>("todos-view", "all");
  const todayDate = format(new Date(), "yyyy-MM-dd");

  const { data: groupedData, isLoading: loadingAll } = useApi<IApi<TodoGroup[]>>({
    url: urls.TodosGrouped,
    queryKey: ["todos-grouped"],
    enabled: view === "all",
  });

  const { data: todayData, isLoading: loadingToday } = useApi<IApi<TodoTodayGroups>>({
    url: urls.TodosGroupedToday(todayDate),
    queryKey: ["todos-grouped-today", todayDate],
    enabled: view === "today",
  });

  const { mutate: updateTodo } = useMutation({
    mutationFn: ({ id, ...body }: UpdatePayload) =>
      request(urls.Todo(id), { method: "PATCH", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos-grouped"] });
      queryClient.invalidateQueries({ queryKey: ["todos-grouped-today"] });
    },
  });

  const { mutate: deleteTodo } = useMutation({
    mutationFn: (id: string) => request(urls.Todo(id), { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos-grouped"] });
      queryClient.invalidateQueries({ queryKey: ["todos-grouped-today"] });
    },
  });

  const { mutate: createTodo } = useMutation({
    mutationFn: (body: {
      id: string;
      noteId: string;
      text: string;
      lastTodoId?: string;
    }) => request(urls.Todos, { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos-grouped"] });
      queryClient.invalidateQueries({ queryKey: ["todos-grouped-today"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const groups = groupedData?.data ?? [];
  const todayGroups = todayData?.data;
  const totalTodos = groups.reduce((acc, g) => acc + g.todos.length, 0);
  const isLoading = view === "all" ? loadingAll : loadingToday;

  return (
    <div className="max-w-165 mx-auto py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-3">
          {view === "all"
            ? `${totalTodos} todo${totalTodos === 1 ? "" : "s"}`
            : format(new Date(), "EEEE, MMM d")}
        </p>
        <ViewDropdown view={view} onChange={setView} />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-ink-3">
          <div className="text-sm">Loading...</div>
        </div>
      ) : view === "all" ? (
        groups.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map((group) => (
              <div key={group.noteId} className="flex flex-col">
                <p className="text-[15px] font-semibold text-ink pb-2.5 mb-1 border-b-2 border-(--line)">
                  {group.title ?? "Untitled"}
                </p>
                {group.todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onUpdate={updateTodo}
                    onDelete={deleteTodo}
                  />
                ))}
                <AddTodoRow
                  noteId={group.noteId}
                  lastTodoId={
                    group.todos.length > 0
                      ? group.todos[group.todos.length - 1].id
                      : undefined
                  }
                  onCreate={createTodo}
                />
              </div>
            ))}
          </div>
        )
      ) : !todayGroups ||
        TODAY_SECTIONS.every((s) => todayGroups[s.key].length === 0) ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-8">
          {TODAY_SECTIONS.map(
            ({ key, label }) =>
              todayGroups[key].length > 0 && (
                <div key={key} className="flex flex-col">
                  <p className="text-[15px] font-semibold text-ink pb-2.5 mb-1 border-b-2 border-(--line)">
                    {label}
                  </p>
                  {todayGroups[key].map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onUpdate={updateTodo}
                      onDelete={deleteTodo}
                    />
                  ))}
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
}

function ViewDropdown({
  view,
  onChange,
}: {
  view: TodoView;
  onChange: (view: TodoView) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-(--line) bg-(--surface) text-[13px] text-(--ink-2) transition-colors duration-120 hover:bg-(--surface-2) outline-none">
        {view === "all" ? "All notes" : "Today"}
        <IconChevronDown size={14} className="text-ink-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-36 bg-(--surface) border-(--line-2) rounded-md shadow-(--shadow-lg) py-1 px-0"
      >
        <DropdownMenuRadioGroup
          value={view}
          onValueChange={(v) => onChange(v as TodoView)}
        >
          <DropdownMenuRadioItem
            value="all"
            className="text-[13px] rounded-none cursor-pointer"
          >
            All notes
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="today"
            className="text-[13px] rounded-none cursor-pointer"
          >
            Today
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
    <div className="flex items-center gap-3 px-1 py-2 rounded-lg hover:bg-(--surface-2) transition-colors duration-120">
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
          className="text-[15px] flex-1 leading-snug bg-transparent outline-none border-b border-line focus:border-ink transition-colors duration-120"
        />
      ) : (
        <span
          onClick={startEdit}
          className={cn(
            "text-[15px] flex-1 leading-snug cursor-text",
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
        today={todo.today}
        onChange={(attrs) => onUpdate({ id: todo.id, ...attrs })}
        onDelete={() => onDelete(todo.id)}
      />
    </div>
  );
}

function AddTodoRow({
  noteId,
  lastTodoId,
  onCreate,
}: {
  noteId: string;
  lastTodoId?: string;
  onCreate: (payload: {
    id: string;
    noteId: string;
    text: string;
    lastTodoId?: string;
  }) => void;
}) {
  const [active, setActive] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => {
    setActive(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commit = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onCreate({ id: newId(), noteId, text: trimmed, lastTodoId });
      setText("");
    } else {
      setActive(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      setText("");
      setActive(false);
    }
  };

  if (!active) {
    return (
      <button
        onClick={open}
        className="flex items-center gap-3 px-1 py-2.5 rounded-lg text-ink-3 hover:text-(--ink-2) hover:bg-(--surface-2) transition-colors duration-120 cursor-pointer"
      >
        <IconPlus size={16} />
        <span className="text-[15px]">Add todo</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-1 py-2.5 rounded-lg bg-(--surface-2)">
      <IconPlus size={16} className="text-(--ink-3) flex-none" />
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        placeholder="New todo..."
        className="text-[15px] flex-1 leading-snug bg-transparent outline-none placeholder:text-(--ink-3)"
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-22.5 px-5 text-center text-(--ink-3)">
      <div className="text-[17px] font-semibold text-ink-2">No todos yet</div>
      <div className="text-sm max-w-75">Your todos will appear here.</div>
    </div>
  );
}
